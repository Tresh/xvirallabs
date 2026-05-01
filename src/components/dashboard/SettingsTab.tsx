import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Zap, Shield, Save, Loader2, Check, Brain, Sparkles, MessageSquare, LogOut, X, Plus, Moon, Sun, RefreshCw, Database, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ContentPillarSetup } from "@/components/dashboard/ContentPillarSetup";

type SaveStatus = "idle" | "saving" | "saved";

const sections = [
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
  { id: "profile", label: "Profile" },
  { id: "data-health", label: "Data Health" },
  { id: "signout", label: "Sign Out" },
] as const;

function TagInput({ value, onChange, onAdd, tags, onRemove, placeholder }: {
  value: string; onChange: (v: string) => void; onAdd: () => void; tags: string[]; onRemove: (tag: string) => void; placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }} />
        <Button type="button" variant="outline" size="icon" onClick={onAdd} disabled={!value.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => onRemove(tag)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const areStringArraysEqual = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

interface DataHealthCounts {
  analyses: number;
  patterns: number;
  ideas: number;
  dailyPosts: number;
  calendars: number;
  profileComplete: number;
  voiceComplete: number;
  profileUpdatedAt: string | null;
  voiceUpdatedAt: string | null;
}

interface SettingsDraft {
  displayName: string;
  twitterHandle: string;
  primaryNiche: string;
  brandTone: "authoritative" | "relatable" | "bold" | "playful";
  growthGoal: "followers" | "leads" | "sales" | "authority";
  skills: string[];
  contentStrategy: string;
  customSystemPrompt: string;
  writingTraits: string[];
  wordsToAvoid: string[];
  signaturePhrases: string[];
  preferredHooks: string[];
  skillInput: string;
  traitInput: string;
  avoidInput: string;
  phraseInput: string;
  hookInput: string;
}

export function SettingsTab() {
  const { user, profile, brandVoice, signOut, isLoading: authLoading, refreshProfile, authError, loginProvider } = useAuth();
  const { remaining, isUnlimited, dailyLimit } = useDailyUsage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [brandTone, setBrandTone] = useState<"authoritative" | "relatable" | "bold" | "playful">("authoritative");
  const [growthGoal, setGrowthGoal] = useState<"followers" | "leads" | "sales" | "authority">("followers");
  const [skills, setSkills] = useState<string[]>([]);
  const [contentStrategy, setContentStrategy] = useState("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [writingTraits, setWritingTraits] = useState<string[]>([]);
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [signaturePhrases, setSignaturePhrases] = useState<string[]>([]);
  const [preferredHooks, setPreferredHooks] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");
  const [hookInput, setHookInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [activeSection, setActiveSection] = useState("account");
  const [isHydrated, setIsHydrated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const draftKey = user ? `settings-draft:${user.id}` : null;

  // Data health
  const [dataHealth, setDataHealth] = useState<DataHealthCounts | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchDataHealth = async () => {
    if (!user) return;
    setHealthLoading(true);
    try {
      const [analyses, patterns, ideas, dailyPosts, calendars] = await Promise.all([
        supabase.from("viral_analyses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("viral_patterns").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("idea_vault").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("daily_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("content_calendars").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      // Profile completeness
      const profileFields = [profile?.display_name, profile?.twitter_handle, profile?.primary_niche, profile?.content_strategy];
      const profileComplete = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

      // Voice completeness
      const voiceFields = [
        (brandVoice?.writing_traits?.length ?? 0) > 0,
        (brandVoice?.words_to_avoid?.length ?? 0) > 0,
        (brandVoice?.signature_phrases?.length ?? 0) > 0,
        (brandVoice?.preferred_hooks?.length ?? 0) > 0,
      ];
      const voiceComplete = Math.round((voiceFields.filter(Boolean).length / voiceFields.length) * 100);

      setDataHealth({
        analyses: analyses.count ?? 0,
        patterns: patterns.count ?? 0,
        ideas: ideas.count ?? 0,
        dailyPosts: dailyPosts.count ?? 0,
        calendars: calendars.count ?? 0,
        profileComplete,
        voiceComplete,
        profileUpdatedAt: (profile as any)?.updated_at ?? null,
        voiceUpdatedAt: (brandVoice as any)?.updated_at ?? null,
      });
    } catch (err) {
      console.error("Failed to fetch data health:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTwitterHandle(profile.twitter_handle || "");
      setPrimaryNiche(profile.primary_niche || "");
      setBrandTone((profile.brand_tone as "authoritative" | "relatable" | "bold" | "playful") || "authoritative");
      setGrowthGoal((profile.growth_goal as "followers" | "leads" | "sales" | "authority") || "followers");
      setSkills(profile.skills || []);
      setContentStrategy(profile.content_strategy || "");
      setCustomSystemPrompt(profile.custom_system_prompt || "");
    }
    if (brandVoice) {
      setWritingTraits(brandVoice.writing_traits || []);
      setWordsToAvoid(brandVoice.words_to_avoid || []);
      setSignaturePhrases(brandVoice.signature_phrases || []);
      setPreferredHooks(brandVoice.preferred_hooks || []);
    }

    if (profile && brandVoice && draftKey) {
      try {
        const rawDraft = sessionStorage.getItem(draftKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft) as Partial<SettingsDraft>;
          setDisplayName(draft.displayName ?? profile.display_name ?? "");
          setTwitterHandle(draft.twitterHandle ?? profile.twitter_handle ?? "");
          setPrimaryNiche(draft.primaryNiche ?? profile.primary_niche ?? "");
          setBrandTone(draft.brandTone ?? (profile.brand_tone as "authoritative" | "relatable" | "bold" | "playful") ?? "authoritative");
          setGrowthGoal(draft.growthGoal ?? (profile.growth_goal as "followers" | "leads" | "sales" | "authority") ?? "followers");
          setSkills(draft.skills ?? profile.skills ?? []);
          setContentStrategy(draft.contentStrategy ?? profile.content_strategy ?? "");
          setCustomSystemPrompt(draft.customSystemPrompt ?? profile.custom_system_prompt ?? "");
          setWritingTraits(draft.writingTraits ?? brandVoice.writing_traits ?? []);
          setWordsToAvoid(draft.wordsToAvoid ?? brandVoice.words_to_avoid ?? []);
          setSignaturePhrases(draft.signaturePhrases ?? brandVoice.signature_phrases ?? []);
          setPreferredHooks(draft.preferredHooks ?? brandVoice.preferred_hooks ?? []);
          setSkillInput(draft.skillInput ?? "");
          setTraitInput(draft.traitInput ?? "");
          setAvoidInput(draft.avoidInput ?? "");
          setPhraseInput(draft.phraseInput ?? "");
          setHookInput(draft.hookInput ?? "");
        }
      } catch (error) {
        console.warn("Failed to read settings draft:", error);
      }
      setIsHydrated(true);
      return;
    }

    if (profile && brandVoice) {
      setIsHydrated(true);
    }
  }, [profile, brandVoice, draftKey]);

  // Persist unsaved draft locally so tab switches don't lose in-progress edits
  useEffect(() => {
    if (!draftKey || !isHydrated) return;

    const draft: SettingsDraft = {
      displayName,
      twitterHandle,
      primaryNiche,
      brandTone,
      growthGoal,
      skills,
      contentStrategy,
      customSystemPrompt,
      writingTraits,
      wordsToAvoid,
      signaturePhrases,
      preferredHooks,
      skillInput,
      traitInput,
      avoidInput,
      phraseInput,
      hookInput,
    };

    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [
    draftKey,
    isHydrated,
    displayName,
    twitterHandle,
    primaryNiche,
    brandTone,
    growthGoal,
    skills,
    contentStrategy,
    customSystemPrompt,
    writingTraits,
    wordsToAvoid,
    signaturePhrases,
    preferredHooks,
    skillInput,
    traitInput,
    avoidInput,
    phraseInput,
    hookInput,
  ]);

  // Auto-save: detect changes and save after 2s of inactivity
  const hasChanges = useCallback(() => {
    if (!profile || !brandVoice || !isHydrated) return false;
    const pChanged =
      (displayName.trim() || null) !== (profile.display_name ?? null) ||
      (twitterHandle.trim() || null) !== (profile.twitter_handle ?? null) ||
      (primaryNiche.trim() || null) !== (profile.primary_niche ?? null) ||
      brandTone !== profile.brand_tone ||
      growthGoal !== profile.growth_goal ||
      !areStringArraysEqual(skills, profile.skills || []) ||
      (contentStrategy.trim() || null) !== (profile.content_strategy ?? null) ||
      (customSystemPrompt.trim() || null) !== (profile.custom_system_prompt ?? null);
    const vChanged =
      !areStringArraysEqual(writingTraits, brandVoice.writing_traits || []) ||
      !areStringArraysEqual(wordsToAvoid, brandVoice.words_to_avoid || []) ||
      !areStringArraysEqual(signaturePhrases, brandVoice.signature_phrases || []) ||
      !areStringArraysEqual(preferredHooks, brandVoice.preferred_hooks || []);
    return pChanged || vChanged;
  }, [profile, brandVoice, isHydrated, displayName, twitterHandle, primaryNiche, brandTone, growthGoal, skills, contentStrategy, customSystemPrompt, writingTraits, wordsToAvoid, signaturePhrases, preferredHooks]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isHydrated || saveStatus === "saving") return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (hasChanges()) {
      setSaveStatus("idle");
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [displayName, twitterHandle, primaryNiche, brandTone, growthGoal, skills, contentStrategy, customSystemPrompt, writingTraits, wordsToAvoid, signaturePhrases, preferredHooks, isHydrated]);

  // Fetch data health on mount and when profile loads
  useEffect(() => {
    if (user && profile) {
      fetchDataHealth();
    }
  }, [user, profile?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionEls = sections.map(s => document.getElementById(`section-${s.id}`));
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const el = sectionEls[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addTag = (value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!user || !profile || !brandVoice || !isHydrated) {
      toast({ title: "Settings are still loading", description: "Please wait a second and try again." });
      return;
    }

    setSaveStatus("saving");

    try {
      const normalizedDisplayName = displayName.trim() || null;
      const normalizedTwitterHandle = twitterHandle.trim() || null;
      const normalizedPrimaryNiche = primaryNiche.trim() || null;
      const normalizedContentStrategy = contentStrategy.trim() || null;
      const normalizedCustomSystemPrompt = customSystemPrompt.trim() || null;

      const profileUpdates: Record<string, unknown> = {};
      if (normalizedDisplayName !== (profile.display_name ?? null)) profileUpdates.display_name = normalizedDisplayName;
      if (normalizedTwitterHandle !== (profile.twitter_handle ?? null)) profileUpdates.twitter_handle = normalizedTwitterHandle;
      if (normalizedPrimaryNiche !== (profile.primary_niche ?? null)) profileUpdates.primary_niche = normalizedPrimaryNiche;
      if (brandTone !== profile.brand_tone) profileUpdates.brand_tone = brandTone;
      if (growthGoal !== profile.growth_goal) profileUpdates.growth_goal = growthGoal;
      if (!areStringArraysEqual(skills, profile.skills || [])) profileUpdates.skills = skills;
      if (normalizedContentStrategy !== (profile.content_strategy ?? null)) profileUpdates.content_strategy = normalizedContentStrategy;
      if (normalizedCustomSystemPrompt !== (profile.custom_system_prompt ?? null)) profileUpdates.custom_system_prompt = normalizedCustomSystemPrompt;

      const voiceUpdates: Record<string, unknown> = {};
      if (!areStringArraysEqual(writingTraits, brandVoice.writing_traits || [])) voiceUpdates.writing_traits = writingTraits;
      if (!areStringArraysEqual(wordsToAvoid, brandVoice.words_to_avoid || [])) voiceUpdates.words_to_avoid = wordsToAvoid;
      if (!areStringArraysEqual(signaturePhrases, brandVoice.signature_phrases || [])) voiceUpdates.signature_phrases = signaturePhrases;
      if (!areStringArraysEqual(preferredHooks, brandVoice.preferred_hooks || [])) voiceUpdates.preferred_hooks = preferredHooks;

      const updateRequests: Promise<any>[] = [];

      if (Object.keys(profileUpdates).length > 0) {
        updateRequests.push(
          (async () => {
            const res = await supabase.from("profiles").update(profileUpdates).eq("user_id", user.id).select();
            if (res.error) throw res.error;
            if (!res.data || res.data.length === 0) throw new Error("Profile update affected 0 rows — your profile row may be missing.");
            return res;
          })()
        );
      }

      if (Object.keys(voiceUpdates).length > 0) {
        updateRequests.push(
          (async () => {
            const res = await supabase.from("brand_voice").update(voiceUpdates).eq("user_id", user.id).select();
            if (res.error) throw res.error;
            if (!res.data || res.data.length === 0) throw new Error("Brand voice update affected 0 rows — your voice row may be missing.");
            return res;
          })()
        );
      }

      if (updateRequests.length === 0) {
        setSaveStatus("idle");
        toast({ title: "No changes to save" });
        return;
      }

      await Promise.all(updateRequests);

      if (draftKey) sessionStorage.removeItem(draftKey);
      await refreshProfile();
      await fetchDataHealth();
      toast({ title: "Settings saved" });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
      setSaveStatus("idle");
    }
  };

  const handleRefreshFromBackend = async () => {
    if (draftKey) sessionStorage.removeItem(draftKey);
    await refreshProfile();
    await fetchDataHealth();
    toast({ title: "Refreshed from backend" });
  };

  const handleSignOut = async () => {
    if (draftKey) sessionStorage.removeItem(draftKey);
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const shortUserId = user?.id?.slice(0, 8) ?? "—";

  return (
    <div className="relative">
      <div className="flex gap-8 max-w-4xl mx-auto">
        {/* Main content */}
        <div ref={contentRef} className="flex-1 space-y-6 min-w-0">

          {/* Auth error banner */}
          {authError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Data loading issue</p>
                <p className="text-xs text-destructive/80">{authError}</p>
              </div>
            </div>
          )}

          {/* Account */}
          <Card id="section-account">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{profile?.tier || "free"}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Login Method</p>
                  <p className="text-xs text-muted-foreground capitalize">{loginProvider || "unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Account ID</p>
                  <p className="text-xs text-muted-foreground font-mono">{shortUserId}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Daily Analysis Credits</p>
                  <p className="text-xs text-muted-foreground">
                    {isUnlimited ? "Unlimited analyses with your plan" : `${remaining} of ${dailyLimit} remaining today`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">{isUnlimited ? "∞" : remaining}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card id="section-appearance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card id="section-profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Profile</CardTitle>
              <CardDescription>How the AI personalizes content for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Handle</Label>
                  <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Primary Niche</Label>
                <Input value={primaryNiche} onChange={(e) => setPrimaryNiche(e.target.value)} placeholder="e.g. AI, Fitness, Finance" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand Tone</Label>
                  <Select value={brandTone} onValueChange={(value) => setBrandTone(value as "authoritative" | "relatable" | "bold" | "playful")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="relatable">Relatable</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Growth Goal</Label>
                  <Select value={growthGoal} onValueChange={(value) => setGrowthGoal(value as "followers" | "leads" | "sales" | "authority")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followers">Grow Followers</SelectItem>
                      <SelectItem value="leads">Get More Leads</SelectItem>
                      <SelectItem value="sales">Drive Sales</SelectItem>
                      <SelectItem value="authority">Build Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Health */}
          <Card id="section-data-health">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base"><Database className="h-4 w-4" /> Data Health</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleRefreshFromBackend} className="gap-1.5">
                  <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>Live counts of your saved data in the backend</CardDescription>
            </CardHeader>
            <CardContent>
              {dataHealth ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Profile Completeness</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${dataHealth.profileComplete}%` }} />
                        </div>
                        <span className="text-sm font-medium">{dataHealth.profileComplete}%</span>
                      </div>
                      {dataHealth.profileUpdatedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">Updated: {new Date(dataHealth.profileUpdatedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Voice Completeness</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${dataHealth.voiceComplete}%` }} />
                        </div>
                        <span className="text-sm font-medium">{dataHealth.voiceComplete}%</span>
                      </div>
                      {dataHealth.voiceUpdatedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">Updated: {new Date(dataHealth.voiceUpdatedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Analyses", count: dataHealth.analyses },
                      { label: "Patterns", count: dataHealth.patterns },
                      { label: "Ideas", count: dataHealth.ideas },
                      { label: "Daily Posts", count: dataHealth.dailyPosts },
                      { label: "Calendars", count: dataHealth.calendars },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-xl font-bold text-foreground">{item.count}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : healthLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to load data health.</p>
              )}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card id="section-signout" className="border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end pb-4">
            <Button onClick={handleSave} disabled={saveStatus === "saving" || !isHydrated || !profile || !brandVoice} variant="viral" className="gap-2 shadow-lg">
              {saveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saveStatus === "saving" ? "Auto-saving..." : saveStatus === "saved" ? "Saved!" : hasChanges() ? "Unsaved changes" : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Floating right-side TOC */}
        <nav className="hidden lg:block w-44 shrink-0">
          <div className="fixed top-1/2 -translate-y-1/2 w-44">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
            <ul className="space-y-1 border-l border-border">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left text-sm pl-3 py-1.5 -ml-px border-l-2 transition-colors ${
                      activeSection === s.id
                        ? "border-primary text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
