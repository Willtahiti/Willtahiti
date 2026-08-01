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
  mobile/   # Interface mobile (React Native) — squelette à venir
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

## Variables d'environnement

Chaque app a un `.env.example` documentant les variables Supabase attendues (`apps/web/.env.example`, `apps/mobile/.env.example`). Copier vers `.env.local` (web) ou `.env` (mobile) et remplir avec les valeurs du projet Supabase (local via `supabase start`, ou celui du dashboard une fois le projet hébergé créé — voir `backend/README.md`).

## Stack

- Web : Next.js
- Mobile : React Native
- Backend : solution managée type Supabase (Postgres + auth + realtime + storage)
- Scraping produits et pipeline tutoriels DIY : services séparés sur infra personnelle (homelab → Kubernetes), appelés via une passerelle API
