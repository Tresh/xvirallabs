import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== MASTER SYSTEM PROMPT (CONTENT BANK ENGINE) =====
const SYSTEM_PROMPT = `You are ViralLabs Content Engine, an elite Twitter/X growth strategist.

Your job is to generate high-volume, psychology-driven content banks, NOT calendars.

For each day:
- Generate MULTIPLE posts
- Across MULTIPLE formats
- Using MULTIPLE psychological triggers

You understand that creators win by:
- Posting frequently
- Testing angles
- Letting the algorithm pick winners

You NEVER generate "one post per day".
You generate OPTIONS.

Twitter/X is a short-form, attention-driven platform.

Content must:
- Stop the scroll
- Trigger emotion
- Invite reaction
- Reward curiosity
- Normalize clickbait (without lying)

This system does NOT optimize for politeness or professionalism.
It optimizes for:
- Attention
- Replies
- Bookmarks
- Profile clicks
- Sales intent

Every day should feel like: "What do I feel like posting today?"`;

// ===== PSYCHOLOGY TRIGGERS =====
const PSYCHOLOGY_TRIGGERS = [
  "Curiosity gaps",
  "Fear of missing out",
  "Identity signaling",
  "Authority bias",
  "Social proof",
  "Loss aversion",
  "Relatability",
  "Status aspiration",
  "Controversy",
  "Pattern interrupt",
  "Open loops",
  "Tribal belonging"
];

// ===== CONTENT BANK GENERATION PROMPT =====
const CONTENT_BANK_PROMPT = `Generate a Daily Twitter/X Content Bank.

For EACH post, output a JSON object with these exact fields:
{
  "post_number": <number 1-10>,
  "post_category": "<clickbait|engagement|authority|thread|sales|relatable>",
  "psychological_trigger": "<specific trigger from: ${PSYCHOLOGY_TRIGGERS.join(", ")}>",
  "content_goal": "<reach|replies|bookmarks|profile_clicks|sales>",
  "content_type": "<tweet|thread|poll|question|hot_take|story|value_bomb>",
  "post_text": "<the actual tweet text, under 280 chars for single tweets>",
  "why_it_works": "<1 sentence explaining the psychology>",
  "primary_action": "<what this drives: reply, bookmark, follow, click_link, DM>"
}

POST CATEGORY REQUIREMENTS:
🧲 Clickbait/Curiosity (2 posts): Pure scroll-stoppers. Slightly unhinged. Forces a click or reply.
💬 Engagement Farming (2 posts): Opinion bait. Questions. "Agree/disagree" energy. Designed for replies, not likes.
🧠 Authority/Psychology (2 posts): Short insights. Contrarian takes. "Here's what nobody tells you."
🧵 Thread/Long-Form (2 posts): Educational but dramatic. Built on open loops. Monetization-aware.
💰 Sales/Conversion (1 post): Soft sell. Problem-aware. Leads to product, service, or DM.
🧍 Relatable/Identity (1 post): "If you're like me…" Makes audience feel seen. Builds retention.

CRITICAL RULES:
- Never repeat the same psychology trigger more than twice per day
- No LinkedIn tone
- No filler
- Embrace clickbait, curiosity, and emotion
- Short-form, attention-first language

Output ONLY a valid JSON array of 10 post objects. No markdown, no explanation, just the JSON array.`;

// ===== UNHINGED MODE ADDITION =====
const UNHINGED_ADDITION = `
UNHINGED MODE ACTIVATED 🔥
Write bolder. Slightly controversial. Push boundaries.
Still aligned with the niche. Optimized for replies, not safety.
More personality. More edge. More "I can't believe they said that."
Make people screenshot and share.`;

// ===== DRAFT REGENERATION PROMPT =====
const DRAFT_REGEN_PROMPT = `Regenerate this specific post with a fresh angle.

Keep:
- Same post category
- Same general goal

Change:
- The hook
- The angle
- The psychology trigger

Make it feel like a completely different post that serves the same purpose.

Output as JSON:
{
  "post_text": "<new tweet text>",
  "psychological_trigger": "<new trigger used>",
  "why_it_works": "<1 sentence explanation>"
}`;

interface ContentBankSettings {
  calendarId: string;
  primaryNiche: string;
  audienceLevel: string;
  mainGoal: string;
  dayNumber: number;
  unhingedMode: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user tier for access control
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    const tier = profile?.tier || "free";
    const isPaidUser = tier === "pro" || tier === "elite";

