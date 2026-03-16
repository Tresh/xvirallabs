# XviralLabs — Content Operating System (Platform-Wide)
# Paste this entire prompt into Lovable exactly as written.
# This is a platform feature for ALL users, not just one account.

---

## FILE 1 — CREATE: supabase/migrations/20260315000002_content_os.sql

```sql
-- Content Pillars table — each user defines up to 6 pillars
CREATE TABLE IF NOT EXISTS public.content_pillars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pillar_name TEXT NOT NULL,
  pillar_description TEXT,
  pillar_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3B8BD4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pillars" ON public.content_pillars
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_content_pillars_updated_at
  BEFORE UPDATE ON public.content_pillars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Content OS table — stores the full daily content batch
CREATE TABLE IF NOT EXISTS public.content_os_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  pillar_name TEXT,
  format TEXT NOT NULL,
  -- formats: two_liner | medium_tweet | thread | article | video_script | newsletter
  title TEXT,
  content TEXT NOT NULL,
  thread_tweets JSONB, -- array of tweet strings for thread format
  video_prompt TEXT,   -- AI video generation prompt
  word_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | approved | posted | skipped
  viral_score INTEGER,
  psychology_trigger TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_os_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content os items" ON public.content_os_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_content_os_items_updated_at
  BEFORE UPDATE ON public.content_os_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast date queries
CREATE INDEX IF NOT EXISTS idx_content_os_user_date
  ON public.content_os_items(user_id, generated_date);
CREATE INDEX IF NOT EXISTS idx_content_pillars_user
  ON public.content_pillars(user_id, pillar_order);
```

---

## FILE 2 — CREATE: src/hooks/useContentPillars.ts

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ContentPillar {
  id: string;
  pillar_name: string;
  pillar_description: string;
  pillar_order: number;
  is_active: boolean;
  color: string;
}

const PILLAR_COLORS = [
  "#3B8BD4", "#639922", "#BA7517",
  "#D85A30", "#7F77DD", "#1D9E75"
];

