import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsageState {
  remaining: number; // -1 = unlimited (pro/elite), 0+ = free tier remaining
  isLoading: boolean;
  error: string | null;
}

export function useDailyUsage() {
  const { user, profile } = useAuth();
  const [state, setState] = useState<UsageState>({
    remaining: 5,
    isLoading: true,
    error: null,
  });

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setState({ remaining: 5, isLoading: false, error: null });
      return;
    }

    // Pro/Elite users have unlimited
    if (profile?.tier === "pro" || profile?.tier === "elite") {
      setState({ remaining: -1, isLoading: false, error: null });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_remaining_usage", {
        p_user_id: user.id,
      });

      if (error) throw error;

      setState({
        remaining: data ?? 5,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch usage:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load usage data",
      }));
    }
  }, [user, profile?.tier]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const decrementLocal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      remaining: prev.remaining > 0 ? prev.remaining - 1 : 0,
    }));
  }, []);

  const isUnlimited = state.remaining === -1;
  const hasReachedLimit = !isUnlimited && state.remaining <= 0;
  const dailyLimit = 5;

  return {
    ...state,
    isUnlimited,
    hasReachedLimit,
    dailyLimit,
    refresh: fetchUsage,
    decrementLocal,
  };
}
