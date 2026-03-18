import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  BookMarked, Copy, Check, Trash2, Loader2
} from "lucide-react";

interface BankPost {
  id: string;
  source: string;
  pillar_name: string | null;
  format: string;
  title: string | null;
  content: string;
  thread_tweets: any[] | null;
  viral_score: number | null;
  original_date: string | null;
  posted_at: string | null;
  created_at: string;
}

export function ContentBank() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BankPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await (supabase.from("content_bank" as any) as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPosts(data as BankPost[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = (post: BankPost) => {
    const text = post.thread_tweets?.length
      ? post.thread_tweets.map((t: any) => typeof t === "string" ? t : t?.content || String(t)).join("\n\n---\n\n")
      : post.content;
    navigator.clipboard.writeText(text);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const markPosted = async (id: string) => {
    await (supabase.from("content_bank" as any) as any)
      .update({ posted_at: new Date().toISOString() })
      .eq("id", id);
    await load();
    toast({ title: "Marked as posted! ✅" });
  };

  const deleteFromBank = async (id: string) => {
    await (supabase.from("content_bank" as any) as any).delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Removed from bank" });
  };

  const filtered = posts.filter(p =>
    filter === "all" ? true :
    filter === "posted" ? !!p.posted_at :
    filter === "unposted" ? !p.posted_at :
    p.source === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Content Bank
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts.length} saved posts · {posts.filter(p => !p.posted_at).length} unposted
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {["all", "unposted", "posted", "daily_feed", "content_os"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            {f.replace("_", " ")}
            {f === "all" && ` (${posts.length})`}
            {f === "unposted" && ` (${posts.filter(p => !p.posted_at).length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookMarked className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No saved posts yet. Approve posts in Daily Feed or Content OS to save them here permanently.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className={`border rounded-xl p-4 bg-card ${
              post.posted_at ? "opacity-60" : ""
            }`}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {post.format}
                </Badge>
                {post.pillar_name && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {post.pillar_name}
                  </Badge>
                )}
                {post.viral_score && (
                  <Badge variant="outline" className="text-[10px] text-yellow-500 bg-yellow-500/10 border-yellow-500/20">
                    ⚡ {post.viral_score}
                  </Badge>
                )}
                {post.posted_at && (
                  <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                    ✅ Posted
                  </Badge>
                )}
                {post.original_date && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(post.original_date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric"
                    })}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground mb-3">
                {post.content.slice(0, 200)}{post.content.length > 200 ? "..." : ""}
              </p>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost"
                  onClick={() => handleCopy(post)}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground">
                  {copiedId === post.id
                    ? <Check className="h-3 w-3 text-green-400" />
                    : <Copy className="h-3 w-3" />}
                  Copy
                </Button>
                {!post.posted_at && (
                  <Button size="sm" variant="ghost"
                    onClick={() => markPosted(post.id)}
                    className="h-7 text-xs px-2 text-green-400 hover:text-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Mark Posted
                  </Button>
                )}
                <Button size="sm" variant="ghost"
                  onClick={() => deleteFromBank(post.id)}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-red-400 ml-auto">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
