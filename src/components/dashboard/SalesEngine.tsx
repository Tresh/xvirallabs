import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSalesEngine, POST_TYPE_CONFIG, Product, SalesPost } from "@/hooks/useSalesEngine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  ShoppingBag, Sparkles, Loader2, Plus, Copy,
  Check, X, ChevronDown, ChevronUp, ArrowRight,
  Calendar, TrendingUp, Zap, RefreshCw,
} from "lucide-react";

const PRODUCT_TYPES = ["digital", "course", "coaching", "service", "newsletter", "community", "physical"];

function ProductForm({ onSave, onCancel }: { onSave: (product: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    target_audience: "",
    price: "",
    product_link: "",
    product_type: "digital",
    transformation: "",
    proof: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Add Your Product or Offer</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Product Name *</label>
            <Input value={form.product_name} onChange={(e) => update("product_name", e.target.value)} placeholder="e.g. Web3 Mastery Course" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Price</label>
            <Input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="e.g. $97" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">What does it do? *</label>
          <Textarea value={form.product_description} onChange={(e) => update("product_description", e.target.value)} rows={2} placeholder="Describe your product..." />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Who is it for? *</label>
          <Input value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)} placeholder="e.g. Beginners looking to break into Web3" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">What transformation does it deliver?</label>
          <Input value={form.transformation} onChange={(e) => update("transformation", e.target.value)} placeholder="e.g. Go from 0 to earning $5K/month" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Social proof / results (optional)</label>
          <Textarea value={form.proof} onChange={(e) => update("proof", e.target.value)} rows={2} placeholder="e.g. 500+ students, 4.9/5 rating" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Product Link</label>
          <Input value={form.product_link} onChange={(e) => update("product_link", e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={form.product_type} onChange={(e) => update("product_type", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (!form.product_name || !form.product_description || !form.target_audience) {
                toast({ title: "Fill in the required fields", variant: "destructive" });
                return;
              }
              onSave(form);
            }}
          >
            <Check className="h-4 w-4 mr-1" /> Save Product
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesPostCard({
  post, onApprove, onSkip, onCopy,
}: {
  post: SalesPost;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onCopy: (content: string, type: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.soft_sell;
  const isThread = post.post_type === "value_thread" && Array.isArray(post.thread_tweets) && post.thread_tweets.length > 0;
  const isApproved = post.status === "approved";
  const isSkipped = post.status === "skipped";

  return (
    <Card className={isApproved ? "border-primary/40" : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px] pointer-events-none">Day {post.scheduled_day}</Badge>
          <Badge variant="outline" className="text-[10px] pointer-events-none">{config.label}</Badge>
          {post.viral_score && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 pointer-events-none">
              ⚡ {post.viral_score}
            </Badge>
          )}
          {post.scheduled_date && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {new Date(post.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {post.title && <h3 className="font-semibold text-sm">{post.title}</h3>}

        {isThread && post.thread_tweets ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Hook (1/{post.thread_tweets.length})</p>
            <p className="text-sm whitespace-pre-wrap">{post.thread_tweets[0]}</p>
            {post.thread_tweets.length > 1 && (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  {expanded ? "Hide thread" : `Show all ${post.thread_tweets.length} tweets`}
                </Button>
                {expanded && post.thread_tweets.slice(1).map((tweet, i) => (
                  <div key={i} className="rounded-md border border-border bg-secondary/40 p-2.5 text-sm">
                    <span className="text-[10px] text-muted-foreground">{i + 2}/{post.thread_tweets!.length}</span>
                    {i === post.thread_tweets!.length - 2 && <Badge variant="outline" className="text-[9px] ml-2">← CTA</Badge>}
                    <p className="mt-1">{tweet}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!isApproved && !isSkipped && (
            <>
              <Button size="sm" variant="viral" onClick={() => onApprove(post.id)} className="h-7 text-xs px-3">
                <Check className="h-3 w-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onSkip(post.id)} className="h-7 text-xs px-3 text-muted-foreground">
                <X className="h-3 w-3 mr-1" /> Skip
              </Button>
            </>
          )}
          {(isApproved || isSkipped) && <Badge variant="secondary">{post.status}</Badge>}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(isThread ? post.thread_tweets!.join("\n\n---\n\n") : post.content, config.label)}
            className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3 w-3 mr-1" /> Copy
          </Button>
          {isApproved && (
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent((isThread ? post.thread_tweets![0] : post.content).slice(0, 280))}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto"
            >
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Post to X <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesEngine() {
  const { profile, brandVoice } = useAuth();
  const {
    products, campaigns, activeCampaignPosts, isLoading, isGenerating,
    saveProduct, generateCampaign, updatePostStatus, loadCampaignPosts,
  } = useSalesEngine();
  const [view, setView] = useState<"products" | "campaign">("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDays, setCampaignDays] = useState(14);
  const [filterType, setFilterType] = useState<string>("all");

  const handleSaveProduct = async (productData: any) => {
    const result = await saveProduct(productData);
    if (result.error) {
      toast({ title: "Failed to save product", description: String(result.error), variant: "destructive" });
    } else {
      toast({ title: "Product saved!", description: "Now generate a sales campaign for it." });
      setShowProductForm(false);
    }
  };

  const handleGenerateCampaign = async (product: Product) => {
    if (!profile?.primary_niche) {
      toast({ title: "Set your niche in Memory first", variant: "destructive" });
      return;
    }
    setSelectedProduct(product);
    const result = await generateCampaign(product, profile, brandVoice, campaignDays);
    if (result?.error) {
      toast({ title: "Generation failed", description: result.error, variant: "destructive" });
    } else {
      toast({
        title: `${result?.count} sales posts ready!`,
        description: `${campaignDays}-day campaign for ${product.product_name}`,
      });
      setSelectedCampaignId(result?.campaign?.id);
      setView("campaign");
    }
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: `${type} copied!` });
  };

  const filtered = activeCampaignPosts.filter((p) =>
    filterType === "all" ? p.status !== "skipped" : p.post_type === filterType
  );

  if (products.length === 0 && !showProductForm) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center space-y-5 max-w-lg mx-auto">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Sales Engine</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Turn a product into a multi-day organic sales campaign. Value-first, no spam.
          </p>
        </div>
        <Button variant="viral" size="lg" onClick={() => setShowProductForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Your First Product
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Sales Engine</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant={view === "products" ? "default" : "outline"} onClick={() => setView("products")} className="h-8 text-xs">
          Products ({products.length})
        </Button>
        {selectedCampaignId && (
          <Button size="sm" variant={view === "campaign" ? "default" : "outline"} onClick={() => { setView("campaign"); loadCampaignPosts(selectedCampaignId); }} className="h-8 text-xs">
            Campaign Posts
          </Button>
        )}
      </div>

      {view === "products" && (
        <div className="space-y-3">
          {showProductForm && (
            <ProductForm onSave={handleSaveProduct} onCancel={() => setShowProductForm(false)} />
          )}

          {!showProductForm && (
            <Button size="sm" variant="outline" onClick={() => setShowProductForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          )}

          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{product.product_name}</h3>
                  <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">{product.product_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.product_description}</p>
                {product.transformation && (
                  <div className="text-xs">
                    <span className="font-medium text-primary">TRANSFORMATION</span>
                    <p className="text-muted-foreground">{product.transformation}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {[7, 14, 21].map((d) => (
                    <button
                      key={d}
                      onClick={() => setCampaignDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        campaignDays === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                  <Button size="sm" variant="viral" onClick={() => handleGenerateCampaign(product)} disabled={isGenerating} className="h-8 text-xs">
                    {isGenerating && selectedProduct?.id === product.id
                      ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Generating...</>
                      : <><Sparkles className="h-3 w-3 mr-1" /> Generate {campaignDays}-Day Campaign</>
                    }
                  </Button>
                </div>

                {campaigns.filter((c) => c.product_id === product.id).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-muted-foreground mr-1">Past campaigns</span>
                    {campaigns.filter((c) => c.product_id === product.id).map((camp) => (
                      <Button
                        key={camp.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => { loadCampaignPosts(camp.id); setSelectedCampaignId(camp.id); setView("campaign"); }}
                        className="text-[10px] bg-secondary hover:bg-secondary/80 px-2.5 py-1 h-auto"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {camp.campaign_name.slice(0, 30)}
                        <Badge variant="outline" className="text-[9px] ml-1">{camp.status}</Badge>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === "campaign" && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            {[
              { label: "Total", value: activeCampaignPosts.length, color: "text-foreground" },
              { label: "Pending", value: activeCampaignPosts.filter((p) => p.status === "pending").length, color: "text-primary" },
              { label: "Approved", value: activeCampaignPosts.filter((p) => p.status === "approved").length, color: "text-green-500" },
              { label: "Posted", value: activeCampaignPosts.filter((p) => p.status === "posted").length, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              All
            </button>
            {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? "all" : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post) => (
                <SalesPostCard
                  key={post.id}
                  post={post}
                  onApprove={(id) => updatePostStatus(id, "approved")}
                  onSkip={(id) => updatePostStatus(id, "skipped")}
                  onCopy={handleCopy}
                />
              ))}
              {filtered.length === 0 && (
                <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground text-center">No posts for this filter.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
