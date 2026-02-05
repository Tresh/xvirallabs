import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradePromptProps {
  onClose?: () => void;
}

export function UpgradePrompt({ onClose }: UpgradePromptProps) {
  return (
    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-viral-purple/10 to-viral-success/10 border border-primary/30">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/20">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">
            You've Hit Your Daily Limit 🎯
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            You've used all 5 free analyses today. Upgrade to Pro for unlimited analyses, 
            pattern saving, and your personal viral memory.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-viral-success" />
              Unlimited analyses
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-viral-warning" />
              Save patterns & ideas
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4 text-primary" />
              Personal brand voice
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="viral" size="lg">
              <Link to="/dashboard?tab=plans">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro - $19/mo
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              Come Back Tomorrow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
