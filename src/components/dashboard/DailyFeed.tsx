import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyPosts, type DailyPost } from "@/hooks/useDailyPosts";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, Check, X, Copy, Loader2, RefreshCw,
  Zap, ArrowRight, TrendingUp, ChevronDown, ChevronUp,
  Twitter, FileText, Linkedin, AlignLeft, CheckCheck, Lock
} from "lucide-react";

const FORMAT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  tweet:   { label: "Tweet",    icon: Twitter,    color: "text-sky-400 border-sky-400/30 bg-sky-400/10" },
  thread:  { label: "Thread",   icon: AlignLeft,  color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
  article: { label: "Article",  icon: FileText,   color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  linkedin:{ label: "LinkedIn", icon: Linkedin,   color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
};

const TRIGGER_COLORS: Record<string, string> = {
  curiosity:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  authority:    "text-orange-400 bg-orange-400/10 border-orange-400/20",
  relatability: "text-green-400 bg-green-400/10 border-green-400/20",
  controversy:  "text-red-400 bg-red-400/10 border-red-400/20",
  fomo:         "text-pink-400 bg-pink-400/10 border-pink-400/20",
  identity:     "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  rage:         "text-red-500 bg-red-500/10 border-red-500/20",
};

function ViralScoreBadge({ score }: { score?: number }) {
  if (!score) return null;
  const color = score >= 85 ? "text-green-400 bg-green-400/10 border-green-400/20"
    : score >= 70 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    : "text-muted-foreground bg-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold transition-colors ${color}`}>
      ⚡ {score}
    </span>
  );
}

function PostCard({ post, onApprove, onSkip, onCopy }: {
  post: any;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onCopy: (content: string) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const fmt = FORMAT_CONFIG[post.format] || FORMAT_CONFIG.tweet;
  const FmtIcon = fmt.icon;
  const triggerColor = TRIGGER_COLORS[post.psychology_trigger] || "text-muted-foreground bg-muted border-border";
  const isApproved = post.status === "approved";
  const isSkipped  = post.status === "skipped";
  const isPosted   = post.status === "posted";

  return (
    <div className={`group rounded-xl border p-4 transition-all duration-200 ${
      isApproved ? "border-primary/40 bg-primary/[0.03]" :
      isSkipped  ? "opacity-40 border-border" :
      isPosted   ? "border-green-500/30 bg-green-500/[0.03]" :
      "border-border hover:border-border/80 bg-card"
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className={`text-[10px] font-medium gap-1 ${fmt.color}`}>
          <FmtIcon className="h-3 w-3" />
          {fmt.label}
        </Badge>
        {post.psychology_trigger && (
          <Badge variant="outline" className={`text-[10px] capitalize ${triggerColor}`}>
            {post.psychology_trigger}
          </Badge>
        )}
        <ViralScoreBadge score={post.viral_score} />
        {isApproved && (
          <Badge className="ml-auto text-[10px] bg-primary/20 text-primary border-primary/30">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )}
        {isPosted && (
          <Badge className="ml-auto text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCheck className="h-3 w-3 mr-1" /> Posted
          </Badge>
        )}
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground mb-3">
        {post.content}
      </p>

      {/* Why it works toggle */}
      {post.why_it_works && (
        <>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {showWhy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Why this works
          </button>
          {showWhy && (
            <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3 mb-3 leading-relaxed border border-border">
              {post.why_it_works}
            </p>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        {!isApproved && !isSkipped && !isPosted && (
          <>
            <Button size="sm" variant="viral" onClick={() => onApprove(post.id)} className="h-7 text-xs px-3">
              <Check className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onSkip(post.id)} className="h-7 text-xs px-3 text-muted-foreground">
              <X className="h-3 w-3 mr-1" /> Skip
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" onClick={() => onCopy(post.content)} className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground">
          <Copy className="h-3 w-3 mr-1" /> Copy
        </Button>
        {isApproved && (
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.slice(0, 280))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-sky-500/30 text-sky-400 hover:bg-sky-500/10">
              Post to 𝕏 <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

export function DailyFeed() {
  const { profile, brandVoice } = useAuth();
  const { posts, isLoading, isGenerating, generate, updateStatus, approveAll } = useDailyPosts();
  const { remaining, isUnlimited, hasReachedLimit, decrementLocal, refresh: refreshUsage } = useDailyUsage();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const handleGenerate = async () => {
    if (!profile?.primary_niche) {
      toast({
        title: "Set your niche first",
        description: "Go to Memory → set your Primary Niche before generating posts.",
        variant: "destructive",
      });
      return;
    }
    if (hasReachedLimit) {
      toast({
        title: "Daily credits used up",
        description: "You've used all 5 free credits today. Upgrade to Pro for unlimited.",
        variant: "destructive",
      });
      return;
    }
    const result = await generate(profile, brandVoice);
    if (result?.error) {
      if (result.error.includes("credit limit") || result.error.includes("LIMIT_REACHED")) {
        toast({ title: "No credits remaining", description: "Upgrade to Pro for unlimited generations.", variant: "destructive" });
      } else {
        toast({ title: "Generation failed", description: result.error, variant: "destructive" });
      }
    } else {
      decrementLocal();
      refreshUsage();
      toast({ title: `${result?.count || 15} posts ready! 🚀`, description: "Approve the ones you love." });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!" });
  };

  const pending  = posts.filter(p => p.status === "pending").length;
  const approved = posts.filter(p => p.status === "approved").length;
  const posted   = posts.filter(p => p.status === "posted").length;

  const filtered = posts.filter(p =>
    filter === "pending"  ? p.status === "pending" :
    filter === "approved" ? p.status === "approved" :
    p.status !== "skipped"
  );

  // ── EMPTY STATE ──────────────────────────────────────────────────
  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Generate Today's Content</h2>
        <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
          {profile?.primary_niche
            ? `Your AI co-pilot will research what's trending in ${profile.primary_niche} and write ${profile?.tier === "elite" ? "20" : "15"} posts in your exact voice.`
            : "Set your niche in Memory first, then come back to generate your daily posts."}
        </p>

        {/* Formats preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 w-full max-w-md">
          {Object.entries(FORMAT_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card">
                <Icon className={`h-4 w-4 ${cfg.color.split(" ")[0]}`} />
                <span className="text-xs text-muted-foreground">{cfg.label}s</span>
              </div>
            );
          })}
        </div>

        <Button
          variant="viral"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || !profile?.primary_niche || hasReachedLimit}
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Writing your posts...</>
          ) : hasReachedLimit ? (
            <><X className="h-4 w-4" /> No Credits Left</>
          ) : (
            <><Zap className="h-4 w-4" /> Generate Today's Posts</>
          )}
        </Button>
        {!isUnlimited && (
          <p className="text-xs text-muted-foreground mt-3">
            {hasReachedLimit ? "You've used all 5 free daily credits. Upgrade to Pro for unlimited." : `${remaining} credit${remaining !== 1 ? "s" : ""} remaining today`}
          </p>
        )}
        {!profile?.primary_niche && (
          <p className="text-xs text-muted-foreground mt-3">
            ↑ Set your niche in <strong>Memory</strong> tab first
          </p>
        )}
      </div>
    );
  }

  // ── MAIN FEED ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Today's Content
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            <span className="mx-2">·</span>
            <span className="text-primary font-medium">{approved} approved</span>
            <span className="mx-1">·</span>
            <span>{pending} to review</span>
            {posted > 0 && <><span className="mx-1">·</span><span className="text-green-400">{posted} posted</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <Button size="sm" variant="outline" onClick={approveAll} className="h-8 text-xs">
              <CheckCheck className="h-3 w-3 mr-1" /> Approve All
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating || hasReachedLimit} className="h-8 text-xs">
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            {isGenerating ? "Writing..." : hasReachedLimit ? "No Credits" : "Regenerate"}
          </Button>
          {!isUnlimited && !hasReachedLimit && (
            <span className="text-[10px] text-muted-foreground">{remaining} left</span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: posts.filter(p => p.status !== "skipped").length, color: "text-foreground" },
          { label: "Pending", value: pending, color: "text-yellow-400" },
          { label: "Approved", value: approved, color: "text-primary" },
          { label: "Posted", value: posted, color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="bg-secondary rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "pending", "approved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? `All (${posts.filter(p => p.status !== "skipped").length})` :
             f === "pending" ? `To Review (${pending})` : `Approved (${approved})`}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onApprove={id => updateStatus(id, "approved")}
              onSkip={id => updateStatus(id, "skipped")}
              onCopy={handleCopy}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              {filter === "approved" ? "No approved posts yet — review your pending posts above." : "All caught up!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
