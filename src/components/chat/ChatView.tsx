import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send, Plus, Loader2, Sparkles, Microscope, ShoppingBag,
  Video, FileText, RefreshCw, Zap, Layers, Calendar, X, Menu, Check, Copy, ArrowDown,
  Maximize2, Minimize2,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChat";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { toast } from "@/hooks/use-toast";

const PRIMARY_TOOLS = [
  { id: "analyze", label: "Analyze", icon: Microscope, hint: "Reverse-engineer a viral tweet", placeholder: "Paste a tweet or describe one to reverse-engineer..." },
  { id: "generate_post", label: "Generate Post", icon: Sparkles, hint: "Write viral X posts", placeholder: "Topic + any direction (style, count, angle)..." },
  { id: "sales", label: "Sales Post", icon: ShoppingBag, hint: "Sell-without-selling content", placeholder: "Product / offer + tone (soft, story, proof, direct)..." },
  { id: "video", label: "Video Script", icon: Video, hint: "Sora/Runway-ready video", placeholder: "Concept + style (vibe, length, characters)..." },
] as const;

const SECONDARY_TOOLS = [
  { id: "thread", label: "Thread", icon: FileText, hint: "Convert to high-retention thread", placeholder: "Paste your draft or topic for the thread..." },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw, hint: "Boost virality of a draft", placeholder: "Paste the draft you want rewritten..." },
  { id: "daily_feed", label: "Daily Feed", icon: Zap, hint: "Generate daily posts", placeholder: "How many posts? Pillars / direction?" },
  { id: "content_os", label: "Content OS", icon: Layers, hint: "Plan content mix from pillars", placeholder: "Your pillars + how many of each format..." },
  { id: "content_lab", label: "Content Lab", icon: Calendar, hint: "Strategy planning", placeholder: "What strategy do you want planned?" },
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
  const [toolPickerOpen, setToolPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const { remaining, isUnlimited } = useDailyUsage();

  useEffect(() => {
    if (atBottom) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streamBuffer]);

  const checkScrollPosition = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distance <= 24;
    setAtBottom(isAtBottom);
    setShowScrollBtn(distance > 80);
    // eslint-disable-next-line no-console
    console.log("[scrollDbg]", { sh: el.scrollHeight, st: el.scrollTop, ch: el.clientHeight, distance, show: distance > 80 });
  };

  const handleScroll = () => checkScrollPosition();

  useEffect(() => {
    // Re-check after content updates (new messages, streaming chunks, layout changes)
    const frame = requestAnimationFrame(checkScrollPosition);
    const t = setTimeout(checkScrollPosition, 120);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [messages, streamBuffer]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => checkScrollPosition());
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    // Also poll every 500ms as a safety net for cases where scroll events don't fire reliably
    const poll = setInterval(checkScrollPosition, 500);
    return () => { observer.disconnect(); clearInterval(poll); };
  }, []);

  // Track composer height so the floating scroll-to-bottom sits just above it
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty("--composer-h", `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [composerExpanded, input, tool]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const maxHeight = composerExpanded ? Math.max(260, window.innerHeight - 220) : 168;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input, composerExpanded]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
    setShowScrollBtn(false);
  };

  const send = async () => {
    if (!input.trim() || streaming) return;
    const txt = input;
    const t = tool;
    setInput("");
    await onSend(txt, { tool: t });
  };

  const pickTool = (id: string) => {
    setTool(prev => (prev === id ? null : id));
    setToolPickerOpen(false);
  };

  const clearTool = () => { setTool(null); };

  const activeToolMeta = ALL_TOOLS.find(t => t.id === tool);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden bg-background relative">
      {/* Header — sidebar toggle on mobile, credits on right. No "name" overlap. */}
      <header className="h-14 border-b border-border flex items-center px-3 md:px-5 justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
            <Button data-tour="sidebar-toggle" variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onToggleSidebar}>
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
        <div data-tour="credits" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/60 border border-border">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[11px] font-mono text-muted-foreground">
            {isUnlimited ? "∞" : remaining}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto pb-56">
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

      {/* Scroll-to-bottom button — fixed to viewport so it's always visible above composer */}
      {showScrollBtn && !isEmpty && !composerExpanded && (
        <button
          onClick={scrollToBottom}
          style={{ bottom: "calc(var(--composer-h, 160px) + 12px)" }}
          className="fixed left-1/2 md:left-[calc(50%+9rem)] -translate-x-1/2 z-[60] h-9 px-3.5 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center gap-1.5 text-[11px] font-medium hover:bg-primary/90 transition-all border border-primary-foreground/10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" /> Bottom
        </button>
      )}

      {/* Composer — fixed to viewport bottom */}
      <div
        ref={composerRef}
        className={cn(
        "fixed inset-x-0 md:left-72 z-20 border-t border-border bg-background/95 backdrop-blur-xl px-3 md:px-5 transition-all",
        composerExpanded ? "inset-y-0 pt-4 pb-4 flex flex-col" : "bottom-0 pt-3 pb-3"
      )}>
        <div className={cn("max-w-3xl mx-auto space-y-2 w-full", composerExpanded && "flex-1 flex flex-col min-h-0")}>
          {/* Floating tool suggestions — fixed primary list, joined by active secondary */}
          <div data-tour="tools" className="flex flex-wrap gap-1.5 px-1">
            {PRIMARY_TOOLS.map(t => (
              <ToolPill key={t.id} active={tool === t.id} onClick={() => pickTool(t.id)} icon={t.icon} label={t.label} />
            ))}
            {/* If active tool is a secondary one, show it joined to the row */}
            {tool && !PRIMARY_TOOLS.some(p => p.id === tool) && activeToolMeta && (
              <ToolPill
                active
                onClick={clearTool}
                icon={activeToolMeta.icon}
                label={activeToolMeta.label}
              />
            )}
            {tool && (
              <button
                onClick={clearTool}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Input row */}
          <div className={cn(
            "relative flex flex-col rounded-2xl border border-border bg-card shadow-lg focus-within:border-primary/50 focus-within:shadow-xl transition-all",
            composerExpanded && "flex-1 min-h-0"
          )}>
            {/* Top bar — expand toggle, no overlap with send */}
            <div className="flex items-center justify-end px-2 pt-1.5">
              <button
                type="button"
                onClick={() => setComposerExpanded(prev => !prev)}
                aria-label={composerExpanded ? "Collapse composer" : "Enlarge composer"}
                className="h-7 w-7 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {composerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            <div className={cn("flex items-end gap-1 px-1.5 pb-1.5", composerExpanded && "flex-1 min-h-0 items-stretch")}>
            <Popover open={toolPickerOpen} onOpenChange={setToolPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  data-tour="plus-menu"
                  type="button"
                  className="h-9 w-9 shrink-0 rounded-xl inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Pick a tool"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-72 p-2 rounded-xl">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Pick a tool
                </div>
                <div className="space-y-0.5">
                  {ALL_TOOLS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => pickTool(t.id)}
                      className={cn(
                        "w-full flex items-start gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors",
                        tool === t.id && "bg-primary/10"
                      )}
                    >
                      <t.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium flex items-center gap-1">
                          {t.label}
                          {tool === t.id && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{t.hint}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={tool && activeToolMeta ? activeToolMeta.placeholder : "What do you want to generate? (pick a tool or just type)"}
              className={cn(
                "min-h-[40px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2 text-sm flex-1 bg-transparent leading-relaxed",
                composerExpanded && "h-full max-h-none"
              )}
              disabled={streaming}
            />

            <Button
              data-tour="send" variant="viral" size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              onClick={send}
              disabled={!input.trim() || streaming}
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/70 text-center font-mono">
            {tool ? `${activeToolMeta?.label} mode · tap pill again to clear` : "Tip: pick a tool above or type your request"} · 1 message = 1 credit
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPickTool }: { onPickTool: (id: string) => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6 md:mb-10 max-w-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider">XViralLabs</span>
        </div>
        <div className="text-2xl md:text-4xl font-semibold mb-2.5 tracking-tight">
          What do you want to <span className="text-gradient-primary">generate</span>?
        </div>
        <div className="text-xs md:text-sm text-muted-foreground">
          Select a tool below, then describe what you want. Like an agent.
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-2xl">
        {PRIMARY_TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => onPickTool(t.id)}
            className="p-3 md:p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 text-left transition-all group"
          >
            <t.icon className="h-4 w-4 md:h-5 md:w-5 text-primary mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs md:text-sm font-medium mb-0.5">{t.label}</div>
            <div className="text-[10px] md:text-[11px] text-muted-foreground line-clamp-2 leading-snug">{t.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const isUser = message.role === "user";

  // For assistant messages, split into post sections by "### Post" headers so each gets its own copy button
  const sections = !isUser ? splitIntoPosts(message.content) : null;

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex flex-col items-end min-w-0 max-w-[92%]">
          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col min-w-0 w-full max-w-[92%] gap-2">
        {message.tool && (
          <Badge variant="outline" className="text-[9px] pointer-events-none capitalize w-fit">{message.tool}</Badge>
        )}

        {sections && sections.length > 1 ? (
          <>
            {sections.map((sec, i) => (
              <PostCard key={i} title={sec.title} content={sec.body} />
            ))}
          </>
        ) : (
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
            <MarkdownBody content={message.content} />
            {streaming && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5" />}
            {!streaming && message.content.length > 0 && (
              <div className="mt-3 pt-2 border-t border-border/60 flex justify-end">
                <CopyButton text={message.content} label="Copy" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1 first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 mb-2 list-disc list-inside text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-2 list-decimal list-inside text-sm">{children}</ol>,
          code: ({ children }) => <code className="px-1 py-0.5 bg-background rounded text-[11px] font-mono">{children}</code>,
          pre: ({ children }) => <pre className="p-2.5 bg-background rounded text-[11px] font-mono overflow-x-auto mb-2 whitespace-pre-wrap">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function PostCard({ title, content }: { title: string; content: string }) {
  // Extract the primary post text (inside ``` block if present), else use full content
  const codeMatch = content.match(/```([\s\S]*?)```/);
  const postText = codeMatch ? codeMatch[1].trim() : content.trim();
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/40">
        <span className="text-[11px] font-mono text-muted-foreground truncate">{title}</span>
        <CopyButton text={postText} label="Copy post" />
      </div>
      <div className="px-4 py-3">
        <MarkdownBody content={content} />
      </div>
    </div>
  );
}

function splitIntoPosts(content: string): { title: string; body: string }[] | null {
  // Match "### Post N — Title" or "### Post N" headers
  const regex = /^###\s+Post\s+\d+.*$/gim;
  const matches = [...content.matchAll(regex)];
  if (matches.length < 2) return null;
  const sections: { title: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? content.length : content.length;
    const block = content.slice(start, end);
    const firstLineEnd = block.indexOf("\n");
    const title = block.slice(0, firstLineEnd === -1 ? block.length : firstLineEnd).replace(/^###\s*/, "").trim();
    const body = firstLineEnd === -1 ? "" : block.slice(firstLineEnd + 1).trim();
    sections.push({ title, body });
  }
  return sections;
}

function ToolPill({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: any; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
      )}
    >
      {active ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: "Copied to clipboard" });
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}