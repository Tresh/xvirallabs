import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutSuccess() {
  const { refreshProfile } = useAuth() as any;

  useEffect(() => {
    // Webhook may take a few seconds to flip the tier — poll lightly.
    let cancelled = false;
    const tryRefresh = async () => {
      for (let i = 0; i < 6 && !cancelled; i++) {
        try { await refreshProfile?.(); } catch {}
        await new Promise((r) => setTimeout(r, 1500));
      }
    };
    tryRefresh();
    return () => { cancelled = true; };
  }, [refreshProfile]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
        <h1 className="text-3xl font-semibold tracking-tight">You're in.</h1>
        <p className="text-muted-foreground">
          Your subscription is active. We're applying your new plan now —
          you'll see unlimited access in a few seconds.
        </p>
        <Button asChild variant="viral" className="w-full">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}