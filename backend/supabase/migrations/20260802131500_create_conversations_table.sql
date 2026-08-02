create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id) on delete cascade,
  aide_menagere_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, aide_menagere_id)
);

alter table public.conversations enable row level security;

create policy "participants can view own conversation"
  on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = aide_menagere_id);

-- Comme pour les tâches libres : une conversation ne peut être créée qu'entre un client et une
-- aide-ménagère qui ont déjà une relation existante (au moins une tâche en commun).
create policy "client can create conversation with related aide_menagere"
  on public.conversations for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.taches t
      where t.client_id = auth.uid() and t.aide_menagere_id = conversations.aide_menagere_id
    )
  );

create policy "aide_menagere can create conversation with related client"
  on public.conversations for insert
  with check (
    auth.uid() = aide_menagere_id
    and exists (
      select 1 from public.taches t
      where t.aide_menagere_id = auth.uid() and t.client_id = conversations.client_id
    )
  );

grant select, insert on public.conversations to authenticated;

-- La table messages avait été créée sans FK vers conversations (qui n'existait pas encore) et
-- avec une RLS provisoire limitée à l'expéditeur (voir migration 20260802122055). On complète
-- les deux maintenant.
alter table public.messages
  add constraint messages_conversation_id_fkey
  foreign key (conversation_id) references public.conversations (id) on delete cascade;

drop policy "expediteur can view own messages" on public.messages;

create policy "participants can view conversation messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.aide_menagere_id = auth.uid())
    )
  );

create policy "participants can send message"
  on public.messages for insert
  with check (
    auth.uid() = expediteur_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.aide_menagere_id = auth.uid())
    )
  );

grant insert on public.messages to authenticated;
