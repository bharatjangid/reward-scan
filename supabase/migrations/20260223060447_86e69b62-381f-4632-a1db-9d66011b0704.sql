
-- 1. Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.qr_status AS ENUM ('pending', 'redeemed', 'expired');
CREATE TYPE public.redemption_type AS ENUM ('store_pickup', 'delivery', 'bank_withdrawal');
CREATE TYPE public.redemption_status AS ENUM ('pending', 'approved', 'dispatched', 'completed', 'rejected');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.activity_type AS ENUM ('scan', 'redeem', 'withdraw', 'bonus', 'deduction');
CREATE TYPE public.user_status AS ENUM ('active', 'suspended');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  agent_code TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  status public.user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Agent codes table
CREATE TABLE public.agent_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. QR batches table
CREATE TABLE public.qr_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  points_per_code INTEGER NOT NULL,
  total_codes INTEGER NOT NULL,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. QR codes table
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  batch_id UUID REFERENCES public.qr_batches(id) ON DELETE CASCADE NOT NULL,
  status public.qr_status NOT NULL DEFAULT 'pending',
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_by_name TEXT,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Reward products table
CREATE TABLE public.reward_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '🎁',
  category TEXT NOT NULL DEFAULT 'General',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Redemptions table
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  type public.redemption_type NOT NULL,
  status public.redemption_status NOT NULL DEFAULT 'pending',
  store_address TEXT,
  store_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  points_used INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type public.activity_type NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Store locations table
CREATE TABLE public.store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 13. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone, name, agent_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'agent_code', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. RLS policies

-- user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- agent_codes
ALTER TABLE public.agent_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read agent codes for signup" ON public.agent_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage agent codes" ON public.agent_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- qr_batches
ALTER TABLE public.qr_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage qr_batches" ON public.qr_batches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- qr_codes
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read qr_codes" ON public.qr_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update qr_codes when scanning" ON public.qr_codes FOR UPDATE TO authenticated USING (status = 'pending');

-- reward_products
ALTER TABLE public.reward_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reward products" ON public.reward_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage reward products" ON public.reward_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- redemptions
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own redemptions" ON public.redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own redemptions" ON public.redemptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all redemptions" ON public.redemptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own withdrawals" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own activity" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all activity" ON public.activity_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- store_locations
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read store locations" ON public.store_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage store locations" ON public.store_locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 16. Seed reward products
INSERT INTO public.reward_products (name, description, points_cost, image, category, stock) VALUES
  ('Glass Bottle', 'Premium quality glass water bottle 500ml', 50, '🍶', 'Household', 150),
  ('Measurement Tape 5m', 'Professional 5 meter measurement tape', 200, '📏', 'Tools', 80),
  ('LED Flashlight', 'Rechargeable LED flashlight with 3 modes', 350, '🔦', 'Tools', 45),
  ('Stainless Steel Lunch Box', '3-compartment stainless steel tiffin box', 500, '🍱', 'Kitchen', 60),
  ('Sports Water Bottle', '1L BPA-free sports bottle with straw', 100, '🥤', 'Sports', 200),
  ('Tool Kit Set', '12-piece home tool kit with carrying case', 800, '🧰', 'Tools', 25),
  ('Umbrella', 'Compact folding umbrella, wind-resistant', 150, '☂️', 'Accessories', 100),
  ('Power Bank 10000mAh', 'Dual USB output portable charger', 1000, '🔋', 'Electronics', 30);

-- 17. Seed store locations
INSERT INTO public.store_locations (name, address, phone, lat, lng) VALUES
  ('Main Branch Store', '123 Main Market, Sector 22, Chandigarh 160022', '+91 172 270 0001', 30.7333, 76.7794),
  ('Station Road Store', '456 Station Road, Ludhiana 141001', '+91 161 240 0055', 30.9010, 75.8573),
  ('City Center Store', '789 Mall Road, Amritsar 143001', '+91 183 250 0088', 31.6340, 74.8723);
