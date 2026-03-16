import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoBank, VideoPackage } from "@/hooks/useVideoBank";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Video, Sparkles, Copy, Check, Loader2, RefreshCw,
  ChevronDown, ChevronUp, Trash2, Film,
  Mic, Type, Zap, BookOpen, TrendingUp,
} from "lucide-react";

const STYLE_CONFIG: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  text_explainer: {
    label: "Text Explainer", icon: Type,
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    desc: "Bold text on screen, no face needed",
  },
  shock_reveal: {
    label: "Shock Reveal", icon: Zap,
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    desc: "Did you know? FOMO hook style",
  },
  step_by_step: {
    label: "Step-by-Step", icon: BookOpen,
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    desc: "Tutorial walkthrough format",
  },
  trending_overlay: {
    label: "Trending Overlay", icon: TrendingUp,
    color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    desc: "Audio trend + text overlay",
  },
  cinematic: {
    label: "Cinematic Story", icon: Film,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    desc: "Movie-like storytelling",
  },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };
  return (
    <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs px-2">
      <Copy className="h-3 w-3 mr-1" /> Copy
    </Button>
  );
}

function VideoCard({
  video, onStatusUpdate, onDelete,
}: {
  video: VideoPackage;
  onStatusUpdate: (id: string, status: VideoPackage["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const styleCfg = STYLE_CONFIG[video.video_style] || STYLE_CONFIG.text_explainer;
  const StyleIcon = styleCfg.icon;
  const isUsed = video.status === "used";
  const overlays = Array.isArray(video.text_overlays) ? video.text_overlays : [];

  return (
    <Card className={isUsed ? "opacity-60" : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] gap-1 ${styleCfg.color}`}>
              <StyleIcon className="h-3 w-3" /> {styleCfg.label}
            </Badge>
            {video.hook_type && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">{video.hook_type}</Badge>
            )}
            {video.viral_score && (
              <Badge variant="outline" className="text-[10px] text-yellow-500 bg-yellow-500/10">⚡ {video.viral_score}/100</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(video.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <h3 className="font-semibold text-sm">{video.title}</h3>

        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">🎣 Hook</p>
          <p className="text-sm">{video.hook}</p>
          <CopyButton text={video.hook} label="Hook" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="text-xs">
            {expanded ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
            {expanded ? "Hide" : "Full Package"}
          </Button>
          <CopyButton text={video.ai_video_prompt} label="AI Prompt" />
          {!isUsed && (
            <Button size="sm" variant="outline" onClick={() => onStatusUpdate(video.id, "used")} className="text-xs">
              <Check className="h-3 w-3 mr-1" /> Mark Used
            </Button>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <p className="text-xs font-medium mb-1">Full Script</p>
              <p className="text-sm whitespace-pre-wrap bg-secondary/40 rounded-md p-3">{video.script}</p>
              <CopyButton text={video.script} label="Script" />
            </div>

            {video.voiceover_text && (
              <div>
                <p className="text-xs font-medium mb-1"><Mic className="h-3 w-3 inline mr-1" />Voiceover Text</p>
                <p className="text-sm whitespace-pre-wrap bg-secondary/40 rounded-md p-3">{video.voiceover_text}</p>
                <CopyButton text={video.voiceover_text} label="Voiceover" />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">🪄 AI Video Generation Prompt</p>
                <CopyButton text={video.ai_video_prompt} label="AI Prompt" />
              </div>
              <p className="text-sm whitespace-pre-wrap bg-primary/5 border border-primary/20 rounded-md p-3">{video.ai_video_prompt}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Sora", "Runway ML", "CapCut AI", "Pika Labs", "Kling AI"].map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-[10px]">{tool}</Badge>
                ))}
              </div>
            </div>

            {overlays.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1"><Type className="h-3 w-3 inline mr-1" />Text Overlays</p>
                <div className="space-y-1">
                  {overlays.map((overlay, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-secondary/40 rounded p-2">
                      <span className="font-mono text-muted-foreground">{overlay.time}</span>
                      <span>{overlay.text}</span>
                      <Badge variant="outline" className="text-[9px] ml-auto">{overlay.style}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {video.caption && (
              <div>
                <p className="text-xs font-medium mb-1">X/Twitter Caption</p>
                <p className="text-sm whitespace-pre-wrap bg-secondary/40 rounded-md p-3">{video.caption}</p>
                <CopyButton text={video.caption} label="Caption" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VideoBank() {
  const { profile, brandVoice } = useAuth();
  const { videos, isLoading, isGenerating, generate, updateStatus, deleteVideo } = useVideoBank();
  const [count, setCount] = useState(5);
  const [filter, setFilter] = useState<"all" | "unused" | "used">("all");

  const handleGenerate = async () => {
    if (!profile?.primary_niche) {
      toast({ title: "Set your niche in Memory first", variant: "destructive" });
      return;
    }
    const result = await generate(profile, brandVoice, count);
    if (result?.error) {
      toast({ title: "Generation failed", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `${result?.count} video packages ready!`, description: "Copy the AI prompt → paste into your video tool." });
    }
  };

  const unused = videos.filter((v) => v.status === "unused").length;
  const filtered = videos.filter((v) =>
    filter === "unused" ? v.status === "unused" : filter === "used" ? v.status === "used" : true
  );

  if (!isLoading && videos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Video Content Bank</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate complete video packages for your niche. Each includes a scroll-stopping hook, full script, voiceover text, AI video prompt, text overlays, and X/Twitter caption.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Copy the AI prompt → paste into Sora, Runway ML, CapCut AI, Pika Labs, or Kling AI</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(STYLE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className={`rounded-lg border p-2.5 text-left ${cfg.color}`}>
                <div className="flex items-center gap-1 text-xs font-medium"><Icon className="h-3 w-3" />{cfg.label}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 justify-center">
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                count === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {n} videos
            </button>
          ))}
        </div>
        <Button variant="viral" size="lg" onClick={handleGenerate} disabled={isGenerating || !profile?.primary_niche}>
          {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating video packages...</> : <><Sparkles className="h-4 w-4" /> Generate Video Bank</>}
        </Button>
        {!profile?.primary_niche && (
          <p className="text-xs text-muted-foreground">Set your niche in Memory tab first</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Video Content Bank</h2>
          <p className="text-sm text-muted-foreground">
            {unused} unused · {videos.length} total · Copy AI prompt → paste into video generator
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                count === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {n} videos
            </button>
          ))}
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            {isGenerating ? "Generating..." : "Generate More"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {[
          { label: "Total", value: videos.length, color: "text-foreground" },
          { label: "Unused", value: unused, color: "text-primary" },
          { label: "Used", value: videos.filter((v) => v.status === "used").length, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "unused", "used"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f === "all" ? `All (${videos.length})` : f === "unused" ? `Unused (${unused})` : `Used (${videos.filter((v) => v.status === "used").length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} onStatusUpdate={updateStatus} onDelete={deleteVideo} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground text-center">No videos yet</p>
          )}
        </div>
      )}
    </div>
  );
}
