import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Target,
  Brain,
  MessageSquare,
  Sparkles,
  X,
  Plus,
  Loader2,
  Check,
  Save,
  Shield,
  Mail,
  AtSign,
  KeyRound,
} from "lucide-react";

function TagInput({
  value,
  onChange,
  onAdd,
  tags,
  onRemove,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  tags: string[];
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={onAdd} disabled={!value.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => onRemove(tag)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

type SaveStatus = "idle" | "saving" | "saved";

export default function Settings() {
  const { user, profile, brandVoice, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [secondaryNiches, setSecondaryNiches] = useState<string[]>([]);
  const [nicheInput, setNicheInput] = useState("");
  const [brandTone, setBrandTone] = useState("authoritative");
  const [growthGoal, setGrowthGoal] = useState("followers");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [contentStrategy, setContentStrategy] = useState("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");

  // Brand voice state
  const [writingTraits, setWritingTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [avoidInput, setAvoidInput] = useState("");
  const [signaturePhrases, setSignaturePhrases] = useState<string[]>([]);
  const [phraseInput, setPhraseInput] = useState("");
  const [preferredHooks, setPreferredHooks] = useState<string[]>([]);
  const [hookInput, setHookInput] = useState("");
  const [avoidHooks, setAvoidHooks] = useState<string[]>([]);
  const [avoidHookInput, setAvoidHookInput] = useState("");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTwitterHandle(profile.twitter_handle || "");
      setPrimaryNiche(profile.primary_niche || "");
      setSecondaryNiches(profile.secondary_niches || []);
      setBrandTone(profile.brand_tone || "authoritative");
      setGrowthGoal(profile.growth_goal || "followers");
      setSkills(profile.skills || []);
      setContentStrategy(profile.content_strategy || "");
      setCustomSystemPrompt(profile.custom_system_prompt || "");
    }
    if (brandVoice) {
      setWritingTraits(brandVoice.writing_traits || []);
      setWordsToAvoid(brandVoice.words_to_avoid || []);
      setSignaturePhrases(brandVoice.signature_phrases || []);
      setPreferredHooks(brandVoice.preferred_hooks || []);
      setAvoidHooks(brandVoice.avoid_hooks || []);
    }
  }, [profile, brandVoice]);

  const addTag = (value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((t) => t !== tag));
  };

  const saveAll = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const [profileRes, voiceRes] = await Promise.all([
        supabase.from("profiles").update({
          display_name: displayName || null,
          twitter_handle: twitterHandle || null,
          primary_niche: primaryNiche || null,
          secondary_niches: secondaryNiches,
          brand_tone: brandTone,
          growth_goal: growthGoal,
          skills,
          content_strategy: contentStrategy || null,
          custom_system_prompt: customSystemPrompt || null,
        }).eq("user_id", user.id),
        supabase.from("brand_voice").update({
          writing_traits: writingTraits,
          words_to_avoid: wordsToAvoid,
          signature_phrases: signaturePhrases,
          preferred_hooks: preferredHooks,
          avoid_hooks: avoidHooks,
        }).eq("user_id", user.id),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (voiceRes.error) throw voiceRes.error;

      setSaveStatus("saved");
      await refreshProfile();
      setTimeout(() => setSaveStatus("idle"), 2000);
      toast({ title: "Settings saved", description: "Your profile and preferences have been updated." });
    } catch (e) {
      setSaveStatus("idle");
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password has been changed." });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar activeTab="settings" onTabChange={(tab) => {
          if (tab === "settings") return;
          navigate("/dashboard");
        }} onSignOut={handleSignOut} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 pb-24 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your account, profile, and AI preferences.
              </p>
            </div>

            {/* Account */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </label>
                  <Input value={user?.email || ""} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Plan</label>
                  <Badge variant="outline" className="capitalize text-sm px-3 py-1">
                    {profile?.tier || "free"}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> Change Password
                  </label>
                  <div className="space-y-2 mt-1">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={changePassword}
                      disabled={passwordSaving || !newPassword}
                    >
                      {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                      <AtSign className="h-3.5 w-3.5 text-muted-foreground" /> Twitter/X Handle
                    </label>
                    <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Primary Niche</label>
                  <Input value={primaryNiche} onChange={(e) => setPrimaryNiche(e.target.value)} placeholder="e.g., AI tools, SaaS, Web3" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Secondary Niches</label>
                  <TagInput
                    value={nicheInput}
                    onChange={setNicheInput}
                    onAdd={() => addTag(nicheInput, secondaryNiches, setSecondaryNiches, setNicheInput)}
                    tags={secondaryNiches}
                    onRemove={(t) => removeTag(t, secondaryNiches, setSecondaryNiches)}
                    placeholder="Add a secondary niche"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Brand Tone</label>
                  <Select value={brandTone} onValueChange={setBrandTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="relatable">Relatable</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Growth Goal</label>
                  <Select value={growthGoal} onValueChange={setGrowthGoal}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followers">Grow Followers</SelectItem>
                      <SelectItem value="leads">Generate Leads</SelectItem>
                      <SelectItem value="sales">Drive Sales</SelectItem>
                      <SelectItem value="authority">Build Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Skills & Expertise
                </CardTitle>
                <CardDescription className="text-xs">What are you known for?</CardDescription>
              </CardHeader>
              <CardContent>
                <TagInput
                  value={skillInput}
                  onChange={setSkillInput}
                  onAdd={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                  tags={skills}
                  onRemove={(t) => removeTag(t, skills, setSkills)}
                  placeholder="e.g., Full-stack dev, Growth hacking"
                />
              </CardContent>
            </Card>

            {/* Content Strategy */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Content Strategy
                </CardTitle>
                <CardDescription className="text-xs">Describe your audience, goals, and approach.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={contentStrategy}
                  onChange={(e) => setContentStrategy(e.target.value)}
                  placeholder="e.g., I'm building a personal brand around AI productivity..."
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>

            {/* AI Instructions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> AI Instructions
                </CardTitle>
                <CardDescription className="text-xs">Custom system-level directives for AI content generation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="e.g., Always write in first person. Never use emojis."
                  className="min-h-[120px] resize-none font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Voice & Style */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" /> Voice & Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Writing Traits</label>
                  <TagInput
                    value={traitInput}
                    onChange={setTraitInput}
                    onAdd={() => addTag(traitInput, writingTraits, setWritingTraits, setTraitInput)}
                    tags={writingTraits}
                    onRemove={(t) => removeTag(t, writingTraits, setWritingTraits)}
                    placeholder="e.g., Concise, data-driven"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Signature Phrases</label>
                  <TagInput
                    value={phraseInput}
                    onChange={setPhraseInput}
                    onAdd={() => addTag(phraseInput, signaturePhrases, setSignaturePhrases, setPhraseInput)}
                    tags={signaturePhrases}
                    onRemove={(t) => removeTag(t, signaturePhrases, setSignaturePhrases)}
                    placeholder="e.g., Here's the thing"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Preferred Hooks</label>
                  <TagInput
                    value={hookInput}
                    onChange={setHookInput}
                    onAdd={() => addTag(hookInput, preferredHooks, setPreferredHooks, setHookInput)}
                    tags={preferredHooks}
                    onRemove={(t) => removeTag(t, preferredHooks, setPreferredHooks)}
                    placeholder="e.g., Curiosity, Contrarian"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hooks to Avoid</label>
                  <TagInput
                    value={avoidHookInput}
                    onChange={setAvoidHookInput}
                    onAdd={() => addTag(avoidHookInput, avoidHooks, setAvoidHooks, setAvoidHookInput)}
                    tags={avoidHooks}
                    onRemove={(t) => removeTag(t, avoidHooks, setAvoidHooks)}
                    placeholder="e.g., Clickbait"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Words to Avoid</label>
                  <TagInput
                    value={avoidInput}
                    onChange={setAvoidInput}
                    onAdd={() => addTag(avoidInput, wordsToAvoid, setWordsToAvoid, setAvoidInput)}
                    tags={wordsToAvoid}
                    onRemove={(t) => removeTag(t, wordsToAvoid, setWordsToAvoid)}
                    placeholder="e.g., Leverage, Synergy"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save */}
            <div className="sticky bottom-4 flex justify-end">
              <Button onClick={saveAll} disabled={saveStatus === "saving"} variant="viral" size="lg" className="gap-2 shadow-lg">
                {saveStatus === "saving" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : saveStatus === "saved" ? (
                  <><Check className="h-4 w-4" /> Saved!</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Settings</>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
