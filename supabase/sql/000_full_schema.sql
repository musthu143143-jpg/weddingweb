-- ============================================================================
-- Celebrates — complete Supabase schema
--
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (every statement is idempotent).
--
-- This creates EVERY table the application uses, matching src/db/schema.ts
-- exactly, so that pointing SUPABASE_DB_URL at this project moves templates,
-- accounts, orders, invitations, RSVPs and coupons onto Supabase.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- roles ----
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'reseller', 'admin');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------- profiles ----
-- `id` is TEXT to match the application schema (it stores the Supabase auth
-- user id). This keeps Drizzle and Supabase in sync.
create table if not exists public.profiles (
  id            text primary key,
  email         text not null,
  full_name     text,
  role          public.user_role not null default 'user',
  business_name text,
  phone         text,
  logo_url      text,
  created_at    timestamp not null default now(),
  updated_at    timestamp not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create a profile whenever someone signs up through Supabase Auth,
-- mirroring the metadata the app sends (full_name, requested_role, business_name).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, business_name)
  values (
    new.id::text,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when new.raw_user_meta_data ->> 'requested_role' = 'reseller'
         then 'reseller'::public.user_role else 'user'::public.user_role end,
    new.raw_user_meta_data ->> 'business_name'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------ templates ----
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tagline     text,
  description text,
  categories  jsonb not null default '[]'::jsonb,
  style       jsonb not null default '[]'::jsonb,
  price       integer not null,
  premium     boolean not null default false,
  image       text,
  image_alt   text,
  theme       jsonb not null,
  features    jsonb not null default '[]'::jsonb,
  sections    jsonb not null default '[]'::jsonb,
  opening     text,
  status      text not null default 'published',
  created_at  timestamp not null default now(),
  updated_at  timestamp not null default now()
);

drop trigger if exists set_templates_updated_at on public.templates;
create trigger set_templates_updated_at before update on public.templates
  for each row execute procedure public.set_updated_at();

-- --------------------------------------------------------------- orders ----
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_id    text,
  reseller_id    text,
  customer_email text not null,
  template_slug  text,
  plan           text not null default 'Signature',
  amount         integer not null default 0,
  status         text not null default 'pending',
  notes          text,
  created_at     timestamp not null default now(),
  updated_at     timestamp not null default now()
);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------------- coupons ----
-- Single-use codes: `code` is unique, and redemption stamps redeemed_at.
create table if not exists public.coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  description       text,
  discount_type     text not null default 'percent',
  discount_value    integer not null default 0,
  active            boolean not null default true,
  starts_at         timestamp not null default now(),
  expires_at        timestamp not null,
  redeemed_at       timestamp,
  redeemed_by       text,
  redeemed_order_id uuid,
  created_by        text,
  created_at        timestamp not null default now(),
  updated_at        timestamp not null default now()
);

drop trigger if exists set_coupons_updated_at on public.coupons;
create trigger set_coupons_updated_at before update on public.coupons
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------- invitations ----
create table if not exists public.invitations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      text,
  title         text not null default 'Our Wedding',
  template_slug text not null,
  data          jsonb,
  theme         jsonb,
  couple        jsonb,
  events        jsonb,
  story         jsonb,
  gallery       jsonb,
  published     boolean not null default false,
  unlocked_plan text,
  public_slug   text unique,
  created_at    timestamp not null default now(),
  updated_at    timestamp not null default now()
);

create index if not exists invitations_owner_id_idx on public.invitations (owner_id);

drop trigger if exists set_invitations_updated_at on public.invitations;
create trigger set_invitations_updated_at before update on public.invitations
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------- unlock keys ----
create table if not exists public.unlock_keys (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  plan               text not null default 'custom',
  template_slug      text,
  amount             integer not null default 0,
  status             text not null default 'available',
  used_by            text,
  used_invitation_id uuid,
  used_at            timestamp,
  note               text,
  created_by         text,
  created_at         timestamp not null default now(),
  updated_at         timestamp not null default now()
);

-- ---------------------------------------------------------------- rsvps ----
create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_name    text,
  guest_email   text,
  attending     boolean not null,
  guests        integer not null default 1,
  message       text,
  created_at    timestamp not null default now()
);

create index if not exists rsvps_invitation_id_idx on public.rsvps (invitation_id);

-- ==========================================================================
-- Row Level Security
--
-- The Next.js server connects as the Postgres owner (via SUPABASE_DB_URL) and
-- therefore bypasses RLS — authorization for those paths is enforced in the
-- application (adminAuth.ts / authGuard.ts, plus ownership checks in every
-- query). These policies protect the data if it is ever queried directly with
-- the anon/publishable key from a browser or Edge Function.
-- ==========================================================================

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid()::text and role = 'admin');
$$;

alter table public.profiles    enable row level security;
alter table public.templates   enable row level security;
alter table public.orders      enable row level security;
alter table public.coupons     enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps       enable row level security;

-- profiles: read/update your own row; admins see everything.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated
  using (id = auth.uid()::text or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid()::text or public.is_admin());

-- templates: published designs are public; only admins may write.
drop policy if exists "templates public read" on public.templates;
create policy "templates public read" on public.templates for select to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "templates admin write" on public.templates;
create policy "templates admin write" on public.templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders: customers see their own; admins manage all.
drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select to authenticated
  using (customer_id = auth.uid()::text or public.is_admin());

drop policy if exists "orders admin write" on public.orders;
create policy "orders admin write" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- coupons: admin-only. Redemption happens server-side.
drop policy if exists "coupons admin only" on public.coupons;
create policy "coupons admin only" on public.coupons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- invitations: owners manage their own; published ones are publicly readable.
drop policy if exists "invitations owner manage" on public.invitations;
create policy "invitations owner manage" on public.invitations for all to authenticated
  using (owner_id = auth.uid()::text or public.is_admin())
  with check (owner_id = auth.uid()::text or public.is_admin());

drop policy if exists "invitations public read" on public.invitations;
create policy "invitations public read" on public.invitations for select to anon, authenticated
  using (published = true);

-- rsvps: anyone may respond to a published invitation; only the owner reads them.
drop policy if exists "rsvps public insert" on public.rsvps;
create policy "rsvps public insert" on public.rsvps for insert to anon, authenticated
  with check (exists (select 1 from public.invitations i where i.id = invitation_id and i.published = true));

drop policy if exists "rsvps owner read" on public.rsvps;
create policy "rsvps owner read" on public.rsvps for select to authenticated
  using (exists (select 1 from public.invitations i
                 where i.id = invitation_id and i.owner_id = auth.uid()::text)
         or public.is_admin());

-- ------------------------------------------------------------- storage ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-media','invitation-media', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/gif','image/avif','audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/mp4','audio/x-m4a','audio/aac'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "invitation-media public read" on storage.objects;
create policy "invitation-media public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'invitation-media');

drop policy if exists "invitation-media owner upload" on storage.objects;
create policy "invitation-media owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'invitation-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "invitation-media owner update" on storage.objects;
create policy "invitation-media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'invitation-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "invitation-media owner delete" on storage.objects;
create policy "invitation-media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'invitation-media' and (storage.foldername(name))[1] = auth.uid()::text);
