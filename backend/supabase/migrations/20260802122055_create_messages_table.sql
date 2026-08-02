create table public.messages (
  id uuid primary key default gen_random_uuid(),
  -- Pas de FK vers une table conversations pour l'instant : elle sera créée dans la
  -- tâche suivante du TODO ("Créer une conversation liée à une relation client ↔ aide-ménagère").
  conversation_id uuid not null,
  expediteur_id uuid not null references public.users (id) on delete cascade,
  contenu_texte text null,
  photo_url text null,
  horodatage timestamptz not null default now(),
  constraint messages_contenu_check check (contenu_texte is not null or photo_url is not null)
);

alter table public.messages enable row level security;

-- RLS minimale pour l'instant : l'expéditeur voit ses propres messages. La visibilité pour
-- le destinataire (l'autre partie de la conversation) sera ajoutée avec la table
-- conversations et ses participants (tâche suivante du TODO).
create policy "expediteur can view own messages"
  on public.messages for select
  using (auth.uid() = expediteur_id);
