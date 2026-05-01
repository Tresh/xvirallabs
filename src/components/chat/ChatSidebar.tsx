import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Settings, LogOut, Trash2, MessageSquare,
  Filter, Pin, Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import type { Conversation } from "@/hooks/useChat";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  analyze: "Analyze",
  generate_post: "Generate",
  sales: "Sales",
  video: "Video",
  thread: "Thread",
  rewrite: "Rewrite",
  daily_feed: "Daily Feed",
  content_os: "Content OS",
  content_lab: "Content Lab",
  chat: "Chat",
};

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete, onOpenSettings }: Props) {
  const { signOut, profile } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState<string | null>(null);

  const tools = useMemo(() => {
    const set = new Set<string>();
    conversations.forEach(c => { if (c.tool) set.add(c.tool); });
    return [...set];
  }, [conversations]);

  const filtered = useMemo(() => {
    return conversations
      .filter(c => !toolFilter || c.tool === toolFilter)
      .filter(c => !search.trim() || c.title.toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search, toolFilter]);

  const grouped = useMemo(() => {
    if (!toolFilter) return null;
    const map: Record<string, Conversation[]> = {};
    filtered.forEach(c => {
      const k = c.tool || "chat";
      (map[k] ||= []).push(c);
    });
    return map;
  }, [filtered, toolFilter]);

  return (
    <aside className="h-screen w-72 shrink-0 border-r border-border bg-background flex flex-col">
      {/* Top: logo + new chat */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo size="sm" showText /></Link>
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} title="Admin">
              <Shield className="h-4 w-4 text-primary" />
            </Button>
          )}
        </div>
        <Button variant="viral" size="sm" className="w-full gap-2" onClick={onNew}>
          <Plus className="h-4 w-4" /> New chat
        </Button>
      </div>

      {/* Search + filter */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="h-8 pl-8 text-xs"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <Filter className="h-3 w-3" />
                {toolFilter ? `Tool: ${TOOL_LABELS[toolFilter] || toolFilter}` : "All chats"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Group / filter</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={!toolFilter} onCheckedChange={() => setToolFilter(null)}>
              All chats
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {tools.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No tools used yet</div>}
            {tools.map(t => (
              <DropdownMenuCheckboxItem
                key={t}
                checked={toolFilter === t}
                onCheckedChange={() => setToolFilter(toolFilter === t ? null : t)}
              >
                {TOOL_LABELS[t] || t}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 px-3">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No chats yet. Start one.</p>
          </div>
        )}

        {grouped ? (
          Object.entries(grouped).map(([tool, items]) => (
            <div key={tool} className="mb-3">
              <div className="px-2 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                {TOOL_LABELS[tool] || tool}
              </div>
              {items.map(c => (
                <ConvRow key={c.id} conv={c} active={c.id === activeId} onSelect={onSelect} onDelete={onDelete} />
              ))}
            </div>
          ))
        ) : (
          filtered.map(c => (
            <ConvRow key={c.id} conv={c} active={c.id === activeId} onSelect={onSelect} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* Bottom: settings + signout */}
      <div className="border-t border-border p-2 space-y-1">
        {profile?.email && (
          <div className="px-2 py-1 text-[10px] text-muted-foreground truncate font-mono">
            {profile.email}
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button
          variant="ghost" size="sm"
          className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}

function ConvRow({
  conv, active, onSelect, onDelete,
}: { conv: Conversation; active: boolean; onSelect: (id: string) => void; onDelete: (id: string) => void; }) {
  return (
    <div
      onClick={() => onSelect(conv.id)}
      className={cn(
        "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-xs transition-colors",
        active ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{conv.title}</div>
        {conv.tool && (
          <Badge variant="outline" className="mt-0.5 h-4 text-[9px] px-1 pointer-events-none">
            {TOOL_LABELS[conv.tool] || conv.tool}
          </Badge>
        )}
      </div>
      {conv.is_pinned && <Pin className="h-3 w-3 text-primary" />}
      <button
        onClick={(e) => { e.stopPropagation(); if (confirm("Delete this chat?")) onDelete(conv.id); }}
        className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 transition-opacity"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}