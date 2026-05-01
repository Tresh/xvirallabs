import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  title: string;
  tool: string | null;
  tags: string[];
  is_pinned: boolean;
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool: string | null;
  metadata: any;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConvs(true);
    const { data } = await (supabase.from("conversations" as any) as any)
      .select("*").eq("user_id", user.id).order("last_message_at", { ascending: false });
    setConversations((data as Conversation[]) || []);
    setLoadingConvs(false);
  }, [user]);

  const loadMessages = useCallback(async (id: string) => {
    const { data } = await (supabase.from("messages" as any) as any)
      .select("*").eq("conversation_id", id).order("created_at");
    setMessages((data as ChatMessage[]) || []);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setStreamBuffer("");
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await (supabase.from("conversations" as any) as any).delete().eq("id", id);
    if (activeId === id) newChat();
    await loadConversations();
  }, [activeId, newChat, loadConversations]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await (supabase.from("conversations" as any) as any).update({ title }).eq("id", id);
    await loadConversations();
  }, [loadConversations]);

  const sendMessage = useCallback(async (content: string, opts: { tool?: string | null; note?: string } = {}) => {
    if (!user || !content.trim() || streaming) return;
    setStreaming(true);
    setStreamBuffer("");

    let convId = activeId;

    // Create conversation if needed
    if (!convId) {
      const title = content.slice(0, 60).replace(/\n/g, " ").trim() || "New chat";
      const tags: string[] = [];
      if (opts.tool) tags.push(opts.tool);
      const { data: conv, error } = await (supabase.from("conversations" as any) as any)
        .insert({ user_id: user.id, title, tool: opts.tool ?? null, tags })
        .select().single();
      if (error || !conv) { setStreaming(false); return; }
      convId = conv.id;
      setActiveId(convId);
    }

    // Insert user message
    const userMsg = {
      conversation_id: convId, user_id: user.id, role: "user",
      content, tool: opts.tool ?? null,
      metadata: opts.note ? { note: opts.note } : null,
    };
    const { data: insertedUser } = await (supabase.from("messages" as any) as any)
      .insert(userMsg).select().single();
    if (insertedUser) setMessages(m => [...m, insertedUser as ChatMessage]);

    // Build full message history for API
    const history = [...messages, insertedUser as ChatMessage].map(m => ({ role: m.role, content: m.content }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virallab-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, tool: opts.tool, note: opts.note, conversationId: convId }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.message || err.error || "Something went wrong.";
        const assistantErr = {
          conversation_id: convId, user_id: user.id, role: "assistant",
          content: `⚠️ ${errMsg}`, tool: opts.tool ?? null, metadata: { error: true },
        };
        await (supabase.from("messages" as any) as any).insert(assistantErr);
        await loadMessages(convId);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              full += delta;
              setStreamBuffer(full);
            }
          } catch { /* partial */ }
        }
      }

      // Persist assistant message
      const assistantMsg = {
        conversation_id: convId, user_id: user.id, role: "assistant",
        content: full, tool: opts.tool ?? null, metadata: null,
      };
      const { data: insertedAssistant } = await (supabase.from("messages" as any) as any)
        .insert(assistantMsg).select().single();
      if (insertedAssistant) setMessages(m => [...m, insertedAssistant as ChatMessage]);
      setStreamBuffer("");

      await (supabase.from("conversations" as any) as any)
        .update({ last_message_at: new Date().toISOString() }).eq("id", convId);
      await loadConversations();
    } catch (e: any) {
      console.error("chat error", e);
      setStreamBuffer("");
    } finally {
      setStreaming(false);
    }
  }, [user, activeId, streaming, messages, loadConversations, loadMessages]);

  return {
    conversations, activeId, messages, streaming, streamBuffer, loadingConvs,
    setActiveId, newChat, sendMessage, deleteConversation, renameConversation,
    refresh: loadConversations,
  };
}