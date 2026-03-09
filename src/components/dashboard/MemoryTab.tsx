import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain,
  User,
  Sparkles,
  MessageSquare,
  X,
  Plus,
  Loader2,
  Check,
  Save,
} from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved";

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

export function MemoryTab() {
  const { user, profile, brandVoice, isLoading: authLoading, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [contentStrategy, setContentStrategy] = useState("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [brandTone, setBrandTone] = useState("authoritative");
  const [primaryNiche, setPrimaryNiche] = useState("");

  const [writingTraits, setWritingTraits] = useState<string[]>([]);
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [signaturePhrases, setSignaturePhrases] = useState<string[]>([]);
  const [preferredHooks, setPreferredHooks] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState("");
  const [traitInput, setTraitInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");
  const [hookInput, setHookInput] = useState("");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTwitterHandle(profile.twitter_handle || "");
      setSkills(profile.skills || []);
      setContentStrategy(profile.content_strategy || "");
      setCustomSystemPrompt(profile.custom_system_prompt || "");
      setBrandTone(profile.brand_tone || "authoritative");
      setPrimaryNiche(profile.primary_niche || "");
    }
    if (brandVoice) {
      setWritingTraits(brandVoice.writing_traits || []);
      setWordsToAvoid(brandVoice.words_to_avoid || []);
      setSignaturePhrases(brandVoice.signature_phrases || []);
      setPreferredHooks(brandVoice.preferred_hooks || []);
    }
  }, [profile, brandVoice]);

  const saveAll = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const [profileRes, voiceRes] = await Promise.all([
        supabase.from("profiles").update({
          display_name: displayName || null,
          twitter_handle: twitterHandle || null,
          skills,
          content_strategy: contentStrategy || null,
          custom_system_prompt: customSystemPrompt || null,
          brand_tone: brandTone,
          primary_niche: primaryNiche || null,
        }).eq("user_id", user.id),
        supabase.from("brand_voice").update({
          writing_traits: writingTraits,
          words_to_avoid: wordsToAvoid,
          signature_phrases: signaturePhrases,
          preferred_hooks: preferredHooks,
        }).eq("user_id", user.id),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (voiceRes.error) throw voiceRes.error;

      setSaveStatus("saved");
      await refreshProfile();
      setTimeout(() => setSaveStatus("idle"), 2000);
      toast({ title: "Memory saved", description: "Your AI context has been updated." });
    } catch (e) {
      setSaveStatus("idle");
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Memory
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything here is used by the AI to generate personalized content. The more you fill in, the better the output.
        </p>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Twitter/X Handle</label>
              <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Primary Niche</label>
            <Input value={primaryNiche} onChange={(e) => setPrimaryNiche(e.target.value)} placeholder="e.g., AI tools, Web3, SaaS marketing" />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Skills & Expertise
          </CardTitle>
          <CardDescription className="text-xs">What are you known for? These help the AI position you correctly.</CardDescription>
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
          <CardDescription className="text-xs">
            Describe what you're building, your audience, and how you want to grow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={contentStrategy}
            onChange={(e) => setContentStrategy(e.target.value)}
            placeholder="e.g., I'm building a personal brand around AI productivity. My audience is solopreneurs and indie hackers."
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
          <CardDescription className="text-xs">
            Custom instructions for the AI. This is injected as a system-level directive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customSystemPrompt}
            onChange={(e) => setCustomSystemPrompt(e.target.value)}
            placeholder="e.g., Always write in first person. Never use emojis. Keep sentences under 15 words."
            className="min-h-[120px] resize-none font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Voice & Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Voice & Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tone</label>
            <Select value={brandTone} onValueChange={setBrandTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="relatable">Relatable</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Writing Traits</label>
            <TagInput
              value={traitInput}
              onChange={setTraitInput}
              onAdd={() => addTag(traitInput, writingTraits, setWritingTraits, setTraitInput)}
              tags={writingTraits}
              onRemove={(t) => removeTag(t, writingTraits, setWritingTraits)}
              placeholder="e.g., Concise, data-driven, storytelling"
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
              placeholder="e.g., Here's the thing, Let me break it down"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Preferred Hook Types</label>
            <TagInput
              value={hookInput}
              onChange={setHookInput}
              onAdd={() => addTag(hookInput, preferredHooks, setPreferredHooks, setHookInput)}
              tags={preferredHooks}
              onRemove={(t) => removeTag(t, preferredHooks, setPreferredHooks)}
              placeholder="e.g., Curiosity, Authority, Contrarian"
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
              placeholder="e.g., Leverage, Synergy, Game-changer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveAll} disabled={saveStatus === "saving"} variant="viral" size="lg" className="gap-2 shadow-lg">
          {saveStatus === "saving" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : saveStatus === "saved" ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save Memory</>
          )}
        </Button>
      </div>
    </div>
  );
}
