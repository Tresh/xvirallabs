import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send, Plus, Loader2, Sparkles, Microscope, ShoppingBag,
  Video, FileText, RefreshCw, Zap, Layers, Calendar, X, MessageSquare,
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
}

export function ChatView({ messages, streaming, streamBuffer, onSend, isEmpty }: Props) {
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
    <div className="flex-1 flex flex-col min-w-0 h-screen">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center px-4 justify-between bg-background/90 backdrop-blur-md">
        <div className="text-sm font-medium font-mono">
          {tool ? (activeToolMeta?.label ?? "Chat") : "XViralLabs"}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {isUnlimited ? "∞ credits" : `${remaining} credits left`}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPickTool={pickTool} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> thinking...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Floating tool suggestions (always visible) */}
          <div className="flex flex-wrap gap-1.5">
            {PRIMARY_TOOLS.map(t => (
              <button
                key={t.id}
                onClick={() => pickTool(t.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                  tool === t.id
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-secondary/60 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Selected tool + note display */}
          {tool && (
            <div className="flex items-start gap-2 p-2 rounded-md border border-primary/30 bg-primary/5">
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
              className="text-xs min-h-[60px] resize-none"
              autoFocus
              onBlur={() => { if (!note) setShowNote(false); }}
            />
          )}

          {/* Input row */}
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:border-primary/50 transition-colors">
            <Popover open={toolPickerOpen} onOpenChange={setToolPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-72 p-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Tools
                </div>
                <div className="space-y-0.5">
                  {ALL_TOOLS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => pickTool(t.id)}
                      className="w-full flex items-start gap-2 p-2 rounded-md hover:bg-muted text-left transition-colors"
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
              className="min-h-[40px] max-h-32 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 text-sm flex-1"
              disabled={streaming}
            />

            <Button
              variant="viral" size="icon"
              className="h-8 w-8 shrink-0"
              onClick={send}
              disabled={!input.trim() || streaming}
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-[10px] text-muted-foreground text-center font-mono">
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
      <div className="text-center mb-8 max-w-lg">
        <div className="text-3xl font-bold mb-2">What are we engineering today?</div>
        <div className="text-sm text-muted-foreground">
          Pick a tool, add your direction, or just start typing.
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-2xl">
        {PRIMARY_TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => onPickTool(t.id)}
            className="p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all group"
          >
            <t.icon className="h-5 w-5 text-primary mb-2" />
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
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0",
        isUser ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
      )}>
        {isUser ? "you" : "X"}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "flex justify-end")}>
        <div className={cn(
          "rounded-lg px-3.5 py-2.5 max-w-[90%]",
          isUser ? "bg-primary/10 text-foreground" : "bg-muted/40"
        )}>
          {message.tool && !isUser && (
            <Badge variant="outline" className="mb-2 text-[9px] pointer-events-none">{message.tool}</Badge>
          )}
          {message.metadata?.note && isUser && (
            <div className="mb-2 text-[10px] text-muted-foreground border-l-2 border-primary/40 pl-2">
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