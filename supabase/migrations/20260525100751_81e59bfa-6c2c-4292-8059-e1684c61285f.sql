
create table public.guest_quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  urgency quote_urgency not null default 'standard',
  status quote_status not null default 'new',
  site_address text,
  gps_lat double precision,
  gps_lng double precision,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.guest_quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.guest_quote_requests(id) on delete cascade,
  kind attachment_kind not null,
  storage_path text not null,
  name text,
  size integer,
  duration_ms integer,
  created_at timestamptz not null default now()
);

alter table public.guest_quote_requests enable row level security;
alter table public.guest_quote_attachments enable row level security;

create policy "Anyone can submit guest quotes"
  on public.guest_quote_requests for insert
  to anon, authenticated
  with check (true);

create policy "Staff view guest quotes"
  on public.guest_quote_requests for select
  using (public.is_staff(auth.uid()));

create policy "Staff update guest quotes"
  on public.guest_quote_requests for update
  using (public.is_staff(auth.uid()));

create policy "Anyone can attach files to guest quotes"
  on public.guest_quote_attachments for insert
  to anon, authenticated
  with check (true);

create policy "Staff view guest attachments"
  on public.guest_quote_attachments for select
  using (public.is_staff(auth.uid()));

insert into storage.buckets (id, name, public)
values ('guest-quote-media', 'guest-quote-media', false)
on conflict (id) do nothing;

create policy "Anyone can upload guest quote media"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'guest-quote-media');

create policy "Staff read guest quote media"
  on storage.objects for select
  using (bucket_id = 'guest-quote-media' and public.is_staff(auth.uid()));
