import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, ExternalLink, Loader2, AlertTriangle, ShieldOff } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { getPaddleEnvironment } from "@/lib/paddle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionManagement() {
  const { subscription, loading, isActive, isPastDue, isCanceledButActive, cancelAtPeriodEnd, refetch } = useSubscription();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !isActive) {
    return null; // free users see the pricing card instead
  }

  const renewLabel = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      })
    : "—";

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "portal", environment: getPaddleEnvironment() },
      });
      if (error) throw error;
      const url = data?.overviewUrl;
      if (!url) throw new Error("No portal URL returned");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({ title: "Couldn't open portal", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const cancelNow = async () => {
    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "cancel", environment: getPaddleEnvironment() },
      });
      if (error) throw error;
      toast({
        title: "Cancellation scheduled",
        description: data?.alreadyCanceled
          ? "Your subscription was already canceled."
          : `You'll keep access until ${renewLabel}.`,
      });
      await refetch();
    } catch (e: any) {
      toast({ title: "Couldn't cancel", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Subscription</CardTitle>
            <CardDescription>Manage billing, payment method, and cancellation.</CardDescription>
          </div>
          <Badge variant="outline" className="capitalize border-primary/30 text-primary pointer-events-none">
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPastDue && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Payment failed</p>
              <p className="text-destructive/80 text-xs">Your last charge didn't go through. Update your payment method to avoid losing access.</p>
            </div>
          </div>
        )}
        {(isCanceledButActive || cancelAtPeriodEnd) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
            <ShieldOff className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Cancellation scheduled</p>
              <p className="text-muted-foreground text-xs">You'll keep premium access until {renewLabel}, then drop to Free.</p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Plan</p>
            <p className="font-medium capitalize">{subscription.price_id.replace("_monthly", "")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{cancelAtPeriodEnd || isCanceledButActive ? "Access ends" : "Renews"}</p>
            <p className="font-medium">{renewLabel}</p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={openPortal} disabled={portalLoading} className="flex-1">
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Manage billing
          </Button>

          {!cancelAtPeriodEnd && !isCanceledButActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                  Cancel subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll keep premium access until <span className="font-medium text-foreground">{renewLabel}</span>, then your account will return to the Free plan. You can resubscribe at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={cancelNow}
                    disabled={cancelLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Cancel subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}