-- Add seller-defined shipping terms to marketplace listings.
-- Existing rows remain valid with a zero-cost default; sellers can update their estimate.
alter table public.listings
  add column shipping_fee_amount numeric(12,2) not null default 0,
  add column shipping_fee_payer text not null default 'buyer',
  add column ships_internationally boolean not null default true;

alter table public.listings
  add constraint listings_shipping_fee_amount_nonnegative
    check (shipping_fee_amount >= 0),
  add constraint listings_shipping_fee_payer_valid
    check (shipping_fee_payer in ('buyer', 'seller', 'split'));
