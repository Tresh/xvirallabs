import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#modes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Modes
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Analyze
          </a>
        </nav>

        <Button variant="glow" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Start Analyzing
        </Button>
      </div>
    </header>
  );
}
