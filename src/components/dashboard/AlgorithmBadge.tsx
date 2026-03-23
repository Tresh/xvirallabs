import { Badge } from "@/components/ui/badge";
import { ALGORITHM_BADGES } from "@/utils/algorithmScorer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlgorithmBadgeProps {
  score: string;
  followScore?: number;
  replyScore?: number;
  dwellScore?: number;
  shareScore?: number;
  hasReplyBait?: boolean;
  recommendedTime?: string;
  compact?: boolean;
}

export function AlgorithmBadge({
  score, followScore, replyScore, dwellScore, shareScore,
  hasReplyBait, recommendedTime, compact = false,
}: AlgorithmBadgeProps) {
  const badge = ALGORITHM_BADGES[score] || ALGORITHM_BADGES.reply_driver;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`text-[10px] gap-1 cursor-help ${badge.color}`}>
              {badge.emoji} {badge.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{badge.description}</p>
            {!compact && (
              <div className="mt-2 space-y-1">
                <ScoreBar label="Follow" value={followScore || 0} color="bg-purple-400" />
                <ScoreBar label="Reply" value={replyScore || 0} color="bg-blue-400" />
                <ScoreBar label="Dwell" value={dwellScore || 0} color="bg-green-400" />
                <ScoreBar label="Share" value={shareScore || 0} color="bg-yellow-400" />
              </div>
            )}
          </TooltipContent>
        </Tooltip>

        {hasReplyBait && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] text-blue-400 bg-blue-400/10 border-blue-400/20 cursor-help">
                💬 Reply Bait
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">This post has a reply-triggering hook — expect high comment engagement</p>
            </TooltipContent>
          </Tooltip>
        )}

        {recommendedTime && !compact && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            🕐 Post at {recommendedTime}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-10">{label}</span>
      <div className="flex-1 bg-secondary rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}
