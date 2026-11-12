create or replace function public.enforce_listing_content_policy()
returns trigger
language plpgsql
as $$
declare
  listing_content text;
begin
  listing_content := coalesce(new.category, '') || ' ' || coalesce(new.title, '') || ' ' || coalesce(new.description, '');

  if listing_content ~* '(^|[^[:alnum:]_])(armes?|munitions?|explosifs?|drogues?|stup[eé]fiants?|alcool|tabac|nicotine|jeux d''argent|paris (sportifs?|en ligne)|m[eé]dicaments? sur ordonnance|contrefa[cç]ons?)([^[:alnum:]_]|$)' then
    raise exception 'Cette annonce ne respecte pas les règles de publication GoWill.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_content_policy_check on public.listings;
create trigger listings_content_policy_check
before insert or update of title, description, category
on public.listings
for each row
execute function public.enforce_listing_content_policy();
