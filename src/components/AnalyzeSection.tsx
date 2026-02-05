import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  ArrowRight, 
  Link as LinkIcon, 
  FileText, 
  Sparkles,
  Loader2,
  Microscope,
  Brain,
  Dna,
  BarChart3,
  RefreshCw,
  Lightbulb,
  User,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { AnalysisResult } from "./AnalysisResult";
import { toast } from "@/hooks/use-toast";

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

export function AnalyzeSection() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [selectedMode, setSelectedMode] = useState(1);
  const [niche, setNiche] = useState("");
  
  const { isAnalyzing, result, error, analyze, reset } = useViralAnalysis();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    if (selectedMode === 4 && !niche.trim()) {
      toast({
        title: "Niche required",
        description: "Please enter your niche for generating viral variations.",
        variant: "destructive",
      });
      return;
    }
    
    await analyze(input, selectedMode, niche || undefined);
  };

  const handleReset = () => {
    reset();
    setInput("");
    setNiche("");
  };

  return (
    <section id="analyze" className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
            <Sparkles className="h-4 w-4 text-viral-success" />
            <span className="font-mono text-xs text-viral-success">START YOUR ANALYSIS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Paste. Analyze.{" "}
            <span className="text-gradient-viral">Go Viral.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drop any tweet and let our AI reverse-engineer its success.
          </p>
        </div>

        {/* Main Analysis Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl">
            {/* Input Type Toggle */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setInputType("text")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  inputType === "text"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
                Paste Text
              </button>
              <button
                onClick={() => setInputType("url")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  inputType === "url"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4" />
                Tweet URL
              </button>
            </div>

            {/* Text Input */}
            <Textarea
              placeholder={
                inputType === "text"
                  ? "Paste the viral tweet text here...\n\nExample: 'I spent 10 years building startups.\n\nHere are 7 lessons that cost me $2M to learn:'"
                  : "Paste the tweet URL here...\n\nhttps://twitter.com/user/status/..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[160px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none text-base mb-6"
            />

            {/* Niche Input for Mode 4 and 8 */}
            {(selectedMode === 4 || selectedMode === 8) && (
              <input
                type="text"
                placeholder="Your niche (e.g., SaaS, Fitness, Personal Finance)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground mb-6"
              />
            )}

            {/* Mode Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Select Analysis Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    disabled={isAnalyzing}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedMode === mode.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                      isAnalyzing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.name}</span>
                    <span className="sm:hidden">{mode.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                {error}
              </div>
            )}

            {/* Analyze Button */}
            <Button
              variant="viral"
              size="xl"
              className="w-full"
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Virality...
                </>
              ) : (
                <>
                  Run Analysis
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Analysis Tips */}
          {!result && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Microscope className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Pro Tip</h4>
                  <p className="text-xs text-muted-foreground">
                    Analyze posts with 1000+ likes for better pattern recognition
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border">
                <div className="p-2 rounded-lg bg-viral-success/10">
                  <Sparkles className="h-4 w-4 text-viral-success" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Best Results</h4>
                  <p className="text-xs text-muted-foreground">
                    Use Mode 4 after extracting patterns from top performers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border">
                <div className="p-2 rounded-lg bg-viral-warning/10">
                  <Brain className="h-4 w-4 text-viral-warning" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Deep Dive</h4>
                  <p className="text-xs text-muted-foreground">
                    Mode 2 reveals the psychology behind every viral hit
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Result */}
        <AnalysisResult
          result={result}
          isAnalyzing={isAnalyzing}
          mode={selectedMode}
          onReset={handleReset}
          originalPost={input}
          inputType={inputType}
        />
      </div>
    </section>
  );
}