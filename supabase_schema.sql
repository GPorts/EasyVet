-- Clinics Table
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tutors Table
CREATE TABLE public.tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  cpf text,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pets Table
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  "tutorId" uuid REFERENCES public.tutors(id) ON DELETE SET NULL,
  "tutorName" text,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age text,
  weight text,
  "photoUrl" text,
  vaccines jsonb DEFAULT '[]'::jsonb,
  "medicalRecords" jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments Table
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  "petId" uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  "petName" text,
  "tutorId" uuid REFERENCES public.tutors(id) ON DELETE SET NULL,
  "tutorName" text,
  "tutorPhone" text,
  date text NOT NULL,
  time text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  source text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  "currentQty" integer DEFAULT 0,
  "minStock" integer DEFAULT 0,
  price numeric DEFAULT 0,
  "expirationDate" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Clinics Policies
CREATE POLICY "Clinics are readable by owner" ON public.clinics FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Clinics are publicly readable by slug for booking" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Clinics can be created by owner" ON public.clinics FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Clinics can be updated by owner" ON public.clinics FOR UPDATE USING (auth.uid() = id);

-- Tutors Policies
CREATE POLICY "Tutors are visible to clinic owner" ON public.tutors FOR ALL USING (auth.uid() = clinic_id);

-- Pets Policies
CREATE POLICY "Pets are visible to clinic owner" ON public.pets FOR ALL USING (auth.uid() = clinic_id);

-- Products Policies
CREATE POLICY "Products are visible to clinic owner" ON public.products FOR ALL USING (auth.uid() = clinic_id);

-- Appointments Policies
CREATE POLICY "Appointments are visible to clinic owner" ON public.appointments FOR ALL USING (auth.uid() = clinic_id);
CREATE POLICY "Public can insert pending appointments" ON public.appointments FOR INSERT WITH CHECK (status = 'pending' AND source = 'public');

-- Storage Bucket setup
insert into storage.buckets (id, name, public) values ('clinics_storage', 'clinics_storage', true)
ON CONFLICT (id) DO NOTHING;

create policy "Files are publically accessible" on storage.objects for select using ( bucket_id = 'clinics_storage' );
create policy "Clinic owners can upload files" on storage.objects for insert with check ( bucket_id = 'clinics_storage' and (auth.uid())::text = (string_to_array(name, '/'))[2] );
create policy "Clinic owners can delete files" on storage.objects for delete using ( bucket_id = 'clinics_storage' and (auth.uid())::text = (string_to_array(name, '/'))[2] );
