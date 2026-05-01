import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send, Plus, Loader2, Sparkles, Microscope, ShoppingBag,
  Video, FileText, RefreshCw, Zap, Layers, Calendar, X, Menu,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChat";
import { useDailyUsage } from "@/hooks/useDailyUsage";

const PRIMARY_TOOLS = [
  { id: "analyze", label: "Analyze", icon: Microscope, hint: "Reverse-engineer a viral tweet" },
  { id: "generate_post", label: "Generate Post", icon: Sparkles, hint: "Write viral X posts" },
  { id: "sales", label: "Sales Post", icon: ShoppingBag, hint: "Sell-without-selling content" },
  { id: "video", label: "Video Script", icon: Video, hint: "Sora/Runway-ready video" },
] as const;

const SECONDARY_TOOLS = [
  { id: "thread", label: "Thread", icon: FileText, hint: "Convert to high-retention thread" },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw, hint: "Boost virality of a draft" },
  { id: "daily_feed", label: "Daily Feed", icon: Zap, hint: "Generate daily posts" },
  { id: "content_os", label: "Content OS", icon: Layers, hint: "Plan content mix from pillars" },
  { id: "content_lab", label: "Content Lab", icon: Calendar, hint: "Strategy planning" },
] as const;

const ALL_TOOLS = [...PRIMARY_TOOLS, ...SECONDARY_TOOLS];

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuffer: string;
  onSend: (content: string, opts: { tool?: string | null; note?: string }) => Promise<void>;
  isEmpty: boolean;
  onToggleSidebar?: () => void;
}

export function ChatView({ messages, streaming, streamBuffer, onSend, isEmpty, onToggleSidebar }: Props) {
  const [input, setInput] = useState("");
  const [tool, setTool] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [toolPickerOpen, setToolPickerOpen] = useState(false);
  const [notePickerTool, setNotePickerTool] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { remaining, isUnlimited } = useDailyUsage();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamBuffer]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const txt = input;
    const t = tool;
    const n = note;
    setInput("");
    await onSend(txt, { tool: t, note: n });
  };

  const pickTool = (id: string) => {
    setTool(id);
    setToolPickerOpen(false);
    setNotePickerTool(id);
    setShowNote(true);
  };

  const clearTool = () => { setTool(null); setNote(""); setShowNote(false); };

  const activeToolMeta = ALL_TOOLS.find(t => t.id === tool);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen bg-background">
      {/* Header — sidebar toggle on mobile, credits on right. No "name" overlap. */}
      <header className="h-14 border-b border-border flex items-center px-3 md:px-5 justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onToggleSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          {tool && activeToolMeta && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <activeToolMeta.icon className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">{activeToolMeta.label}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/60 border border-border">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[11px] font-mono text-muted-foreground">
            {isUnlimited ? "∞" : remaining}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPickTool={pickTool} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {streaming && streamBuffer && (
              <MessageBubble
                message={{
                  id: "streaming",
                  conversation_id: "",
                  role: "assistant",
                  content: streamBuffer,
                  tool: null,
                  metadata: null,
                  created_at: "",
                }}
                streaming
              />
            )}
            {streaming && !streamBuffer && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="bg-gradient-to-t from-background via-background to-background/0 pt-6 pb-3 px-3 md:px-5">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Floating tool suggestions (always visible) */}
          <div className="flex flex-wrap gap-1.5 px-1">
            {PRIMARY_TOOLS.map(t => (
              <button
                key={t.id}
                onClick={() => pickTool(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
                  tool === t.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Selected tool + note display */}
          {tool && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5">
              {activeToolMeta && <activeToolMeta.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-primary">{activeToolMeta?.label}</div>
                {note ? (
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">📝 {note}</div>
                ) : (
                  <button
                    onClick={() => setShowNote(true)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    + add a note / direction
                  </button>
                )}
              </div>
              <button onClick={clearTool} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {showNote && tool && (
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional: write what you want this tool to do (style, angle, count, audience...)"
              className="text-xs min-h-[60px] resize-none rounded-xl"
              autoFocus
              onBlur={() => { if (!note) setShowNote(false); }}
            />
          )}

          {/* Input row */}
          <div className="flex items-end gap-1 rounded-2xl border border-border bg-card shadow-sm p-1.5 focus-within:border-primary/50 focus-within:shadow-md transition-all">
            <Popover open={toolPickerOpen} onOpenChange={setToolPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-72 p-2 rounded-xl">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Tools
                </div>
                <div className="space-y-0.5">
                  {ALL_TOOLS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => pickTool(t.id)}
                      className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <t.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium">{t.label}</div>
                        <div className="text-[10px] text-muted-foreground">{t.hint}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={tool ? `Ask ${activeToolMeta?.label}...` : "Ask anything about virality..."}
              className="min-h-[40px] max-h-40 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2 text-sm flex-1 bg-transparent"
              disabled={streaming}
            />

            <Button
              variant="viral" size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              onClick={send}
              disabled={!input.trim() || streaming}
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-[10px] text-muted-foreground/70 text-center font-mono">
            Shift + Enter for newline · 1 message = 1 credit
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPickTool }: { onPickTool: (id: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-10 max-w-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider">XViralLabs</span>
        </div>
        <div className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
          What are we <span className="text-gradient-primary">engineering</span> today?
        </div>
        <div className="text-sm text-muted-foreground">
          Pick a tool, add your direction, or just start typing.
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full max-w-2xl">
        {PRIMARY_TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => onPickTool(t.id)}
            className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 text-left transition-all group"
          >
            <t.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium mb-0.5">{t.label}</div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{t.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 shadow-sm",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary"
      )}>
        {isUser ? "Y" : "✦"}
      </div>
      <div className={cn("flex-1 min-w-0 flex flex-col", isUser && "items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 max-w-[88%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        )}>
          {message.tool && !isUser && (
            <Badge variant="outline" className="mb-2 text-[9px] pointer-events-none capitalize">{message.tool}</Badge>
          )}
          {message.metadata?.note && isUser && (
            <div className="mb-2 text-[10px] opacity-80 border-l-2 border-primary-foreground/40 pl-2">
              📝 {message.metadata.note}
            </div>
          )}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="space-y-1 mb-2 list-disc list-inside text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-1 mb-2 list-decimal list-inside text-sm">{children}</ol>,
                code: ({ children }) => <code className="px-1 py-0.5 bg-background rounded text-[11px] font-mono">{children}</code>,
                pre: ({ children }) => <pre className="p-2.5 bg-background rounded text-[11px] font-mono overflow-x-auto mb-2">{children}</pre>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {streaming && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5" />}
        </div>
      </div>
    </div>
  );
}