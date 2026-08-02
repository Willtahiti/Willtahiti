-- Le client ajoute une tâche libre uniquement pour une aide-ménagère avec qui il a déjà une
-- relation existante (au moins une autre tâche en commun, typiquement issue d'un contrat) —
-- ça empêche un client d'assigner une tâche à une aide-ménagère arbitraire.
create policy "client can insert own free tache"
  on public.taches for insert
  with check (
    auth.uid() = client_id
    and not verrouillee
    and contrat_id is null
    and exists (
      select 1 from public.taches t
      where t.client_id = auth.uid()
        and t.aide_menagere_id = taches.aide_menagere_id
    )
  );

-- L'aide-ménagère peut modifier une tâche qui lui est assignée (en pratique : cocher le statut,
-- voir le trigger ci-dessous qui empêche toute autre modification).
create policy "aide_menagere can update assigned tache"
  on public.taches for update
  using (auth.uid() = aide_menagere_id)
  with check (auth.uid() = aide_menagere_id);

-- Filet de sécurité : même avec la policy d'update ci-dessus, seul le statut doit changer.
create or replace function public.taches_prevent_protected_update()
returns trigger
language plpgsql
as $$
begin
  if new.client_id is distinct from old.client_id
     or new.aide_menagere_id is distinct from old.aide_menagere_id
     or new.contrat_id is distinct from old.contrat_id
     or new.description is distinct from old.description
     or new.verrouillee is distinct from old.verrouillee
  then
    raise exception 'Seul le statut d''une tâche peut être modifié';
  end if;
  return new;
end;
$$;

create trigger taches_prevent_protected_update
  before update on public.taches
  for each row execute function public.taches_prevent_protected_update();

grant insert, update on public.taches to authenticated;
