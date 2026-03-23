import { Clock, Calendar, AlertCircle } from "lucide-react";

const OPTIMAL_TIMES = [
  { time: "7:00 AM", label: "Early Morning", reason: "High engagement before work", score: 85 },
  { time: "9:30 AM", label: "Morning Peak", reason: "Peak commute scrolling time", score: 92 },
  { time: "12:00 PM", label: "Lunch Break", reason: "High dwell time during lunch", score: 88 },
  { time: "2:30 PM", label: "Afternoon", reason: "Post-lunch engagement spike", score: 78 },
  { time: "5:00 PM", label: "Evening Rush", reason: "Commute home scroll time", score: 90 },
  { time: "7:30 PM", label: "Prime Time", reason: "Peak evening engagement", score: 95 },
  { time: "9:00 PM", label: "Night", reason: "Relaxed scrolling session", score: 82 },
  { time: "11:00 PM", label: "Late Night", reason: "Night owl audience", score: 70 },
];

export function PostScheduler({ totalPosts = 20 }: { totalPosts?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">Post Spacing Optimizer</h3>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-400 mb-1">X Algorithm: Author Diversity Scorer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Posting more than once every 2-3 hours reduces reach per post.
              The algorithm attenuates your score if you appear too frequently
              in someone's feed in one session. Space your posts for maximum individual reach.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {OPTIMAL_TIMES.slice(0, totalPosts > 8 ? 8 : totalPosts).map((slot) => (
          <div key={slot.time} className="border border-border rounded-lg p-3 bg-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{slot.time}</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  slot.score >= 90 ? "bg-green-400" : slot.score >= 80 ? "bg-yellow-400" : "bg-orange-400"
                }`} />
                <span className="text-[10px] text-muted-foreground">{slot.score}/100</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">{slot.reason}</p>
            <div className="mt-2 bg-secondary rounded-full h-1">
              <div
                className={`h-1 rounded-full ${
                  slot.score >= 90 ? "bg-green-400" : slot.score >= 80 ? "bg-yellow-400" : "bg-orange-400"
                }`}
                style={{ width: `${slot.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/50 rounded-xl p-4">
        <h4 className="text-xs font-medium mb-3 flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Recommended Daily Schedule ({totalPosts} posts)
        </h4>
        <div className="space-y-1.5">
          {OPTIMAL_TIMES.slice(0, Math.min(totalPosts, 8)).map((slot, i) => (
            <div key={slot.time} className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground w-16 flex-shrink-0">{slot.time}</span>
              <span className="text-foreground">Post {i + 1}</span>
              <div className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                slot.score >= 90 ? "bg-green-500/20 text-green-400" :
                slot.score >= 80 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-orange-500/20 text-orange-400"
              }`}>
                {slot.score >= 90 ? "Peak" : slot.score >= 80 ? "Good" : "Low"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
