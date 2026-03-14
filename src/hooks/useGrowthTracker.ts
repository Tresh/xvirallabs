import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GrowthSnapshot {
  id: string;
  snapshot_date: string;
  follower_count?: number;
  following_count?: number;
  posts_published: number;
  total_impressions: number;
  total_likes: number;
  total_replies: number;
  weekly_gain: number;
  notes?: string;
}

export function useGrowthTracker() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("growth_snapshots" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(30);
    if (data) setSnapshots(data as any as GrowthSnapshot[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addSnapshot = async (data: Omit<GrowthSnapshot, "id" | "snapshot_date">) => {
    if (!user) return { error: "Not authenticated" };
    const today = new Date().toISOString().split("T")[0];
    const existing = snapshots.find(s => s.snapshot_date === today);
    if (existing) {
      const { error } = await (supabase.from("growth_snapshots" as any) as any).update(data).eq("id", existing.id);
      await load();
      return { error };
    }
    const { error } = await (supabase.from("growth_snapshots" as any) as any).insert({ ...data, user_id: user.id, snapshot_date: today });
    await load();
    return { error };
  };

  const getWeeklyStats = () => {
    if (!snapshots.length) return null;
    const latest = snapshots[0];
    const weekAgo = snapshots[6] || snapshots[snapshots.length - 1];
    return {
      followerGain: latest.follower_count && weekAgo.follower_count
        ? latest.follower_count - weekAgo.follower_count : null,
      totalPosts: snapshots.slice(0, 7).reduce((sum, s) => sum + (s.posts_published || 0), 0),
      totalImpressions: snapshots.slice(0, 7).reduce((sum, s) => sum + (s.total_impressions || 0), 0),
      totalLikes: snapshots.slice(0, 7).reduce((sum, s) => sum + (s.total_likes || 0), 0),
      avgDailyPosts: Math.round(snapshots.slice(0, 7).reduce((sum, s) => sum + (s.posts_published || 0), 0) / 7),
    };
  };

  return { snapshots, isLoading, addSnapshot, getWeeklyStats, reload: load };
}
