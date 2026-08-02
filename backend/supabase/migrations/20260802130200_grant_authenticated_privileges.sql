-- Le cloud Supabase actuel n'expose plus automatiquement les nouvelles tables aux rôles
-- anon/authenticated (auto_expose_new_tables=false, voir supabase/config.toml). Sans GRANT
-- explicite, les policies RLS déjà posées sont inertes : la requête échoue en
-- "permission denied" avant même que RLS ne soit évaluée. `anon` n'a besoin de rien ici :
-- l'app n'a aucune fonctionnalité publique/anonyme (voir SPEC.md), et auth.uid() y est
-- toujours null donc aucune policy n'y matcherait de toute façon.
grant usage on schema public to authenticated;

grant select, update on public.users to authenticated;
grant select on public.societes to authenticated;
grant select on public.contrats to authenticated;
grant select on public.taches to authenticated;
grant select on public.messages to authenticated;
