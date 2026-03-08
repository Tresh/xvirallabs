import { Atom } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: { wrapper: "p-1.5", icon: "h-4 w-4", text: "text-base", subtext: "text-[8px]" },
  md: { wrapper: "p-2", icon: "h-5 w-5", text: "text-xl", subtext: "text-[10px]" },
  lg: { wrapper: "p-2.5", icon: "h-7 w-7", text: "text-2xl", subtext: "text-xs" },
};

export function Logo({ size = "md", showText = true }: LogoProps) {
  const classes = sizeClasses[size];
  
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("bg-foreground rounded-lg", classes.wrapper)}>
        <Atom className={cn("text-background", classes.icon)} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-foreground", classes.text)}>
            Viral<span className="text-primary">Labs</span>
          </span>
          <span className={cn("font-mono text-muted-foreground tracking-widest uppercase", classes.subtext)}>
            Twitter/X Analysis
          </span>
        </div>
      )}
    </div>
  );
}
