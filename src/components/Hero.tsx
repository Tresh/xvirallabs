import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary text-sm mb-8 animate-fade-in">
            <span className="font-mono text-muted-foreground text-xs">
              Not a tweet generator. A <span className="text-foreground font-semibold">virality lab</span>.
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Reverse-Engineer{" "}
            <span className="text-primary">Viral</span>{" "}
            Tweets
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Decode why posts go viral using psychology, platform mechanics, and audience behavior. 
            Then generate your own high-probability viral content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="viral" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Analyze a Tweet
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">10</div>
              <div className="text-xs text-muted-foreground font-mono">Modes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">20+</div>
              <div className="text-xs text-muted-foreground font-mono">Variations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">∞</div>
              <div className="text-xs text-muted-foreground font-mono">Ideas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
