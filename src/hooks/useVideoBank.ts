import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoPackage {
  id: string;
  title: string;
  video_style: string;
  platform: string;
  hook: string;
  hook_type: string | null;
  script: string;
  voiceover_text: string | null;
  ai_video_prompt: string;
  text_overlays: { time: string; text: string; style: string }[] | null;
  caption: string | null;
  status: "unused" | "used" | "saved";
  viral_score: number | null;
  created_at: string;
}

export function useVideoBank() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("video_bank")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setVideos(data as unknown as VideoPackage[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async (profile: any, brandVoice: any, count = 5) => {
    if (!user) return { error: "Not authenticated" };
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_video_bank",
          niche: profile?.primary_niche || "content creation",
          brandTone: profile?.brand_tone || "relatable",
          twitterHandle: profile?.twitter_handle || "",
          displayName: profile?.display_name || "",
          writingTraits: brandVoice?.writing_traits || [],
          signaturePhrases: brandVoice?.signature_phrases || [],
          contentStrategy: profile?.content_strategy || "",
          skills: profile?.skills || [],
          customSystemPrompt: profile?.custom_system_prompt || "",
          count,
        },
      });
      if (error) throw error;
      if (data?.videos?.length) {
        const inserts = data.videos.map((v: any) => ({
          user_id: user.id,
          title: v.title,
          video_style: v.video_style || "text_explainer",
          platform: "twitter",
          hook: v.hook,
          hook_type: v.hook_type || null,
          script: v.script,
          voiceover_text: v.voiceover_text || null,
          ai_video_prompt: v.ai_video_prompt,
          text_overlays: v.text_overlays || null,
          caption: v.caption || null,
          viral_score: v.viral_score || null,
          status: "unused",
        }));
        await supabase.from("video_bank").insert(inserts);
        await load();
        return { error: null, count: inserts.length };
      }
      return { error: "No videos returned" };
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: VideoPackage["status"]) => {
    const { error } = await supabase
      .from("video_bank")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user?.id ?? "");
    if (!error) setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    return { error };
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase
      .from("video_bank")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id ?? "");
    if (!error) setVideos((prev) => prev.filter((v) => v.id !== id));
    return { error };
  };

  return { videos, isLoading, isGenerating, generate, updateStatus, deleteVideo, reload: load };
}
