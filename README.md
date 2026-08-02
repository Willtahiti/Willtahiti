# Willtahiti

Application de mise en relation pour sociétés de ménage (mobile + web). Trois profils : aide-ménagère (priorité v1), gérant, client.

- Le besoin détaillé est dans [SPEC.md](./SPEC.md)
- L'architecture technique est dans [ARCHITECTURE.md](./ARCHITECTURE.md)
- L'avancement, jalon par jalon, est dans [TODO.md](./TODO.md)
- Les règles de développement pour ce projet sont dans [CLAUDE.md](./CLAUDE.md)

## Structure du repo

```
apps/
  web/      # Interface web (Next.js, App Router, TypeScript)
  mobile/   # Interface mobile (Expo, React Native, TypeScript)
backend/    # Backend managé (type Supabase) : config, migrations, fonctions
```

## Lancer le web en local

```bash
cd apps/web
npm install
cp .env.example .env.local   # puis renseigner les valeurs Supabase
npm run dev
```

La page d'accueil affiche le statut de connexion au backend Supabase.

## Lancer le mobile en local

```bash
cd apps/mobile
npm install
cp .env.example .env   # puis renseigner les valeurs Supabase
npm start
```

L'écran d'accueil affiche le statut de connexion au backend Supabase.

## Variables d'environnement

Chaque app a un `.env.example` documentant les variables Supabase attendues (`apps/web/.env.example` avec le préfixe `NEXT_PUBLIC_`, `apps/mobile/.env.example` avec le préfixe `EXPO_PUBLIC_`). Copier vers `.env.local` (web) ou `.env` (mobile) et remplir avec les valeurs du projet Supabase hébergé (dashboard Supabase, voir `backend/README.md`).

## Stack

- Web : Next.js
- Mobile : React Native
- Backend : solution managée type Supabase (Postgres + auth + realtime + storage)
- Scraping produits et pipeline tutoriels DIY : services séparés sur infra personnelle (homelab → Kubernetes), appelés via une passerelle API
