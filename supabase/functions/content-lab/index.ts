import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== BRAND PILLAR ARCHITECT SYSTEM PROMPT =====
const BRAND_PILLAR_PROMPT = `You are a Brand Content Strategist.

Based on the user's niche, goals, and audience:
• Define the brand's core content pillars
• Ensure pillars balance:
  • Growth (reach)
  • Trust (authority)
  • Retention (identity)
  • Monetization (sales)

Twitter/X is short-form and attention-driven.
Pillars must be practical, psychological, and postable daily.

For each pillar, provide:
- pillar_name: A clear, actionable name (e.g., "Authority & Expertise", "Viral Discovery")
- purpose: What this pillar achieves for the brand
- audience_need: What audience pain/desire it addresses
- psychology_trigger: The core psychology it activates
- example_formats: Array of 3-4 content formats that work for this pillar

Output as a JSON array of exactly 5 pillar objects. No markdown, just JSON.`;

// ===== MIND-MAP PLANNER PROMPT =====
const MIND_MAP_PROMPT = `Using the brand content pillars provided, build a content mind-map plan.

Rules:
• Each day focuses on ONE primary pillar
• Each day contains 5-10 tweet IDEAS (short titles, not full content)
• Ideas must vary in format, psychology, and intent
• Do NOT generate full content yet - just structured idea titles

For each day, output:
{
  "day_number": <number>,
  "pillar_id": "<uuid of the pillar>",
  "pillar_name": "<name of the pillar>",
  "ideas": [
    {
      "idea_title": "<short actionable title, max 50 chars>",
      "idea_type": "<short_take|contrarian|framework|thread|question|hot_take|story|value_bomb|quote_tweet|poll>",
      "intent": "<reach|replies|bookmarks|sales|authority>",
      "psychology_hint": "<brief psychology note>"
    }
  ]
}

Output as a JSON array of day objects. Each day should have 5-10 ideas.`;

// ===== SINGLE TWEET GENERATOR PROMPT =====
const SINGLE_TWEET_PROMPT = `Generate the full Twitter/X post for this idea.

TWITTER PSYCHOLOGY RULES:
• Twitter is RAGE, CURIOSITY, and EGO
• Nobody reads boring. They read controversy.
• Stop the scroll with PATTERN INTERRUPTS
• Use open loops (incomplete thoughts that demand clicks)
• Clickbait is not lying - it's strategic curiosity
• Rage bait = engagement bait = algorithm bait
• Make people feel SOMETHING: anger, FOMO, superiority, shock

CONTENT FORMULAS THAT WORK:
• "Unpopular opinion: [controversial take]"
• "Stop doing [thing everyone does]"
• "Nobody is talking about this..."
• "I lost/made $X doing [thing]. Here's what I learned:"
• "The [niche] industry doesn't want you to know this"
• "Delete this tweet before [entity] sees it"
• "This is the ONLY [thing] you need to [result]"
• "[Number]% of people will ignore this. The rest will [benefit]"

REQUIREMENTS:
• Under 280 characters for single tweets
• NO hashtags, NO emojis spam
• Platform-native language (not LinkedIn)
• Hook must create curiosity gap or emotional spike
• End with implicit call-to-action when possible

Output as JSON:
{
  "content": "<the full tweet text - raw, punchy, scroll-stopping>",
  "why_it_works": "<1-2 sentences on the psychology trigger used>",
  "hook_type": "<curiosity|fear|authority|relatability|controversy|urgency|rage|fomo>"
}`;

// ===== IMPROVE TWEET PROMPT =====
const IMPROVE_TWEET_PROMPT = `Improve this tweet using the user's instruction.

Keep:
• The core idea
• Twitter-native tone

Enhance:
• Hook strength
• Emotional pull
• Clarity
• Engagement potential

Output as JSON:
{
  "content": "<improved tweet text>",
  "why_it_works": "<explanation of the improvement>",
  "changes_made": "<brief description of what changed>"
}`;

