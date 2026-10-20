CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First account to sign up becomes the site admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  recognition text NOT NULL DEFAULT '',
  counseling text NOT NULL DEFAULT '',
  foundation_url text NOT NULL DEFAULT '',
  counseling_url text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.outreaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  stat text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','outreaches','programs','partners'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "admin insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE POLICY "admin update" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE POLICY "admin delete" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

INSERT INTO public.site_settings (id, name, tagline, intro, mission, about, recognition, counseling, foundation_url, counseling_url, contact_email) VALUES (1,
 'Melody Gaius Danjuma',
 'Social worker · Christian counselor · Humanitarian',
 'A passionate social worker, Christian counselor and humanitarian based in Taraba State, Nigeria.',
 'Reveal Jesus by feeding the people.',
 'Melody is the founder and Managing Director of the Melody Gaius Foundation, a faith-based charity dedicated to feeding the hungry, hosting children''s outreach programs and providing local community support. Her work blends physical charity with spiritual ministry and psychological support.',
 'Recognized by the Rhapsodi Affos Blog as one of Taraba''s Twenty Most Influential Youths for her extensive community and philanthropic outreach.',
 'Through Aviv Counseling (AVI), Melody focuses on family support and mental well-being.',
 '', '', '');

INSERT INTO public.outreaches (location, title, date_label, description, stat, sort_order) VALUES
 ('Taraba State', 'Where it began — Takum', 'Ongoing', 'As a native of Takum, Melody launched her earliest efforts here, providing direct meals and spiritual support to less-privileged individuals.', 'Hundreds fed', 1),
 ('Gombe State', 'Feed a Thousand Children', 'May 2026', 'With the Purpose Ignite Initiative, the foundation distributed raw food items and cooked meals across Gombe city.', '1,000+ children & families', 2),
 ('Adamawa State', 'Compassion for widows — Yola', '', 'A dedicated outreach providing relief items alongside prayer, counseling and emotional encouragement.', '60+ widows', 3);

INSERT INTO public.programs (title, description, sort_order) VALUES
 ('Targeted Aid', 'Partnering with local orphanages and vulnerable widows, offering consistent financial support to help rebuild failing local businesses.', 1),
 ('Teenage & Child Counselling', 'Emotional healing and mental health guidance sessions that help children and teenagers process silent trauma and build personal hope.', 2),
 ('Collaborative Interventions', 'Networking with regional NGOs to scale the reach of community interventions.', 3);

INSERT INTO public.partners (name, sort_order) VALUES
 ('Purpose Ignite Initiative', 1), ('Raising Women Initiative', 2), ('Magdalene Musa Foundation', 3);