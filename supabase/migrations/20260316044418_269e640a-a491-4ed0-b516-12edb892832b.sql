-- Products/Offers table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID,
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  price TEXT,
  product_link TEXT,
  product_type TEXT DEFAULT 'digital',
  transformation TEXT,
  proof TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own products" ON public.products
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sales campaigns table
CREATE TABLE IF NOT EXISTS public.sales_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  total_posts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.sales_campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sales content posts table
CREATE TABLE IF NOT EXISTS public.sales_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.sales_campaigns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  thread_tweets JSONB,
  scheduled_day INTEGER,
  scheduled_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  viral_score INTEGER,
  sell_intensity TEXT DEFAULT 'soft',
  estimated_reach TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sales posts" ON public.sales_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sales_posts_campaign
  ON public.sales_posts(campaign_id, scheduled_day);
CREATE INDEX IF NOT EXISTS idx_products_user
  ON public.products(user_id);