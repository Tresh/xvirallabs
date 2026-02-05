import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ViralLabs Content Lab, a growth-focused content strategist and psychology-driven content coach.

Your role is to:
- Build data-backed, psychology-informed content systems
- Help creators grow reach, trust, retention, and revenue
- Design content calendars that compound over time

You do NOT generate random posts.
Every piece of content must serve at least one goal:
- Reach (virality)
- Authority (trust)
- Retention (loyal audience)
- Conversion (sales)

You think in:
- Attention economics
- Behavioral psychology
- Platform-native Twitter/X mechanics
- Creator monetization funnels

You adapt outputs based on:
- User niche
- Growth stage
- Monetization intent
- Inspirations provided

Content Psychology Framework - Use these 5 buckets:
1. Viral / Reach Content - Optimized for discovery, curiosity, and shares
2. Authority / Trust Content - Builds credibility and expertise
3. Retention / Relationship Content - Makes followers stay and feel seen
4. Education / Grooming Content - Trains the audience to understand the problem you solve
5. Conversion / Sales Content - Turns attention into leads or buyers`;

// DNA Extraction prompt for analyzing inspiration accounts
const DNA_EXTRACTION_PROMPT = `Analyze the Twitter/X account style provided.

Extract:
- Common hook styles they use
- Content formats they repeat
- Psychological angles they employ
- How they balance value vs personality
- Monetization signals (soft vs hard selling)

Summarize:
- "What makes this account work" (3 bullet points)
- "What should NOT be copied" (2 bullet points)
- "How to adapt this to your own voice" (2 actionable tips)

Keep it actionable and specific. Output in clear sections.`;

// Calendar generation prompt
const CALENDAR_GENERATION_PROMPT = `Generate a content calendar for the specified number of days.

For EACH day, output a JSON object with:
{
  "day_number": <number>,
  "content_goal": "<reach|authority|retention|education|conversion>",
  "content_type": "<tweet|thread|reply_bait|soft_sell|story|value_bomb|contrarian>",
  "psychological_trigger": "<specific trigger like curiosity gap, social proof, fear of missing out, identity signaling, etc>",
  "post_brief": "<2-3 sentence description of what to post about>"
}

Requirements:
- Balance all 5 content psychology buckets throughout the calendar
- Start with trust-building content
- Gradually ramp up reach content
- Warm audience before any conversion content
- Avoid repetition and burnout
- Match the user's posting capacity

Output ONLY a valid JSON array of day objects. No markdown, no explanation, just the JSON array.`;

// Draft generation prompt
const DRAFT_GENERATION_PROMPT = `Write the actual tweet/thread content for this post brief.

Requirements:
- Use platform-native Twitter/X language
- Match the specified niche and tone
- Optimize for replies and dwell time
- Make it feel authentic, not AI-generated
- Keep tweets under 280 characters unless it's a thread

Also provide:
- "why_it_works": <1-2 sentences explaining the psychological mechanism>
- "action_driven": <what action this post drives - e.g., "profile visit", "reply", "bookmark", "follow">

Output as JSON:
{
  "draft_content": "<the actual tweet or thread>",
  "why_it_works": "<explanation>",
  "action_driven": "<action>"
}`;

// Coaching prompt
const COACHING_PROMPT = `Act as a daily content coach for this post.

Provide:
1. Intent explanation (why this post matters today, 1-2 sentences)
2. Best posting time (with reasoning based on content type)
3. Reply strategy (how to engage with replies to boost algorithm)
4. 2-3 follow-up suggestions (what to post after this one performs)

Keep guidance short and actionable.

Output as JSON:
{
  "intent_explanation": "<string>",
  "best_posting_time": "<string>",
  "reply_strategy": "<string>",
  "follow_up_suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
}`;

interface CalendarSettings {
  calendarId: string;
  primaryNiche: string;
  subNiches?: string[];
  mainGoal: string;
  monetizationType?: string;
  postingCapacity: string;
  calendarLength: number;
  inspirationHandles?: string[];
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

    // Handle different actions
    switch (action) {
      case "generate_calendar": {
        const settings = params as CalendarSettings;
        
        // Free users: 7 days, Paid users: full calendar
        const actualLength = isPaidUser ? settings.calendarLength : Math.min(settings.calendarLength, 7);
        
        const userPrompt = `Create a ${actualLength}-day content calendar.

User Profile:
- Primary Niche: ${settings.primaryNiche}
${settings.subNiches?.length ? `- Sub-niches: ${settings.subNiches.join(", ")}` : ""}
- Main Goal: ${settings.mainGoal}
${settings.monetizationType ? `- Monetization: ${settings.monetizationType}` : ""}
- Posting Capacity: ${settings.postingCapacity} (${settings.postingCapacity === "low" ? "3-4x/week" : settings.postingCapacity === "medium" ? "1x/day" : "2-3x/day"})

