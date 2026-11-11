-- Public listing photos, with upload/delete restricted to each authenticated seller's folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view GoWill listing images" on storage.objects;
create policy "Public can view GoWill listing images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'listing-images');

drop policy if exists "Members upload their own GoWill listing images" on storage.objects;
create policy "Members upload their own GoWill listing images"
on storage.objects for insert to authenticated
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members update their own GoWill listing images" on storage.objects;
create policy "Members update their own GoWill listing images"
on storage.objects for update to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members delete their own GoWill listing images" on storage.objects;
create policy "Members delete their own GoWill listing images"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
