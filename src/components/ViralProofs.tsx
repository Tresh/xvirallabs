import { Heart, Repeat2, MessageCircle, Bookmark } from "lucide-react";

const viralPosts = [
  {
    content: "I spent 6 months studying why tweets go viral.\n\n→ Pattern interrupt in first 3 words\n→ Emotional polarity (not neutral)\n→ Identity-level resonance\n→ Low-friction engagement hooks\n\nBookmark this.",
    likes: "12.4K",
    retweets: "3.2K",
    replies: "847",
    bookmarks: "8.1K",
  },
  {
    content: "Hot take: Your content isn't boring.\n\nYour hooks are.\n\nThe difference between 50 views and 50K views is the first 7 words.",
    likes: "8.7K",
    retweets: "2.1K",
    replies: "423",
    bookmarks: "5.3K",
  },
  {
    content: "Stop writing tweets.\n\nStart writing scroll-stoppers.\n\n• Curiosity gaps > information\n• Questions > statements\n• Stories > lectures\n• Tension > resolution\n\nYour audience doesn't owe you attention. Earn it.",
    likes: "21.3K",
    retweets: "6.8K",
    replies: "1.2K",
    bookmarks: "14.7K",
  },
  {
    content: "The algorithm doesn't care about your feelings.\n\nIt cares about:\n— Dwell time\n— Saves\n— Replies with 3+ words\n— Profile clicks\n\nOptimize for these. Watch everything change.",
    likes: "15.9K",
    retweets: "4.4K",
    replies: "956",
    bookmarks: "11.2K",
  },
  {
    content: "I asked AI to rewrite my worst-performing tweet.\n\nOriginal: 12 likes.\nRewritten: 4,200 likes.\n\nSame idea. Better hook. That's the whole game.",
    likes: "6.2K",
    retweets: "1.8K",
    replies: "312",
    bookmarks: "3.9K",
  },
  {
    content: "Your thread won't go viral because:\n\n1. The first tweet doesn't create tension\n2. You're teaching, not storytelling\n3. No open loop between tweets\n4. The CTA is \"follow me\" instead of value\n\nFix these. Thank me later.",
    likes: "18.1K",
    retweets: "5.6K",
    replies: "1.4K",
    bookmarks: "12.8K",
  },
];

const cardStyles = [
  "rotate-[-2deg] translate-y-0 z-10",
  "rotate-[1.5deg] translate-y-4 z-20",
  "rotate-[-1deg] -translate-y-2 z-10",
  "rotate-[2.5deg] translate-y-6 z-30",
  "rotate-[-1.5deg] translate-y-1 z-20",
  "rotate-[1deg] -translate-y-3 z-10",
];

export function ViralProofs() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Scattered overlapping grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
            {viralPosts.map((post, i) => (
              <div
                key={i}
                className={`${cardStyles[i]} relative rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:z-40 hover:rotate-0 hover:scale-[1.03] transition-all duration-300 cursor-default mb-[-16px] md:mb-[-24px]`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <span className="text-[10px] font-mono text-primary tracking-wider uppercase">AI Generated</span>
                </div>

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageCircle className="h-3 w-3" />
                    {post.replies}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Repeat2 className="h-3 w-3" />
                    {post.retweets}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] ml-auto">
                    <Bookmark className="h-3 w-3" />
                    {post.bookmarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
