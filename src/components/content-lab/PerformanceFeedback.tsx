import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  BarChart3,
  Link,
  Upload,
  Keyboard,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Eye,
  Users,
  MousePointer,
  UserPlus,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface ContentPost {
  id: string;
  draft_content: string | null;
  post_category: string;
}

interface PerformanceFeedbackProps {
  post: ContentPost;
  onAnalyzed: () => void;
}

interface AnalysisResult {
  score: number;
  engagement_rate: number;
  what_worked: string[];
  what_to_improve: string[];
  suggestions: string[];
  psychology_insights: string;
  full_analysis: string;
}

export function PerformanceFeedback({ post, onAnalyzed }: PerformanceFeedbackProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Metrics state
  const [metrics, setMetrics] = useState({
    impressions: "",
    likes: "",
    retweets: "",
    replies: "",
    bookmarks: "",
    profile_visits: "",
    link_clicks: "",
    follows_gained: "",
    audience_reached: "",
    posted_time: "",
  });
  const [tweetUrl, setTweetUrl] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const handleMetricChange = (field: string, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile || !user) return null;

    const fileExt = screenshotFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("performance-screenshots")
      .upload(fileName, screenshotFile);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Bucket is private; create a short-lived signed URL for the AI to read.
    const { data: signed, error: signErr } = await supabase.storage
      .from("performance-screenshots")
      .createSignedUrl(fileName, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      console.error("Signed URL error:", signErr);
      return null;
    }

    return signed.signedUrl;
  };

  const extractFromScreenshot = async () => {
    if (!screenshotPreview) return;

    setIsUploading(true);
    try {
      // Upload and get URL
      const screenshotUrl = await uploadScreenshot();
      if (!screenshotUrl) throw new Error("Failed to upload screenshot");

      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "analyze_screenshot",
          screenshotUrl,
        },
      });

      if (error) throw error;

      // Populate metrics from extracted data
      if (data.metrics) {
        setMetrics({
          impressions: data.metrics.impressions?.toString() || "",
          likes: data.metrics.likes?.toString() || "",
          retweets: data.metrics.retweets?.toString() || "",
          replies: data.metrics.replies?.toString() || "",
          bookmarks: data.metrics.bookmarks?.toString() || "",
          profile_visits: data.metrics.profile_visits?.toString() || "",
          link_clicks: data.metrics.link_clicks?.toString() || "",
          follows_gained: data.metrics.follows_gained?.toString() || "",
          audience_reached: data.metrics.audience_reached?.toString() || "",
          posted_time: data.metrics.posted_time || "",
        });

        toast({
          title: "Metrics extracted!",
          description: `Confidence: ${data.metrics.confidence || "medium"}. Review and adjust if needed.`,
        });

        // Switch to manual tab to show/edit extracted values
        setActiveTab("manual");
      }
    } catch (error) {
      console.error("Screenshot analysis error:", error);
      toast({
        variant: "destructive",
        title: "Extraction failed",
        description: "Could not extract metrics from screenshot. Please enter manually.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare metrics object with numbers
      const metricsPayload = {
        impressions: parseInt(metrics.impressions) || null,
        likes: parseInt(metrics.likes) || null,
        retweets: parseInt(metrics.retweets) || null,
        replies: parseInt(metrics.replies) || null,
        bookmarks: parseInt(metrics.bookmarks) || null,
        profile_visits: parseInt(metrics.profile_visits) || null,
        link_clicks: parseInt(metrics.link_clicks) || null,
        follows_gained: parseInt(metrics.follows_gained) || null,
        audience_reached: parseInt(metrics.audience_reached) || null,
        posted_time: metrics.posted_time || null,
      };

      // Upload screenshot if exists
      let screenshotUrl = null;
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot();
      }

      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "analyze_performance",
          postId: post.id,
          metrics: metricsPayload,
          tweetUrl: tweetUrl || null,
          screenshotUrl,
          originalContent: post.draft_content,
        },
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      toast({
        title: "🎯 Analysis Complete!",
        description: `Performance score: ${data.analysis.score}/100`,
      });
      onAnalyzed();
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze performance",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasEnoughMetrics = metrics.impressions || metrics.likes || metrics.retweets;

  if (analysisResult) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-background to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  analysisResult.score >= 70 
                    ? "border-green-500 text-green-500" 
                    : analysisResult.score >= 40 
                    ? "border-yellow-500 text-yellow-500"
                    : "border-red-500 text-red-500"
                }
              >
                Score: {analysisResult.score}/100
              </Badge>
              {analysisResult.engagement_rate && (
                <Badge variant="secondary">
                  {analysisResult.engagement_rate}% engagement
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Performance Score</span>
              <span className="font-medium">{analysisResult.score}/100</span>
            </div>
            <Progress value={analysisResult.score} className="h-2" />
          </div>

          {/* What Worked */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              What Worked
            </h4>
            <ul className="space-y-1">
              {analysisResult.what_worked.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What to Improve */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              What to Improve
            </h4>
            <ul className="space-y-1">
              {analysisResult.what_to_improve.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Suggestions */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-medium flex items-center gap-2 mb-2 text-primary">
              <Lightbulb className="h-4 w-4" />
              AI Suggestions for Next Time
            </h4>
            <ul className="space-y-2">
              {analysisResult.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] mt-0.5">{i + 1}</Badge>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Psychology Insights */}
          <div className="p-4 rounded-lg bg-secondary/30">
            <h4 className="font-medium mb-2">🧠 Psychology Insights</h4>
            <p className="text-sm text-muted-foreground">{analysisResult.psychology_insights}</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setAnalysisResult(null)}
          >
            Analyze Another Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Report Tweet Performance
        </CardTitle>
        <CardDescription>
          Enter your tweet metrics and get AI-powered analysis with improvement suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post Preview */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <Badge variant="outline" className="text-xs mb-2">{post.post_category}</Badge>
          <p className="text-sm line-clamp-3">{post.draft_content}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="gap-1 text-xs">
              <Keyboard className="h-3 w-3" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1 text-xs">
              <Link className="h-3 w-3" />
              Tweet URL
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="gap-1 text-xs">
              <Upload className="h-3 w-3" />
              Screenshot
            </TabsTrigger>
          </TabsList>

          {/* Manual Input */}
          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Impressions
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.impressions}
                  onChange={(e) => handleMetricChange("impressions", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> Likes
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.likes}
                  onChange={(e) => handleMetricChange("likes", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Retweets
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.retweets}
                  onChange={(e) => handleMetricChange("retweets", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Replies
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.replies}
                  onChange={(e) => handleMetricChange("replies", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Bookmark className="h-3 w-3" /> Bookmarks
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.bookmarks}
                  onChange={(e) => handleMetricChange("bookmarks", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Users className="h-3 w-3" /> Profile Visits
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.profile_visits}
                  onChange={(e) => handleMetricChange("profile_visits", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <MousePointer className="h-3 w-3" /> Link Clicks
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.link_clicks}
                  onChange={(e) => handleMetricChange("link_clicks", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Follows Gained
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={metrics.follows_gained}
                  onChange={(e) => handleMetricChange("follows_gained", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" /> Posted Time (optional)
              </Label>
              <Input 
                type="datetime-local"
                value={metrics.posted_time}
                onChange={(e) => handleMetricChange("posted_time", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Tweet URL */}
          <TabsContent value="url" className="space-y-4">
            <div>
              <Label className="text-xs">Tweet URL</Label>
              <Input 
                placeholder="https://x.com/username/status/..."
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Note: Paste your tweet URL for reference. You'll still need to enter metrics manually 
                (Twitter API access required for automatic fetching).
              </p>
            </div>
          </TabsContent>

          {/* Screenshot Upload */}
          <TabsContent value="screenshot" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {screenshotPreview ? (
                <div className="space-y-3">
                  <img 
                    src={screenshotPreview} 
                    alt="Screenshot preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload tweet analytics screenshot
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleScreenshotChange}
                  />
                </label>
              )}
            </div>
            {screenshotPreview && (
              <Button 
                onClick={extractFromScreenshot}
                disabled={isUploading}
                className="w-full"
                variant="outline"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Extracting Metrics...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract Metrics with AI
                  </>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <Button 
          onClick={analyzePerformance}
          disabled={isAnalyzing || !hasEnoughMetrics}
          className="w-full"
          variant="viral"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing Performance...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze & Get AI Suggestions
            </>
          )}
        </Button>

        {!hasEnoughMetrics && (
          <p className="text-xs text-muted-foreground text-center">
            Enter at least impressions, likes, or retweets to analyze
          </p>
        )}
      </CardContent>
    </Card>
  );
}
