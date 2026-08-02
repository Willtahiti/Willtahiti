-- Crée un contrat de test avec des tâches verrouillées, pour un client et une
-- aide-ménagère existants (déjà inscrits via l'app). Bypasse la RLS car exécuté
-- via une connexion directe à Postgres (psql), pas via l'API PostgREST.
--
-- Usage (Supabase local, port/identifiants par défaut de `supabase start`) :
--   psql "postgresql://postgres:postgres@localhost:54322/postgres" \
--     -v client_email=client@example.com \
--     -v aide_menagere_email=aide-menagere@example.com \
--     -f backend/supabase/seed/seed_test_contrat.sql
--
-- Pour un projet hébergé, remplacer la chaîne de connexion par celle du
-- dashboard Supabase (Project Settings > Database).
--
-- Note technique : les variables psql (:'var') ne sont pas substituées à
-- l'intérieur d'un bloc `do $$ ... $$` (dollar-quoting = texte opaque pour
-- psql). On les passe donc en dehors, via set_config(), et on les relit avec
-- current_setting() dans le bloc plpgsql.

select set_config('willtahiti.seed_client_email', :'client_email', false);
select set_config('willtahiti.seed_aide_menagere_email', :'aide_menagere_email', false);

do $$
declare
  v_client_email text := current_setting('willtahiti.seed_client_email');
  v_aide_menagere_email text := current_setting('willtahiti.seed_aide_menagere_email');
  v_client_id uuid;
  v_aide_menagere_id uuid;
  v_societe_id uuid;
  v_contrat_id uuid;
  v_taches text[] := array[
    'Passer l''aspirateur au salon',
    'Faire la vaisselle',
    'Nettoyer la salle de bain'
  ];
  v_tache text;
begin
  select id into v_client_id from auth.users where email = v_client_email;
  select id into v_aide_menagere_id from auth.users where email = v_aide_menagere_email;

  if v_client_id is null then
    raise exception 'Aucun utilisateur avec l''email % (inscris-le d''abord via l''app)', v_client_email;
  end if;
  if v_aide_menagere_id is null then
    raise exception 'Aucun utilisateur avec l''email % (inscris-le d''abord via l''app)', v_aide_menagere_email;
  end if;

  insert into public.societes (nom) values ('Société de test') returning id into v_societe_id;
  update public.users set societe_id = v_societe_id where id = v_aide_menagere_id;

  insert into public.contrats (societe_id, client_id, taches_incluses)
  values (v_societe_id, v_client_id, v_taches)
  returning id into v_contrat_id;

  foreach v_tache in array v_taches loop
    insert into public.taches (client_id, aide_menagere_id, contrat_id, description, verrouillee)
    values (v_client_id, v_aide_menagere_id, v_contrat_id, v_tache, true);
  end loop;

  raise notice 'Contrat de test créé : % (société %)', v_contrat_id, v_societe_id;
end $$;
