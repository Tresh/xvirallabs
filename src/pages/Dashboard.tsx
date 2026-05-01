import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatView } from "@/components/chat/ChatView";
import { SettingsView } from "@/components/chat/SettingsView";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
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
    <div className="min-h-screen flex w-full bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setShowSettings(false); }}
        onNew={() => { newChat(); setShowSettings(false); }}
        onDelete={deleteConversation}
        onOpenSettings={() => setShowSettings(true)}
      />
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
  );
}
