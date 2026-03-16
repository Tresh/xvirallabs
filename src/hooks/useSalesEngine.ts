import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Product {
  id: string;
  product_name: string;
  product_description: string;
  target_audience: string;
  price: string | null;
  product_link: string | null;
  product_type: string;
  transformation: string | null;
  proof: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SalesCampaign {
  id: string;
  product_id: string;
  campaign_name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  total_posts: number;
  created_at: string;
}

export interface SalesPost {
  id: string;
  campaign_id: string;
  product_id: string;
  post_type: string;
  title: string | null;
  content: string;
  thread_tweets: string[] | null;
  scheduled_day: number | null;
  scheduled_date: string | null;
  status: "pending" | "approved" | "posted" | "skipped";
  viral_score: number | null;
  sell_intensity: string;
  estimated_reach: string | null;
}

export const POST_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; desc: string; sellIntensity: string }> = {
  value_thread: {
    label: "Value Thread", emoji: "🧵", color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    desc: "Deliver massive value, soft sell at end", sellIntensity: "soft",
  },
  fomo: {
    label: "FOMO Post", emoji: "⏰", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    desc: "Social proof + urgency", sellIntensity: "medium",
  },
  story: {
    label: "Story Post", emoji: "📖", color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    desc: "Personal journey → product as solution", sellIntensity: "soft",
  },
  controversy: {
    label: "Controversy", emoji: "🔥", color: "text-red-400 bg-red-400/10 border-red-400/20",
    desc: "Unpopular opinion → product as answer", sellIntensity: "medium",
  },
  list: {
    label: "List Post", emoji: "📋", color: "text-green-400 bg-green-400/10 border-green-400/20",
    desc: "X free ways + 1 paid shortcut", sellIntensity: "medium",
  },
  result: {
    label: "Result Post", emoji: "📊", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    desc: "Show transformation/outcome with proof", sellIntensity: "medium",
  },
  soft_sell: {
    label: "Soft Sell", emoji: "💡", color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    desc: "Natural mention of product in context", sellIntensity: "soft",
  },
  hard_sell: {
    label: "Direct CTA", emoji: "🎯", color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    desc: "Direct offer with clear CTA", sellIntensity: "hard",
  },
};

export function useSalesEngine() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<SalesCampaign[]>([]);
  const [activeCampaignPosts, setActiveCampaignPosts] = useState<SalesPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  }, [user]);

  const loadCampaigns = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sales_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setCampaigns(data as SalesCampaign[]);
  }, [user]);

  const loadCampaignPosts = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from("sales_posts")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("scheduled_day", { ascending: true });
    if (data) setActiveCampaignPosts(data as SalesPost[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCampaigns();
  }, [loadProducts, loadCampaigns]);

  const saveProduct = async (product: Omit<Product, "id" | "is_active" | "created_at">) => {
    if (!user) return { error: "Not authenticated", data: null };
    const { data, error } = await supabase
      .from("products")
      .insert({ ...product, user_id: user.id, is_active: true })
      .select()
      .single();
    if (!error) await loadProducts();
    return { data, error };
  };

  const generateCampaign = async (
    product: Product,
    profile: any,
    brandVoice: any,
    campaignDays: number = 14
  ) => {
    if (!user) return { error: "Not authenticated" };
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_sales_campaign",
          product: {
            name: product.product_name,
            description: product.product_description,
            targetAudience: product.target_audience,
            price: product.price,
            link: product.product_link,
            type: product.product_type,
            transformation: product.transformation,
            proof: product.proof,
          },
          niche: profile?.primary_niche || "",
          brandTone: profile?.brand_tone || "relatable",
          displayName: profile?.display_name || "",
          twitterHandle: profile?.twitter_handle || "",
          writingTraits: brandVoice?.writing_traits || [],
          signaturePhrases: brandVoice?.signature_phrases || [],
          contentStrategy: profile?.content_strategy || "",
          customSystemPrompt: profile?.custom_system_prompt || "",
          campaignDays,
        },
      });

      if (error) throw error;
      if (!data?.posts?.length) throw new Error("No posts returned");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + campaignDays);

      const { data: campaign, error: campError } = await supabase
        .from("sales_campaigns")
        .insert({
          user_id: user.id,
          product_id: product.id,
          campaign_name: `${product.product_name} — ${campaignDays}-Day Campaign`,
          status: "draft",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          total_posts: data.posts.length,
        })
        .select()
        .single();

      if (campError) throw campError;

      const postInserts = data.posts.map((post: any) => {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(scheduledDate.getDate() + (post.scheduled_day - 1));
        return {
          user_id: user.id,
          campaign_id: campaign.id,
          product_id: product.id,
          post_type: post.post_type,
          title: post.title || null,
          content: post.content || "Content generating...",
          thread_tweets: post.thread_tweets || null,
          scheduled_day: post.scheduled_day,
          scheduled_date: scheduledDate.toISOString().split("T")[0],
          status: "pending" as const,
          viral_score: post.viral_score || null,
          sell_intensity: post.sell_intensity || "soft",
          estimated_reach: post.estimated_reach || null,
        };
      });

      await supabase.from("sales_posts").insert(postInserts);
      await loadCampaigns();
      await loadCampaignPosts(campaign.id);
      return { error: null, campaign, count: postInserts.length };
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePostStatus = async (id: string, status: SalesPost["status"]) => {
    await supabase.from("sales_posts").update({ status }).eq("id", id);
    setActiveCampaignPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  return {
    products,
    campaigns,
    activeCampaignPosts,
    isLoading,
    isGenerating,
    saveProduct,
    generateCampaign,
    updatePostStatus,
    loadCampaignPosts,
    loadProducts,
  };
}
