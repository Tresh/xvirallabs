import { useState, useRef, useEffect } from "react";
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
  Trophy,
  Image,
  X,
  MessageSquare,
  Eye,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { useViralMemory } from "@/hooks/useViralMemory";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { useAuth } from "@/contexts/AuthContext";
import { AnalysisResult } from "./AnalysisResult";
import { toast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { UsageIndicator } from "./analyze/UsageIndicator";
import { UpgradePrompt } from "./analyze/UpgradePrompt";
import { Link } from "react-router-dom";

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

interface UploadedImage {
  file: File;
  preview: string;
  type: "stats" | "comments";
}

export function AnalyzeSection() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [selectedMode, setSelectedMode] = useState(1);
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [hasSaved, setHasSaved] = useState(false);
  
  const statsInputRef = useRef<HTMLInputElement>(null);
  const commentsInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { isAnalyzing, result, error, analyze, reset } = useViralAnalysis();
  const { remaining, isUnlimited, hasReachedLimit, isLoading: usageLoading, dailyLimit, refresh: refreshUsage, decrementLocal } = useDailyUsage();
  const { saveAnalysis } = useViralMemory();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "stats" | "comments") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check if we already have an image of this type
    const existingIndex = uploadedImages.findIndex(img => img.type === type);
    const preview = URL.createObjectURL(file);
    const newImage: UploadedImage = { file, preview, type };

    if (existingIndex >= 0) {
      // Replace existing
      const updated = [...uploadedImages];
      URL.revokeObjectURL(updated[existingIndex].preview);
      updated[existingIndex] = newImage;
      setUploadedImages(updated);
    } else {
      setUploadedImages([...uploadedImages, newImage]);
    }

    // Reset the input
    e.target.value = "";
  };

  const removeImage = (type: "stats" | "comments") => {
    const image = uploadedImages.find(img => img.type === type);
    if (image) {
      URL.revokeObjectURL(image.preview);
      setUploadedImages(uploadedImages.filter(img => img.type !== type));
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to analyze tweets.",
        variant: "destructive",
      });
      return;
    }

    if (hasReachedLimit) {
      toast({
        title: "Daily limit reached",
        description: "You've used all 3 free analyses today. Upgrade to Pro for unlimited access!",
        variant: "destructive",
      });
      return;
    }
    
    
    // TODO: Pass uploaded images to the analysis when backend supports it
    setHasSaved(false);
    
    // Optimistically decrement usage
    if (!isUnlimited) {
      decrementLocal();
    }
    
    await analyze(input, selectedMode);
  };

  // Auto-save analysis when complete (for logged-in users)
  useEffect(() => {
    if (result && user && !isAnalyzing && !hasSaved) {
      const saveToMemory = async () => {
        const { error: saveError } = await saveAnalysis({
          post_source: inputType === "url" ? "link" : "text",
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
      };
      saveToMemory();
    }
  }, [result, user, isAnalyzing, hasSaved]);

  const handleReset = () => {
    reset();
    setInput("");
    
    setHasSaved(false);
    // Clean up image previews
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
  };

  const statsImage = uploadedImages.find(img => img.type === "stats");
  const commentsImage = uploadedImages.find(img => img.type === "comments");

  return (
    <section id="analyze" className="py-24 relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">Start Your Analysis</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Paste. Analyze.{" "}
            <span className="text-primary">Go Viral.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drop any tweet and let our AI reverse-engineer its success.
          </p>
        </div>

        {/* Main Analysis Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-2xl border border-border p-8 shadow-sm">
            {/* Input Type Toggle + Usage Indicator */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
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
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all relative",
                    inputType === "url"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LinkIcon className="h-4 w-4" />
                  Tweet URL
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
                    Soon
                  </Badge>
                </button>
              </div>
              
              {user && (
                <UsageIndicator 
                  remaining={remaining}
                  isUnlimited={isUnlimited}
                  isLoading={usageLoading}
                  dailyLimit={dailyLimit}
                />
              )}
            </div>

            {/* URL Coming Soon Message */}
            {inputType === "url" && (
              <div className="mb-6 p-4 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="h-5 w-5" />
                  <span className="font-medium">Direct URL Fetching Coming Soon!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  We're working on integrating with X's API. For now, please copy and paste the tweet text manually.
                </p>
              </div>
            )}

            {/* Text Input */}
            <Textarea
              placeholder={
                inputType === "text"
                  ? "Paste the viral tweet text here...\n\nExample: 'I spent 10 years building startups.\n\nHere are 7 lessons that cost me $2M to learn:'"
                  : "Paste the tweet URL here...\n\nhttps://twitter.com/user/status/..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={inputType === "url"}
              className={cn(
                "min-h-[160px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none text-base mb-6",
                inputType === "url" && "opacity-50 cursor-not-allowed"
              )}
            />

            {/* Screenshot Upload Section */}
            {inputType === "text" && (
              <div className="mb-6 space-y-4">
                <label className="text-sm font-medium text-muted-foreground block">
                  Add Screenshots for Better Analysis <span className="text-muted-foreground/60">(Optional)</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stats Screenshot */}
                  <div className="relative">
                    <input
                      ref={statsInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "stats")}
                      className="hidden"
                    />
                    {statsImage ? (
                      <div className="relative rounded-xl border border-border overflow-hidden group">
                        <img 
                          src={statsImage.preview} 
                          alt="Stats screenshot" 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage("stats")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary/90 text-primary-foreground text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Stats
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => statsInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 hover:bg-secondary transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Eye className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                          Stats Screenshot
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          Views, likes, retweets
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Comments Screenshot */}
                  <div className="relative">
                    <input
                      ref={commentsInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "comments")}
                      className="hidden"
                    />
                    {commentsImage ? (
                      <div className="relative rounded-xl border border-border overflow-hidden group">
                        <img 
                          src={commentsImage.preview} 
                          alt="Comments screenshot" 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage("comments")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-muted text-foreground text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Comments
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => commentsInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 bg-secondary/50 hover:bg-secondary transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-secondary transition-colors">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                          Comments Screenshot
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          Top replies & reactions
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Screenshots will give the AI more context for deeper analysis
                  </p>
                )}
              </div>
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
                      "flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                      selectedMode === mode.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                      isAnalyzing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <mode.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{mode.name}</span>
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

            {/* Limit Reached Prompt */}
            {hasReachedLimit && user && (
              <UpgradePrompt />
            )}

            {/* Sign In Prompt for non-logged in users */}
            {!user && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <LogIn className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground block">Sign in to analyze tweets</span>
                      <p className="text-sm text-muted-foreground">Free users get 3 analyses per day</p>
                    </div>
                  </div>
                  <Button asChild variant="viral" size="default" className="w-full sm:w-auto">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              variant="viral"
              size="xl"
              className="w-full"
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing || inputType === "url" || !user || hasReachedLimit}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Virality...
                </>
              ) : hasReachedLimit ? (
                <>
                  Daily Limit Reached
                </>
              ) : !user ? (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In to Analyze
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
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                <div className="p-2 rounded-lg bg-secondary">
                  <Microscope className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Pro Tip</h4>
                  <p className="text-xs text-muted-foreground">
                    Analyze posts with 1000+ likes for better pattern recognition
                  </p>
                </div>
              </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                <div className="p-2 rounded-lg bg-secondary">
                  <Sparkles className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Best Results</h4>
                  <p className="text-xs text-muted-foreground">
                    Use Mode 4 after extracting patterns from top performers
                  </p>
                </div>
              </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                <div className="p-2 rounded-lg bg-secondary">
                  <Brain className="h-4 w-4 text-foreground" />
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