    switch (action) {
      // ===== GENERATE DAILY CONTENT BANK =====
      case "generate_content_bank": {
        const settings = params as ContentBankSettings;
        
        // Free users: 5 posts max, Paid users: 10+ posts
        const postCount = isPaidUser ? 10 : 5;
        const categories = isPaidUser 
          ? ["clickbait", "clickbait", "engagement", "engagement", "authority", "authority", "thread", "thread", "sales", "relatable"]
          : ["clickbait", "engagement", "authority", "thread", "relatable"]; // No sales for free

        const systemPrompt = settings.unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Generate a Daily Twitter/X Content Bank for:

Niche: ${settings.primaryNiche}
Audience level: ${settings.audienceLevel || "intermediate"}
Goal: ${settings.mainGoal}
Day: ${settings.dayNumber}

Requirements:
- Generate exactly ${postCount} posts for today
- Use short-form, attention-first language
- Embrace clickbait, curiosity, and emotion
- No LinkedIn tone
- No filler

${!isPaidUser ? "NOTE: This is a FREE user - do NOT include any sales/conversion posts." : ""}

${CONTENT_BANK_PROMPT}`;

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
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI error:", errorText);
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw new Error("Failed to generate content bank");
        }

        const aiResponse = await response.json();
        const bankContent = aiResponse.choices[0]?.message?.content;

        // Parse the JSON response
        let posts;
        try {
          let cleanedContent = bankContent.trim();
          if (cleanedContent.startsWith("```json")) cleanedContent = cleanedContent.slice(7);
          if (cleanedContent.startsWith("```")) cleanedContent = cleanedContent.slice(3);
          if (cleanedContent.endsWith("```")) cleanedContent = cleanedContent.slice(0, -3);
          posts = JSON.parse(cleanedContent.trim());
        } catch (e) {
          console.error("Failed to parse content bank JSON:", e, bankContent);
          throw new Error("Invalid content format from AI");
        }

        // Insert posts into database as calendar days
        const dayInserts = posts.map((post: any, index: number) => ({
          calendar_id: settings.calendarId,
          user_id: user.id,
          day_number: settings.dayNumber,
          post_number: index + 1,
          post_category: post.post_category,
          content_goal: post.content_goal,
          content_type: post.content_type,
          psychological_trigger: post.psychological_trigger,
          post_brief: post.why_it_works,
          draft_content: post.post_text,
          draft_why_it_works: post.why_it_works,
          draft_action_driven: post.primary_action,
          status: "drafted",
        }));

        const { error: insertError } = await supabaseAdmin
          .from("content_calendar_days")
          .insert(dayInserts);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error("Failed to save content bank");
        }

        // Update calendar status
        await supabaseAdmin
          .from("content_calendars")
          .update({ status: "ready" })
          .eq("id", settings.calendarId);

        return new Response(
          JSON.stringify({ success: true, posts: posts.length, isPaidUser }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ===== REGENERATE A SINGLE POST =====
      case "regenerate_post": {
        const { postId, originalPost, niche, category, unhingedMode } = params;

        const systemPrompt = unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Original post in ${niche} niche, category: ${category}
"${originalPost}"

${DRAFT_REGEN_PROMPT}`;

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
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) throw new Error("Failed to regenerate post");

        const aiResponse = await response.json();
        let newPost;
        try {
          let content = aiResponse.choices[0]?.message?.content.trim();
          if (content.startsWith("```json")) content = content.slice(7);
          if (content.startsWith("```")) content = content.slice(3);
          if (content.endsWith("```")) content = content.slice(0, -3);
          newPost = JSON.parse(content.trim());
        } catch (e) {
          console.error("Failed to parse regenerated post:", e);
          throw new Error("Invalid post format");
        }

        // Update the post in database
        const { error: updateError } = await supabaseAdmin
          .from("content_calendar_days")
          .update({
            draft_content: newPost.post_text,
            psychological_trigger: newPost.psychological_trigger,
            draft_why_it_works: newPost.why_it_works,
          })
          .eq("id", postId);

        if (updateError) throw new Error("Failed to save regenerated post");

        return new Response(
          JSON.stringify({ success: true, post: newPost }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ===== GENERATE NEXT DAY =====
      case "generate_next_day": {
        const { calendarId, primaryNiche, audienceLevel, mainGoal, unhingedMode, currentMaxDay } = params;

        // Free users limited to 1 day
        if (!isPaidUser && currentMaxDay >= 1) {
          return new Response(
            JSON.stringify({ error: "Free users can generate 1 day. Upgrade to Pro for 30-day content banks!" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Paid users limited to 30 days
        if (currentMaxDay >= 30) {
          return new Response(
            JSON.stringify({ error: "Maximum 30 days reached for this content bank." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const nextDay = currentMaxDay + 1;
        const postCount = isPaidUser ? 10 : 5;

        const systemPrompt = unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Generate a Daily Twitter/X Content Bank for:

Niche: ${primaryNiche}
Audience level: ${audienceLevel || "intermediate"}
Goal: ${mainGoal}
Day: ${nextDay}

Requirements:
- Generate exactly ${postCount} posts for today
- This is day ${nextDay} - vary the angles from previous days
- Fresh psychology triggers
- New hooks and formats

${!isPaidUser ? "NOTE: This is a FREE user - do NOT include any sales/conversion posts." : ""}

${CONTENT_BANK_PROMPT}`;

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
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw new Error("Failed to generate next day");
        }

        const aiResponse = await response.json();
        let posts;
        try {
          let content = aiResponse.choices[0]?.message?.content.trim();
          if (content.startsWith("```json")) content = content.slice(7);
          if (content.startsWith("```")) content = content.slice(3);
          if (content.endsWith("```")) content = content.slice(0, -3);
          posts = JSON.parse(content.trim());
        } catch (e) {
          console.error("Failed to parse next day:", e);
          throw new Error("Invalid content format");
        }

        const dayInserts = posts.map((post: any, index: number) => ({
          calendar_id: calendarId,
          user_id: user.id,
          day_number: nextDay,
          post_number: index + 1,
          post_category: post.post_category,
          content_goal: post.content_goal,
          content_type: post.content_type,
          psychological_trigger: post.psychological_trigger,
          post_brief: post.why_it_works,
          draft_content: post.post_text,
          draft_why_it_works: post.why_it_works,
          draft_action_driven: post.primary_action,
          status: "drafted",
        }));

        const { error: insertError } = await supabaseAdmin
          .from("content_calendar_days")
          .insert(dayInserts);

        if (insertError) throw new Error("Failed to save next day");

        // Update calendar length
        await supabaseAdmin
          .from("content_calendars")
          .update({ calendar_length: nextDay })
          .eq("id", calendarId);

        return new Response(
          JSON.stringify({ success: true, dayNumber: nextDay, posts: posts.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("content-lab error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
