import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    description: "Get started with viral analysis",
    icon: Zap,
    features: ["3 analyses per day", "Basic viral diagnosis", "Psychology breakdown", "Pattern extraction"],
    limitations: ["No saved history", "No idea vault"],
  },
  {
    name: "Pro",
    tier: "pro",
    price: "$19",
    period: "/month",
    description: "For serious content creators",
    icon: Sparkles,
    badge: "Popular",
    features: ["Unlimited analyses", "All 10 analysis modes", "Saved analysis history", "Pattern library", "Idea vault", "Brand voice settings"],
  },
  {
    name: "Elite",
    tier: "elite",
    price: "$49",
    period: "/month",
    description: "For agencies & power users",
    icon: Crown,
    features: ["Everything in Pro", "Team collaboration", "API access", "Priority support", "Custom integrations", "White-label reports"],
  },
];

export function PricingPlans() {
  const { profile } = useAuth();
  const currentTier = profile?.tier || "free";

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl">Upgrade Your Plan</CardTitle>
            <CardDescription>Unlock more powerful viral analysis tools</CardDescription>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30 capitalize">
            Current: {currentTier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.tier === currentTier;
            return (
              <div
                key={plan.name}
                className={`relative p-5 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-foreground/30 bg-secondary"
                    : plan.badge
                    ? "border-primary/30 bg-primary/5"
                    : "border-border"
                }`}
              >
                {plan.badge && !isCurrent && (
                  <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                    Your Plan
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isCurrent ? "bg-primary/15" : "bg-secondary"}`}>
                    <Icon className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation) => (
                    <li key={limitation} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-4 w-4 flex items-center justify-center text-xs">✕</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button variant="viral" className="w-full">Upgrade</Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
