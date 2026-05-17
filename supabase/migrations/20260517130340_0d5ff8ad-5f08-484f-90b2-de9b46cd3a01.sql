
-- Enums
create type public.app_role as enum ('super_admin','admin','sales','delivery','customer');
create type public.account_type as enum ('customer','contractor','sales_rep');
create type public.quote_urgency as enum ('standard','priority','urgent');
create type public.quote_status as enum ('new','in_review','quoted','closed');
create type public.attachment_kind as enum ('image','video','audio');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  mobile text,
  company_name text,
  account_type public.account_type not null default 'customer',
  vat_number text,
  alt_contact text,
  default_delivery_address text,
  billing_address text,
  preferred_branch text,
  comm_method text,
  notes text,
  avatar_url text,
  loyalty_points integer not null default 0,
  status text not null default 'active',
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('super_admin','admin','sales','delivery')
  )
$$;

-- Auto profile + customer role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, mobile, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'company_name'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Quote requests
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  urgency public.quote_urgency not null default 'standard',
  site_address text,
  site_contact text,
  gps_lat double precision,
  gps_lng double precision,
  status public.quote_status not null default 'new',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.quote_requests enable row level security;

create table public.quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.attachment_kind not null,
  storage_path text not null,
  name text,
  size integer,
  duration_ms integer,
  created_at timestamptz not null default now()
);
alter table public.quote_attachments enable row level security;

-- RLS: profiles
create policy "Users view own profile" on public.profiles
for select using (auth.uid() = id);
create policy "Staff view all profiles" on public.profiles
for select using (public.is_staff(auth.uid()));
create policy "Users update own profile" on public.profiles
for update using (auth.uid() = id);
create policy "Super admin updates any profile" on public.profiles
for update using (public.has_role(auth.uid(),'super_admin'));

-- RLS: user_roles
create policy "Users view own roles" on public.user_roles
for select using (auth.uid() = user_id);
create policy "Staff view all roles" on public.user_roles
for select using (public.is_staff(auth.uid()));
create policy "Super admin manages roles insert" on public.user_roles
for insert with check (public.has_role(auth.uid(),'super_admin'));
create policy "Super admin manages roles update" on public.user_roles
for update using (public.has_role(auth.uid(),'super_admin'));
create policy "Super admin manages roles delete" on public.user_roles
for delete using (public.has_role(auth.uid(),'super_admin'));

-- RLS: quote_requests
create policy "Users view own quotes" on public.quote_requests
for select using (auth.uid() = user_id);
create policy "Staff view all quotes" on public.quote_requests
for select using (public.is_staff(auth.uid()));
create policy "Users create own quotes" on public.quote_requests
for insert with check (auth.uid() = user_id);
create policy "Staff update quotes" on public.quote_requests
for update using (public.is_staff(auth.uid()));

-- RLS: quote_attachments
create policy "Users view own attachments" on public.quote_attachments
for select using (auth.uid() = user_id);
create policy "Staff view all attachments" on public.quote_attachments
for select using (public.is_staff(auth.uid()));
create policy "Users insert own attachments" on public.quote_attachments
for insert with check (auth.uid() = user_id);

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('quote-media','quote-media', false)
on conflict (id) do nothing;

-- Storage policies: path prefix = auth.uid()
create policy "Users upload own quote media" on storage.objects
for insert with check (
  bucket_id = 'quote-media' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users read own quote media" on storage.objects
for select using (
  bucket_id = 'quote-media' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Staff read all quote media" on storage.objects
for select using (
  bucket_id = 'quote-media' and public.is_staff(auth.uid())
);
