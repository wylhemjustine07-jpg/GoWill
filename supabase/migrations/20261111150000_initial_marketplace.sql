-- GoWill initial marketplace schema
-- Applied to Supabase project ltvbbmazvgvgaujswtux on 2026-11-11.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 5000),
  price numeric(12,2) not null check (price >= 0),
  category text not null,
  item_condition text not null default 'good',
  location text,
  image_urls text[] not null default '{}',
  status text not null default 'active' check (status in ('draft','active','sold','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index if not exists listings_status_created_idx on public.listings(status, created_at desc);
create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists favorites_user_idx on public.favorites(user_id);
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Active listings are public" on public.listings;
create policy "Active listings are public" on public.listings for select to anon, authenticated using (status = 'active' or (select auth.uid()) = seller_id);
drop policy if exists "Authenticated users can publish listings" on public.listings;
create policy "Authenticated users can publish listings" on public.listings for insert to authenticated with check ((select auth.uid()) = seller_id);
drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings" on public.listings for update to authenticated using ((select auth.uid()) = seller_id) with check ((select auth.uid()) = seller_id);
drop policy if exists "Sellers can delete own listings" on public.listings;
create policy "Sellers can delete own listings" on public.listings for delete to authenticated using ((select auth.uid()) = seller_id);
drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select on public.profiles, public.listings to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