export function useContentPillars() {
  const { user } = useAuth();
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("content_pillars")
      .select("*")
      .eq("user_id", user.id)
      .order("pillar_order", { ascending: true });
    if (data) setPillars(data as ContentPillar[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const suggestPillars = async (niche: string, brandTone: string) => {
    if (!user || !niche) return { error: "Niche required" };
    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: { action: "suggest_pillars", niche, brandTone },
      });
      if (error) throw error;
      return { pillars: data?.pillars, error: null };
    } catch (e: any) {
      return { pillars: null, error: e.message };
    } finally {
      setIsSuggesting(false);
    }
  };

  const savePillars = async (newPillars: Omit<ContentPillar, "id">[]) => {
    if (!user) return { error: "Not authenticated" };
    // Delete existing and replace
    await supabase.from("content_pillars").delete().eq("user_id", user.id);
    const inserts = newPillars.map((p, i) => ({
      ...p,
      user_id: user.id,
      pillar_order: i + 1,
      color: PILLAR_COLORS[i] || PILLAR_COLORS[0],
    }));
    const { error } = await supabase.from("content_pillars").insert(inserts);
    if (!error) await load();
    return { error };
  };

  const updatePillar = async (id: string, updates: Partial<ContentPillar>) => {
    const { error } = await supabase
      .from("content_pillars").update(updates).eq("id", id);
    if (!error) await load();
    return { error };
  };

  return { pillars, isLoading, isSuggesting, suggestPillars, savePillars, updatePillar, reload: load };
}
```

---

## FILE 3 — CREATE: src/hooks/useContentOS.ts

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ContentOSItem {
  id: string;
  pillar_id: string | null;
  pillar_name: string | null;
  format: "two_liner" | "medium_tweet" | "thread" | "article" | "video_script" | "newsletter";
  title: string | null;
  content: string;
  thread_tweets: string[] | null;
  video_prompt: string | null;
  word_count: number | null;
  status: "pending" | "approved" | "posted" | "skipped";
  viral_score: number | null;
  psychology_trigger: string | null;
  generated_date: string;
  created_at: string;
}

export const FORMAT_CONFIG = {
  two_liner:     { label: "2-Liner",      emoji: "⚡", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", desc: "Scroll-stopping short hit" },
  medium_tweet:  { label: "Medium Tweet", emoji: "🐦", color: "text-sky-400 bg-sky-400/10 border-sky-400/20",    desc: "5–8 lines with value" },
  thread:        { label: "Thread",       emoji: "🧵", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", desc: "10–20 tweet deep dive" },
  article:       { label: "Article",      emoji: "📄", color: "text-green-400 bg-green-400/10 border-green-400/20",  desc: "Long-form 1K–10K words" },
  video_script:  { label: "Video",        emoji: "🎬", color: "text-pink-400 bg-pink-400/10 border-pink-400/20",   desc: "Script + AI prompt" },
  newsletter:    { label: "Newsletter",   emoji: "📧", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",   desc: "Weekly digest" },
};

export function useContentOS() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentOSItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async (date?: string) => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("content_os_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("generated_date", date || today)
      .order("created_at", { ascending: true });
    if (data) setItems(data as ContentOSItem[]);
    setIsLoading(false);
  }, [user, today]);

  useEffect(() => { load(); }, [load]);

  const generate = async (profile: any, brandVoice: any, pillars: any[]) => {
    if (!user) return { error: "Not authenticated" };
    if (!pillars.length) return { error: "Set up your content pillars first" };
    setIsGenerating(true);
    try {
      const isPro = profile?.tier === "pro" || profile?.tier === "elite";
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_content_os",
          niche: profile?.primary_niche || "content creation",
          brandTone: profile?.brand_tone || "relatable",
          twitterHandle: profile?.twitter_handle || "",
          displayName: profile?.display_name || "",
          writingTraits: brandVoice?.writing_traits || [],
          wordsToAvoid: brandVoice?.words_to_avoid || [],
          signaturePhrases: brandVoice?.signature_phrases || [],
          contentStrategy: profile?.content_strategy || "",
          skills: profile?.skills || [],
          customSystemPrompt: profile?.custom_system_prompt || "",
          pillars: pillars.map(p => ({ id: p.id, name: p.pillar_name, description: p.pillar_description })),
          isPro,
          generatedDate: today,
        },
      });
      if (error) throw error;
      if (data?.items?.length) {
        // Clear today's items and insert fresh
        await supabase.from("content_os_items")
          .delete().eq("user_id", user.id).eq("generated_date", today);
        const inserts = data.items.map((item: any) => ({
          user_id: user.id,
          generated_date: today,
          pillar_id: pillars.find(p => p.pillar_name === item.pillar_name)?.id || null,
          pillar_name: item.pillar_name,
          format: item.format,
          title: item.title || null,
          content: item.content,
          thread_tweets: item.thread_tweets || null,
          video_prompt: item.video_prompt || null,
          word_count: item.word_count || null,
          status: "pending",
          viral_score: item.viral_score || null,
          psychology_trigger: item.psychology_trigger || null,
        }));
        await supabase.from("content_os_items").insert(inserts);
        await load();
        return { error: null, count: inserts.length };
      }
      return { error: "No content returned" };
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: ContentOSItem["status"]) => {
    await supabase.from("content_os_items")
      .update({ status, ...(status === "posted" ? { posted_at: new Date().toISOString() } : {}) })
      .eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const getByFormat = (format: ContentOSItem["format"]) =>
    items.filter(i => i.format === format);

  const getByPillar = (pillarName: string) =>
    items.filter(i => i.pillar_name === pillarName);

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === "pending").length,
    approved: items.filter(i => i.status === "approved").length,
    posted: items.filter(i => i.status === "posted").length,
    byFormat: Object.keys(FORMAT_CONFIG).reduce((acc, fmt) => {
      acc[fmt] = items.filter(i => i.format === fmt).length;
      return acc;
    }, {} as Record<string, number>),
  };

  return { items, isLoading, isGenerating, generate, updateStatus, getByFormat, getByPillar, stats, reload: load, today };
}
```

---

## FILE 4 — CREATE: src/components/dashboard/ContentPillarSetup.tsx

```tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentPillars, ContentPillar } from "@/hooks/useContentPillars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Plus, Trash2, Loader2, GripVertical, Check, Wand2 } from "lucide-react";

const PILLAR_COLORS = ["#3B8BD4","#639922","#BA7517","#D85A30","#7F77DD","#1D9E75"];

const EXAMPLE_PILLARS: Record<string, string[]> = {
  default: ["Education & How-To","Behind the Scenes","Inspiration & Motivation","Industry News","Personal Story","Promotion & Offers"],
  web3: ["Web3 Jobs & Opportunities","Money Hacks & Free Tools","Founder Journey","Life Hacks & Relatable","Web3 Education","Personal Brand Strategy"],
  fitness: ["Workout Tips","Nutrition & Diet","Transformation Stories","Mindset & Motivation","Business of Fitness","Client Wins"],
  finance: ["Money Mindset","Investment Tips","Side Hustles","Debt-Free Journey","Financial Education","Case Studies"],
};

interface EditablePillar {
  id?: string;
  pillar_name: string;
  pillar_description: string;
  is_active: boolean;
  color: string;
}

export function ContentPillarSetup({ onComplete }: { onComplete?: () => void }) {
  const { profile, brandVoice } = useAuth();
  const { pillars, isLoading, isSuggesting, suggestPillars, savePillars } = useContentPillars();
  const [editingPillars, setEditingPillars] = useState<EditablePillar[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSuggested, setHasSuggested] = useState(false);

  useEffect(() => {
    if (pillars.length > 0) {
      setEditingPillars(pillars.map(p => ({ ...p })));
      setHasSuggested(true);
    }
  }, [pillars]);

  const handleSuggest = async () => {
    if (!profile?.primary_niche) {
      toast({ title: "Set your niche in Memory first", variant: "destructive" });
      return;
    }
    const result = await suggestPillars(profile.primary_niche, profile.brand_tone || "relatable");
    if (result?.pillars) {
      setEditingPillars(result.pillars.map((p: any, i: number) => ({
        pillar_name: p.name,
        pillar_description: p.description,
        is_active: true,
        color: PILLAR_COLORS[i] || PILLAR_COLORS[0],
      })));
      setHasSuggested(true);
      toast({ title: "Pillars suggested! Edit them to match your brand." });
    } else {
      toast({ title: "Failed to suggest pillars", description: result?.error, variant: "destructive" });
    }
  };

  const handleAdd = () => {
    if (editingPillars.length >= 6) {
      toast({ title: "Maximum 6 pillars allowed" });
      return;
    }
    setEditingPillars([...editingPillars, {
      pillar_name: "",
      pillar_description: "",
      is_active: true,
      color: PILLAR_COLORS[editingPillars.length] || PILLAR_COLORS[0],
    }]);
  };

  const handleRemove = (index: number) => {
    setEditingPillars(editingPillars.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof EditablePillar, value: any) => {
    setEditingPillars(editingPillars.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    const valid = editingPillars.filter(p => p.pillar_name.trim());
    if (valid.length < 1) {
      toast({ title: "Add at least 1 pillar", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const { error } = await savePillars(valid);
    if (error) {
      toast({ title: "Failed to save", description: String(error), variant: "destructive" });
    } else {
      toast({ title: "Content pillars saved! 🎉", description: "Your daily content will now rotate across your pillars." });
      onComplete?.();
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Content Pillars</h2>
        <p className="text-sm text-muted-foreground">
          Define up to 6 pillars that represent your brand. Every day, your content will be balanced across all pillars — so your audience gets variety, not repetition.
        </p>
      </div>

      {/* AI Suggest */}
      {!hasSuggested && (
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Let AI suggest your pillars
            </h3>
            <p className="text-xs text-muted-foreground">
              Based on your niche ({profile?.primary_niche || "set in Memory"}), AI will suggest 6 pillars. You can edit them freely.
            </p>
          </div>
          <Button variant="viral" size="sm" onClick={handleSuggest} disabled={isSuggesting || !profile?.primary_niche}>
            {isSuggesting ? <><Loader2 className="h-3 w-3 animate-spin" />Generating...</> : <><Sparkles className="h-3 w-3" />Suggest Pillars</>}
          </Button>
        </div>
      )}

      {/* Pillar Editor */}
      {editingPillars.length > 0 && (
        <div className="space-y-3">
          {editingPillars.map((pillar, index) => (
            <div key={index} className="flex gap-3 items-start p-4 border border-border rounded-xl bg-card">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-3"
                style={{ background: pillar.color }}
              />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder={`Pillar ${index + 1} name — e.g. "Web3 Jobs & Opportunities"`}
                  value={pillar.pillar_name}
                  onChange={e => handleUpdate(index, "pillar_name", e.target.value)}
                  className="font-medium"
                />
                <Input
                  placeholder="Brief description — what kind of content goes here?"
                  value={pillar.pillar_description}
                  onChange={e => handleUpdate(index, "pillar_description", e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button
                size="sm" variant="ghost"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 flex-shrink-0 mt-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add + Save */}
      <div className="flex items-center gap-3 flex-wrap">
        {editingPillars.length < 6 && (
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Pillar ({editingPillars.length}/6)
          </Button>
        )}
        {editingPillars.length > 0 && (
          <Button variant="viral" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Check className="h-4 w-4" />Save Pillars</>}
          </Button>
        )}
        {hasSuggested && (
          <Button variant="ghost" size="sm" onClick={handleSuggest} disabled={isSuggesting} className="text-muted-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Re-suggest
          </Button>
        )}
      </div>

      {/* Example niches */}
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Example pillars for other niches: </span>
        Fitness: Workouts, Nutrition, Mindset · Finance: Investing, Side Hustles, Money Mindset · Tech: Tutorials, Industry News, Career Tips
      </div>
    </div>
  );
}
```

