create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_distinct_participants check (buyer_id <> seller_id),
  constraint conversations_one_buyer_per_listing unique (listing_id, buyer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists conversations_buyer_updated_idx on public.conversations (buyer_id, updated_at desc);
create index if not exists conversations_seller_updated_idx on public.conversations (seller_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

create policy "Participants can view conversations"
on public.conversations for select to authenticated
using ((select auth.uid()) in (buyer_id, seller_id));

create policy "Buyers can start conversations for active listings"
on public.conversations for insert to authenticated
with check (
  buyer_id = (select auth.uid())
  and buyer_id <> seller_id
  and exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.seller_id = seller_id
      and l.status = 'active'
  )
);

create policy "Participants can view conversation messages"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  )
);

create policy "Participants can send conversation messages"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  )
);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
