alter table public.listings
  add column shipping_origin_country_code text;

alter table public.listings
  add constraint listings_shipping_origin_country_code_valid
  check (
    shipping_origin_country_code is null
    or shipping_origin_country_code ~ '^[A-Z]{2}$'
  );
