import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradePromptProps {
  onClose?: () => void;
}

export function UpgradePrompt({ onClose }: UpgradePromptProps) {
  return (
    <div className="mb-6 p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Daily Limit Reached</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Upgrade to Pro for unlimited analyses and all 10 modes.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="viral" size="sm">
          <Link to="/dashboard?tab=plans">Upgrade to Pro</Link>
        </Button>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Come Back Tomorrow
          </Button>
        )}
      </div>
    </div>
  );
}
