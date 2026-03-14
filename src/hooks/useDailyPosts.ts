import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyPost {
  id: string;
  content: string;
  format: "tweet" | "thread" | "article" | "linkedin";
  status: "pending" | "approved" | "skipped" | "posted";
  viral_score?: number;
  psychology_trigger?: string;
  why_it_works?: string;
  generated_date: string;
  created_at: string;
}

export function useDailyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("daily_posts" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("generated_date", today)
      .order("created_at", { ascending: true });
    if (data) setPosts(data as any as DailyPost[]);
    setIsLoading(false);
  }, [user, today]);

  useEffect(() => { load(); }, [load]);

  const generate = async (profile: any, brandVoice: any) => {
    if (!user) return { error: "Not authenticated" };
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_daily_feed",
          niche: profile?.primary_niche || "entrepreneurship",
          brandTone: profile?.brand_tone || "authoritative",
          twitterHandle: profile?.twitter_handle || "",
          displayName: profile?.display_name || "",
          writingTraits: brandVoice?.writing_traits || [],
          wordsToAvoid: brandVoice?.words_to_avoid || [],
          signaturePhrases: brandVoice?.signature_phrases || [],
          contentStrategy: profile?.content_strategy || "",
          skills: profile?.skills || [],
          customSystemPrompt: profile?.custom_system_prompt || "",
          postCount: profile?.tier === "elite" ? 20 : 15,
        },
      });
      if (error) throw error;
      if (data?.posts?.length) {
        const inserts = data.posts.map((p: any) => ({
          user_id: user.id,
          generated_date: today,
          content: p.content,
          format: p.format || "tweet",
          status: "pending",
          viral_score: p.viral_score,
          psychology_trigger: p.psychology_trigger,
          why_it_works: p.why_it_works,
        }));
        await (supabase.from("daily_posts" as any) as any).delete().eq("user_id", user.id).eq("generated_date", today);
        await (supabase.from("daily_posts" as any) as any).insert(inserts);
        await load();
        return { error: null, count: inserts.length };
      }
      return { error: "No posts returned" };
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: DailyPost["status"]) => {
    await (supabase.from("daily_posts" as any) as any).update({ status, ...(status === "posted" ? { posted_at: new Date().toISOString() } : {}) }).eq("id", id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const approveAll = async () => {
    const pendingIds = posts.filter(p => p.status === "pending").map(p => p.id);
    if (!pendingIds.length) return;
    await (supabase.from("daily_posts" as any) as any).update({ status: "approved" }).in("id", pendingIds);
    setPosts(prev => prev.map(p => pendingIds.includes(p.id) ? { ...p, status: "approved" } : p));
  };

  return { posts, isLoading, isGenerating, generate, updateStatus, approveAll, reload: load, today };
}