---

## FILE 5 — CREATE: src/components/dashboard/ContentOS.tsx

```tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentOS, FORMAT_CONFIG, ContentOSItem } from "@/hooks/useContentOS";
import { useContentPillars } from "@/hooks/useContentPillars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, Loader2, RefreshCw, Check, X, Copy,
  ChevronDown, ChevronUp, ArrowRight, Settings,
  Zap, BookOpen, AlignLeft, FileText, Video, Mail
} from "lucide-react";

const FORMAT_ICONS: Record<string, any> = {
  two_liner: Zap, medium_tweet: AlignLeft,
  thread: BookOpen, article: FileText,
  video_script: Video, newsletter: Mail,
};

function ContentCard({ item, onApprove, onSkip, onCopy }: {
  item: ContentOSItem;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onCopy: (content: string, format: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fmt = FORMAT_CONFIG[item.format];
  const FmtIcon = FORMAT_ICONS[item.format] || Zap;
  const isApproved = item.status === "approved";
  const isSkipped = item.status === "skipped";

  // For threads, show tweet count and expandable list
  const isThread = item.format === "thread" && item.thread_tweets?.length;
  // For article, show word count and truncated preview
  const isArticle = item.format === "article";
  // For video, show prompt separately
  const isVideo = item.format === "video_script";

  const previewContent = isArticle && !expanded
    ? item.content.slice(0, 300) + (item.content.length > 300 ? "..." : "")
    : item.content;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isApproved ? "border-primary/40 bg-primary/[0.03]" :
      isSkipped  ? "opacity-40 border-border" :
      "border-border bg-card hover:border-border/80"
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className={`text-[10px] gap-1 ${fmt.color}`}>
            <FmtIcon className="h-3 w-3" />{fmt.label}
          </Badge>
          {item.pillar_name && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {item.pillar_name}
            </Badge>
          )}
          {item.psychology_trigger && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground capitalize">
              {item.psychology_trigger}
            </Badge>
          )}
          {item.viral_score && (
            <Badge variant="outline" className="text-[10px] text-yellow-500 bg-yellow-500/10 border-yellow-500/20">
              ⚡ {item.viral_score}
            </Badge>
          )}
          {item.word_count && (
            <span className="text-[10px] text-muted-foreground ml-auto">{item.word_count.toLocaleString()} words</span>
          )}
          {isApproved && (
            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 ml-auto">
              <Check className="h-3 w-3 mr-1" />Approved
            </Badge>
          )}
        </div>

        {/* Title for article/newsletter */}
        {item.title && (
          <h3 className="font-bold text-sm mb-2 text-foreground">{item.title}</h3>
        )}

        {/* Content */}
        {isThread ? (
          <div className="space-y-2">
            {/* Show first tweet always */}
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
              <span className="text-[10px] text-primary font-mono uppercase tracking-wider">Hook Tweet (1/{item.thread_tweets!.length})</span>
              <p className="text-sm text-foreground mt-1 leading-relaxed">{item.thread_tweets![0]}</p>
            </div>
            {/* Expand to see all tweets */}
            {item.thread_tweets!.length > 1 && (
              <>
                <button onClick={() => setExpanded(!expanded)}
                  className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {expanded ? "Hide" : `Show all ${item.thread_tweets!.length} tweets`}
                </button>
                {expanded && item.thread_tweets!.slice(1).map((tweet, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 bg-secondary/30">
                    <span className="text-[10px] text-muted-foreground font-mono">{i + 2}/{item.thread_tweets!.length}</span>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{tweet}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : isVideo ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{item.content}</p>
            {item.video_prompt && (
              <>
                <button onClick={() => setExpanded(!expanded)}
                  className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {expanded ? "Hide" : "Show AI video prompt"}
                </button>
                {expanded && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-purple-400 font-mono uppercase">AI Video Prompt → Paste into Sora / Runway / CapCut</span>
                      <Button size="sm" variant="ghost" onClick={() => onCopy(item.video_prompt!, "AI Video Prompt")}
                        className="h-6 text-xs px-2">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{item.video_prompt}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{previewContent}</p>
            {isArticle && item.content.length > 300 && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                {expanded ? "Show less" : "Read full article"}
                {!expanded && <ArrowRight className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {!isApproved && !isSkipped && (
            <>
              <Button size="sm" variant="viral" onClick={() => onApprove(item.id)} className="h-7 text-xs px-3">
                <Check className="h-3 w-3 mr-1" />Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onSkip(item.id)} className="h-7 text-xs px-3 text-muted-foreground">
                <X className="h-3 w-3 mr-1" />Skip
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => onCopy(
            isThread ? item.thread_tweets!.join("\n\n---\n\n") : item.content, fmt.label
          )} className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3 mr-1" />Copy
          </Button>
          {isApproved && item.format !== "article" && item.format !== "newsletter" && (
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              isThread ? item.thread_tweets![0].slice(0, 280) : item.content.slice(0, 280)
            )}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
              <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-sky-500/30 text-sky-400 hover:bg-sky-500/10">
                Post to 𝕏 <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContentOS() {
  const { profile, brandVoice } = useAuth();
  const { pillars } = useContentPillars();
  const { items, isLoading, isGenerating, generate, updateStatus, stats } = useContentOS();
  const [activeFormat, setActiveFormat] = useState<string>("all");
  const [activePillar, setActivePillar] = useState<string>("all");

  const handleGenerate = async () => {
    if (!pillars.length) {
      toast({
        title: "Set up your content pillars first",
        description: "Go to Memory → Content Pillars to define your pillars.",
        variant: "destructive",
      });
      return;
    }
    if (!profile?.primary_niche) {
      toast({ title: "Set your niche in Memory first", variant: "destructive" });
      return;
    }
    const result = await generate(profile, brandVoice, pillars);
    if (result?.error) {
      toast({ title: "Generation failed", description: result.error, variant: "destructive" });
    } else {
      toast({
        title: `Today's content is ready! 🚀`,
        description: `${result?.count} pieces across ${pillars.length} pillars and 6 formats.`,
      });
    }
  };

  const handleCopy = (content: string, format: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: `${format} copied!` });
  };

  const filtered = items.filter(item => {
    const fmtMatch = activeFormat === "all" || item.format === activeFormat;
    const pillarMatch = activePillar === "all" || item.pillar_name === activePillar;
    return fmtMatch && pillarMatch && item.status !== "skipped";
  });

  const uniquePillars = [...new Set(items.map(i => i.pillar_name).filter(Boolean))];

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Daily Content Operating System</h2>
        <p className="text-muted-foreground text-sm max-w-lg mb-3 leading-relaxed">
          Every day, generate a complete content mix across all your pillars — 2-liners, medium tweets, threads, articles, video scripts, and newsletters. All in your voice.
        </p>

        {!pillars.length && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 max-w-sm text-sm text-yellow-400">
            ⚠️ Set up your content pillars first — go to <strong>Memory → Content Pillars</strong>
          </div>
        )}

        {/* Format preview */}
        <div className="grid grid-cols-3 gap-2 mb-8 w-full max-w-lg">
          {Object.entries(FORMAT_CONFIG).map(([key, cfg]) => {
            const Icon = FORMAT_ICONS[key] || Zap;
            return (
              <div key={key} className="p-3 rounded-xl border border-border bg-card text-left">
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full border mb-1.5 ${cfg.color}`}>
                  <Icon className="h-3 w-3" />{cfg.label}
                </div>
                <p className="text-[11px] text-muted-foreground">{cfg.desc}</p>
              </div>
            );
          })}
        </div>

        <Button variant="viral" size="lg" onClick={handleGenerate}
          disabled={isGenerating || !pillars.length || !profile?.primary_niche}>
          {isGenerating
            ? <><Loader2 className="h-4 w-4 animate-spin" />Generating your content...</>
            : <><Sparkles className="h-4 w-4" />Generate Today's Full Content Mix</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Daily Content Mix
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            <span className="mx-2">·</span>
            <span className="text-primary font-medium">{stats.approved} approved</span>
            <span className="mx-1">·</span>
            <span>{stats.pending} pending</span>
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating} className="h-8 text-xs">
          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
          {isGenerating ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(FORMAT_CONFIG).map(([fmt, cfg]) => (
          <button key={fmt} onClick={() => setActiveFormat(activeFormat === fmt ? "all" : fmt)}
            className={`rounded-lg p-2.5 text-center border transition-all ${
              activeFormat === fmt ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-border/80"
            }`}>
            <div className={`text-lg font-bold ${activeFormat === fmt ? "text-primary" : "text-foreground"}`}>
              {stats.byFormat[fmt] || 0}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{cfg.label}</div>
          </button>
        ))}
      </div>

      {/* Pillar filter */}
      {uniquePillars.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setActivePillar("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePillar === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            All pillars
          </button>
          {uniquePillars.map(p => (
            <button key={p} onClick={() => setActivePillar(activePillar === p ? "all" : p!)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePillar === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Content cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={id => updateStatus(id, "approved")}
              onSkip={id => updateStatus(id, "skipped")}
              onCopy={handleCopy}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No content for this filter. Try "All pillars" above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## FILE 6 — ADD to supabase/functions/content-lab/index.ts

Add these TWO new cases BEFORE the `default:` case:

```typescript
      // ===== SUGGEST CONTENT PILLARS =====
      case "suggest_pillars": {
        const { niche, brandTone } = params;

        const PILLAR_PROMPT = `You are a content strategy expert. Suggest 6 content pillars for a creator.

The pillars should:
- Cover different aspects of their niche
- Balance reach content (broad appeal) with authority content (deep expertise)
- Include personal/relatable content for connection
- Be distinct from each other — no overlap
- Each generate 3-5 types of posts naturally

For each pillar output:
{
  "name": "<short, punchy pillar name>",
  "description": "<one sentence describing what content goes here>"
}

Output ONLY a valid JSON array of exactly 6 pillar objects. No markdown.`;

        const userPrompt = `Suggest 6 content pillars for:
Niche: ${niche}
Tone: ${brandTone}

Make them specific to this niche, not generic.`;

        try {
          const content = await callAI(PILLAR_PROMPT, userPrompt);
          const pillars = parseAIJson(content);
          return new Response(
            JSON.stringify({ success: true, pillars }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // ===== GENERATE CONTENT OPERATING SYSTEM =====
      case "generate_content_os": {
        const {
          niche, brandTone, twitterHandle, displayName,
          writingTraits, wordsToAvoid, signaturePhrases,
          contentStrategy, skills, customSystemPrompt,
          pillars, isPro, generatedDate
        } = params;

        if (!pillars?.length) {
          return new Response(
            JSON.stringify({ error: "No content pillars defined" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Determine today's featured pillar (rotates by day of week)
        const dayOfWeek = new Date(generatedDate || Date.now()).getDay();
        const featuredPillar = pillars[dayOfWeek % pillars.length];

        // Volume based on plan
        const twoLinersPerPillar = 1; // always 1 per pillar
        const mediumPerPillar = 1;    // always 1 per pillar
        const totalTwoLiners = pillars.length;
        const totalMedium = pillars.length;

        const CONTENT_OS_SYSTEM = `You are an elite content strategist generating a complete daily content mix.

CREATOR PROFILE:
- Name: ${displayName || "Creator"}
- Niche: ${niche}
- Tone: ${brandTone}
${twitterHandle ? `- Handle: @${twitterHandle}` : ""}
${skills?.length ? `- Expertise: ${skills.join(", ")}` : ""}
${writingTraits?.length ? `- Writing style: ${writingTraits.join(", ")}` : ""}
${wordsToAvoid?.length ? `- Never use: ${wordsToAvoid.join(", ")}` : ""}
${signaturePhrases?.length ? `- Signature phrases: ${signaturePhrases.join(", ")}` : ""}
${contentStrategy ? `- Strategy: ${contentStrategy}` : ""}
${customSystemPrompt ? `- Special instructions: ${customSystemPrompt}` : ""}

CONTENT PILLARS:
${pillars.map((p: any, i: number) => `${i + 1}. ${p.name}: ${p.description}`).join("\n")}

TODAY'S FEATURED PILLAR: ${featuredPillar.name} (thread + article focus today)

RULES:
- Write in the creator's EXACT voice — not generic AI
- Every piece must feel native to the platform
- Vary hooks and psychology triggers across all pieces
- Include specific tools, platforms, dollar amounts where relevant
- Never write the same type of hook twice in the same batch`;

        const CONTENT_OS_PROMPT = `Generate today's complete content mix. Output a JSON array with ALL of the following items:

${pillars.map((p: any) => `
TWO_LINER for "${p.name}":
{
  "format": "two_liner",
  "pillar_name": "${p.name}",
  "content": "<ultra short 1-2 line tweet, scroll-stopping hook, under 140 chars>",
  "psychology_trigger": "<curiosity|shock|fomo|relatability|controversy|authority>",
  "viral_score": <75-98>
}

MEDIUM_TWEET for "${p.name}":
{
  "format": "medium_tweet",
  "pillar_name": "${p.name}",
  "content": "<5-8 line tweet with value, specific steps or insight, ends with CTA>",
  "psychology_trigger": "<trigger>",
  "viral_score": <70-95>
}`).join("\n")}

FULL THREAD for "${featuredPillar.name}" (today's featured pillar):
{
  "format": "thread",
  "pillar_name": "${featuredPillar.name}",
  "title": "<thread title>",
  "content": "<hook tweet — the first tweet that makes people want to read the thread>",
  "thread_tweets": ["<tweet 1 — the hook>", "<tweet 2>", ..., "<tweet 10-15 — value + CTA>"],
  "word_count": <estimated word count>,
  "viral_score": <80-97>
}

${isPro ? `LONG-FORM ARTICLE for "${featuredPillar.name}":
{
  "format": "article",
  "pillar_name": "${featuredPillar.name}",
  "title": "<compelling article title>",
  "content": "<full article, 1000-3000 words, with headers, sections, examples, actionable tips. Written in creator's voice. Newsletter/Medium quality.>",
  "word_count": <actual word count>,
  "viral_score": <75-90>
}` : `ARTICLE PREVIEW for "${featuredPillar.name}":
{
  "format": "article",
  "pillar_name": "${featuredPillar.name}",
  "title": "<compelling article title>",
  "content": "<article introduction and outline, 300-500 words. Full article available on paid plan.>",
  "word_count": 400,
  "viral_score": 80
}`}

VIDEO SCRIPT for "${featuredPillar.name}":
{
  "format": "video_script",
  "pillar_name": "${featuredPillar.name}",
  "title": "<video title>",
  "content": "<full 60-90 second video script with [CUT], [TEXT ON SCREEN: ___] markers>",
  "video_prompt": "<detailed 100+ word AI video generation prompt for Sora/Runway/CapCut — scene, mood, lighting, text style, transitions>",
  "viral_score": <75-95>
}

${new Date(generatedDate || Date.now()).getDay() === 0 ? `WEEKLY NEWSLETTER:
{
  "format": "newsletter",
  "pillar_name": "All Pillars",
  "title": "<newsletter subject line>",
  "content": "<full weekly digest email, 500-800 words, covering top opportunities/insights from each pillar this week, written in creator's voice, ends with CTA>",
  "word_count": <word count>
}` : ""}

Output ONLY a valid JSON array containing ALL the items above. No markdown. No explanation.`;

        try {
          const content = await callAI(CONTENT_OS_SYSTEM, CONTENT_OS_PROMPT);
          const items = parseAIJson(content);

          if (!Array.isArray(items) || items.length === 0) {
            throw new Error("Invalid response format");
          }

          return new Response(
            JSON.stringify({ success: true, items, count: items.length, featuredPillar: featuredPillar.name }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ error: e.message || "Content OS generation failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
```

---

## FILE 7 — UPDATE: src/components/dashboard/DashboardSidebar.tsx

Replace the navItems array entirely:

```typescript
const navItems = [
  { id: "daily-feed",  title: "Daily Feed",     icon: Zap,        badge: null },
  { id: "content-os",  title: "Content OS",     icon: Layers,     badge: "NEW" },
  { id: "video-bank",  title: "Video Bank",     icon: Video,      badge: null },
  { id: "content-lab", title: "Content Lab",    icon: Calendar,   badge: null },
  { id: "growth",      title: "Growth",         icon: TrendingUp, badge: null },
  { id: "analyses",    title: "Analyses",       icon: Microscope, badge: null },
  { id: "patterns",    title: "Patterns",       icon: Dna,        badge: null },
  { id: "ideas",       title: "Ideas",          icon: Lightbulb,  badge: null },
  { id: "memory",      title: "Memory",         icon: Brain,      badge: null },
  { id: "plans",       title: "Plans",          icon: CreditCard, badge: null },
];
```

Add `Layers` to the lucide-react imports.

---

## FILE 8 — UPDATE: src/components/dashboard/MemoryTab.tsx

Add a "Content Pillars" section at the bottom of the MemoryTab component, before the save button:

```tsx
import { ContentPillarSetup } from "@/components/dashboard/ContentPillarSetup";

// Add this section at the bottom of the MemoryTab return, after all the existing fields:
<div className="pt-6 border-t border-border">
  <ContentPillarSetup />
</div>
```

---

## FILE 9 — UPDATE: src/pages/Dashboard.tsx

1. Add imports:
```tsx
import { ContentOS } from "@/components/dashboard/ContentOS";
```

2. Add tab render:
```tsx
{activeTab === "content-os" && <ContentOS />}
```

---

## SUMMARY — What this builds:

**For EVERY user on the platform:**

1. **Content Pillars Setup** (in Memory tab)
   - AI suggests 6 pillars based on user's niche
   - User can edit, rename, reorder, delete any pillar
   - Works for ANY niche — fitness, finance, tech, fashion, Web3, anything

2. **Content OS tab** (new primary tab)
   - Generates a complete daily content mix in one click
   - **Per pillar:** 1 x 2-liner tweet + 1 x medium tweet = balanced across all pillars
   - **Daily:** 1 x full thread on today's featured pillar
   - **Daily:** 1 x video script + AI prompt
   - **Pro users:** 1 x full long-form article (1K-3K words)
   - **Free users:** article preview/outline only
   - **Sundays:** weekly newsletter generated automatically
   - Filter by format (see only threads, only 2-liners, etc.)
   - Filter by pillar (see only one topic at a time)
   - Approve / Skip / Copy / Post to X buttons on every piece

3. **The key difference from Daily Feed:**
   - Daily Feed = 15 short tweets, same format, same style
   - Content OS = balanced mix of ALL formats across ALL pillars
   - This is how you build a BRAND, not just a Twitter account

**Free tier:** Gets full mix but article is preview only (300-500 words)
**Pro tier:** Gets full articles (1,000-3,000 words) + higher volume
```
