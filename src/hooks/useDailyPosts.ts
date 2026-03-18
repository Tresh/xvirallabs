import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyPost {
  id: string;
  content: string;
  format: string;
  status: "pending" | "approved" | "skipped" | "posted";
  viral_score?: number;
  psychology_trigger?: string;
  why_it_works?: string;
  generated_date: string;
  is_approved?: boolean;
  is_archived?: boolean;
  post_date?: string;
  created_at: string;
}

export function useDailyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async (date?: string) => {
    if (!user) return;
    setIsLoading(true);
    const selectedDate = date || today;
    const { data } = await supabase
      .from("daily_posts" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("generated_date", selectedDate)
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
        // CRITICAL: Only delete NON-approved posts for today
        await (supabase.from("daily_posts" as any) as any)
          .delete()
          .eq("user_id", user.id)
          .eq("generated_date", today)
          .eq("is_approved", false)
          .neq("status", "approved");

        const inserts = data.posts.map((p: any) => ({
          user_id: user.id,
          generated_date: today,
          post_date: today,
          is_approved: false,
          content: p.content || p.post_text || p.tweet || "Content generating...",
          format: p.format || "tweet",
          status: "pending",
          viral_score: p.viral_score,
          psychology_trigger: p.psychology_trigger,
          why_it_works: p.why_it_works,
        }));
        const { error: insertError } = await (supabase.from("daily_posts" as any) as any).insert(inserts);
        if (insertError) {
          console.error("Insert error:", insertError);
          return { error: insertError.message };
        }
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
    await (supabase.from("daily_posts" as any) as any)
      .update({ status, ...(status === "posted" ? { posted_at: new Date().toISOString() } : {}) })
      .eq("id", id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const approveAndSave = async (id: string, post: DailyPost) => {
    if (!user) return;
    // Update status in daily_posts
    await (supabase.from("daily_posts" as any) as any)
      .update({ status: "approved", is_approved: true })
      .eq("id", id);

    // Save to permanent content_bank
    await (supabase.from("content_bank" as any) as any).insert({
      user_id: user.id,
      original_id: id,
      source: "daily_feed",
      pillar_name: null,
      format: post.format,
      title: null,
      content: post.content,
      viral_score: post.viral_score,
      psychology_trigger: post.psychology_trigger,
      original_date: today,
    });

    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, status: "approved", is_approved: true } : p
    ));
  };

  const approveAll = async () => {
    if (!user) return;
    const pendingPosts = posts.filter(p => p.status === "pending");
    if (!pendingPosts.length) return;

    const pendingIds = pendingPosts.map(p => p.id);
    await (supabase.from("daily_posts" as any) as any)
      .update({ status: "approved", is_approved: true })
      .in("id", pendingIds);

    // Save all to content_bank
    const bankInserts = pendingPosts.map(p => ({
      user_id: user.id,
      original_id: p.id,
      source: "daily_feed",
      pillar_name: null,
      format: p.format,
      content: p.content,
      viral_score: p.viral_score,
      psychology_trigger: p.psychology_trigger,
      original_date: today,
    }));
    await (supabase.from("content_bank" as any) as any).insert(bankInserts);

    setPosts(prev => prev.map(p =>
      pendingIds.includes(p.id) ? { ...p, status: "approved", is_approved: true } : p
    ));
  };

  return { posts, isLoading, isGenerating, generate, updateStatus, approveAndSave, approveAll, reload: load, today };
}
