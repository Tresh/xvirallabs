import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, RefreshCw, Star, ChevronLeft, Sparkles, Wand2, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BrandPillar {
  id: string;
  pillar_name: string;
}

interface ContentIdea {
  id: string;
  day_number: number;
  idea_order: number;
  idea_title: string;
  idea_type: string;
  intent: string;
  psychology_hint: string | null;
  generated_content: string | null;
  why_it_works: string | null;
  status: string;
  pillar_id: string | null;
  is_saved_to_vault: boolean;
}

interface TweetWorkspaceProps {
  idea: ContentIdea;
  pillar: BrandPillar | null;
  niche: string;
  unhingedMode: boolean;
  onBack: () => void;
  onUpdate: (updatedIdea: ContentIdea) => void;
}

export function TweetWorkspace({
  idea,
  pillar,
  niche,
  unhingedMode,
  onBack,
  onUpdate,
}: TweetWorkspaceProps) {
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [improveInstruction, setImproveInstruction] = useState("");
  const [showWhyItWorks, setShowWhyItWorks] = useState(false);

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";

  const generateTweet = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_tweet",
          ideaId: idea.id,
          ideaTitle: idea.idea_title,
          ideaType: idea.idea_type,
          pillarName: pillar?.pillar_name || "General",
          niche,
          intent: idea.intent,
          unhingedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onUpdate({
        ...idea,
        generated_content: data.tweet.content,
        why_it_works: data.tweet.why_it_works,
        status: "generated",
      });

      toast({ title: "✨ Tweet generated!" });
    } catch (error) {
      console.error("Generate tweet error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const improveTweet = async () => {
    if (!improveInstruction.trim()) {
      toast({
        variant: "destructive",
        title: "Enter an instruction",
        description: "Tell me how to improve this tweet",
      });
      return;
    }

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "improve_tweet",
          ideaId: idea.id,
          currentContent: idea.generated_content,
          instruction: improveInstruction,
          niche,
          unhingedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onUpdate({
        ...idea,
        generated_content: data.improved.content,
        why_it_works: data.improved.why_it_works,
      });

      setImproveInstruction("");
      toast({ title: "✨ Tweet improved!" });
    } catch (error) {
      console.error("Improve tweet error:", error);
      toast({
        variant: "destructive",
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const saveToVault = async () => {
    if (!idea.generated_content) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "save_to_vault",
          ideaId: idea.id,
          content: idea.generated_content,
          pillarName: pillar?.pillar_name || "General",
          ideaTitle: idea.idea_title,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onUpdate({ ...idea, is_saved_to_vault: true });
      toast({ title: "⭐ Saved to Vault!" });
    } catch (error) {
      console.error("Save to vault error:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (!idea.generated_content) return;
    await navigator.clipboard.writeText(idea.generated_content);
    toast({ title: "📋 Copied to clipboard!" });
  };

  const regenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_tweet",
          ideaId: idea.id,
          ideaTitle: idea.idea_title,
          ideaType: idea.idea_type,
          pillarName: pillar?.pillar_name || "General",
          niche,
          intent: idea.intent,
          unhingedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onUpdate({
        ...idea,
        generated_content: data.tweet.content,
        why_it_works: data.tweet.why_it_works,
      });

      toast({ title: "🔄 Regenerated!" });
    } catch (error) {
      console.error("Regenerate error:", error);
      toast({
        variant: "destructive",
        title: "Regeneration failed",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const quickImproveOptions = [
    "Make it more aggressive",
    "Add sales angle",
    "More clickbait",
    "Shorter",
    "More controversial",
    "Add emotion",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold">Day {idea.day_number} • Idea {idea.idea_order}</h2>
          <p className="text-sm text-muted-foreground">{idea.idea_title}</p>
        </div>
        {pillar && (
          <Badge variant="outline">{pillar.pillar_name}</Badge>
        )}
      </div>

      {/* Idea Info */}
      <Card className="bg-secondary/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              📝 {idea.idea_type.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">
              🎯 {idea.intent}
            </Badge>
            {idea.psychology_hint && (
              <Badge variant="secondary">
                🧠 {idea.psychology_hint}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {!idea.generated_content ? (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-primary/20">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Generate This Tweet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click below to create the full tweet based on this idea.
            </p>
            <Button 
              variant="viral" 
              size="lg"
              onClick={generateTweet}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Tweet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Generated Tweet */}
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Tweet</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={regenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Regenerate
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={saveToVault}
                    disabled={isSaving || idea.is_saved_to_vault}
                    className={idea.is_saved_to_vault ? "text-yellow-400" : ""}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Star className={`h-4 w-4 mr-1 ${idea.is_saved_to_vault ? "fill-current" : ""}`} />
                    )}
                    {idea.is_saved_to_vault ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-secondary/30 whitespace-pre-wrap text-base">
                {idea.generated_content}
              </div>
              
              {/* Why it works */}
              {idea.why_it_works && (
                <div className="mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowWhyItWorks(!showWhyItWorks)}
                    className="text-xs"
                  >
                    {showWhyItWorks ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                    {showWhyItWorks ? "Hide" : "Show"} why this works
                  </Button>
                  {showWhyItWorks && (
                    <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-primary/30 italic">
                      💡 {idea.why_it_works}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improve Section */}
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Improve This Tweet
                {!isPaidUser && <Lock className="h-3 w-3 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaidUser ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="E.g., 'Make it more aggressive' or 'Add urgency'"
                      value={improveInstruction}
                      onChange={(e) => setImproveInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && improveTweet()}
                    />
                    <Button 
                      onClick={improveTweet}
                      disabled={isImproving || !improveInstruction.trim()}
                    >
                      {isImproving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Improve"
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickImproveOptions.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setImproveInstruction(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Inline editing is a Pro feature
                  </p>
                  <Button variant="outline" size="sm">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
