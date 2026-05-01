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
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-primary text-xs font-medium tracking-wide">
              The AI Agent for Twitter/X Growth
            </span>
          </div>

          <h1 className="text-[2.25rem] sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 text-foreground animate-fade-in leading-[1.15] sm:leading-[1.1]" style={{ animationDelay: "0.1s" }}>
            One chat. <span className="text-primary whitespace-nowrap">Every viral asset</span> you need.
          </h1>

          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in leading-relaxed md:text-base" style={{ animationDelay: "0.2s" }}>
            Analyze viral tweets, generate posts in your voice, plan threads, build sales campaigns, write video scripts — all from a single chat. Pick a tool, type your prompt, copy the result.
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
              <div className="text-2xl font-bold text-foreground mb-1">9+</div>
              <div className="text-xs text-muted-foreground font-mono">Tools in chat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">1-tap</div>
              <div className="text-xs text-muted-foreground font-mono">Copy any post</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">∞</div>
              <div className="text-xs text-muted-foreground font-mono">Saved history</div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}