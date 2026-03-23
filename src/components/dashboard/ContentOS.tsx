import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentOS, FORMAT_CONFIG, type ContentOSItem, type ContentOSFormat } from "@/hooks/useContentOS";
import { useContentPillars } from "@/hooks/useContentPillars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Check, ChevronDown, ChevronUp, Copy, Loader2, RefreshCw, Sparkles, X } from "lucide-react";

function ContentCard({
  item,
  onApprove,
  onSkip,
  onCopy,
}: {
  item: ContentOSItem;
  onApprove: (id: string, item: ContentOSItem) => void;
  onSkip: (id: string) => void;
  onCopy: (content: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = FORMAT_CONFIG[item.format];
  const isThread = item.format === "thread" && Array.isArray(item.thread_tweets) && item.thread_tweets.length > 0;
  const threadTweets: string[] = isThread
    ? (item.thread_tweets ?? []).map((t: any) => (typeof t === "string" ? t : t?.content || t?.text || t?.tweet || String(t)))
    : [];

  return (
    <Card className={item.status === "approved" ? "border-primary/40" : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{config.emoji} {config.label}</Badge>
          {item.pillar_name && <Badge variant="outline">{item.pillar_name}</Badge>}
          {item.psychology_trigger && <Badge variant="outline">{item.psychology_trigger}</Badge>}
          {item.viral_score ? <Badge variant="outline">⚡ {item.viral_score}</Badge> : null}
          {item.word_count ? <span className="ml-auto text-xs text-muted-foreground">{item.word_count} words</span> : null}
        </div>

        {item.title ? <h3 className="font-semibold text-sm">{item.title}</h3> : null}

        {isThread ? (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{threadTweets[0]}</p>
            {threadTweets.length > 1 && (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
                  {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {expanded ? "Hide thread" : `Show all ${threadTweets.length} tweets`}
                </Button>
                {expanded && (
                  <div className="space-y-2">
                    {threadTweets.slice(1).map((tweet, index) => (
                      <div key={`${item.id}-${index}`} className="rounded-md border border-border bg-secondary/40 p-2.5 text-sm">
                        {tweet}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
        )}

        {item.format === "video_script" && item.video_prompt ? (
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <p className="text-xs font-medium mb-1">AI video prompt</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.video_prompt}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {item.status === "pending" ? (
            <>
              <Button size="sm" variant="viral" onClick={() => onApprove(item.id, item)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onSkip(item.id)}>
                <X className="h-3.5 w-3.5" /> Skip
              </Button>
            </>
          ) : (
            <Badge variant="secondary">
              {item.status === "approved" ? "🔒 Saved to Bank" : item.status}
            </Badge>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(isThread ? threadTweets.join("\n\n") : item.content, config.label)}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>

          {(item.status === "approved" || item.status === "posted") && item.format !== "article" && item.format !== "newsletter" ? (
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent((isThread ? threadTweets[0] : item.content).slice(0, 280))}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto"
            >
              <Button size="sm" variant="outline">
                Post to X <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentOS() {
  const { profile, brandVoice } = useAuth();
  const { pillars } = useContentPillars();
  const { items, isLoading, isGenerating, stats, generate, updateStatus, approveAndSave } = useContentOS();
  const [activeFormat, setActiveFormat] = useState<"all" | ContentOSFormat>("all");
  const [activePillar, setActivePillar] = useState<string>("all");

  const handleGenerate = async () => {
    if (!pillars.length) {
      toast({ title: "Set up your content pillars first", description: "Add pillars in Settings → Memory.", variant: "destructive" });
      return;
    }

    const result = await generate({ profile, brandVoice, pillars });
    if (result.error) {
      toast({ title: "Generation failed", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Content mix generated", description: `${result.count} items ready for today.` });
  };

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const formatMatch = activeFormat === "all" || item.format === activeFormat;
      const pillarMatch = activePillar === "all" || item.pillar_name === activePillar;
      return formatMatch && pillarMatch && item.status !== "skipped";
    });
  }, [activeFormat, activePillar, items]);

  const uniquePillars = useMemo(
    () => Array.from(new Set(items.map((item) => item.pillar_name).filter((name): name is string => Boolean(name)))),
    [items]
  );

  const handleCopy = async (content: string, label: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: `${label} copied` });
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Content OS</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a full daily mix across all pillars: short posts, medium posts, thread, article, video script, and newsletter.
          </p>
        </div>
        <Button variant="viral" size="lg" onClick={handleGenerate} disabled={isGenerating || !profile?.primary_niche}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate today’s content mix"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Daily Content Mix</h2>
          <p className="text-sm text-muted-foreground">
            {stats.approved} approved · {stats.pending} pending · {stats.total} total
          </p>
        </div>
        <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.keys(FORMAT_CONFIG) as ContentOSFormat[]).map((format) => (
          <button
            key={format}
            onClick={() => setActiveFormat((current) => (current === format ? "all" : format))}
            className={`rounded-lg border p-2.5 text-left transition-colors ${
              activeFormat === format ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <p className="text-sm font-semibold">{stats.byFormat[format] || 0}</p>
            <p className="text-[11px] text-muted-foreground">{FORMAT_CONFIG[format].label}</p>
          </button>
        ))}
      </div>

      {uniquePillars.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={activePillar === "all" ? "default" : "outline"} onClick={() => setActivePillar("all")}>All pillars</Button>
          {uniquePillars.map((pillar) => (
            <Button
              key={pillar}
              size="sm"
              variant={activePillar === pillar ? "default" : "outline"}
              onClick={() => setActivePillar((current) => (current === pillar ? "all" : pillar))}
            >
              {pillar}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={(id, itm) => approveAndSave(id, itm)}
              onSkip={(id) => void updateStatus(id, "skipped")}
              onCopy={handleCopy}
            />
          ))}
          {visibleItems.length === 0 && (
            <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground text-center">
              Nothing matches this filter yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
