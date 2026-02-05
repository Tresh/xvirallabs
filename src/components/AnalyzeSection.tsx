import { useState, useRef } from "react";
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
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViralAnalysis } from "@/hooks/useViralAnalysis";
import { AnalysisResult } from "./AnalysisResult";
import { toast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

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
  const [niche, setNiche] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  const statsInputRef = useRef<HTMLInputElement>(null);
  const commentsInputRef = useRef<HTMLInputElement>(null);
  
  const { isAnalyzing, result, error, analyze, reset } = useViralAnalysis();

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
    
    if (selectedMode === 4 && !niche.trim()) {
      toast({
        title: "Niche required",
        description: "Please enter your niche for generating viral variations.",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Pass uploaded images to the analysis when backend supports it
    await analyze(input, selectedMode, niche || undefined);
  };

  const handleReset = () => {
    reset();
    setInput("");
    setNiche("");
    // Clean up image previews
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
  };

  const statsImage = uploadedImages.find(img => img.type === "stats");
  const commentsImage = uploadedImages.find(img => img.type === "comments");

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
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all relative",
                  inputType === "url"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4" />
                Tweet URL
                <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 bg-viral-warning/20 text-viral-warning border-viral-warning/30">
                  Soon
                </Badge>
              </button>
            </div>

            {/* URL Coming Soon Message */}
            {inputType === "url" && (
              <div className="mb-6 p-4 rounded-xl bg-viral-warning/10 border border-viral-warning/30">
                <div className="flex items-center gap-2 text-viral-warning">
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
                "min-h-[160px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none text-base mb-6",
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
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-2 group"
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
                          <Badge className="bg-viral-purple/90 text-foreground text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Comments
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => commentsInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-viral-purple/50 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="p-2 rounded-lg bg-viral-purple/10 group-hover:bg-viral-purple/20 transition-colors">
                          <MessageSquare className="h-5 w-5 text-viral-purple" />
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
              disabled={!input.trim() || isAnalyzing || inputType === "url"}
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
