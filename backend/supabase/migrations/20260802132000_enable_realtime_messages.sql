-- Autorise la réplication temps réel (Supabase Realtime) des nouveaux messages.
-- Sans ça, postgres_changes ne reçoit jamais rien : la RLS s'applique en plus,
-- indépendamment (le client ne recevra que les changements que ses policies lui permettent de lire).
alter publication supabase_realtime add table public.messages;
