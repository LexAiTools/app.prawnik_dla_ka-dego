-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create lawyers table
CREATE TABLE IF NOT EXISTS public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  hourly_rate INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Lawyers policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lawyers' AND policyname = 'Anyone can view lawyers') THEN
    CREATE POLICY "Anyone can view lawyers"
      ON public.lawyers FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lawyers' AND policyname = 'Admins can insert lawyers') THEN
    CREATE POLICY "Admins can insert lawyers"
      ON public.lawyers FOR INSERT
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lawyers' AND policyname = 'Admins can update lawyers') THEN
    CREATE POLICY "Admins can update lawyers"
      ON public.lawyers FOR UPDATE
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lawyers' AND policyname = 'Admins can delete lawyers') THEN
    CREATE POLICY "Admins can delete lawyers"
      ON public.lawyers FOR DELETE
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Create token_packages table
CREATE TABLE IF NOT EXISTS public.token_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;

-- Token packages policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'token_packages' AND policyname = 'Anyone can view active packages') THEN
    CREATE POLICY "Anyone can view active packages"
      ON public.token_packages FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'token_packages' AND policyname = 'Admins can insert packages') THEN
    CREATE POLICY "Admins can insert packages"
      ON public.token_packages FOR INSERT
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'token_packages' AND policyname = 'Admins can update packages') THEN
    CREATE POLICY "Admins can update packages"
      ON public.token_packages FOR UPDATE
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'token_packages' AND policyname = 'Admins can delete packages') THEN
    CREATE POLICY "Admins can delete packages"
      ON public.token_packages FOR DELETE
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.token_packages(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments') THEN
    CREATE POLICY "Users can view their own payments"
      ON public.payments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can view all payments') THEN
    CREATE POLICY "Admins can view all payments"
      ON public.payments FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can insert their own payments') THEN
    CREATE POLICY "Users can insert their own payments"
      ON public.payments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone_number, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample lawyers (only if table is empty)
INSERT INTO public.lawyers (full_name, specialization, description, hourly_rate, is_available)
SELECT 'Anna Kowalska', 'Prawo rodzinne', 'Specjalistka z 10-letnim doświadczeniem w sprawach rozwodowych i alimentacyjnych', 350, true
WHERE NOT EXISTS (SELECT 1 FROM public.lawyers LIMIT 1);

INSERT INTO public.lawyers (full_name, specialization, description, hourly_rate, is_available)
SELECT 'Jan Nowak', 'Prawo karne', 'Były prokurator, obecnie adwokat specjalizujący się w obronie w sprawach karnych', 400, true
WHERE NOT EXISTS (SELECT 1 FROM public.lawyers WHERE full_name = 'Jan Nowak');

INSERT INTO public.lawyers (full_name, specialization, description, hourly_rate, is_available)
SELECT 'Maria Wiśniewska', 'Prawo pracy', 'Ekspertka w zakresie sporów pracowniczych i umów o pracę', 300, true
WHERE NOT EXISTS (SELECT 1 FROM public.lawyers WHERE full_name = 'Maria Wiśniewska');

-- Insert sample token packages (only if table is empty)
INSERT INTO public.token_packages (name, tokens, price, description, is_active)
SELECT 'Pakiet Starter', 100, 29.99, 'Idealny na początek - 100 tokenów dla podstawowych konsultacji', true
WHERE NOT EXISTS (SELECT 1 FROM public.token_packages LIMIT 1);

INSERT INTO public.token_packages (name, tokens, price, description, is_active)
SELECT 'Pakiet Standard', 500, 129.99, 'Najczęściej wybierany - 500 tokenów z rabatem 13%', true
WHERE NOT EXISTS (SELECT 1 FROM public.token_packages WHERE name = 'Pakiet Standard');

INSERT INTO public.token_packages (name, tokens, price, description, is_active)
SELECT 'Pakiet Premium', 1000, 229.99, 'Najlepsza wartość - 1000 tokenów z rabatem 23%', true
WHERE NOT EXISTS (SELECT 1 FROM public.token_packages WHERE name = 'Pakiet Premium');