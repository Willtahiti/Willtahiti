# Backend managé (Supabase)

Ce dossier contient la configuration du projet Supabase (auth, base de données Postgres, storage, realtime).

## État actuel

Le projet Supabase **local** est initialisé (`supabase/config.toml`). Aucun projet **hébergé** (cloud) n'est encore lié — cette étape nécessite un compte Supabase.

## Développement local

Prérequis : [Docker](https://docs.docker.com/get-docker/) et la [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
cd backend
npx supabase start
```

Cela lance Postgres, l'API, l'auth et le storage en local, et affiche les clés (`anon key`, `service_role key`) et l'URL de l'API à utiliser dans les fichiers `.env.local` du web et du mobile.

## Lier un projet hébergé (cloud)

À faire une fois un compte Supabase créé :

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

`<project-ref>` et les clés API sont à récupérer dans le dashboard Supabase du projet, et ne doivent jamais être commités (voir `.gitignore` à la racine).

## Migrations

Les migrations SQL vivent dans `supabase/migrations/` (créées via `npx supabase migration new <nom>`).

- `20260802121601_create_users_table.sql` — table `users` (profil applicatif lié à `auth.users`, rôle aide_menagere/gerant/client)
- `20260802121716_create_societes_table.sql` — table `societes` (nom, palier gratuit/pro/business), FK depuis `users.societe_id`
- `20260802121830_create_contrats_table.sql` — table `contrats` (societe_id, client_id, taches_incluses[])
- `20260802121950_create_taches_table.sql` — table `taches` (client_id, aide_menagere_id, contrat_id, description, statut, verrouillee)
- `20260802122055_create_messages_table.sql` — table `messages` (conversation_id, expediteur_id, contenu_texte, photo_url, horodatage) ; `conversation_id` sans FK en attendant la table `conversations`
- `20260802122500_create_handle_new_user_trigger.sql` — trigger sur `auth.users` qui crée automatiquement la ligne `public.users` avec le rôle passé dans les métadonnées d'inscription

Toutes les tables du modèle simplifié (voir ARCHITECTURE.md) sont créées, ainsi que les règles d'accès (RLS) de base et l'auth aide-ménagère/client. La suite du TODO porte sur les API tâches et la messagerie temps réel.

## Seed de test

`supabase/seed/seed_test_contrat.sql` crée un contrat avec des tâches verrouillées pour un
client et une aide-ménagère déjà inscrits (via l'app web ou mobile). Contourne volontairement
la RLS en se connectant directement à Postgres (pas via l'API PostgREST) :

```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -v client_email=client@example.com \
  -v aide_menagere_email=aide-menagere@example.com \
  -f backend/supabase/seed/seed_test_contrat.sql
```

(chaîne de connexion par défaut pour `supabase start` en local ; à remplacer par celle du
projet hébergé sinon — dashboard Supabase > Project Settings > Database). Testé de bout en
bout sur une instance Postgres 16 locale (hors stack Supabase) dans ce sandbox : les migrations
s'appliquent proprement et le script crée bien la société, le contrat et les 3 tâches
verrouillées attendues.
