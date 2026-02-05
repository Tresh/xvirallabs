import { Atom } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: { wrapper: "p-1.5", icon: "h-4 w-4", text: "text-base", subtext: "text-[8px]" },
  md: { wrapper: "p-2.5", icon: "h-6 w-6", text: "text-xl", subtext: "text-[10px]" },
  lg: { wrapper: "p-3", icon: "h-8 w-8", text: "text-2xl", subtext: "text-xs" },
};

export function Logo({ size = "md", showText = true }: LogoProps) {
  const classes = sizeClasses[size];
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
        <div className={cn("relative bg-gradient-to-br from-primary to-viral-success rounded-xl", classes.wrapper)}>
          <Atom className={cn("text-primary-foreground", classes.icon)} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-foreground", classes.text)}>
            Viral<span className="text-gradient-primary">Labs</span>
          </span>
          <span className={cn("font-mono text-muted-foreground tracking-widest uppercase", classes.subtext)}>
            Twitter/X Analysis
          </span>
        </div>
      )}
    </div>
  );
}
