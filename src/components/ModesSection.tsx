import { useState } from "react";
import { ModeCard } from "./ModeCard";
import {
  Microscope,
  Brain,
  Dna,
  Sparkles,
  BarChart3,
  RefreshCw,
  FileText,
  Lightbulb,
  User,
  Trophy,
} from "lucide-react";

const modes = [
  { mode: 1, title: "Viral Diagnosis", description: "Analyze tweet hooks, psychological triggers, and algorithm signals.", icon: Microscope },
  { mode: 2, title: "Psychology Deconstruction", description: "Identify cognitive biases, emotional tension, and social identity appeals.", icon: Brain },
  { mode: 3, title: "Pattern Extraction", description: "Extract reusable viral templates, hooks, and CTA frameworks.", icon: Dna },
  { mode: 4, title: "Generate Variations", description: "Create 10-20 high-performing tweet variations for your niche.", icon: Sparkles },
  { mode: 5, title: "Engagement Forecast", description: "Predict scroll-stopping potential, dwell time, and engagement types.", icon: BarChart3 },
  { mode: 6, title: "Rewrite for Virality", description: "Transform your post with stronger hooks and better emotional payoff.", icon: RefreshCw },
  { mode: 7, title: "Article → Thread", description: "Convert long-form content into viral Twitter/X threads.", icon: FileText },
  { mode: 8, title: "Idea Engine", description: "Generate 30 viral post ideas based on trends and psychology.", icon: Lightbulb },
  { mode: 9, title: "Brand Alignment", description: "Adapt posts to match your tone, positioning, and audience level.", icon: User },
  { mode: 10, title: "Lab Summary", description: "Get actionable insights: core lessons, rules, and mistakes to avoid.", icon: Trophy },
];

export function ModesSection() {
  const [selectedMode, setSelectedMode] = useState<number | null>(null);

  return (
    <section id="modes" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">10 Powerful Modes</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Complete <span className="text-primary">Virality Toolkit</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From diagnosis to generation, every tool you need to create content that spreads.
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
