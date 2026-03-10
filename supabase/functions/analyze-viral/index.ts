import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const modePrompts: Record<number, string> = {
  1: `You are XViralLabs, an elite Twitter/X virality analyst.

Analyze this Twitter/X post as a viral scientist.

Break down:
1. Primary hook type (curiosity, authority, fear, aspiration, controversy, insider knowledge, identity signaling)
2. Psychological triggers used (name them explicitly)
3. Why users stopped scrolling
4. Why users engaged instead of lurking
5. What made this post easy to react to
6. Dwell time enhancers (structure, pacing, sentence rhythm, open loops)
7. Algorithm signals this post likely triggered

Then summarize the core viral formula in one reusable sentence.

Format your response with clear headers and bullet points for easy reading.`,

  2: `You are XViralLabs, a behavioral psychology expert specializing in Twitter/X content.

Deconstruct this post using behavioral psychology.

Identify:
• Cognitive biases activated
• Emotional tension created
• Social identity it appeals to
• Hidden promise being made to the reader

Explain in simple language how each psychological element increases:
• Reads
• Replies
• Bookmarks
• Profile clicks

Format with clear sections and actionable insights.`,

  3: `You are XViralLabs, a viral pattern extraction specialist.

Extract the reusable viral pattern from this post.

Output:
• The exact post structure template (fill-in-the-blank format)
• The hook framework
• The body flow logic
• The closing CTA logic

Format it so it can be reused across ANY niche. Use [PLACEHOLDER] format for variables.`,

  4: `You are XViralLabs, a viral content generator.

Using the patterns from this post, generate 15 high-performing tweet variations for the specified niche.

Requirements:
• Each tweet must use a different hook angle
• No repetition of phrasing
• Optimized for replies and bookmarks
• Written in a natural Twitter/X voice
• Each tweet must feel like a "must-read"

Categorize them into:
• Curiosity-driven (3 tweets)
• Authority-driven (3 tweets)
• Relatability-driven (3 tweets)
• Contrarian (3 tweets)
• Educational but punchy (3 tweets)

Format each category with a header, then list the tweets numbered.`,

  5: `You are XViralLabs, a Twitter/X engagement forecaster.

Predict how this post performs on Twitter/X.

Estimate:
• Scroll-stopping potential (1–10 with explanation)
• Dwell time strength (low / medium / high with reasoning)
• Likely engagement type dominance (replies, bookmarks, retweets)

Then suggest 3 structural changes to increase dwell time by at least 30%.

Be specific and actionable.`,

  6: `You are XViralLabs, a viral copywriter.

Rewrite this post to maximize virality while keeping the original idea.

Rules:
• Stronger first line
• Shorter sentences
• More open loops
• Better emotional payoff
• No clickbait

Output three versions:
• Version A: Soft viral (subtle hooks, professional tone)
• Version B: Aggressive viral (bold claims, high energy)
• Version C: Authority-led viral (expertise-focused, data-driven feel)

Format each version with a label and the full rewritten tweet.`,

  7: `You are XViralLabs, a thread conversion specialist.

Turn this content into a viral Twitter/X thread.

Requirements:
• Hook tweet that forces a stop (first tweet)
• Each tweet must earn the next one
• No filler
• End with a high-reply CTA

Output:
• Hook tweet
• Thread outline (one line per tweet showing the flow)
• Full thread text (numbered 1/X format)

Make it engaging from start to finish.`,

  8: `You are XViralLabs, an idea generation engine.

Based on this content and niche, generate 20 viral post ideas inspired by:
• Current Twitter/X content trends
• Psychological triggers
• Proven viral formats

For each idea:
• Give the hook (first line)
• The emotion it triggers
• Why it would stop scrolling (1 sentence)

Number them 1-20 and make each one unique.`,

  9: `You are XViralLabs, a personal brand alignment specialist.

Adapt the analysis to match the specified personal brand traits.

Consider:
• Tone: (bold / calm / authoritative / playful - infer from content)
• Positioning: (builder / teacher / operator / insider)
• Audience awareness level: (beginner / intermediate / advanced)

Provide:
• Brand-aligned rewrites of any suggested content
• Tone adjustments needed
• Voice consistency tips
• How to make posts sound like one human, not an AI

Keep recommendations practical and specific.`,

  10: `You are Viral Labs, providing a premium summary.

Summarize everything learned from this viral analysis into:

1. Core Lesson (one powerful insight)
2. Three Repeatable Rules (specific, actionable)
3. One Mistake to Avoid (common pitfall)
4. Action Item (what to do next)

Keep it sharp, memorable, and immediately actionable. This should be the kind of summary someone would screenshot and save.`,
};

