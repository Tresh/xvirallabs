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
        "group relative p-4 md:p-6 rounded-xl border text-left transition-all duration-200",
        "hover:shadow-sm",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border bg-background hover:border-muted-foreground/40"
      )}
    >
      <div className="absolute top-3 right-3 md:top-4 md:right-4 font-mono text-xs opacity-40">
        {String(mode).padStart(2, '0')}
      </div>

      <div className="flex items-center gap-3 md:block">
        <div className={cn(
          "p-2.5 md:p-3 rounded-lg w-fit transition-all duration-200 md:mb-4 flex-shrink-0",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "bg-secondary text-muted-foreground group-hover:text-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className={cn(
          "text-sm md:text-base font-semibold md:hidden",
          isSelected ? "text-primary" : "text-foreground"
        )}>{title}</h3>
      </div>

      <h3 className={cn(
        "hidden md:block text-base font-semibold mb-2",
        isSelected ? "text-primary" : "text-foreground"
      )}>{title}</h3>
      <p className="text-xs leading-relaxed mt-2 md:mt-0 text-muted-foreground">{description}</p>
    </button>
  );
}
