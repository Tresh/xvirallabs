import { Logo } from "./Logo";
import { Atom, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground font-mono">
            © 2025 Viral Labs. Reverse-engineer virality.
          </p>
        </div>
      </div>
    </footer>
  );
}
