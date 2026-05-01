import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOOL_PROMPTS: Record<string, string> = {
  analyze: `You are XViralLabs, an elite Twitter/X virality analyst. The user pasted a tweet (or describes one) and may add a custom direction. Reverse-engineer it: hook type, psychology triggers, dwell mechanics, algorithm signals, and a one-line reusable formula. Use markdown headers and bullets.`,
  generate_post: `You are XViralLabs, a viral X copywriter. Generate posts based on the user's topic + direction. Default to 3 distinct angles unless they specify a count. Optimize for replies and bookmarks. Always output the raw post text in code-style blocks the user can copy.`,
  sales: `You are XViralLabs Sales Engine. Generate sell-without-selling posts for the product/topic the user describes. Mix soft sells, story-led, proof-led, and direct CTA. Use the user's note for tone and intensity.`,
  video: `You are XViralLabs Video Bank. Generate short-form video scripts (Sora/Runway-ready) with: hook, voiceover, on-screen text, and an AI video prompt. Follow the user's note for style.`,
  thread: `You are XViralLabs Thread Builder. Convert the input into a high-retention thread: scroll-stop hook, every tweet earns the next, ends with a high-reply CTA. Number tweets 1/n.`,
  rewrite: `You are XViralLabs Rewriter. Rewrite the user's draft for higher virality while keeping the idea. Output 3 versions: Soft / Aggressive / Authority.`,
  daily_feed: `You are XViralLabs Daily Feed. Generate a varied set of daily posts based on the user's pillars and direction. Mix psychology triggers (curiosity, controversy, authority, relatability).`,
  content_os: `You are XViralLabs Content OS. Plan a strategic content mix using the user's pillars and direction. Output a structured set with format, hook, body, and pillar tag for each item.`,
  content_lab: `You are XViralLabs Content Lab. Help the user plan and refine content strategy. Use the note to focus on calendar planning, mind-mapping, or workspace iteration.`,
  chat: `You are XViralLabs, an elite attention-economics co-pilot for Twitter/X creators. Help with viral writing, analysis, strategy, hooks, and growth. Be sharp, opinionated, and practical. Use markdown.`,
};

function buildContext(profile: any, brandVoice: any): string {
  if (!profile && !brandVoice) return "";
  const parts: string[] = [];
  if (profile?.display_name) parts.push(`Creator: ${profile.display_name}`);
  if (profile?.twitter_handle) parts.push(`Handle: ${profile.twitter_handle}`);
  if (profile?.primary_niche) parts.push(`Niche: ${profile.primary_niche}`);
  if (profile?.brand_tone) parts.push(`Tone: ${profile.brand_tone}`);
  if (profile?.content_strategy) parts.push(`Strategy: ${profile.content_strategy}`);
  if (profile?.custom_system_prompt) parts.push(`Custom: ${profile.custom_system_prompt}`);
  if (brandVoice?.writing_traits?.length) parts.push(`Traits: ${brandVoice.writing_traits.join(", ")}`);
  if (brandVoice?.words_to_avoid?.length) parts.push(`Avoid: ${brandVoice.words_to_avoid.join(", ")}`);
  if (brandVoice?.signature_phrases?.length) parts.push(`Signature: ${brandVoice.signature_phrases.join(", ")}`);
  if (!parts.length) return "";
  return `\n\n--- CREATOR CONTEXT (use silently to personalize, never repeat) ---\n${parts.join("\n")}\n---`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tool, note, conversationId } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "auth invalid" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Usage check (counts as one analysis credit)
    const { data: remaining } = await supabaseAdmin.rpc("check_and_increment_usage", { p_user_id: user.id });
    if (remaining === 0) {
      return new Response(JSON.stringify({
        error: "Daily limit reached", code: "LIMIT_EXCEEDED",
        message: "You've used all 5 free messages today. Upgrade to Pro for unlimited.",
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pull creator context
    const [profileRes, brandRes] = await Promise.all([
      supabase.from("profiles").select("display_name, twitter_handle, primary_niche, brand_tone, content_strategy, custom_system_prompt").eq("user_id", user.id).maybeSingle(),
      supabase.from("brand_voice").select("writing_traits, words_to_avoid, signature_phrases, preferred_hooks").eq("user_id", user.id).maybeSingle(),
    ]);

    const baseTool = (tool && TOOL_PROMPTS[tool]) ? tool : "chat";
    let systemPrompt = TOOL_PROMPTS[baseTool];
    if (note && note.trim()) {
      systemPrompt += `\n\nUSER DIRECTION (follow strictly): ${note.trim()}`;
    }
    systemPrompt += buildContext(profileRes.data, brandRes.data);

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Retry shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("virallab-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});