Generate exactly ${actualLength} days of content.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT + "\n\n" + CALENDAR_GENERATION_PROMPT },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI error:", errorText);
          throw new Error("Failed to generate calendar");
        }

        const aiResponse = await response.json();
        const calendarContent = aiResponse.choices[0]?.message?.content;

        // Parse the JSON response
        let calendarDays;
        try {
          // Clean the response - remove markdown code blocks if present
          let cleanedContent = calendarContent.trim();
          if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.slice(7);
          }
          if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.slice(3);
          }
          if (cleanedContent.endsWith("```")) {
            cleanedContent = cleanedContent.slice(0, -3);
          }
          calendarDays = JSON.parse(cleanedContent.trim());
        } catch (e) {
          console.error("Failed to parse calendar JSON:", e, calendarContent);
          throw new Error("Invalid calendar format from AI");
        }

        // Insert calendar days into database
        const dayInserts = calendarDays.map((day: any) => ({
          calendar_id: settings.calendarId,
          user_id: user.id,
          day_number: day.day_number,
          content_goal: day.content_goal,
          content_type: day.content_type,
          psychological_trigger: day.psychological_trigger,
          post_brief: day.post_brief,
          status: "pending",
        }));

        const { error: insertError } = await supabaseAdmin
          .from("content_calendar_days")
          .insert(dayInserts);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error("Failed to save calendar");
        }

        // Update calendar status
        await supabaseAdmin
          .from("content_calendars")
          .update({ status: "ready", calendar_length: actualLength })
          .eq("id", settings.calendarId);

        return new Response(
          JSON.stringify({ success: true, days: calendarDays.length, isPaidUser }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_draft": {
        const { dayId, postBrief, contentGoal, contentType, niche } = params;

        // Free users: limited drafts
        if (!isPaidUser) {
          const { count } = await supabase
            .from("content_calendar_days")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .not("draft_content", "is", null);

          if ((count || 0) >= 5) {
            return new Response(
              JSON.stringify({ error: "Free users limited to 5 drafts. Upgrade to Pro!" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        const userPrompt = `Write content for:
Niche: ${niche}
Goal: ${contentGoal}
Type: ${contentType}
Brief: ${postBrief}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT + "\n\n" + DRAFT_GENERATION_PROMPT },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate draft");
        }

        const aiResponse = await response.json();
        let draftData;
        try {
          let content = aiResponse.choices[0]?.message?.content.trim();
          if (content.startsWith("```json")) content = content.slice(7);
          if (content.startsWith("```")) content = content.slice(3);
          if (content.endsWith("```")) content = content.slice(0, -3);
          draftData = JSON.parse(content.trim());
        } catch (e) {
          console.error("Failed to parse draft:", e);
          throw new Error("Invalid draft format");
        }

        // Update the calendar day with the draft
        const { error: updateError } = await supabaseAdmin
          .from("content_calendar_days")
          .update({
            draft_content: draftData.draft_content,
            draft_why_it_works: draftData.why_it_works,
            draft_action_driven: draftData.action_driven,
            status: "drafted",
          })
          .eq("id", dayId);

        if (updateError) {
          throw new Error("Failed to save draft");
        }

        return new Response(
          JSON.stringify({ success: true, draft: draftData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_coaching": {
        const { dayId, postBrief, contentGoal, draftContent } = params;

        // Coaching is Pro+ only
        if (!isPaidUser) {
          return new Response(
            JSON.stringify({ error: "Daily coaching is a Pro feature. Upgrade to unlock!" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const userPrompt = `Coach me on this post:
Goal: ${contentGoal}
Brief: ${postBrief}
${draftContent ? `Draft: ${draftContent}` : ""}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: COACHING_PROMPT },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate coaching");
        }

        const aiResponse = await response.json();
        let coachingData;
        try {
          let content = aiResponse.choices[0]?.message?.content.trim();
          if (content.startsWith("```json")) content = content.slice(7);
          if (content.startsWith("```")) content = content.slice(3);
          if (content.endsWith("```")) content = content.slice(0, -3);
          coachingData = JSON.parse(content.trim());
        } catch (e) {
          console.error("Failed to parse coaching:", e);
          throw new Error("Invalid coaching format");
        }

        // Save coaching to database
        const { error: insertError } = await supabaseAdmin
          .from("content_coaching")
          .insert({
            calendar_day_id: dayId,
            user_id: user.id,
            intent_explanation: coachingData.intent_explanation,
            best_posting_time: coachingData.best_posting_time,
            reply_strategy: coachingData.reply_strategy,
            follow_up_suggestions: coachingData.follow_up_suggestions,
          });

        if (insertError) {
          throw new Error("Failed to save coaching");
        }

        return new Response(
          JSON.stringify({ success: true, coaching: coachingData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "analyze_inspiration": {
        const { calendarId, handle } = params;

        // DNA extraction is Pro+ only
        if (!isPaidUser) {
          return new Response(
            JSON.stringify({ error: "Account DNA analysis is a Pro feature. Upgrade to unlock!" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const userPrompt = `Analyze the Twitter/X account: @${handle}

Note: I don't have access to real-time data, so analyze based on common patterns for accounts in this style. Provide actionable insights the user can apply to their own content strategy.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: DNA_EXTRACTION_PROMPT },
              { role: "user", content: userPrompt },
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze account");
        }

        // For streaming response, return directly
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
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
