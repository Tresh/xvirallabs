import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export function QuickAnalyze() {
  const { user } = useAuth();
  const { analyze, isAnalyzing, result, reset } = useViralAnalysis();
  const [input, setInput] = useState("");

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    if (!user) return;
    await analyze(input.trim(), 1);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">Try It</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Viral Check</h2>
          <p className="text-base text-muted-foreground">
            Paste a tweet. Get an instant diagnosis.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {!result ? (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a tweet here..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none min-h-[120px] mb-4"
                disabled={isAnalyzing}
              />
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
            </>
          ) : (
            <>
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground mb-4 max-h-[400px] overflow-y-auto">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { reset(); setInput(""); }}>
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
