import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Sparkles,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Flame,
  MessageSquare,
  Bookmark,
  TrendingUp,
  DollarSign,
  Heart,
  Lock,
} from "lucide-react";

interface ContentPost {
  id: string;
  day_number: number;
  post_number: number;
  post_category: string;
  content_goal: string;
  content_type: string;
  psychological_trigger: string | null;
  post_brief: string;
  draft_content: string | null;
  draft_why_it_works: string | null;
  draft_action_driven: string | null;
  status: string;
}

interface ContentBank {
  id: string;
  name: string;
  calendar_length: number;
  primary_niche: string;
  main_goal: string;
  audience_level: string | null;
  unhinged_mode: boolean | null;
  status: string;
}

interface ContentBankViewProps {
  calendarId: string;
  onNewBank: () => void;
}

const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
  clickbait: { icon: Flame, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "🧲 Clickbait" },
  engagement: { icon: MessageSquare, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "💬 Engagement" },
  authority: { icon: TrendingUp, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "🧠 Authority" },
  thread: { icon: Bookmark, color: "bg-green-500/20 text-green-400 border-green-500/30", label: "🧵 Thread" },
  sales: { icon: DollarSign, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "💰 Sales" },
  relatable: { icon: Heart, color: "bg-pink-500/20 text-pink-400 border-pink-500/30", label: "🧍 Relatable" },
};

export function ContentBankView({ calendarId, onNewBank }: ContentBankViewProps) {
  const { profile } = useAuth();
  const [bank, setBank] = useState<ContentBank | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingDay, setGeneratingDay] = useState(false);
  const [regeneratingPost, setRegeneratingPost] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";

  useEffect(() => {
    fetchBank();
  }, [calendarId]);

  const fetchBank = async () => {
    setIsLoading(true);
    try {
      const [bankRes, postsRes] = await Promise.all([
        supabase
          .from("content_calendars")
          .select("*")
          .eq("id", calendarId)
          .single(),
        supabase
          .from("content_calendar_days")
          .select("*")
          .eq("calendar_id", calendarId)
          .order("day_number")
          .order("post_number"),
      ]);

      if (bankRes.data) {
        setBank(bankRes.data as unknown as ContentBank);
      }
      if (postsRes.data) {
        setPosts(postsRes.data as unknown as ContentPost[]);
      }
    } catch (error) {
      console.error("Error fetching bank:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextDay = async () => {
    if (!bank) return;

    const currentMaxDay = Math.max(...posts.map(p => p.day_number), 0);

    if (!isPaidUser && currentMaxDay >= 1) {
      toast({
        variant: "destructive",
        title: "Upgrade to Pro",
        description: "Free users can generate 1 day. Upgrade for 30-day content banks!",
      });
      return;
    }

    setGeneratingDay(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_next_day",
          calendarId: bank.id,
          primaryNiche: bank.primary_niche,
          audienceLevel: bank.audience_level,
          mainGoal: bank.main_goal,
          unhingedMode: bank.unhinged_mode,
          currentMaxDay,
        },
      });

      if (error) throw error;

      toast({
        title: `🔥 Day ${data.dayNumber} Generated!`,
        description: `${data.posts} fresh posts ready to go.`,
      });

      fetchBank();
      setExpandedDay(data.dayNumber);
    } catch (error) {
      console.error("Generate next day error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate next day",
      });
    } finally {
      setGeneratingDay(false);
    }
  };

  const regeneratePost = async (post: ContentPost) => {
    if (!bank) return;

    setRegeneratingPost(post.id);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "regenerate_post",
          postId: post.id,
          originalPost: post.draft_content,
          niche: bank.primary_niche,
          category: post.post_category,
          unhingedMode: bank.unhinged_mode,
        },
      });

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { 
              ...p, 
              draft_content: data.post.post_text,
              psychological_trigger: data.post.psychological_trigger,
              draft_why_it_works: data.post.why_it_works,
            } 
          : p
      ));

      toast({ title: "Post regenerated!" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to regenerate",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setRegeneratingPost(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!bank) {
    return (
      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Content bank not found</p>
          <Button variant="outline" className="mt-4" onClick={onNewBank}>
            Create New Content Bank
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group posts by day
  const postsByDay = posts.reduce((acc, post) => {
    if (!acc[post.day_number]) acc[post.day_number] = [];
    acc[post.day_number].push(post);
    return acc;
  }, {} as Record<number, ContentPost[]>);

  const days = Object.keys(postsByDay).map(Number).sort((a, b) => a - b);
  const currentMaxDay = Math.max(...days, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-orange-500/10 to-transparent border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{bank.name}</h2>
                {bank.unhinged_mode && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Flame className="h-3 w-3 mr-1" />
                    Unhinged
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{bank.primary_niche}</Badge>
                <span>•</span>
                <span>{days.length} days</span>
                <span>•</span>
                <span>{posts.length} posts</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(isPaidUser || currentMaxDay < 1) && currentMaxDay < 30 && (
                <Button 
                  variant="viral" 
                  size="sm"
                  onClick={generateNextDay}
                  disabled={generatingDay}
                >
                  {generatingDay ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate Day {currentMaxDay + 1}
                </Button>
              )}
              {!isPaidUser && currentMaxDay >= 1 && (
                <Button variant="outline" size="sm" className="gap-1" disabled>
                  <Lock className="h-3 w-3" />
                  Upgrade for More Days
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onNewBank}>
                New Bank
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tagline */}
      <p className="text-center text-sm text-muted-foreground italic">
        "We don't give you a content calendar. We give you a daily content bank so you never run out of posts."
      </p>

      {/* Days */}
      <div className="space-y-4">
        {days.map((dayNum) => {
          const dayPosts = postsByDay[dayNum] || [];
          const isExpanded = expandedDay === dayNum;

          return (
            <Card key={dayNum} className="bg-card/50 overflow-hidden">
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    D{dayNum}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Day {dayNum} — Content Bank</h3>
                    <p className="text-xs text-muted-foreground">
                      {dayPosts.length} posts • 
                      {dayPosts.filter(p => p.post_category === "clickbait").length} clickbait, 
                      {dayPosts.filter(p => p.post_category === "engagement").length} engagement
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Posts */}
              {isExpanded && (
                <div className="border-t border-border divide-y divide-border">
                  {dayPosts.map((post) => {
                    const config = categoryConfig[post.post_category] || categoryConfig.clickbait;
                    const isRegenerating = regeneratingPost === post.id;

                    return (
                      <div key={post.id} className="p-4 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-start gap-3">
                          {/* Post Number */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {post.post_number}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Category & Trigger */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={`${config.color} border text-xs`}>
                                {config.label}
                              </Badge>
                              {post.psychological_trigger && (
                                <span className="text-xs text-muted-foreground">
                                  {post.psychological_trigger}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {post.content_goal}
                              </Badge>
                            </div>

                            {/* Post Text */}
                            <p className="text-sm whitespace-pre-wrap mb-2">
                              {post.draft_content}
                            </p>

                            {/* Why it works */}
                            {post.draft_why_it_works && (
                              <p className="text-xs text-muted-foreground italic mb-3">
                                💡 {post.draft_why_it_works}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(post.draft_content || "")}
                                className="h-7 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regeneratePost(post)}
                                disabled={isRegenerating}
                                className="h-7 text-xs"
                              >
                                {isRegenerating ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                )}
                                Regenerate
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No content yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your first day's content bank to get started.
            </p>
            <Button variant="viral" onClick={generateNextDay} disabled={generatingDay}>
              {generatingDay ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Day 1
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
