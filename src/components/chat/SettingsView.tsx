import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon, ShoppingBag, TrendingUp, Brain, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SalesEngine } from "@/components/dashboard/SalesEngine";
import { GrowthTracker } from "@/components/dashboard/GrowthTracker";
import { MemoryTab } from "@/components/dashboard/MemoryTab";
import { PricingPlans } from "@/components/dashboard/PricingPlans";

const SECTIONS = [
  { id: "settings", label: "Settings", icon: SettingsIcon },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "sales", label: "Sales Engine", icon: ShoppingBag },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "plans", label: "Plans", icon: CreditCard },
] as const;

export function SettingsView({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<string>("settings");

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="h-12 border-b border-border flex items-center px-4 gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium font-mono">Settings & Tools</div>
      </header>

      <div className="border-b border-border px-4 overflow-x-auto">
        <div className="flex gap-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                section === s.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {section === "settings" && <SettingsTab />}
        {section === "memory" && <MemoryTab />}
        {section === "sales" && <SalesEngine />}
        {section === "growth" && <GrowthTracker />}
        {section === "plans" && <PricingPlans />}
      </div>
    </div>
  );
}