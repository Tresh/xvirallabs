

# Plan: Improve Brand Content Planner + Add Memory Page

## What's Being Built

Three major improvements:

### 1. New "Memory" Sidebar Page — AI Identity & Personalization Hub
A new sidebar item called **"Memory"** (with Brain icon) where users store persistent context the AI always uses:
- **Name** (text input)
- **Twitter/X Handle** (text input)  
- **Skills** (tag-style multi-input)
- **Content Strategy** (textarea — what they're building, how they want to grow)
- **System Prompt** (textarea — custom instructions for AI behavior)
- **Tone & Voice** (select: authoritative, relatable, bold, playful)
- **Words to Avoid** (tag-style multi-input)
- **Signature Phrases** (tag-style multi-input)

This data is stored across the existing `profiles` and `brand_voice` tables. We'll add new columns to `profiles` for `display_name`, `skills`, `content_strategy`, and `custom_system_prompt` via a migration.

### 2. Feed Memory Into All AI Calls
Both edge functions (`analyze-viral` and `content-lab`) will fetch the user's full Memory profile and inject it as a **system-level context block** — clearly separated so the AI treats it as background knowledge, not user instructions. The prompt wrapper will say:

```
--- CREATOR CONTEXT (use as background knowledge, never repeat verbatim) ---
Name: ...
Platform: Twitter/X
Skills: ...
Content Strategy: ...
Custom Instructions: ...
Tone: ...
---
```

This replaces the current partial `buildMemoryContext` approach with a complete, consistent context injection across both functions.

### 3. Smart Save Routing from Analysis Results
After running an analysis, the save action routes results to the correct destination based on mode:
- **Mode 3 (Extract Pattern)** → saves to `viral_patterns` table, shows in Patterns tab
- **Mode 8 (Ideas)** → saves to `idea_vault` table, shows in Ideas tab  
- **All other modes** → saves to `viral_analyses` table (current behavior), shows in Analyses tab

The "Save to Library" button label will change dynamically: "Save Pattern", "Save Idea", or "Save Analysis".

### 4. Content Planner UX Improvements
- Onboarding Step 1: Pre-fill niche from Memory profile if available
- Show the user's name/handle in the Content Lab header when available
- Mind Map generation includes the user's Memory context for better personalization

---

## Technical Details

### Database Migration
Add 3 new columns to `profiles`:
```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_strategy text,
  ADD COLUMN IF NOT EXISTS custom_system_prompt text;
```

### Files to Create
- `src/pages/Memory.tsx` — Full Memory page with form sections for all fields, auto-saves on change with debounce

### Files to Modify
- `src/App.tsx` — Add `/memory` route
- `src/components/dashboard/DashboardSidebar.tsx` — Add "Memory" nav item (Brain icon)
- `src/contexts/AuthContext.tsx` — Extend `Profile` interface with new fields
- `src/pages/Analyze.tsx` — Smart save routing by mode (pattern/idea/analysis)
- `supabase/functions/analyze-viral/index.ts` — Fetch full Memory context, inject as system prompt prefix
- `supabase/functions/content-lab/index.ts` — Same Memory context injection for all content generation actions
- `src/components/content-lab/ContentBankOnboarding.tsx` — Pre-fill niche from profile

### Memory Page Layout
Single-column, card-based form:
1. **Identity Card** — Name, Twitter handle
2. **Skills & Expertise Card** — Tag input for skills
3. **Content Strategy Card** — Textarea for strategy description
4. **AI Instructions Card** — Custom system prompt textarea with helper text explaining what this does
5. **Voice & Style Card** — Tone selector, writing traits, words to avoid, signature phrases (from existing `brand_voice` table)

All fields auto-save with a debounced update (1s delay) and show a subtle "Saved" indicator.

