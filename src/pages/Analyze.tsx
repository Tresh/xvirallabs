import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { useViralMemory } from "@/hooks/useViralMemory";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UsageIndicator } from "@/components/analyze/UsageIndicator";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
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
  Copy,
  Download,
  CheckCircle2 } from
"lucide-react";

const modes = [
{ id: 1, name: "Diagnose", icon: Microscope, desc: "Break down why it went viral" },
{ id: 2, name: "Psychology", icon: Brain, desc: "Uncover psychological triggers" },
{ id: 3, name: "Extract Pattern", icon: Dna, desc: "Pull reusable frameworks" },
{ id: 4, name: "Generate 20x", icon: Sparkles, desc: "Create 20 viral variations" },
{ id: 5, name: "Forecast", icon: BarChart3, desc: "Predict engagement metrics" },
{ id: 6, name: "Rewrite", icon: RefreshCw, desc: "Rewrite for higher virality" },
{ id: 7, name: "→ Thread", icon: FileText, desc: "Expand into a full thread" },
{ id: 8, name: "Ideas", icon: Lightbulb, desc: "Generate content ideas" },
{ id: 9, name: "Brand Fit", icon: User, desc: "Check brand alignment" },
{ id: 10, name: "Summary", icon: Trophy, desc: "Get a quick summary" }];


export default function Analyze() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAnalyzing, result, error, analyze, reset } = useViralAnalysis();
  const { saveAnalysis } = useViralMemory();
  const {
    remaining,
    isUnlimited,
    hasReachedLimit,
    isLoading: usageLoading,
    dailyLimit,
    decrementLocal
  } = useDailyUsage();

  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState(1);
  const [niche, setNiche] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    if (hasReachedLimit) {
      toast({ title: "Daily limit reached", description: "Upgrade to Pro for unlimited access!", variant: "destructive" });
      return;
    }
    if ((selectedMode === 4 || selectedMode === 8) && !niche.trim()) {
      toast({ title: "Niche required", description: "Please enter your niche for this mode.", variant: "destructive" });
      return;
    }
    setHasSaved(false);
    if (!isUnlimited) decrementLocal();
    await analyze(input, selectedMode, niche || undefined);
  };

  const handleSave = async () => {
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
        bookmark_potential: null
      });
      if (!saveError) {
        setHasSaved(true);
        toast({ title: "Analysis saved!", description: "View it in your Analyses tab." });
      }
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${modes.find((m) => m.id === selectedMode)?.name.toLowerCase() || "result"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    reset();
    setInput("");
    setNiche("");
    setHasSaved(false);
    setCopied(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <UsageIndicator remaining={remaining} isUnlimited={isUnlimited} isLoading={usageLoading} dailyLimit={dailyLimit} />
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            

            
            New Analysis
          </h1>
          <p className="text-muted-foreground mt-2">Paste any tweet and let AI reverse-engineer its virality.</p>
        </div>

        {!result ?
          <div className="max-w-2xl mx-auto space-y-5">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Tweet Content</label>
                  <Textarea
                    placeholder={"Paste the viral tweet text here...\n\nExample: 'I spent 10 years building startups.\nHere are 7 lessons that cost me $2M to learn:'"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[180px] bg-background border-border resize-none text-base"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Analysis Mode</label>
                  <div className="flex flex-wrap gap-2">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        disabled={isAnalyzing}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer",
                          selectedMode === mode.id
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <mode.icon className="h-3 w-3" />
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedMode === 4 || selectedMode === 8) && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Your Niche</label>
                    <input
                      type="text"
                      placeholder="e.g., SaaS, Fitness, Personal Finance"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  variant="viral"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !input.trim() || hasReachedLimit}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Run Analysis<ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          </div> : (

        /* Results View */
        <div className="space-y-6">
            {/* Result Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {modes.find((m) => m.id === selectedMode)?.name}
                </Badge>
                {hasSaved &&
              <Badge variant="outline" className="text-green-600 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Saved
                  </Badge>
              }
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
                {!hasSaved &&
              <Button variant="viral" size="sm" onClick={handleSave}>
                    Save to Library
                  </Button>
              }
              </div>
            </div>

            {/* Result Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-5 mb-3 first:mt-0">{children}</h1>,
                    h2: ({ children }) =>
                    <h2 className="text-lg font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                          {children}
                        </h2>,

                    h3: ({ children }) => <h3 className="text-base font-medium text-foreground mt-3 mb-1.5">{children}</h3>,
                    p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-2.5 text-sm">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-1.5 mb-3">{children}</ul>,
                    li: ({ children }) =>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{children}</span>
                        </li>,

                    ol: ({ children }) => <ol className="space-y-1.5 mb-3 list-decimal list-inside text-sm">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="text-primary italic">{children}</em>,
                    blockquote: ({ children }) =>
                    <blockquote className="border-l-2 border-primary pl-3 my-3 italic text-muted-foreground bg-secondary/50 py-1.5 rounded-r-lg text-sm">
                          {children}
                        </blockquote>,

                    code: ({ children }) =>
                    <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono text-primary">{children}</code>

                  }}>
                  
                    {result}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>)
        }
      </main>
    </div>);

}