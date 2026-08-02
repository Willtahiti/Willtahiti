# CLAUDE.md

## Projet
Application de mise en relation pour sociétés de ménage (mobile + web). Trois profils : aide-ménagère (priorité v1), gérant, client. Voir SPEC.md pour le détail du besoin et ARCHITECTURE.md pour l'architecture technique complète. Ne pas s'écarter de ces deux fichiers sans me le signaler explicitement.

## Avancement
Le détail des tâches à faire se trouve dans TODO.md, organisé par jalon. Toujours travailler sur une seule tâche non cochée à la fois, dans l'ordre du fichier, sauf si je précise le contraire.

## Stack
- Web : Next.js
- Mobile : React Native
- Backend : solution managée type Supabase (Postgres + auth + realtime + storage)
- Composants scraping produits et pipeline tutoriels DIY : services séparés, conteneurisés, appelés via une passerelle API — jamais d'accès direct à la base de données managée depuis ces services

## Ne pas faire
- Ne pas ajouter de dépendance ou de service externe sans demander
- Ne pas implémenter le module planning/facturation (hors périmètre v1, voir SPEC.md)
- Ne pas construire le pipeline vidéo IA des tutoriels (v2, voir SPEC.md) sauf demande explicite

## Workflow
- Avant toute modification touchant plusieurs fichiers, présenter le plan d'implémentation et attendre validation
- Une tâche du TODO = une session ou un commit, pas plus
- Une fois une tâche terminée, indiquer comment la tester manuellement
