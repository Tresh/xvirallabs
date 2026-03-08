import { Logo } from "./Logo";
import { Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="#" className="hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground font-mono">
            © 2025 Viral Labs
          </p>
        </div>
      </div>
    </footer>
  );
}
