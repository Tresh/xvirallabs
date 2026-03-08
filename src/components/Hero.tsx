import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center pt-28">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary text-sm mb-8 animate-fade-in">
            <span className="font-mono text-muted-foreground text-xs">
              Not a tweet generator. A <span className="text-foreground font-semibold">virality lab</span>.
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Reverse-Engineer{" "}
            <span className="text-primary">Viral</span>{" "}
            Tweets
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Decode why posts go viral using psychology, platform mechanics, and audience behavior. Then generate your own high-probability viral content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="viral" 
              size="lg" 
              className="w-full sm:w-auto"
              asChild
            >
              <Link to={user ? "/dashboard" : "/auth"}>
                Analyze a Tweet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              asChild
            >
              <Link to="/features">
                See How It Works
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-xs mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">10</div>
              <div className="text-xs text-muted-foreground font-mono">Modes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">20+</div>
              <div className="text-xs text-muted-foreground font-mono">Variations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">5</div>
              <div className="text-xs text-muted-foreground font-mono">Free/Day</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
