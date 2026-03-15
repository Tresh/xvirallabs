import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, FlaskConical, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthView = "main" | "verify-otp";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [view, setView] = useState<AuthView>("main");
  const [otpCode, setOtpCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You've been signed in successfully." });
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      setPendingEmail(email);
      setView("verify-otp");
      setResendCooldown(60);
      toast({ title: "Verification code sent", description: `We've sent a 6-digit code to ${email}` });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otpCode,
        type: "signup",
      });
      if (error) {
        toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email verified!", description: "Your account is ready. Welcome to the Lab!" });
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
    });
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      setResendCooldown(60);
      setOtpCode("");
      toast({ title: "Code resent", description: `A new code has been sent to ${pendingEmail}` });
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });
    if (error) {
      toast({ title: "Google sign in failed", description: String(error), variant: "destructive" });
    }
  };

  // OTP Verification Screen
  if (view === "verify-otp") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Logo size="lg" />
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>
                Enter the 6-digit code we sent to{" "}
                <span className="font-medium text-foreground">{pendingEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <span className="text-muted-foreground text-2xl mx-1">–</span>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                variant="viral"
                className="w-full"
                disabled={isLoading || otpCode.length !== 6}
                onClick={handleVerifyOtp}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  "Verify & Enter the Lab"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={() => {
                    setView("main");
                    setOtpCode("");
                    setPendingEmail("");
                  }}
                >
                  <ArrowLeft className="h-3 w-3" /> Back to sign up
                </button>

                <button
                  type="button"
                  className={`transition-colors ${
                    resendCooldown > 0
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-primary hover:text-primary/80 cursor-pointer"
                  }`}
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendCode}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Check your spam folder if you don't see the email. The code expires in 10 minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Auth Screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Access Your Lab</CardTitle>
            <CardDescription>Sign in to save your viral analyses and build your pattern library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-muted/50 border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Use the same sign-in method you used before (Google or Email) to access your saved data.
              </p>
            </div>

            <Button variant="outline" className="w-full gap-2 mb-4" onClick={handleGoogleSignIn}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="scientist@viral.labs" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-background" />
                  </div>
                  <Button type="submit" variant="viral" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Enter the Lab"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="scientist@viral.labs" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-background" />
                  </div>
                  <Button type="submit" variant="viral" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Start Your Lab"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">By signing up, you agree to build viral content responsibly.</p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
