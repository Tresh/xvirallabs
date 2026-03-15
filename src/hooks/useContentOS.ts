import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ContentOSFormat = "two_liner" | "medium_tweet" | "thread" | "article" | "video_script" | "newsletter";
export type ContentOSStatus = "pending" | "approved" | "posted" | "skipped";

export interface ContentOSItem {
  id: string;
  pillar_id: string | null;
  pillar_name: string | null;
  format: ContentOSFormat;
  title: string | null;
  content: string;
  thread_tweets: string[] | null;
  video_prompt: string | null;
  word_count: number | null;
  status: ContentOSStatus;
  viral_score: number | null;
  psychology_trigger: string | null;
  generated_date: string;
  created_at: string;
}

export const FORMAT_CONFIG: Record<ContentOSFormat, { label: string; emoji: string; description: string }> = {
  two_liner: { label: "2-Liner", emoji: "⚡", description: "Short and punchy hook" },
  medium_tweet: { label: "Medium Tweet", emoji: "🐦", description: "5–8 lines with clear value" },
  thread: { label: "Thread", emoji: "🧵", description: "Deep-dive sequence" },
  article: { label: "Article", emoji: "📄", description: "Long-form thought leadership" },
  video_script: { label: "Video Script", emoji: "🎬", description: "Script plus AI visual prompt" },
  newsletter: { label: "Newsletter", emoji: "📧", description: "Weekly audience digest" },
};

export function useContentOS() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentOSItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(
    async (date?: string) => {
      if (!user) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      const selectedDate = date || today;
      const { data } = await supabase
        .from("content_os_items")
        .select("id, pillar_id, pillar_name, format, title, content, thread_tweets, video_prompt, word_count, status, viral_score, psychology_trigger, generated_date, created_at")
        .eq("user_id", user.id)
        .eq("generated_date", selectedDate)
        .order("created_at", { ascending: true });

      if (data) {
        setItems(
          (data as any[]).map((item) => ({
            ...item,
            thread_tweets: Array.isArray(item.thread_tweets) ? item.thread_tweets : null,
          })) as ContentOSItem[]
        );
      }

      setIsLoading(false);
    },
    [today, user]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async (params: {
    profile: {
      tier?: string | null;
      primary_niche?: string | null;
      brand_tone?: string | null;
      twitter_handle?: string | null;
      display_name?: string | null;
      content_strategy?: string | null;
      skills?: string[] | null;
      custom_system_prompt?: string | null;
    } | null;
    brandVoice: {
      writing_traits?: string[] | null;
      words_to_avoid?: string[] | null;
      signature_phrases?: string[] | null;
    } | null;
    pillars: Array<{ id: string; pillar_name: string; pillar_description?: string | null }>;
  }) => {
    if (!user) return { error: "Not authenticated", count: 0 };
    if (!params.pillars.length) return { error: "Set up your content pillars first", count: 0 };

    setIsGenerating(true);
    try {
      const { profile, brandVoice, pillars } = params;
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_content_os",
          generatedDate: today,
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
          pillars: pillars.map((pillar) => ({
            id: pillar.id,
            name: pillar.pillar_name,
            description: pillar.pillar_description || "",
          })),
        },
      });

      if (error) throw error;

      const generatedItems = Array.isArray(data?.items) ? data.items : [];
      if (!generatedItems.length) {
        return { error: "No content returned", count: 0 };
      }

      const { error: deleteError } = await supabase
        .from("content_os_items")
        .delete()
        .eq("user_id", user.id)
        .eq("generated_date", today);

      if (deleteError) throw deleteError;

      const insertRows = generatedItems.map((item: any) => ({
        user_id: user.id,
        generated_date: today,
        pillar_id: pillars.find((pillar) => pillar.pillar_name === item.pillar_name)?.id || null,
        pillar_name: item.pillar_name || null,
        format: item.format,
        title: item.title || null,
        content: item.content,
        thread_tweets: item.thread_tweets || null,
        video_prompt: item.video_prompt || null,
        word_count: item.word_count || null,
        status: "pending" as const,
        viral_score: item.viral_score || null,
        psychology_trigger: item.psychology_trigger || null,
      }));

      const { error: insertError } = await supabase.from("content_os_items").insert(insertRows);
      if (insertError) throw insertError;

      await load(today);
      return { error: null, count: insertRows.length };
    } catch (e: any) {
      return { error: e?.message || "Failed to generate content", count: 0 };
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: ContentOSStatus) => {
    const { error } = await supabase
      .from("content_os_items")
      .update({
        status,
        posted_at: status === "posted" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", user?.id ?? "");

    if (!error) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    }

    return { error };
  };

  const stats = useMemo(() => {
    const byFormat = Object.keys(FORMAT_CONFIG).reduce((acc, formatKey) => {
      acc[formatKey] = items.filter((item) => item.format === formatKey).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      posted: items.filter((item) => item.status === "posted").length,
      byFormat,
    };
  }, [items]);

  return {
    items,
    isLoading,
    isGenerating,
    today,
    generate,
    updateStatus,
    stats,
    reload: load,
  };
}
