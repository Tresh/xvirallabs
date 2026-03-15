import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  twitter_handle: string | null;
  primary_niche: string | null;
  secondary_niches: string[];
  brand_tone: "authoritative" | "relatable" | "bold" | "playful";
  growth_goal: "followers" | "leads" | "sales" | "authority";
  tier: "free" | "pro" | "elite";
  display_name: string | null;
  skills: string[];
  content_strategy: string | null;
  custom_system_prompt: string | null;
  updated_at?: string | null;
}

interface BrandVoice {
  id: string;
  user_id: string;
  writing_traits: string[];
  words_to_avoid: string[];
  signature_phrases: string[];
  preferred_hooks: string[];
  avoid_hooks: string[];
  updated_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  brandVoice: BrandVoice | null;
  isLoading: boolean;
  authError: string | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateBrandVoice: (updates: Partial<BrandVoice>) => Promise<{ error: Error | null }>;
  loginProvider: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brandVoice, setBrandVoice] = useState<BrandVoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginProvider, setLoginProvider] = useState<string | null>(null);

  const ensureAndFetchProfile = async (userId: string, email: string | undefined) => {
    setAuthError(null);

    try {
      // Ensure profile row exists (self-heal)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingProfile) {
        console.warn("[Auth] Profile row missing for user, creating...");
        await supabase.from("profiles").insert({ user_id: userId, email: email || null });
      }

      // Ensure brand_voice row exists (self-heal)
      const { data: existingVoice } = await supabase
        .from("brand_voice")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingVoice) {
        console.warn("[Auth] Brand voice row missing for user, creating...");
        await supabase.from("brand_voice").insert({ user_id: userId });
      }

      // Now fetch both
      const [{ data: profileData, error: pErr }, { data: brandData, error: bErr }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("brand_voice").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      if (pErr) {
        console.error("[Auth] Failed to fetch profile:", pErr.message);
        setAuthError(`Failed to load profile: ${pErr.message}`);
      }
      if (bErr) {
        console.error("[Auth] Failed to fetch brand voice:", bErr.message);
        setAuthError(`Failed to load brand voice: ${bErr.message}`);
      }

      setProfile((profileData as Profile | null) ?? null);
      setBrandVoice((brandData as BrandVoice | null) ?? null);
    } catch (err: any) {
      console.error("[Auth] Error in ensureAndFetchProfile:", err);
      setAuthError(err.message || "Unknown error loading profile");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // Detect login provider
        const provider = nextSession.user.app_metadata?.provider || "email";
        setLoginProvider(provider);
        await ensureAndFetchProfile(nextSession.user.id, nextSession.user.email);
      } else {
        setProfile(null);
        setBrandVoice(null);
        setLoginProvider(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void syncSession(initialSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setBrandVoice(null);
    setLoginProvider(null);
    setAuthError(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await ensureAndFetchProfile(user.id, user.email ?? undefined);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };
    
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    
    if (!error) {
      await refreshProfile();
    }
    
    return { error };
  };

  const updateBrandVoice = async (updates: Partial<BrandVoice>) => {
    if (!user) return { error: new Error("Not authenticated") };
    
    const { error } = await supabase
      .from("brand_voice")
      .update(updates)
      .eq("user_id", user.id);
    
    if (!error) {
      await refreshProfile();
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        brandVoice,
        isLoading,
        authError,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
        updateBrandVoice,
        loginProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
