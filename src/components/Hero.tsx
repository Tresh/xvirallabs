import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm mb-8 animate-fade-in">
            
            <span className="font-mono text-primary text-xs font-medium tracking-wide">
              AI Content Co-Pilot for Twitter/X
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-5 text-foreground animate-fade-in leading-[1.1] md:text-5xl" style={{ animationDelay: "0.1s" }}>
            15 posts written in{" "}
            <span className="text-primary">your voice.</span>
            <br />Every morning.
          </h1>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in leading-relaxed md:text-base" style={{ animationDelay: "0.2s" }}>XViralLabs researches what's trending in your niche, writes tweets, threads, and articles in your voice, then you approve the best ones in 30 seconds.

          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="viral" size="lg" className="w-full sm:w-auto" asChild>
              <Link to={user ? "/dashboard" : "/auth"}>
                <Sparkles className="h-4 w-4" />
                {user ? "Open Dashboard" : "Start Growing Free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/features">See How It Works</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">15</div>
              <div className="text-xs text-muted-foreground font-mono">Posts/day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">10</div>
              <div className="text-xs text-muted-foreground font-mono">AI modes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">4</div>
              <div className="text-xs text-muted-foreground font-mono">Formats</div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}