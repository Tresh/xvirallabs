import { useState } from "react";
import { ModeCard } from "./ModeCard";
import {
  Microscope, Sparkles, ShoppingBag, Video, FileText,
  RefreshCw, Zap, Layers, Calendar, MessageSquare,
} from "lucide-react";

const modes = [
  { mode: 1, title: "Analyze", description: "Reverse-engineer any viral tweet — hook, psychology, algorithm signals.", icon: Microscope },
  { mode: 2, title: "Generate Post", description: "Write viral X posts in your voice. Multiple angles per request.", icon: Sparkles },
  { mode: 3, title: "Sales Engine", description: "Turn a product into a multi-day organic sales campaign.", icon: ShoppingBag },
  { mode: 4, title: "Video Script", description: "Sora/Runway-ready video scripts with shots and pacing.", icon: Video },
  { mode: 5, title: "Thread", description: "Convert any draft into a high-retention thread with open loops.", icon: FileText },
  { mode: 6, title: "Rewrite", description: "Boost the virality of any draft — sharper hook, cleaner payoff.", icon: RefreshCw },
  { mode: 7, title: "Daily Feed", description: "Generate a fresh batch of daily posts varied by psychology trigger.", icon: Zap },
  { mode: 8, title: "Content OS", description: "Plan a content mix from your pillars and formats.", icon: Layers },
  { mode: 9, title: "Content Lab", description: "Strategy planning — pillars, calendar, mind map.", icon: Calendar },
  { mode: 10, title: "Free Chat", description: "Just ask. The agent picks the right tool when you don't.", icon: MessageSquare },
];

export function ModesSection() {
  const [selectedMode, setSelectedMode] = useState<number | null>(null);

  return (
    <section id="modes" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">10 tools, one chat</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Every viral asset, on demand
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick a tool from the chat. Type your prompt. Copy the post. That's the whole workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {modes.map((mode) => (
            <ModeCard
              key={mode.mode}
              {...mode}
              isSelected={selectedMode === mode.mode}
              onClick={() => setSelectedMode(mode.mode)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
