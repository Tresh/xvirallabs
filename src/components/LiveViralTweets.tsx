import { TrendingUp, Flame, Clock, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

export function LiveViralTweets() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-viral-hot/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viral-hot/10 border border-viral-hot/30 mb-6">
            <Flame className="h-4 w-4 text-viral-hot animate-pulse" />
            <span className="font-mono text-xs text-viral-hot">LIVE FEED</span>
            <Badge variant="outline" className="ml-2 text-[10px] px-2 py-0.5 bg-viral-warning/20 text-viral-warning border-viral-warning/30">
              Coming Soon
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Live Viral Tweets on{" "}
            <span className="text-gradient-primary">X</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time feed of trending tweets going viral right now. Learn from what's working today.
          </p>
        </div>

        {/* Coming Soon Preview Cards */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="relative bg-card/50 rounded-2xl border border-border p-6 backdrop-blur-sm overflow-hidden group"
              >
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-md z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-viral-hot/10 border border-viral-hot/30 inline-flex mb-3">
                      <Clock className="h-6 w-6 text-viral-hot" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Coming Soon</p>
                    <p className="text-xs text-muted-foreground mt-1">Real-time viral detection</p>
                  </div>
                </div>

                {/* Placeholder content (blurred behind) */}
                <div className="space-y-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-2 w-16 bg-muted/50 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-3/5 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-viral-hot/10">
                <TrendingUp className="h-5 w-5 text-viral-hot" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Trending Detection</p>
                <p className="text-xs text-muted-foreground">Catch tweets before they peak</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Instant Analysis</p>
                <p className="text-xs text-muted-foreground">One-click pattern extraction</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-viral-success/10">
                <Flame className="h-5 w-5 text-viral-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Niche Filters</p>
                <p className="text-xs text-muted-foreground">See viral content in your space</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
