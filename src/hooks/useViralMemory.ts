import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ViralAnalysis {
  id: string;
  post_source: "link" | "screenshot" | "text";
  original_post: string;
  mode_used: number;
  analysis_result: string;
  identified_hook: string | null;
  psychology_triggers: string[];
  viral_pattern: string | null;
  dwell_time_score: "low" | "medium" | "high" | null;
  reply_potential: number | null;
  bookmark_potential: number | null;
  is_pinned: boolean;
  created_at: string;
}

export interface ViralPattern {
  id: string;
  pattern_name: string;
  pattern_template: string;
  hook_framework: string | null;
  best_for_niches: string[];
  usage_count: number;
  source_analysis_id: string | null;
  created_at: string;
}

export interface IdeaVaultItem {
  id: string;
  idea_title: string;
  idea_content: string | null;
  idea_status: "unused" | "drafted" | "posted" | "archived";
  hook_type: string | null;
  emotion_trigger: string | null;
  generated_from_pattern_id: string | null;
  generated_from_analysis_id: string | null;
  created_at: string;
}

export function useViralMemory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<ViralAnalysis[]>([]);
  const [patterns, setPatterns] = useState<ViralPattern[]>([]);
  const [ideas, setIdeas] = useState<IdeaVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMemory = async () => {
    if (!user) return;
    setIsLoading(true);

    const [analysesRes, patternsRes, ideasRes] = await Promise.all([
      supabase
        .from("viral_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("viral_patterns")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false }),
      supabase
        .from("idea_vault")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (analysesRes.data) setAnalyses(analysesRes.data as ViralAnalysis[]);
    if (patternsRes.data) setPatterns(patternsRes.data as ViralPattern[]);
    if (ideasRes.data) setIdeas(ideasRes.data as IdeaVaultItem[]);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMemory();
  }, [user]);

  const saveAnalysis = async (analysis: Omit<ViralAnalysis, "id" | "created_at" | "is_pinned">) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("viral_analyses")
      .insert({
        user_id: user.id,
        ...analysis,
      })
      .select()
      .single();

    if (!error && data) {
      setAnalyses((prev) => [data as ViralAnalysis, ...prev]);
    }

    return { data, error };
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("viral_analyses").delete().eq("id", id);
    if (!error) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    }
    return { error };
  };

  const togglePinAnalysis = async (id: string) => {
    const analysis = analyses.find((a) => a.id === id);
    if (!analysis) return { error: new Error("Analysis not found") };

    const { error } = await supabase
      .from("viral_analyses")
      .update({ is_pinned: !analysis.is_pinned })
      .eq("id", id);

    if (!error) {
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_pinned: !a.is_pinned } : a))
      );
    }
    return { error };
  };

  const savePattern = async (pattern: Omit<ViralPattern, "id" | "created_at" | "usage_count">) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("viral_patterns")
      .insert({
        user_id: user.id,
        ...pattern,
      })
      .select()
      .single();

    if (!error && data) {
      setPatterns((prev) => [data as ViralPattern, ...prev]);
    }

    return { data, error };
  };

  const deletePattern = async (id: string) => {
    const { error } = await supabase.from("viral_patterns").delete().eq("id", id);
    if (!error) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
    }
    return { error };
  };

  const incrementPatternUsage = async (id: string) => {
    const pattern = patterns.find((p) => p.id === id);
    if (!pattern) return { error: new Error("Pattern not found") };

    const { error } = await supabase
      .from("viral_patterns")
      .update({ usage_count: pattern.usage_count + 1 })
      .eq("id", id);

    if (!error) {
      setPatterns((prev) =>
        prev.map((p) => (p.id === id ? { ...p, usage_count: p.usage_count + 1 } : p))
      );
    }
    return { error };
  };

  const saveIdea = async (idea: Omit<IdeaVaultItem, "id" | "created_at">) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("idea_vault")
      .insert({
        user_id: user.id,
        ...idea,
      })
      .select()
      .single();

    if (!error && data) {
      setIdeas((prev) => [data as IdeaVaultItem, ...prev]);
    }

    return { data, error };
  };

  const updateIdeaStatus = async (id: string, status: IdeaVaultItem["idea_status"]) => {
    const { error } = await supabase
      .from("idea_vault")
      .update({ idea_status: status })
      .eq("id", id);

    if (!error) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, idea_status: status } : i))
      );
    }
    return { error };
  };

  const deleteIdea = async (id: string) => {
    const { error } = await supabase.from("idea_vault").delete().eq("id", id);
    if (!error) {
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    }
    return { error };
  };

  // Stats for insights
  const getStats = () => {
    const hookTypes = analyses.reduce((acc, a) => {
      if (a.identified_hook) {
        acc[a.identified_hook] = (acc[a.identified_hook] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostUsedHook = Object.entries(hookTypes).sort((a, b) => b[1] - a[1])[0];
    const avgReplyPotential = analyses.reduce((sum, a) => sum + (a.reply_potential || 0), 0) / (analyses.length || 1);
    const avgBookmarkPotential = analyses.reduce((sum, a) => sum + (a.bookmark_potential || 0), 0) / (analyses.length || 1);

    return {
      totalAnalyses: analyses.length,
      totalPatterns: patterns.length,
      totalIdeas: ideas.length,
      unusedIdeas: ideas.filter((i) => i.idea_status === "unused").length,
      mostUsedHook: mostUsedHook?.[0] || null,
      avgReplyPotential: Math.round(avgReplyPotential * 10) / 10,
      avgBookmarkPotential: Math.round(avgBookmarkPotential * 10) / 10,
      pinnedAnalyses: analyses.filter((a) => a.is_pinned).length,
    };
  };

  return {
    analyses,
    patterns,
    ideas,
    isLoading,
    fetchMemory,
    saveAnalysis,
    deleteAnalysis,
    togglePinAnalysis,
    savePattern,
    deletePattern,
    incrementPatternUsage,
    saveIdea,
    updateIdeaStatus,
    deleteIdea,
    getStats,
  };
}
