import { Users, FileText, Sparkles, Lightbulb, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformStats } from "@/hooks/useAdmin";

interface AdminStatsProps {
  stats: PlatformStats | undefined;
  isLoading: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = "default" 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  description?: string;
  variant?: "default" | "primary" | "success" | "warning";
}) => {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/30 bg-primary/5",
    success: "border-primary/20 bg-primary/[0.03]",
    warning: "border-border bg-muted/30",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-primary",
    warning: "text-muted-foreground",
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Analyses"
          value={stats.total_analyses}
          icon={FileText}
        />
        <StatCard
          title="Saved Patterns"
          value={stats.total_patterns}
          icon={Sparkles}
        />
        <StatCard
          title="Ideas Generated"
          value={stats.total_ideas}
          icon={Lightbulb}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pro Users"
          value={stats.pro_users}
          icon={Crown}
          variant="success"
        />
        <StatCard
          title="Elite Users"
          value={stats.elite_users}
          icon={Crown}
          variant="warning"
        />
        <StatCard
          title="Last 7 Days"
          value={stats.analyses_last_7_days}
          icon={TrendingUp}
          description="Analyses performed"
        />
        <StatCard
          title="Last 30 Days"
          value={stats.analyses_last_30_days}
          icon={TrendingUp}
          description="Analyses performed"
        />
      </div>
    </div>
  );
}
