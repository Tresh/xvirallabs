import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";

export function Header() {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        
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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">My Lab</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {profile?.email?.split("@")[0]}
                    </span>
                    <Badge variant="secondary" className="hidden sm:inline-flex capitalize text-[10px]">
                      {profile?.tier}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="glow" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Start Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
