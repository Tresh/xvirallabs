import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "user";

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  twitter_handle: string | null;
  tier: string | null;
  created_at: string | null;
  role: AppRole;
}

export interface ContentFlag {
  id: string;
  content_type: "analysis" | "pattern" | "idea";
  content_id: string;
  flagged_by: string | null;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlatformStats {
  total_users: number;
  total_analyses: number;
  total_patterns: number;
  total_ideas: number;
  pro_users: number;
  elite_users: number;
  analyses_last_7_days: number;
  analyses_last_30_days: number;
}

export function useAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return data?.role === "admin";
    },
    enabled: !!user?.id,
  });

  // Fetch platform stats (admin only)
  const { data: platformStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_platform_stats")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as PlatformStats;
    },
    enabled: isAdmin === true,
  });

  // Fetch all users with roles (admin only)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Then get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      
      if (rolesError) throw rolesError;
      
      // Merge them
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          twitter_handle: profile.twitter_handle,
          tier: profile.tier,
          created_at: profile.created_at,
          role: (userRole?.role as AppRole) || "user",
        };
      });
      
      return usersWithRoles;
    },
    enabled: isAdmin === true,
  });

  // Fetch content flags (admin only)
  const { data: contentFlags, isLoading: isLoadingFlags } = useQuery({
    queryKey: ["admin-content-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_flags")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ContentFlag[];
    },
    enabled: isAdmin === true,
  });

  // Update user role
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Update user tier
  const updateUserTier = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ tier })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Update content flag status
  const updateFlagStatus = useMutation({
    mutationFn: async ({ 
      flagId, 
      status, 
      notes 
    }: { 
      flagId: string; 
      status: ContentFlag["status"]; 
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("content_flags")
        .update({ 
          status, 
          notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", flagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-flags"] });
    },
  });

  return {
    isAdmin,
    isCheckingAdmin,
    platformStats,
    isLoadingStats,
    users,
    isLoadingUsers,
    contentFlags,
    isLoadingFlags,
    updateUserRole,
    updateUserTier,
    updateFlagStatus,
  };
}
