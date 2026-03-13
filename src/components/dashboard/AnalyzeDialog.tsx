import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Sparkles,
  Loader2,
  Microscope,
  Brain,
  Dna,
  BarChart3,
  RefreshCw,
  Lightbulb,
  User,
  Trophy,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { useViralMemory } from "@/hooks/useViralMemory";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UsageIndicator } from "@/components/analyze/UsageIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

const modes = [
  { id: 1, name: "Diagnose", icon: Microscope },
  { id: 2, name: "Psychology", icon: Brain },
  { id: 3, name: "Extract Pattern", icon: Dna },
  { id: 4, name: "Generate 20x", icon: Sparkles },
  { id: 5, name: "Forecast", icon: BarChart3 },
  { id: 6, name: "Rewrite", icon: RefreshCw },
  { id: 7, name: "→ Thread", icon: FileText },
  { id: 8, name: "Ideas", icon: Lightbulb },
  { id: 9, name: "Brand Fit", icon: User },
  { id: 10, name: "Summary", icon: Trophy },
];

interface AnalyzeDialogProps {
  children: React.ReactNode;
  onAnalysisComplete?: () => void;
}

export function AnalyzeDialog({ children, onAnalysisComplete }: AnalyzeDialogProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState(1);
  
  const [hasSaved, setHasSaved] = useState(false);

  const { isAnalyzing, result, error, analyze, reset } = useViralAnalysis();
  const {
    remaining,
    isUnlimited,
    hasReachedLimit,
    isLoading: usageLoading,
    dailyLimit,
    decrementLocal,
  } = useDailyUsage();
  const { saveAnalysis } = useViralMemory();

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    if (hasReachedLimit) {
      toast({
        title: "Daily limit reached",
        description: "You've used all 5 free analyses today. Upgrade to Pro for unlimited access!",
        variant: "destructive",
      });
      return;
    }

    setHasSaved(false);

    if (!isUnlimited) {
      decrementLocal();
    }

    await analyze(input, selectedMode);
  };

  // Save analysis when complete
  const handleSaveAndClose = async () => {
    if (result && !hasSaved) {
      const { error: saveError } = await saveAnalysis({
        post_source: "text",
        original_post: input,
        mode_used: selectedMode,
        analysis_result: result,
        identified_hook: null,
        psychology_triggers: [],
        viral_pattern: null,
        dwell_time_score: null,
        reply_potential: null,
        bookmark_potential: null,
      });

      if (!saveError) {
        setHasSaved(true);
        toast({
          title: "Analysis saved!",
          description: "View it in your dashboard anytime.",
        });
      }
    }

    onAnalysisComplete?.();
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    reset();
    setInput("");
    setNiche("");
    setHasSaved(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Analyze Tweet
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pr-4">
              {/* Usage Indicator */}
              <div className="flex justify-end">
                <UsageIndicator
                  remaining={remaining}
                  isUnlimited={isUnlimited}
                  isLoading={usageLoading}
                  dailyLimit={dailyLimit}
                />
              </div>

              {/* Text Input */}
              <Textarea
                placeholder="Paste the viral tweet text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px] bg-background border-border resize-none"
              />

              {/* Niche Input for Mode 4 and 8 */}
              {(selectedMode === 4 || selectedMode === 8) && (
                <input
                  type="text"
                  placeholder="Your niche (e.g., SaaS, Fitness)"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground"
                />
              )}

              {/* Mode Selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Select Analysis Mode
                </label>
                <div className="flex flex-wrap gap-2">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      disabled={isAnalyzing}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                        selectedMode === mode.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      )}
                    >
                      <mode.icon className="h-3.5 w-3.5" />
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="viral"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !input.trim() || hasReachedLimit}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Run Analysis
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pr-4">
              {/* Result Display */}
              <div className="rounded-xl bg-secondary/50 border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Badge>{modes.find((m) => m.id === selectedMode)?.name}</Badge>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-foreground mt-5 mb-3 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-foreground mt-3 mb-1.5">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted-foreground leading-relaxed mb-2.5 text-sm">{children}</p>
                      ),
                      ul: ({ children }) => <ul className="space-y-1.5 mb-3">{children}</ul>,
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{children}</span>
                        </li>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1.5 mb-3 list-decimal list-inside text-sm">{children}</ol>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => <em className="text-primary italic">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary pl-3 my-3 italic text-muted-foreground bg-secondary/50 py-1.5 rounded-r-lg text-sm">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono text-primary">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
                <Button variant="viral" onClick={handleSaveAndClose}>
                  Save & Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
