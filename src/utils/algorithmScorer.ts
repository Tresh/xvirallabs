export interface AlgorithmScores {
  algorithm_score: "follow_driver" | "reply_driver" | "dwell_driver" | "share_driver" | "viral_driver";
  follow_score: number;
  reply_score: number;
  dwell_score: number;
  share_score: number;
  has_reply_bait: boolean;
  recommended_post_time: string;
  pillar_drift_warning: boolean;
}

export interface AlgorithmBadge {
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const ALGORITHM_BADGES: Record<string, AlgorithmBadge> = {
  follow_driver: {
    label: "Follow Driver",
    emoji: "👤",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    description: "High P(follow_author) — this post makes people want to follow you",
  },
  reply_driver: {
    label: "Reply Driver",
    emoji: "💬",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    description: "High P(reply) — designed to generate conversation",
  },
  dwell_driver: {
    label: "Dwell Driver",
    emoji: "👁️",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    description: "High P(dwell) — makes people stop and read fully",
  },
  share_driver: {
    label: "Share Driver",
    emoji: "🔁",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    description: "High P(retweet) — people will share this with others",
  },
  viral_driver: {
    label: "Viral Driver",
    emoji: "⚡",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    description: "Multi-signal post — high scores across all categories",
  },
};

export const POSTING_SCHEDULE = [
  "7:00 AM", "9:30 AM", "12:00 PM", "2:30 PM",
  "5:00 PM", "7:30 PM", "9:00 PM", "11:00 PM",
];

export function getRecommendedTime(postIndex: number): string {
  return POSTING_SCHEDULE[postIndex % POSTING_SCHEDULE.length];
}

export function scoreContent(content: string, format: string): Partial<AlgorithmScores> {
  const text = content.toLowerCase();

  const replyBaitPatterns = [
    /drop your/i, /comment below/i, /who is in/i, /be honest/i,
    /what's your/i, /tell me/i, /\?$/, /👇/, /vote/i, /choose/i,
    /agree or disagree/i, /your letter/i, /your answer/i,
  ];
  const has_reply_bait = replyBaitPatterns.some((p) => p.test(text));

  let follow_score = 0;
  let reply_score = 0;
  let dwell_score = 0;
  let share_score = 0;

  if (/unpopular opinion/i.test(text)) follow_score += 30;
  if (/nobody talks about/i.test(text)) follow_score += 25;
  if (/i've never said/i.test(text)) follow_score += 35;
  if (/the truth/i.test(text)) follow_score += 20;
  if (format === "hot_take" || format === "vulnerable") follow_score += 20;

  if (has_reply_bait) reply_score += 40;
  if (/\?/.test(text)) reply_score += 15;
  if (/drop your letter/i.test(text)) reply_score += 30;
  if (/be honest/i.test(text)) reply_score += 25;
  if (/agree or disagree/i.test(text)) reply_score += 35;
  if (format === "engagement") reply_score += 25;

  if (format === "thread" || format === "article") dwell_score += 40;
  if ((text.match(/→/g) || []).length > 3) dwell_score += 20;
  if (content.length > 500) dwell_score += 25;
  if (/step \d/i.test(text) || /day \d/i.test(text)) dwell_score += 20;
  if (/here's how/i.test(text)) dwell_score += 15;

  if (/🚨/.test(text)) share_score += 20;
  if (/retweet/i.test(text)) share_score += 15;
  if (/bookmark/i.test(text)) share_score += 20;
  if (/tag someone/i.test(text)) share_score += 25;
  if (/platforms/i.test(text) && /→/.test(text)) share_score += 20;
  if (format === "alpha") share_score += 20;

  follow_score = Math.min(follow_score + Math.floor(Math.random() * 20), 100);
  reply_score = Math.min(reply_score + Math.floor(Math.random() * 20), 100);
  dwell_score = Math.min(dwell_score + Math.floor(Math.random() * 20), 100);
  share_score = Math.min(share_score + Math.floor(Math.random() * 20), 100);

  const scores = { follow_score, reply_score, dwell_score, share_score };
  const maxScore = Math.max(...Object.values(scores));
  const allHigh = Object.values(scores).every((s) => s > 60);

  let algorithm_score: AlgorithmScores["algorithm_score"] = "reply_driver";
  if (allHigh) algorithm_score = "viral_driver";
  else if (follow_score === maxScore) algorithm_score = "follow_driver";
  else if (reply_score === maxScore) algorithm_score = "reply_driver";
  else if (dwell_score === maxScore) algorithm_score = "dwell_driver";
  else if (share_score === maxScore) algorithm_score = "share_driver";

  return {
    algorithm_score,
    follow_score,
    reply_score,
    dwell_score,
    share_score,
    has_reply_bait,
  };
}
