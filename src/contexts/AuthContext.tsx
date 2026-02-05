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
}

interface BrandVoice {
  id: string;
  user_id: string;
  writing_traits: string[];
  words_to_avoid: string[];
  signature_phrases: string[];
  preferred_hooks: string[];
  avoid_hooks: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  brandVoice: BrandVoice | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateBrandVoice: (updates: Partial<BrandVoice>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brandVoice, setBrandVoice] = useState<BrandVoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData as Profile);
    }

    const { data: brandData } = await supabase
      .from("brand_voice")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (brandData) {
      setBrandVoice(brandData as BrandVoice);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setBrandVoice(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
        updateBrandVoice,
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
