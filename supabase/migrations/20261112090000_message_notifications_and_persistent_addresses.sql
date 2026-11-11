-- GoWill unread message tracking and persistent member addresses.
alter table public.messages add column if not exists read_at timestamptz;
grant update (read_at) on public.messages to authenticated;

drop policy if exists "Participants can mark received messages as read" on public.messages;
create policy "Participants can mark received messages as read"
on public.messages for update to authenticated
using (
  sender_id <> (select auth.uid())
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  )
)
with check (
  sender_id <> (select auth.uid())
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  )
);

drop policy if exists "Buyers can start conversations for active listings" on public.conversations;
create policy "Buyers can start conversations for active listings"
on public.conversations for insert to authenticated
with check (
  buyer_id = (select auth.uid())
  and buyer_id <> seller_id
  and exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.seller_id = conversations.seller_id
      and l.status = 'active'
  )
);

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'shipping' check (type in ('shipping','billing')),
  first_name text not null,
  last_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null default '',
  postal_code text not null,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_addresses_user_idx on public.user_addresses(user_id, created_at desc);
alter table public.user_addresses enable row level security;
revoke all on table public.user_addresses from anon;
grant select, insert, update, delete on public.user_addresses to authenticated;

drop policy if exists "Users can view own addresses" on public.user_addresses;
create policy "Users can view own addresses" on public.user_addresses
for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own addresses" on public.user_addresses;
create policy "Users can insert own addresses" on public.user_addresses
for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own addresses" on public.user_addresses;
create policy "Users can update own addresses" on public.user_addresses
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own addresses" on public.user_addresses;
create policy "Users can delete own addresses" on public.user_addresses
for delete to authenticated using ((select auth.uid()) = user_id);
