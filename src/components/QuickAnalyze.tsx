import { useState } from "react";
import { Button } from "./ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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

export function QuickAnalyze() {
  const { user } = useAuth();
  const { analyze, isAnalyzing, result, reset } = useViralAnalysis();
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState(1);
  

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    if (!user) return;
    await analyze(input.trim(), selectedMode);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">Try It</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Viral Check</h2>
          <p className="text-base text-muted-foreground">
            Paste a tweet. Pick a mode. Get an instant diagnosis.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {!result ? (
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a tweet here..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none min-h-[100px]"
                disabled={isAnalyzing}
              />

              {/* Mode selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Mode</label>
                <div className="flex flex-wrap gap-1.5">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      disabled={isAnalyzing}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                        selectedMode === mode.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <mode.icon className="h-3 w-3" />
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>


              {user ? (
                <Button
                  variant="viral"
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !input.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="viral" className="w-full" asChild>
                  <Link to="/auth">
                    Sign in to analyze
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground mb-4 max-h-[400px] overflow-y-auto">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { reset(); setInput(""); setNiche(""); }}>
                  Try Another
                </Button>
                <Button variant="viral" className="flex-1" asChild>
                  <Link to={user ? "/dashboard" : "/auth"}>
                    Full Lab
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
