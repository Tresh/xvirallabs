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
        "group relative p-6 rounded-2xl border text-left transition-all duration-300",
        "bg-card hover:bg-secondary/50",
        isSelected 
          ? "border-primary shadow-[0_0_30px_hsla(175,85%,50%,0.2)]" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Mode Number */}
      <div className="absolute top-4 right-4 font-mono text-xs text-muted-foreground">
        MODE {mode}
      </div>

      {/* Icon */}
      <div className={cn(
        "mb-4 p-3 rounded-xl w-fit transition-all duration-300",
        isSelected 
          ? "bg-primary/20 text-primary" 
          : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      {/* Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}
    </button>
  );
}
