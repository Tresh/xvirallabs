import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  mode: number;
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ModeCard({ mode, title, description, icon: Icon, isSelected, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-4 md:p-6 rounded-2xl border text-left transition-all duration-300",
        "bg-card hover:bg-secondary/50",
        isSelected 
          ? "border-primary shadow-[0_0_30px_hsla(175,85%,50%,0.2)]" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Mode Number */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 font-mono text-xs text-muted-foreground">
        MODE {mode}
      </div>

      {/* Mobile Layout: Icon + Title inline */}
      <div className="flex items-center gap-3 md:block">
        {/* Icon */}
        <div className={cn(
          "p-2.5 md:p-3 rounded-xl w-fit transition-all duration-300 md:mb-4 flex-shrink-0",
          isSelected 
            ? "bg-primary/20 text-primary" 
            : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>

        {/* Title - visible on mobile inline with icon */}
        <h3 className="text-base md:text-lg font-semibold text-foreground md:hidden">{title}</h3>
      </div>

      {/* Content - Desktop shows title, mobile hides it since it's inline above */}
      <h3 className="hidden md:block text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-2 md:mt-0">{description}</p>

      {/* Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}
    </button>
  );
}
