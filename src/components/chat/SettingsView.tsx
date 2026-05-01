import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Settings as SettingsIcon, ShoppingBag, TrendingUp, Brain, CreditCard, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SalesEngine } from "@/components/dashboard/SalesEngine";
import { GrowthTracker } from "@/components/dashboard/GrowthTracker";
import { MemoryTab } from "@/components/dashboard/MemoryTab";
import { PricingPlans } from "@/components/dashboard/PricingPlans";
import { replayOnboardingTour } from "@/hooks/useOnboardingTour";

const SECTIONS = [
  { id: "settings", label: "Settings", icon: SettingsIcon, desc: "Account, appearance, profile" },
  { id: "memory", label: "Memory", icon: Brain, desc: "AI context, voice & style" },
  { id: "sales", label: "Sales Engine", icon: ShoppingBag, desc: "Product-based campaigns" },
  { id: "growth", label: "Growth", icon: TrendingUp, desc: "Track follower & impression gains" },
  { id: "plans", label: "Plans", icon: CreditCard, desc: "Upgrade your tier" },
] as const;

export function SettingsView({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<string | null>(null);

  const current = SECTIONS.find((s) => s.id === section);

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="h-14 border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex-1 flex items-center gap-2 text-sm">
          <button
            onClick={() => (section ? setSection(null) : onClose())}
            className="text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            Settings
          </button>
          {current && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{current.label}</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title="Close">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!section ? (
          // Pagination index page
          <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
            <h1 className="text-2xl font-semibold mb-1 tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mb-6">Manage your account, AI memory, and tools.</p>
            <div className="space-y-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>

            <button
              onClick={() => replayOnboardingTour()}
              className="mt-6 w-full group flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
            >
              <PlayCircle className="h-4 w-4 text-primary" />
              <div className="flex-1 text-xs">
                <div className="font-medium">Replay onboarding tour</div>
                <div className="text-muted-foreground">See the guided walkthrough again.</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        ) : (
          <div className="px-4 md:px-6 py-6">
            {section === "settings" && <SettingsTab />}
            {section === "memory" && <MemoryTab />}
            {section === "sales" && <SalesEngine />}
            {section === "growth" && <GrowthTracker />}
            {section === "plans" && <PricingPlans />}
          </div>
        )}
      </div>
    </div>
  );
}