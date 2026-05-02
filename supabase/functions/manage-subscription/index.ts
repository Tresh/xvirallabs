import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

    const { action, environment } = await req.json().catch(() => ({}));
    const env = (environment === 'live' ? 'live' : 'sandbox') as PaddleEnv;
    if (action !== 'portal' && action !== 'cancel') {
      return json({ error: 'Invalid action' }, 400);
    }

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: sub } = await admin
      .from('subscriptions')
      .select('paddle_subscription_id, paddle_customer_id, status')
      .eq('user_id', user.id)
      .eq('environment', env)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.paddle_subscription_id) {
      return json({ error: 'No subscription found' }, 404);
    }

    const paddle = getPaddleClient(env);

    if (action === 'portal') {
      const session = await paddle.customerPortalSessions.create(
        sub.paddle_customer_id as string,
        [sub.paddle_subscription_id as string],
      );
      return json({
        overviewUrl: session.urls?.general?.overview,
        subscriptionUrls: session.urls?.subscriptions ?? [],
      });
    }

    // Cancel: schedule cancellation at next billing period (matches "switch at next billing period" rule).
    if (sub.status === 'canceled') {
      return json({ ok: true, alreadyCanceled: true });
    }
    await paddle.subscriptions.cancel(sub.paddle_subscription_id as string, {
      effectiveFrom: 'next_billing_period',
    });
    return json({ ok: true });
  } catch (e: any) {
    console.error('manage-subscription error:', e);
    return json({ error: e?.message || String(e) }, 500);
  }
});