// ===== CONTENT BANK ENGINE PROMPTS =====
const SYSTEM_PROMPT = `You are ViralLabs Content Engine - an UNHINGED Twitter/X growth machine.

CORE TRUTH: Twitter rewards EMOTION, not information.

THE ALGORITHM LOVES:
• Controversy and hot takes
• Rage bait that forces replies
• Curiosity gaps that demand clicks
• Identity attacks that make people defend themselves
• FOMO triggers that create urgency
• Tribal posts that make one group feel superior

PSYCHOLOGICAL WARFARE TACTICS:
1. Pattern Interrupt: Start with something unexpected/shocking
2. Open Loop: Create incomplete thoughts that NEED closure
3. Status Threat: Challenge people's identity or beliefs
4. Loss Aversion: Show what they're missing/losing
5. Social Proof: Make them feel left behind
6. Rage Bait: State something controversial but defensible

WHAT GETS ENGAGEMENT:
• "Unpopular opinion..." (works every time)
• "Nobody is ready for this conversation..."
• "This might get me canceled but..."
• "I'm going to say what everyone is thinking..."
• "Stop doing [common thing]. Here's why:"
• "[Thing] is a scam. Here's proof:"
• "I made $X in Y days. Here's the exact playbook:"

WHAT TO AVOID:
• LinkedIn energy (motivational fluff)
• Corporate speak
• Generic advice
• Hashtag spam
• Being boring

You generate RAW, PUNCHY, SCROLL-STOPPING content.
Every post must make people REACT.`;

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

