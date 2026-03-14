import { useState, useEffect, useRef } from "react";
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
import { User, Zap, Shield, Save, Loader2, Check, Brain, Sparkles, MessageSquare, LogOut, X, Plus, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type SaveStatus = "idle" | "saving" | "saved";

const sections = [
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
  { id: "profile", label: "Profile" },
  { id: "memory", label: "Memory" },
  { id: "voice", label: "Voice & Style" },
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

export function SettingsTab() {
  const { user, profile, brandVoice, signOut, isLoading: authLoading, refreshProfile } = useAuth();
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
    if (profile && brandVoice) {
      setIsHydrated(true);
    }
  }, [profile, brandVoice]);

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

      const updateRequests: any[] = [];

      if (Object.keys(profileUpdates).length > 0) {
        updateRequests.push(
          supabase.from("profiles").update(profileUpdates).eq("user_id", user.id),
        );
      }

      if (Object.keys(voiceUpdates).length > 0) {
        updateRequests.push(
          supabase.from("brand_voice").update(voiceUpdates).eq("user_id", user.id),
        );
      }

      if (updateRequests.length === 0) {
        setSaveStatus("idle");
        toast({ title: "No changes to save" });
        return;
      }

      const responses = await Promise.all(updateRequests);
      const firstError = responses.find((response) => response.error)?.error;

      if (firstError) {
        throw firstError;
      }

      await refreshProfile();
      toast({ title: "Settings saved" });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
      setSaveStatus("idle");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="relative">
      <div className="flex gap-8 max-w-4xl mx-auto">
        {/* Main content */}
        <div ref={contentRef} className="flex-1 space-y-6 min-w-0">

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

          {/* Memory */}
          <Card id="section-memory">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4" /> Memory</CardTitle>
              <CardDescription>Everything here is used by the AI to generate personalized content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-1.5 block">Skills & Expertise</Label>
                <TagInput value={skillInput} onChange={setSkillInput}
                  onAdd={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                  tags={skills} onRemove={(t) => removeTag(t, skills, setSkills)}
                  placeholder="e.g., Full-stack dev, Growth hacking" />
              </div>
              <div>
                <Label className="mb-1.5 block">Content Strategy</Label>
                <Textarea value={contentStrategy} onChange={(e) => setContentStrategy(e.target.value)}
                  placeholder="e.g., I'm building a personal brand around AI productivity..."
                  className="min-h-[100px] resize-none" />
              </div>
              <div>
                <Label className="mb-1.5 block">AI Instructions</Label>
                <Textarea value={customSystemPrompt} onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="e.g., Always write in first person. Never use emojis."
                  className="min-h-[100px] resize-none font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Voice & Style */}
          <Card id="section-voice">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4" /> Voice & Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-1.5 block">Writing Traits</Label>
                <TagInput value={traitInput} onChange={setTraitInput}
                  onAdd={() => addTag(traitInput, writingTraits, setWritingTraits, setTraitInput)}
                  tags={writingTraits} onRemove={(t) => removeTag(t, writingTraits, setWritingTraits)}
                  placeholder="e.g., Concise, data-driven" />
              </div>
              <div>
                <Label className="mb-1.5 block">Signature Phrases</Label>
                <TagInput value={phraseInput} onChange={setPhraseInput}
                  onAdd={() => addTag(phraseInput, signaturePhrases, setSignaturePhrases, setPhraseInput)}
                  tags={signaturePhrases} onRemove={(t) => removeTag(t, signaturePhrases, setSignaturePhrases)}
                  placeholder="e.g., Here's the thing" />
              </div>
              <div>
                <Label className="mb-1.5 block">Preferred Hook Types</Label>
                <TagInput value={hookInput} onChange={setHookInput}
                  onAdd={() => addTag(hookInput, preferredHooks, setPreferredHooks, setHookInput)}
                  tags={preferredHooks} onRemove={(t) => removeTag(t, preferredHooks, setPreferredHooks)}
                  placeholder="e.g., Curiosity, Authority" />
              </div>
              <div>
                <Label className="mb-1.5 block">Words to Avoid</Label>
                <TagInput value={avoidInput} onChange={setAvoidInput}
                  onAdd={() => addTag(avoidInput, wordsToAvoid, setWordsToAvoid, setAvoidInput)}
                  tags={wordsToAvoid} onRemove={(t) => removeTag(t, wordsToAvoid, setWordsToAvoid)}
                  placeholder="e.g., Leverage, Synergy" />
              </div>
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
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Settings"}
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
