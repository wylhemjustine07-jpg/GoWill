drop trigger if exists messages_touch_conversation on public.messages;
drop function if exists public.touch_conversation_updated_at();
create schema if not exists private;
create or replace function private.touch_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() <> new.sender_id then
    raise exception 'Not authorized to update this conversation';
  end if;
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id
    and (buyer_id = auth.uid() or seller_id = auth.uid());
  return new;
end;
$$;
create trigger messages_touch_conversation
after insert on public.messages
for each row execute function private.touch_conversation_updated_at();
