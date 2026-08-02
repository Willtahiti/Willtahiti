create type public.tache_statut as enum ('a_faire', 'faite');

create table public.taches (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id) on delete cascade,
  aide_menagere_id uuid not null references public.users (id) on delete cascade,
  contrat_id uuid null references public.contrats (id) on delete cascade,
  description text not null,
  statut public.tache_statut not null default 'a_faire',
  verrouillee boolean not null default false,
  created_at timestamptz not null default now(),
  -- Une tâche verrouillée vient toujours d'un contrat ; une tâche libre n'en a jamais (voir ARCHITECTURE.md).
  constraint taches_verrouillee_contrat_check check (
    (verrouillee and contrat_id is not null) or (not verrouillee and contrat_id is null)
  )
);

alter table public.taches enable row level security;

-- Le client voit ses propres tâches, l'aide-ménagère voit celles qui lui sont assignées.
-- Pas de policy d'écriture pour l'instant : couverte par les tâches "API" suivantes du TODO.
create policy "client can view own taches"
  on public.taches for select
  using (auth.uid() = client_id);

create policy "aide_menagere can view assigned taches"
  on public.taches for select
  using (auth.uid() = aide_menagere_id);
