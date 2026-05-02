import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, getPaddleClient, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }
  return _supabase;
}

// Map human-readable price IDs → profile tier
const PRICE_TO_TIER: Record<string, 'pro' | 'elite'> = {
  pro_monthly: 'pro',
  elite_monthly: 'elite',
};

async function updateUserTier(userId: string, tier: 'free' | 'pro' | 'elite') {
  const { error } = await getSupabase()
    .from('profiles')
    .update({ tier, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) console.error('Failed to update profile tier:', error);
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData');
    return;
  }

  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId', {
      rawPriceId: item.price.id,
      rawProductId: item.product.id,
    });
    return;
  }

  await getSupabase().from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status: status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'paddle_subscription_id',
  });

  // Business logic: update tier on purchase
  const tier = PRICE_TO_TIER[priceId] ?? 'free';
  if (status === 'active' || status === 'trialing') {
    await updateUserTier(userId, tier);
  }
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange, items } = data;

  await getSupabase().from('subscriptions')
    .update({
      status: status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);

  // Look up the user
  const { data: subRow } = await getSupabase()
    .from('subscriptions')
    .select('user_id, price_id')
    .eq('paddle_subscription_id', id)
    .eq('environment', env)
    .maybeSingle();

  if (!subRow?.user_id) return;
  const userId = subRow.user_id as string;

  // Plan switch (upgrade/downgrade): updates take effect at next billing period.
  // We update the tier when the new period actually starts (status active + new price applied).
  const newPriceId = items?.[0]?.price?.importMeta?.externalId ?? subRow.price_id;
  const tier = PRICE_TO_TIER[newPriceId as string] ?? 'free';

  if (status === 'active' || status === 'trialing') {
    await updateUserTier(userId, tier);
  } else if (status === 'past_due') {
    // grace period — keep current tier
  }
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase().from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);

  // Business logic: revoke access immediately on cancel
  const { data: subRow } = await getSupabase()
    .from('subscriptions')
    .select('user_id')
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env)
    .maybeSingle();

  if (subRow?.user_id) {
    await updateUserTier(subRow.user_id as string, 'free');
  }
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    await handleWebhook(req, env);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});