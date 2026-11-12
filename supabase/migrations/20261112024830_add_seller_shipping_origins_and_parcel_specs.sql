-- Private ship-from address and parcel measurements for marketplace carrier quotes.
alter table public.listings
  add column parcel_weight_kg numeric(8,3) not null default 0.500,
  add column parcel_length_cm numeric(8,2) not null default 20,
  add column parcel_width_cm numeric(8,2) not null default 15,
  add column parcel_height_cm numeric(8,2) not null default 10;

alter table public.listings
  add constraint listings_parcel_weight_range
    check (parcel_weight_kg > 0 and parcel_weight_kg <= 70),
  add constraint listings_parcel_dimensions_range
    check (
      parcel_length_cm > 0 and parcel_length_cm <= 200
      and parcel_width_cm > 0 and parcel_width_cm <= 200
      and parcel_height_cm > 0 and parcel_height_cm <= 200
    );

create table public.seller_shipping_origins (
  seller_id uuid primary key references auth.users(id) on delete cascade,
  contact_name text not null,
  email text not null,
  phone text not null,
  street1 text not null,
  street2 text,
  city text not null,
  state text not null default '',
  postal_code text not null,
  country text not null,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seller_shipping_origins enable row level security;
revoke all on table public.seller_shipping_origins from anon;
grant select, insert, update, delete on table public.seller_shipping_origins to authenticated;

create policy "Sellers can read their private shipping origin"
  on public.seller_shipping_origins for select to authenticated
  using ((select auth.uid()) = seller_id);

create policy "Sellers can create their private shipping origin"
  on public.seller_shipping_origins for insert to authenticated
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can update their private shipping origin"
  on public.seller_shipping_origins for update to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can delete their private shipping origin"
  on public.seller_shipping_origins for delete to authenticated
  using ((select auth.uid()) = seller_id);
