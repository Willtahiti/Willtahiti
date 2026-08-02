create type public.societe_palier as enum ('gratuit', 'pro', 'business');

create table public.societes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  palier public.societe_palier not null default 'gratuit',
  created_at timestamptz not null default now()
);

alter table public.users
  add constraint users_societe_id_fkey
  foreign key (societe_id) references public.societes (id) on delete set null;

alter table public.societes enable row level security;

-- Un utilisateur ne voit que la société dont il fait partie (gérant ou aide-ménagère rattaché).
-- Pas de policy d'écriture pour l'instant : la création/modification d'une société
-- sera couverte par la tâche d'inscription/connexion (voir TODO.md).
create policy "members can view own societe"
  on public.societes for select
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.societe_id = public.societes.id
    )
  );
