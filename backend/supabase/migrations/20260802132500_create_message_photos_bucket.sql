-- Bucket privé pour les photos envoyées dans la messagerie. Convention de chemin :
-- <conversation_id>/<nom_de_fichier> — utilisée par les policies ci-dessous pour vérifier
-- que seuls les deux participants de la conversation peuvent uploader/consulter une photo.
insert into storage.buckets (id, name, public)
values ('message-photos', 'message-photos', false)
on conflict (id) do nothing;

create policy "participants can upload message photo"
  on storage.objects for insert
  with check (
    bucket_id = 'message-photos'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or c.aide_menagere_id = auth.uid())
    )
  );

create policy "participants can view message photo"
  on storage.objects for select
  using (
    bucket_id = 'message-photos'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or c.aide_menagere_id = auth.uid())
    )
  );
