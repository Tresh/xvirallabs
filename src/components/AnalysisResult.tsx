import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { Copy, Download, RefreshCw, Sparkles, BookmarkPlus, Dna, Lightbulb, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useViralMemory } from "@/hooks/useViralMemory";
import { useState } from "react";
import { Link } from "react-router-dom";

interface AnalysisResultProps {
  result: string;
  isAnalyzing: boolean;
  mode: number;
  onReset: () => void;
  originalPost?: string;
  inputType?: "text" | "url";
}

const modeNames: Record<number, string> = {
  1: "Viral Diagnosis",
  2: "Psychology Deconstruction",
  3: "Pattern Extraction",
  4: "Viral Variations",
  5: "Engagement Forecast",
  6: "Virality Rewrite",
  7: "Thread Conversion",
  8: "Idea Engine",
  9: "Brand Alignment",
  10: "Lab Summary",
};

export function AnalysisResult({
  result,
  isAnalyzing,
  mode,
  onReset,
  originalPost = "",
  inputType = "text",
}: AnalysisResultProps) {
  const { user } = useAuth();
  const { saveAnalysis, savePattern, saveIdea } = useViralMemory();
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingPattern, setIsSavingPattern] = useState(false);
  const [isSavingIdea, setIsSavingIdea] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast({
      title: "Copied!",
      description: "Analysis copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viral-labs-${modeNames[mode].toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Analysis saved as markdown file",
    });
  };

  const handleSaveAnalysis = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Create an account to save your analyses",
        variant: "destructive",
      });
      return;
    }

    const { error } = await saveAnalysis({
      post_source: inputType === "url" ? "link" : "text",
      original_post: originalPost,
      mode_used: mode,
      analysis_result: result,
      identified_hook: null,
      psychology_triggers: [],
      viral_pattern: null,
      dwell_time_score: null,
      reply_potential: null,
      bookmark_potential: null,
    });

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsSaved(true);
      toast({
        title: "Saved to Viral Lab!",
        description: "Access it anytime from your dashboard",
      });
    }
  };

  const handleSavePattern = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Create an account to save patterns",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPattern(true);

    // Extract pattern name from result (first line usually)
    const firstLine = result.split("\n").find((l) => l.trim().length > 0) || "Viral Pattern";
    const patternName = firstLine.replace(/^#+\s*/, "").slice(0, 100);

    const { error } = await savePattern({
      pattern_name: patternName,
      pattern_template: result.slice(0, 2000),
      hook_framework: null,
      best_for_niches: [],
      source_analysis_id: null,
    });

    setIsSavingPattern(false);

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pattern saved!",
        description: "Reuse this pattern for future content",
      });
    }
  };

  const handleSaveIdea = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Create an account to save ideas",
        variant: "destructive",
      });
      return;
    }

    setIsSavingIdea(true);

    // Extract first meaningful line as title
    const firstLine = result.split("\n").find((l) => l.trim().length > 0 && !l.startsWith("#")) || "Viral Idea";
    const ideaTitle = firstLine.slice(0, 200);

    const { error } = await saveIdea({
      idea_title: ideaTitle,
      idea_content: result.slice(0, 5000),
      idea_status: "unused",
      hook_type: null,
      emotion_trigger: null,
      generated_from_pattern_id: null,
      generated_from_analysis_id: null,
    });

    setIsSavingIdea(false);

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added to Idea Vault!",
        description: "Track your content ideas in the dashboard",
      });
    }
  };

  if (!result && !isAnalyzing) return null;

  return (
    <div className="mt-8 max-w-4xl mx-auto animate-fade-in">
      {/* <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl"> */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{modeNames[mode]} Results</h3>
              <p className="text-sm text-muted-foreground font-mono">MODE {mode}</p>
            </div>
          </div>

          {!isAnalyzing && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RefreshCw className="h-4 w-4" />
                New
              </Button>
            </div>
          )}
        </div>

        {/* Save Actions - Only show when not analyzing and has result */}
        {!isAnalyzing && result && (
          <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4 text-primary" />
              Save to Your Viral Lab
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isSaved ? "secondary" : "viral"}
                size="sm"
                onClick={handleSaveAnalysis}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    Save Analysis
                  </>
                )}
              </Button>

              {mode === 3 && (
                <Button variant="outline" size="sm" onClick={handleSavePattern} disabled={isSavingPattern}>
                  <Dna className="h-4 w-4" />
                  {isSavingPattern ? "Saving..." : "Save Pattern"}
                </Button>
              )}

              {(mode === 4 || mode === 8) && (
                <Button variant="outline" size="sm" onClick={handleSaveIdea} disabled={isSavingIdea}>
                  <Lightbulb className="h-4 w-4" />
                  {isSavingIdea ? "Saving..." : "Add to Ideas"}
                </Button>
              )}

              {!user && (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Sign in to save →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {/* <div className="prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[60vh]"> */}
        <div className="prose prose-sm max-w-none overflow-y-auto flex-1 min-h-0">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-foreground mt-5 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  {children}
                </h2>
              ),
              h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>,
              p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-3">{children}</p>,
              ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{children}</span>
                </li>
              ),
              ol: ({ children }) => <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="text-primary italic">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary pl-4 my-4 italic text-muted-foreground bg-secondary/30 py-2 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="px-2 py-1 bg-secondary rounded text-sm font-mono text-primary">{children}</code>
              ),
            }}
          >
            {result}
          </ReactMarkdown>

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-primary mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-mono">Analyzing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
