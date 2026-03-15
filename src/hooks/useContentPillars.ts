import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ContentPillar {
  id: string;
  pillar_name: string;
  pillar_description: string | null;
  pillar_order: number;
  is_active: boolean;
  color: string | null;
}

const PILLAR_COLORS = ["#3B8BD4", "#639922", "#BA7517", "#D85A30", "#7F77DD", "#1D9E75"];

export function useContentPillars() {
  const { user } = useAuth();
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setPillars([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("content_pillars")
      .select("id, pillar_name, pillar_description, pillar_order, is_active, color")
      .eq("user_id", user.id)
      .order("pillar_order", { ascending: true });

    if (!error && data) {
      setPillars(data as ContentPillar[]);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const suggestPillars = async (niche: string, brandTone: string) => {
    if (!user) return { pillars: null, error: "Not authenticated" };
    if (!niche.trim()) return { pillars: null, error: "Niche is required" };

    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: { action: "suggest_pillars", niche: niche.trim(), brandTone },
      });

      if (error) throw error;
      const suggested = Array.isArray(data?.pillars) ? data.pillars : [];
      return { pillars: suggested, error: null };
    } catch (e: any) {
      return { pillars: null, error: e?.message ?? "Failed to suggest pillars" };
    } finally {
      setIsSuggesting(false);
    }
  };

  const savePillars = async (
    newPillars: Array<Pick<ContentPillar, "pillar_name" | "pillar_description" | "is_active" | "color">>
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const cleaned = newPillars
      .map((pillar, index) => ({
        user_id: user.id,
        pillar_name: pillar.pillar_name.trim(),
        pillar_description: pillar.pillar_description?.trim() || null,
        pillar_order: index + 1,
        is_active: pillar.is_active,
        color: pillar.color || PILLAR_COLORS[index] || PILLAR_COLORS[0],
      }))
      .filter((pillar) => pillar.pillar_name.length > 0)
      .slice(0, 6);

    if (cleaned.length === 0) {
      return { error: new Error("At least one pillar is required") };
    }

    const { error: deleteError } = await supabase.from("content_pillars").delete().eq("user_id", user.id);
    if (deleteError) return { error: deleteError };

    const { error } = await supabase.from("content_pillars").insert(cleaned);
    if (!error) {
      await load();
    }

    return { error };
  };

  const updatePillar = async (id: string, updates: Partial<ContentPillar>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("content_pillars")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      await load();
    }

    return { error };
  };

  return {
    pillars,
    isLoading,
    isSuggesting,
    suggestPillars,
    savePillars,
    updatePillar,
    reload: load,
  };
}
