import { Button } from "./ui/button";
import { ArrowRight, Beaker, Dna, Microscope } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-viral-success/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
            <Beaker className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-muted-foreground">
              Not a tweet generator. A <span className="text-primary font-semibold">virality lab</span>.
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Reverse-Engineer{" "}
            <span className="text-gradient-primary">Viral</span>{" "}
            Tweets
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Decode why posts go viral using psychology, platform mechanics, and audience behavior. 
            Then generate your own high-probability viral content.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
              variant="glass" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-1">10</div>
              <div className="text-sm text-muted-foreground font-mono">Analysis Modes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient-viral mb-1">20+</div>
              <div className="text-sm text-muted-foreground font-mono">Viral Variations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">∞</div>
              <div className="text-sm text-muted-foreground font-mono">Content Ideas</div>
            </div>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute top-1/3 left-10 animate-pulse hidden lg:block">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border">
            <Microscope className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="absolute bottom-1/3 right-10 animate-pulse hidden lg:block" style={{ animationDelay: '1s' }}>
          <div className="p-3 bg-secondary/50 rounded-xl border border-border">
            <Dna className="h-6 w-6 text-viral-success" />
          </div>
        </div>
      </div>
    </section>
  );
}
