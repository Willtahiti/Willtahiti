-- Table de profils applicatifs, en complément de auth.users (géré par Supabase Auth).
create type public.user_role as enum ('aide_menagere', 'gerant', 'client');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  societe_id uuid null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Un utilisateur ne voit et ne modifie que sa propre ligne.
-- Les règles d'accès entre rôles (aide-ménagère / gérant / client) seront affinées
-- une fois les tables societes/contrats/taches en place (voir TODO.md).
create policy "users can view own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users can update own row"
  on public.users for update
  using (auth.uid() = id);