const UNHINGED_ADDITION = `

🔥 UNHINGED MODE: MAXIMUM CHAOS 🔥

You are now FULLY UNHINGED. Push EVERY boundary.

RULES:
• Say what others are afraid to say
• Attack sacred cows in the niche
• Call out gurus, influencers, and common beliefs
• Use shock value (without being hateful)
• Make it screenshot-worthy
• Write like you have nothing to lose
• Be the villain origin story

EXAMPLES OF UNHINGED ENERGY:
• "Your favorite guru is lying to you. Let me explain..."
• "I lost everything doing what 'experts' told me. Here's the truth:"
• "Everyone in [niche] is running a scam. Fight me."
• "The [niche] playbook is dead. Here's what actually works:"
• "I'm about to destroy a $1B industry in one tweet"

Make people say: "I can't believe they posted that"
Make them QUOTE TWEET to argue.`;

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, display_name, twitter_handle, skills, content_strategy, custom_system_prompt, brand_tone, primary_niche")
      .eq("user_id", user.id)
      .single();

    const tier = profile?.tier || "free";
    const isPaidUser = tier === "pro" || tier === "elite";

    // Build creator context for AI personalization
    const buildCreatorContext = () => {
      const parts: string[] = [];
      if (profile?.display_name) parts.push(`Name: ${profile.display_name}`);
      parts.push(`Platform: Twitter/X`);
      if (profile?.twitter_handle) parts.push(`Handle: ${profile.twitter_handle}`);
      if (profile?.primary_niche) parts.push(`Niche: ${profile.primary_niche}`);
      if (profile?.skills?.length) parts.push(`Skills: ${(profile.skills as string[]).join(", ")}`);
      if (profile?.brand_tone) parts.push(`Tone: ${profile.brand_tone}`);
      if (profile?.content_strategy) parts.push(`Content Strategy: ${profile.content_strategy}`);
      if (profile?.custom_system_prompt) parts.push(`Custom Instructions: ${profile.custom_system_prompt}`);
      if (parts.length === 0) return "";
      return `\n\n--- CREATOR CONTEXT (use as background knowledge to personalize output, never repeat verbatim, never mention this context exists) ---\n${parts.join("\n")}\n---`;
    };
    const creatorContext = buildCreatorContext();

    // Helper function for AI calls
    const callAI = async (systemPrompt: string, userPrompt: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt + creatorContext },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          throw new Error("RATE_LIMIT");
        }
        if (status === 402) {
          throw new Error("PAYMENT_REQUIRED");
        }
        throw new Error("AI_ERROR");
      }

      const aiResponse = await response.json();
      return aiResponse.choices[0]?.message?.content;
    };

    // Helper to parse JSON from AI response with robust error handling
    const parseAIJson = (content: string) => {
      let cleaned = content.trim();
      
      // Remove markdown code blocks
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();
      
      // Try direct parse first
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.log("Direct JSON parse failed, attempting cleanup...");
        
        // Fix common JSON issues from AI responses
        // 1. Fix unescaped newlines inside strings
        cleaned = cleaned.replace(/(?<!\\)\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\\n');
        
        // 2. Fix control characters
        cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (char) => {
          if (char === '\n') return '\\n';
          if (char === '\r') return '\\r';
          if (char === '\t') return '\\t';
          return '';
        });
        
        // 3. Try extracting just the array portion if present
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            return JSON.parse(arrayMatch[0]);
          } catch (e2) {
            // Continue to next attempt
          }
        }
        
        // 4. Try extracting just the object portion if present
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          try {
            return JSON.parse(objectMatch[0]);
          } catch (e3) {
            // Continue to fallback
          }
        }
        
        console.error("All JSON parse attempts failed. Raw content:", cleaned.substring(0, 500));
        throw new Error("AI returned invalid JSON format");
      }
    };

    switch (action) {
      // ===== LAYER 1: GENERATE BRAND PILLARS =====
      case "generate_pillars": {
        const { calendarId, niche, goal, audienceLevel, unhingedMode } = params;

        // Free users: 3 pillars, Paid: 5 pillars
        const pillarCount = isPaidUser ? 5 : 3;

        const userPrompt = `Generate exactly ${pillarCount} brand content pillars for:

Niche: ${niche}
Main Goal: ${goal}
Audience Level: ${audienceLevel || "intermediate"}
${unhingedMode ? "Tone: Bold, edgy, slightly controversial" : "Tone: Professional but engaging"}

${pillarCount === 3 ? "Focus on: Authority, Viral/Discovery, and Relatability pillars only." : "Include all 5 pillars: Authority, Relatability, Viral/Discovery, Education, and Conversion."}

${BRAND_PILLAR_PROMPT}`;

        try {
          const content = await callAI(BRAND_PILLAR_PROMPT, userPrompt);
          const pillars = parseAIJson(content);

          // Insert pillars into database
          const pillarInserts = pillars.map((pillar: any, index: number) => ({
            calendar_id: calendarId,
            user_id: user.id,
            pillar_name: pillar.pillar_name,
            pillar_order: index + 1,
            purpose: pillar.purpose,
            audience_need: pillar.audience_need,
            psychology_trigger: pillar.psychology_trigger,
            example_formats: pillar.example_formats,
          }));

          const { data: insertedPillars, error: insertError } = await supabaseAdmin
            .from("brand_pillars")
            .insert(pillarInserts)
            .select();

          if (insertError) throw new Error("Failed to save pillars");

          // Update calendar
          await supabaseAdmin
            .from("content_calendars")
            .update({ pillars_generated: true })
            .eq("id", calendarId);

          return new Response(
            JSON.stringify({ success: true, pillars: insertedPillars }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== LAYER 2: GENERATE MIND-MAP (IDEAS ONLY) =====
      case "generate_mind_map": {
        const { calendarId, pillars, niche, daysToGenerate, unhingedMode } = params;

        // Free: 3 days, Paid: up to 30 days
        const maxDays = isPaidUser ? Math.min(daysToGenerate || 7, 30) : Math.min(daysToGenerate || 3, 3);
        const ideasPerDay = isPaidUser ? 10 : 5;

        const pillarsInfo = pillars.map((p: any) => `- ${p.pillar_name} (ID: ${p.id}): ${p.purpose}`).join("\n");

        const userPrompt = `Generate a ${maxDays}-day content mind-map for:

Niche: ${niche}
${unhingedMode ? "Style: Bold, edgy, attention-grabbing" : "Style: Engaging but professional"}

Brand Pillars:
${pillarsInfo}

Requirements:
- Generate exactly ${maxDays} days
- Each day should have ${ideasPerDay} content ideas
- Rotate through pillars to ensure variety
- Ideas are SHORT TITLES only, not full content

${MIND_MAP_PROMPT}`;

        try {
          const content = await callAI(MIND_MAP_PROMPT, userPrompt);
          const dayPlans = parseAIJson(content);

          // Insert all ideas into database
          const ideaInserts: any[] = [];
          for (const day of dayPlans) {
            const pillarId = pillars.find((p: any) => p.pillar_name === day.pillar_name)?.id || day.pillar_id;
            
            day.ideas.forEach((idea: any, index: number) => {
              ideaInserts.push({
                calendar_id: calendarId,
                pillar_id: pillarId,
                user_id: user.id,
                day_number: day.day_number,
                idea_order: index + 1,
                idea_title: idea.idea_title,
                idea_type: idea.idea_type,
                intent: idea.intent,
                psychology_hint: idea.psychology_hint,
                status: "idea",
              });
            });
          }

          const { error: insertError } = await supabaseAdmin
            .from("content_ideas")
            .insert(ideaInserts);

          if (insertError) throw new Error("Failed to save mind-map");

          // Update calendar
          await supabaseAdmin
            .from("content_calendars")
            .update({ mind_map_generated: true, status: "ready", calendar_length: maxDays })
            .eq("id", calendarId);

          return new Response(
            JSON.stringify({ success: true, days: dayPlans.length, totalIdeas: ideaInserts.length }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== LAYER 3: GENERATE SINGLE TWEET ON DEMAND =====
      case "generate_tweet": {
        const { ideaId, ideaTitle, ideaType, pillarName, niche, intent, unhingedMode } = params;

        const systemPrompt = unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Generate the full Twitter/X post for this idea:

Brand Pillar: ${pillarName}
Idea: ${ideaTitle}
Format: ${ideaType}
Niche: ${niche}
Goal: ${intent}

${SINGLE_TWEET_PROMPT}`;

        try {
          const content = await callAI(systemPrompt, userPrompt);
          const tweet = parseAIJson(content);

          // Update the idea with generated content
          const { error: updateError } = await supabaseAdmin
            .from("content_ideas")
            .update({
              generated_content: tweet.content,
              why_it_works: tweet.why_it_works,
              status: "generated",
            })
            .eq("id", ideaId);

          if (updateError) throw new Error("Failed to save generated tweet");

          return new Response(
            JSON.stringify({ success: true, tweet }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== IMPROVE TWEET =====
      case "improve_tweet": {
        const { ideaId, currentContent, instruction, niche, unhingedMode } = params;

        if (!isPaidUser) {
          return new Response(
            JSON.stringify({ error: "Inline editing is a Pro feature. Upgrade to unlock!" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const systemPrompt = unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Improve this tweet using my instruction:

"${instruction}"

Current tweet:
"${currentContent}"

Niche: ${niche}

${IMPROVE_TWEET_PROMPT}`;

        try {
          const content = await callAI(systemPrompt, userPrompt);
          const improved = parseAIJson(content);

          // Update the idea
          const { error: updateError } = await supabaseAdmin
            .from("content_ideas")
            .update({
              generated_content: improved.content,
              why_it_works: improved.why_it_works,
            })
            .eq("id", ideaId);

          if (updateError) throw new Error("Failed to save improved tweet");

          return new Response(
            JSON.stringify({ success: true, improved }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== SAVE TO VAULT =====
      case "save_to_vault": {
        const { ideaId, content, pillarName, ideaTitle } = params;

        // Insert into idea_vault
        const { error: insertError } = await supabaseAdmin
          .from("idea_vault")
          .insert({
            user_id: user.id,
            idea_title: ideaTitle,
            idea_content: content,
            hook_type: pillarName,
            idea_status: "saved",
          });

        if (insertError) throw new Error("Failed to save to vault");

        // Mark as saved
        await supabaseAdmin
          .from("content_ideas")
          .update({ is_saved_to_vault: true })
          .eq("id", ideaId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ===== LEGACY: GENERATE CONTENT BANK (keep for backward compat) =====
      case "generate_content_bank": {
        const settings = params;
        const postCount = isPaidUser ? 10 : 5;

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

        try {
          const content = await callAI(systemPrompt, userPrompt);
          console.log("AI response received for content bank");
          
          let posts;
          try {
            posts = parseAIJson(content);
          } catch (parseErr) {
            console.error("Failed to parse AI response:", content);
            throw new Error("AI returned invalid JSON");
          }

          if (!Array.isArray(posts) || posts.length === 0) {
            console.error("Posts is not a valid array:", posts);
            throw new Error("AI did not return valid posts array");
          }

          const dayInserts = posts.map((post: any, index: number) => ({
            calendar_id: settings.calendarId,
            user_id: user.id,
            day_number: settings.dayNumber,
            post_number: index + 1,
            post_category: post.post_category || "clickbait",
            content_goal: post.content_goal || "reach",
            content_type: post.content_type || "tweet",
            psychological_trigger: post.psychological_trigger || "curiosity",
            post_brief: post.why_it_works || "Attention-grabbing content",
            draft_content: post.post_text || "",
            draft_why_it_works: post.why_it_works || "",
            draft_action_driven: post.primary_action || "engage",
            status: "drafted",
          }));

          console.log("Inserting posts:", dayInserts.length);

          const { error: insertError } = await supabaseAdmin
            .from("content_calendar_days")
            .insert(dayInserts);

          if (insertError) {
            console.error("Database insert error:", insertError);
            throw new Error(`Failed to save content bank: ${insertError.message}`);
          }

          await supabaseAdmin
            .from("content_calendars")
            .update({ status: "ready" })
            .eq("id", settings.calendarId);

          return new Response(
            JSON.stringify({ success: true, posts: posts.length, isPaidUser }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== LEGACY: REGENERATE POST =====
      case "regenerate_post": {
        const { postId, originalPost, niche, category, unhingedMode } = params;

        const systemPrompt = unhingedMode 
          ? SYSTEM_PROMPT + UNHINGED_ADDITION 
          : SYSTEM_PROMPT;

        const userPrompt = `Original post in ${niche} niche, category: ${category}
"${originalPost}"

Regenerate this specific post with a fresh angle.

Keep:
- Same post category
- Same general goal

Change:
- The hook
- The angle
- The psychology trigger

Output as JSON:
{
  "post_text": "<new tweet text>",
  "psychological_trigger": "<new trigger used>",
  "why_it_works": "<1 sentence explanation>"
}`;

        try {
          const content = await callAI(systemPrompt, userPrompt);
          const newPost = parseAIJson(content);

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
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== LEGACY: GENERATE NEXT DAY =====
      case "generate_next_day": {
        const { calendarId, primaryNiche, audienceLevel, mainGoal, unhingedMode, currentMaxDay } = params;

        if (!isPaidUser && currentMaxDay >= 1) {
          return new Response(
            JSON.stringify({ error: "Free users can generate 1 day. Upgrade to Pro for 30-day content banks!" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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

        try {
          const content = await callAI(systemPrompt, userPrompt);
          const posts = parseAIJson(content);

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

          await supabaseAdmin
            .from("content_calendars")
            .update({ calendar_length: nextDay })
            .eq("id", calendarId);

          return new Response(
            JSON.stringify({ success: true, dayNumber: nextDay, posts: posts.length }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== ANALYZE TWEET PERFORMANCE =====
      case "analyze_performance": {
        const { postId, metrics, tweetUrl, screenshotUrl, originalContent } = params;

        const PERFORMANCE_ANALYSIS_PROMPT = `You are a Twitter/X analytics expert. Analyze this post's performance and provide actionable insights.

Based on the metrics provided, analyze:
1. Overall performance score (0-100)
2. What worked well
3. What could be improved
4. Specific suggestions for future similar posts
5. Psychology insights on why this content performed as it did

Be specific and actionable. Reference the actual metrics.`;

        const userPrompt = `Analyze this tweet's performance:

ORIGINAL TWEET:
${originalContent || "Not provided"}

TWEET URL: ${tweetUrl || "Not provided"}

PERFORMANCE METRICS:
- Impressions: ${metrics.impressions || "N/A"}
- Likes: ${metrics.likes || "N/A"}
- Retweets: ${metrics.retweets || "N/A"}
- Replies: ${metrics.replies || "N/A"}
- Bookmarks: ${metrics.bookmarks || "N/A"}
- Profile Visits: ${metrics.profile_visits || "N/A"}
- Link Clicks: ${metrics.link_clicks || "N/A"}
- Follows Gained: ${metrics.follows_gained || "N/A"}
- Audience Reached: ${metrics.audience_reached || "N/A"}
- Posted Time: ${metrics.posted_time || "N/A"}

Calculate engagement rate and provide analysis.

Output as JSON:
{
  "performance_score": <0-100>,
  "engagement_rate": <calculated percentage>,
  "analysis": "<detailed analysis paragraph>",
  "what_worked": ["<point1>", "<point2>"],
  "what_to_improve": ["<point1>", "<point2>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"],
  "psychology_insights": "<why this performed as it did>"
}`;

        try {
          const content = await callAI(PERFORMANCE_ANALYSIS_PROMPT, userPrompt);
          const analysis = parseAIJson(content);

          // Calculate engagement rate if we have enough data
          let engagementRate = analysis.engagement_rate;
          if (!engagementRate && metrics.impressions > 0) {
            const totalEngagements = (metrics.likes || 0) + (metrics.retweets || 0) + (metrics.replies || 0) + (metrics.bookmarks || 0);
            engagementRate = ((totalEngagements / metrics.impressions) * 100).toFixed(2);
          }

          // Save to database
          const { data: performanceData, error: insertError } = await supabaseAdmin
            .from("post_performance")
            .insert({
              user_id: user.id,
              calendar_day_id: postId || null,
              tweet_url: tweetUrl,
              screenshot_url: screenshotUrl,
              impressions: metrics.impressions,
              likes: metrics.likes,
              retweets: metrics.retweets,
              replies: metrics.replies,
              bookmarks: metrics.bookmarks,
              profile_visits: metrics.profile_visits,
              link_clicks: metrics.link_clicks,
              follows_gained: metrics.follows_gained,
              audience_reached: metrics.audience_reached,
              posted_time: metrics.posted_time,
              engagement_rate: engagementRate,
              ai_analysis: analysis.analysis,
              ai_suggestions: analysis.suggestions,
              performance_score: analysis.performance_score,
            })
            .select()
            .single();

          if (insertError) throw new Error("Failed to save performance data");

          return new Response(
            JSON.stringify({ 
              success: true, 
              performance: performanceData,
              analysis: {
                score: analysis.performance_score,
                engagement_rate: engagementRate,
                what_worked: analysis.what_worked,
                what_to_improve: analysis.what_to_improve,
                suggestions: analysis.suggestions,
                psychology_insights: analysis.psychology_insights,
                full_analysis: analysis.analysis,
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== ANALYZE SCREENSHOT =====
      case "analyze_screenshot": {
        const { screenshotUrl } = params;

        const SCREENSHOT_ANALYSIS_PROMPT = `You are analyzing a Twitter/X analytics screenshot. Extract all visible metrics from the image.

Look for:
- Impressions / Views
- Likes
- Retweets / Reposts
- Replies
- Bookmarks
- Quote Tweets
- Profile Visits
- Link Clicks
- Follows from this post
- Any engagement rate shown
- Posted date/time if visible

Output as JSON:
{
  "impressions": <number or null>,
  "likes": <number or null>,
  "retweets": <number or null>,
  "replies": <number or null>,
  "bookmarks": <number or null>,
  "profile_visits": <number or null>,
  "link_clicks": <number or null>,
  "follows_gained": <number or null>,
  "audience_reached": <number or null>,
  "posted_time": "<ISO date string or null>",
  "confidence": "<high|medium|low>",
  "notes": "<any additional observations>"
}`;

        try {
          // Use vision-capable model for screenshot analysis
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: SCREENSHOT_ANALYSIS_PROMPT },
                { 
                  role: "user", 
                  content: [
                    { type: "text", text: "Extract the Twitter/X metrics from this screenshot:" },
                    { type: "image_url", image_url: { url: screenshotUrl } }
                  ]
                },
              ],
            }),
          });

          if (!response.ok) {
            if (response.status === 429) throw new Error("RATE_LIMIT");
            if (response.status === 402) throw new Error("PAYMENT_REQUIRED");
            throw new Error("AI_ERROR");
          }

          const aiResponse = await response.json();
          const content = aiResponse.choices[0]?.message?.content;
          const metrics = parseAIJson(content);

          return new Response(
            JSON.stringify({ success: true, metrics }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
      }

      // ===== EXPAND TO LONG-FORM CONTENT =====
      case "expand_content": {
        const { originalContent, title, additionalContext, outputFormat, formatInstructions } = params;

        const EXPAND_CONTENT_PROMPT = `You are a viral content strategist and researcher.

Your task is to take short-form content and expand it into comprehensive long-form content.

RULES:
• Research and add relevant data points, statistics, and examples
• Maintain the original voice and tone
• Add depth without losing the punch
• Include actionable insights
• Make it engaging from start to finish

${formatInstructions}`;

        const userPrompt = `Expand this content into ${outputFormat}:

Title/Topic: ${title}

Original Content:
${originalContent}

${additionalContext ? `Additional Context/Direction:\n${additionalContext}` : ""}

Generate comprehensive, well-researched content that expands on the original idea.`;

        try {
          // Stream the response for better UX
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: EXPAND_CONTENT_PROMPT },
                { role: "user", content: userPrompt },
              ],
              stream: true,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) throw new Error("RATE_LIMIT");
            if (response.status === 402) throw new Error("PAYMENT_REQUIRED");
            throw new Error("AI_ERROR");
          }

          return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw e;
        }
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
