import { Badge } from "@/components/ui/badge";
import { Zap, Infinity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageIndicatorProps {
  remaining: number;
  isUnlimited: boolean;
  isLoading: boolean;
  dailyLimit: number;
}

export function UsageIndicator({ remaining, isUnlimited, isLoading, dailyLimit }: UsageIndicatorProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading...
      </Badge>
    );
  }

  if (isUnlimited) {
    return (
      <Badge className="bg-viral-success/20 text-viral-success border-viral-success/30">
        <Infinity className="h-3 w-3 mr-1" />
        Unlimited
      </Badge>
    );
  }

  const percentage = (remaining / dailyLimit) * 100;
  const isLow = remaining <= 2;
  const isEmpty = remaining === 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "transition-colors",
        isEmpty
          ? "bg-destructive/20 text-destructive border-destructive/30"
          : isLow
          ? "bg-viral-warning/20 text-viral-warning border-viral-warning/30"
          : "bg-primary/20 text-primary border-primary/30"
      )}
    >
      <Zap className="h-3 w-3 mr-1" />
      {remaining}/{dailyLimit} today
    </Badge>
  );
}
