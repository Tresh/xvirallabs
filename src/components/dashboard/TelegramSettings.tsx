import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Send, Check, ExternalLink, Shield } from "lucide-react";

export function TelegramSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    bot_token: "",
    channel_username: "",
    channel_id: "",
    auto_post_approved: false,
    morning_delivery: false,
    notify_viral: false,
    is_connected: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await (supabase.from("telegram_settings" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) setSettings(data as any);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await (supabase.from("telegram_settings" as any) as any)
      .upsert({ ...settings, user_id: user.id });
    if (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } else {
      toast({ title: "Telegram settings saved! ✅" });
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    if (!settings.bot_token || !settings.channel_username) {
      toast({ title: "Enter bot token and channel username first", variant: "destructive" });
      return;
    }
    setIsTesting(true);
    try {
      const channelId = settings.channel_username.startsWith("@")
        ? settings.channel_username
        : `@${settings.channel_username}`;

      const response = await fetch(
        `https://api.telegram.org/bot${settings.bot_token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: channelId,
            text: "✅ XviralLabs connected successfully! Your content will now be delivered here.",
          }),
        }
      );
      const result = await response.json();
      if (result.ok) {
        await (supabase.from("telegram_settings" as any) as any)
          .upsert({ ...settings, user_id: user!.id, is_connected: true });
        setSettings((prev) => ({ ...prev, is_connected: true }));
        toast({ title: "Connected! Test message sent to your channel ✅" });
      } else {
        toast({
          title: "Connection failed",
          description: result.description || "Check your bot token and channel username",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
          <Send className="h-4 w-4 text-primary" />
          Telegram Integration
        </h3>
        <p className="text-xs text-muted-foreground">
          Connect your Telegram channel to auto-post approved content,
          receive morning content deliveries, and notify your community.
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium">Setup in 3 steps:</p>
        <p className="text-xs text-muted-foreground">1. Open Telegram → search @BotFather → send /newbot → get your token</p>
        <p className="text-xs text-muted-foreground">2. Add your bot as admin to your channel</p>
        <p className="text-xs text-muted-foreground">3. Paste your bot token and channel username below → Test Connection</p>
        <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary flex items-center gap-1 hover:underline">
          Open BotFather <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {settings.is_connected && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <Check className="h-4 w-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">Connected to Telegram</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Shield className="h-3 w-3" /> Bot Token (stored securely)
        </label>
        <Input type="password" placeholder="1234567890:AAF..."
          value={settings.bot_token}
          onChange={(e) => setSettings((prev) => ({ ...prev, bot_token: e.target.value }))} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Channel Username</label>
        <Input placeholder="@yourchannel"
          value={settings.channel_username}
          onChange={(e) => setSettings((prev) => ({ ...prev, channel_username: e.target.value }))} />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium">Features</p>
        {[
          { key: "auto_post_approved", label: "Auto-post approved content to channel", desc: "When you approve a post, it instantly goes to your Telegram channel" },
          { key: "morning_delivery", label: "Morning content delivery", desc: "Get your daily posts delivered to a private Telegram bot every morning" },
          { key: "notify_viral", label: "Notify community when post goes viral", desc: "Auto-notify your channel when you mark a post as viral" },
        ].map((feature) => (
          <div key={feature.key} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card">
            <button
              onClick={() => setSettings((prev) => ({
                ...prev,
                [feature.key]: !prev[feature.key as keyof typeof prev],
              }))}
              className={`w-9 h-5 rounded-full transition-all flex-shrink-0 mt-0.5 ${
                settings[feature.key as keyof typeof settings] ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all mx-auto ${
                settings[feature.key as keyof typeof settings] ? "translate-x-2" : "-translate-x-1"
              }`} />
            </button>
            <div>
              <p className="text-xs font-medium">{feature.label}</p>
              <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="viral" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={isTesting}>
          {isTesting ? "Testing..." : "Test Connection"}
        </Button>
      </div>
    </div>
  );
}
