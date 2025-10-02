-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'editor', 'reader');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create entities table
CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sites table (NEW - between entities and reports)
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('draft', 'in-progress', 'completed')) DEFAULT 'draft',
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_pages table
CREATE TABLE IF NOT EXISTS public.audit_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create criteria_results table
CREATE TABLE IF NOT EXISTS public.criteria_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.audit_pages(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  level TEXT CHECK (level IN ('A', 'AA', 'AAA')) NOT NULL,
  status TEXT CHECK (status IN ('compliant', 'non-compliant', 'not-applicable')) NOT NULL,
  observation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_entity_permissions table (for scope)
CREATE TABLE IF NOT EXISTS public.user_entity_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, entity_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entity_permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has access to entity
CREATE OR REPLACE FUNCTION public.has_entity_access(_user_id UUID, _entity_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_entity_permissions
    WHERE user_id = _user_id AND entity_id = _entity_id
  ) OR EXISTS (
    SELECT 1
    FROM public.entities
    WHERE id = _entity_id AND owner_id = _user_id
  ) OR public.has_role(_user_id, 'owner'::public.app_role)
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'owner' THEN 1
    WHEN 'editor' THEN 2
    WHEN 'reader' THEN 3
  END
  LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Owners can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'owner'::public.app_role));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'::public.app_role));

-- RLS Policies for entities
CREATE POLICY "Users can view entities they have access to" ON public.entities FOR SELECT USING (
  auth.uid() = owner_id OR 
  public.has_entity_access(auth.uid(), id)
);
CREATE POLICY "Authenticated users can create entities" ON public.entities FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners and editors can update entities" ON public.entities FOR UPDATE USING (
  auth.uid() = owner_id OR 
  (public.has_entity_access(auth.uid(), id) AND 
   (public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
);
CREATE POLICY "Owners can delete entities" ON public.entities FOR DELETE USING (
  auth.uid() = owner_id OR 
  (public.has_entity_access(auth.uid(), id) AND public.has_role(auth.uid(), 'owner'::public.app_role))
);

-- RLS Policies for sites
CREATE POLICY "Users can view sites of accessible entities" ON public.sites FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.entities e 
    WHERE e.id = sites.entity_id AND (e.owner_id = auth.uid() OR public.has_entity_access(auth.uid(), e.id))
  )
);
CREATE POLICY "Owners and editors can create sites" ON public.sites FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entities e 
    WHERE e.id = entity_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);
CREATE POLICY "Owners and editors can update sites" ON public.sites FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.entities e 
    WHERE e.id = entity_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);
CREATE POLICY "Owners and editors can delete sites" ON public.sites FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.entities e 
    WHERE e.id = entity_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);

-- RLS Policies for reports
CREATE POLICY "Users can view reports of accessible sites" ON public.reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sites s 
    JOIN public.entities e ON s.entity_id = e.id
    WHERE s.id = reports.site_id AND (e.owner_id = auth.uid() OR public.has_entity_access(auth.uid(), e.id))
  )
);
CREATE POLICY "Owners and editors can create reports" ON public.reports FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites s 
    JOIN public.entities e ON s.entity_id = e.id
    WHERE s.id = site_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);
CREATE POLICY "Owners and editors can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sites s 
    JOIN public.entities e ON s.entity_id = e.id
    WHERE s.id = site_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);
CREATE POLICY "Owners and editors can delete reports" ON public.reports FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.sites s 
    JOIN public.entities e ON s.entity_id = e.id
    WHERE s.id = site_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);

-- RLS Policies for audit_pages
CREATE POLICY "Users can view audit pages of accessible reports" ON public.audit_pages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.sites s ON r.site_id = s.id
    JOIN public.entities e ON s.entity_id = e.id
    WHERE r.id = audit_pages.report_id AND (e.owner_id = auth.uid() OR public.has_entity_access(auth.uid(), e.id))
  )
);
CREATE POLICY "Owners and editors can manage audit pages" ON public.audit_pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.sites s ON r.site_id = s.id
    JOIN public.entities e ON s.entity_id = e.id
    WHERE r.id = report_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);

-- RLS Policies for criteria_results
CREATE POLICY "Users can view criteria results of accessible pages" ON public.criteria_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.audit_pages ap
    JOIN public.reports r ON ap.report_id = r.id
    JOIN public.sites s ON r.site_id = s.id
    JOIN public.entities e ON s.entity_id = e.id
    WHERE ap.id = criteria_results.page_id AND (e.owner_id = auth.uid() OR public.has_entity_access(auth.uid(), e.id))
  )
);
CREATE POLICY "Owners and editors can manage criteria results" ON public.criteria_results FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.audit_pages ap
    JOIN public.reports r ON ap.report_id = r.id
    JOIN public.sites s ON r.site_id = s.id
    JOIN public.entities e ON s.entity_id = e.id
    WHERE ap.id = page_id AND (e.owner_id = auth.uid() OR 
      (public.has_entity_access(auth.uid(), e.id) AND 
       public.get_user_role(auth.uid()) IN ('owner'::public.app_role, 'editor'::public.app_role)))
  )
);

-- RLS Policies for user_entity_permissions
CREATE POLICY "Owners can view all permissions" ON public.user_entity_permissions FOR SELECT USING (
  public.has_role(auth.uid(), 'owner'::public.app_role) OR
  EXISTS (SELECT 1 FROM public.entities WHERE id = entity_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can manage permissions" ON public.user_entity_permissions FOR ALL USING (
  public.has_role(auth.uid(), 'owner'::public.app_role) OR
  EXISTS (SELECT 1 FROM public.entities WHERE id = entity_id AND owner_id = auth.uid())
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();