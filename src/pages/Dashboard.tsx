import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatView } from "@/components/chat/ChatView";
import { SettingsView } from "@/components/chat/SettingsView";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    conversations, activeId, messages, streaming, streamBuffer,
    setActiveId, newChat, sendMessage, deleteConversation,
  } = useChat();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      {/* Sidebar — fixed on mobile, static on desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transition-transform md:static md:translate-x-0",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setShowSettings(false); setMobileSidebarOpen(false); }}
          onNew={() => { newChat(); setShowSettings(false); setMobileSidebarOpen(false); }}
          onDelete={deleteConversation}
          onOpenSettings={() => { setShowSettings(true); setMobileSidebarOpen(false); }}
        />
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost" size="icon"
        className="fixed top-2 left-2 z-50 md:hidden h-8 w-8"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div className="flex-1 flex flex-col min-w-0">
        {showSettings ? (
          <SettingsView onClose={() => setShowSettings(false)} />
        ) : (
          <ChatView
            messages={messages}
            streaming={streaming}
            streamBuffer={streamBuffer}
            onSend={sendMessage}
            isEmpty={!activeId && messages.length === 0}
          />
        )}
      </div>
    </div>
  );
}
