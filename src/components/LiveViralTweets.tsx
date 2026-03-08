import { TrendingUp, Sparkles, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

export function LiveViralTweets() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary mb-6">
            <span className="font-mono text-xs text-muted-foreground">LIVE FEED</span>
            <Badge variant="outline" className="ml-2 text-[10px] px-2 py-0.5">
              Coming Soon
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Live Viral Tweets on <span className="text-primary">X</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time feed of trending tweets going viral right now.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="relative rounded-xl border border-border p-6 overflow-hidden bg-background"
              >
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-3 rounded-full border border-border inline-flex mb-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Coming Soon</p>
                  </div>
                </div>

                <div className="space-y-4 opacity-30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-2 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Trending Detection</p>
                <p className="text-xs text-muted-foreground">Catch tweets before they peak</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border">
              <div className="p-2 rounded-lg bg-secondary">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Instant Analysis</p>
                <p className="text-xs text-muted-foreground">One-click pattern extraction</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-foreground" />
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
