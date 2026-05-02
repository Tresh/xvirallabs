import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with viral analysis",
    icon: Zap,
    features: ["3 analyses per day", "Basic viral diagnosis", "Psychology breakdown", "Pattern extraction"],
  },
  {
    name: "Pro",
    price: "$7",
    originalPrice: "$10",
    period: "/month",
    description: "For serious content creators",
    icon: Sparkles,
    badge: "Launch price",
    features: ["Unlimited analyses", "All 10 analysis modes", "Saved analysis history", "Pattern library", "Idea vault", "Brand voice settings"],
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$18",
    originalPrice: "$25",
    period: "/month",
    description: "For agencies & power users",
    icon: Crown,
    features: ["Everything in Pro", "Team collaboration", "API access", "Priority support", "Custom integrations", "White-label reports"],
    comingSoon: true,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const upgradeHref = user ? "/dashboard?view=settings&section=plans" : "/auth?redirect=/dashboard?view=settings%26section=plans";
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground">Start free. Upgrade when you're ready to scale your reach.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={`relative p-6 ${plan.highlighted ? "border-primary/40 bg-primary/5" : "border-border"}`}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.highlighted ? "bg-primary/15" : "bg-secondary"}`}>
                      <Icon className={`h-5 w-5 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <h3 className="font-semibold text-xl">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-base text-muted-foreground line-through">{plan.originalPrice}</span>
                    )}
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.comingSoon ? (
                    <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
                  ) : plan.name === "Free" ? (
                    <Link to={user ? "/dashboard" : "/auth"}>
                      <Button variant="outline" className="w-full">
                        {user ? "Go to dashboard" : "Start free"}
                      </Button>
                    </Link>
                  ) : (
                    <Link to={upgradeHref}>
                      <Button variant={plan.highlighted ? "viral" : "outline"} className="w-full">
                        {user ? "Upgrade now" : "Get started"}
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-12">
            Payments handled securely by Paddle. 30-day money-back guarantee. See our{" "}
            <Link to="/refund" className="underline hover:text-foreground">Refund Policy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;