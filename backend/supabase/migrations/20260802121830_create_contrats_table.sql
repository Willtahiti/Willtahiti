create table public.contrats (
  id uuid primary key default gen_random_uuid(),
  societe_id uuid not null references public.societes (id) on delete cascade,
  client_id uuid not null references public.users (id) on delete cascade,
  taches_incluses text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.contrats enable row level security;

-- Le client voit ses propres contrats ; les membres de la société (gérant, aide-ménagère)
-- voient les contrats de leur société. Pas de policy d'écriture pour l'instant : la création
-- d'un contrat sera couverte par la tâche "API : créer un contrat de test" (voir TODO.md).
create policy "client can view own contrat"
  on public.contrats for select
  using (auth.uid() = client_id);

create policy "societe members can view contrat"
  on public.contrats for select
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.societe_id = public.contrats.societe_id
    )
  );
