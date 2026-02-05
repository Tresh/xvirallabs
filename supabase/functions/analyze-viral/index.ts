import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const modePrompts: Record<number, string> = {
  1: `You are Viral Labs, an elite Twitter/X virality analyst.

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

  2: `You are Viral Labs, a behavioral psychology expert specializing in Twitter/X content.

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

  3: `You are Viral Labs, a viral pattern extraction specialist.

Extract the reusable viral pattern from this post.

Output:
• The exact post structure template (fill-in-the-blank format)
• The hook framework
• The body flow logic
• The closing CTA logic

Format it so it can be reused across ANY niche. Use [PLACEHOLDER] format for variables.`,

  4: `You are Viral Labs, a viral content generator.

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

  5: `You are Viral Labs, a Twitter/X engagement forecaster.

Predict how this post performs on Twitter/X.

Estimate:
• Scroll-stopping potential (1–10 with explanation)
• Dwell time strength (low / medium / high with reasoning)
• Likely engagement type dominance (replies, bookmarks, retweets)

Then suggest 3 structural changes to increase dwell time by at least 30%.

Be specific and actionable.`,

  6: `You are Viral Labs, a viral copywriter.

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

  7: `You are Viral Labs, a thread conversion specialist.

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

  8: `You are Viral Labs, an idea generation engine.

Based on this content and niche, generate 20 viral post ideas inspired by:
• Current Twitter/X content trends
• Psychological triggers
• Proven viral formats

For each idea:
• Give the hook (first line)
• The emotion it triggers
• Why it would stop scrolling (1 sentence)

Number them 1-20 and make each one unique.`,

  9: `You are Viral Labs, a personal brand alignment specialist.

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

    const systemPrompt = modePrompts[mode] || modePrompts[1];
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