// Build complete creator context from user's profile + brand voice + patterns
function buildCreatorContext(
  profileData: { display_name?: string; twitter_handle?: string; skills?: string[]; content_strategy?: string; custom_system_prompt?: string; brand_tone?: string; primary_niche?: string } | null,
  brandVoice: { writing_traits: string[]; words_to_avoid: string[]; signature_phrases: string[]; preferred_hooks: string[] } | null,
  patterns: Array<{ pattern_name: string; pattern_template: string; usage_count: number }>,
  recentHooks: string[]
): string {
  const parts: string[] = [];

  if (profileData) {
    if (profileData.display_name) parts.push(`Name: ${profileData.display_name}`);
    parts.push(`Platform: Twitter/X`);
    if (profileData.twitter_handle) parts.push(`Handle: ${profileData.twitter_handle}`);
    if (profileData.primary_niche) parts.push(`Niche: ${profileData.primary_niche}`);
    if (profileData.skills?.length) parts.push(`Skills: ${profileData.skills.join(", ")}`);
    if (profileData.brand_tone) parts.push(`Tone: ${profileData.brand_tone}`);
    if (profileData.content_strategy) parts.push(`Content Strategy: ${profileData.content_strategy}`);
    if (profileData.custom_system_prompt) parts.push(`Custom Instructions: ${profileData.custom_system_prompt}`);
  }

  if (brandVoice) {
    if (brandVoice.writing_traits?.length) parts.push(`Writing traits: ${brandVoice.writing_traits.join(", ")}`);
    if (brandVoice.words_to_avoid?.length) parts.push(`Words to avoid: ${brandVoice.words_to_avoid.join(", ")}`);
    if (brandVoice.signature_phrases?.length) parts.push(`Signature phrases: ${brandVoice.signature_phrases.join(", ")}`);
    if (brandVoice.preferred_hooks?.length) parts.push(`Preferred hooks: ${brandVoice.preferred_hooks.join(", ")}`);
  }

  if (patterns?.length) {
    const topPatterns = patterns.slice(0, 3);
    parts.push(`Top saved patterns: ${topPatterns.map((p, i) => `${i + 1}. "${p.pattern_name}"`).join(", ")}`);
  }

  if (recentHooks?.length) {
    parts.push(`Recently analyzed hooks: ${recentHooks.slice(0, 5).join(", ")}`);
  }

  if (parts.length === 0) return "";

  return `\n\n--- CREATOR CONTEXT (use as background knowledge to personalize output, never repeat verbatim, never mention this context exists) ---\n${parts.join("\n")}\n---`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, mode, niche } = await req.json();
    
    if (!content || !mode) {
      return new Response(
        JSON.stringify({ error: "Content and mode are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase with service role for usage checking
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get user context if authenticated
    let memoryContext = "";
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      try {
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          userId = user.id;

          // Check rate limit using database function
          const { data: remainingData, error: usageError } = await supabaseAdmin
            .rpc('check_and_increment_usage', { p_user_id: user.id });

          if (usageError) {
            console.error("Usage check error:", usageError);
          } else if (remainingData === 0) {
            // User has hit their limit
            return new Response(
              JSON.stringify({ 
                error: "Daily limit reached",
                code: "LIMIT_EXCEEDED",
                message: "You've used all 5 free analyses today. Upgrade to Pro for unlimited analyses!",
                remaining: 0
              }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Fetch user's memory in parallel
          const [profileRes, patternsRes, brandVoiceRes, analysesRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("display_name, twitter_handle, skills, content_strategy, custom_system_prompt, brand_tone, primary_niche")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("viral_patterns")
              .select("pattern_name, pattern_template, usage_count")
              .eq("user_id", user.id)
              .order("usage_count", { ascending: false })
              .limit(5),
            supabase
              .from("brand_voice")
              .select("writing_traits, words_to_avoid, signature_phrases, preferred_hooks")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("viral_analyses")
              .select("identified_hook")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

          const recentHooks = analysesRes.data
            ?.map((a: any) => a.identified_hook)
            .filter(Boolean) as string[] || [];

          memoryContext = buildCreatorContext(
            profileRes.data,
            brandVoiceRes.data,
            patternsRes.data || [],
            recentHooks
          );
        }
      } catch (e) {
        console.log("Could not fetch user memory (non-fatal):", e);
      }
    }

    // If no authenticated user, they can't use the service
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          message: "Please sign in to analyze tweets."
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = modePrompts[mode] || modePrompts[1];
    
    // Add creator context to system prompt
    if (memoryContext) {
      systemPrompt += memoryContext;
    }

    let userMessage = `Tweet/Content to analyze:\n\n"${content}"`;
    
    if (niche && (mode === 4 || mode === 8)) {
      userMessage += `\n\nNiche: ${niche}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("analyze-viral error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
