# TODO.md — Jalon 1 : Fondations (comptes, tâches, messagerie)

Objectif du jalon : un aller-retour complet fonctionne — un client voit ses tâches (verrouillées + libres), une aide-ménagère les reçoit, et les deux peuvent échanger par message (texte + photo) — sur mobile et web.

## Setup

- [x] Initialiser le repo (structure web + mobile + backend managé), README minimal
- [x] Créer le projet backend managé (auth, base de données, storage) — projet Supabase hébergé créé, URL/clé anonyme fournies
- [x] Configurer l'environnement local (variables d'env, connexion au backend managé) — `.env.local`/`.env` renseignés (web et mobile) avec les valeurs du projet hébergé ; connexion live non vérifiable depuis le sandbox de dev (accès sortant à `supabase.co` bloqué par la politique réseau de l'environnement), à confirmer en local
- [x] Mettre en place le squelette web (Next.js) qui affiche une page de test connectée au backend
- [x] Mettre en place le squelette mobile (React Native) qui affiche un écran de test connecté au backend — squelette Expo (TypeScript) dans `apps/mobile`

## Modèle de données & auth

- [x] Créer la table `users` (rôle: aide_menagere / gerant / client) — migration `backend/supabase/migrations/20260802121601_create_users_table.sql`, RLS activé (chaque utilisateur voit/modifie sa propre ligne)
- [x] Créer la table `societes` — migration `backend/supabase/migrations/20260802121716_create_societes_table.sql`, FK `users.societe_id` ajoutée, RLS (visible par ses membres)
- [x] Créer la table `contrats` (societe_id, client_id, taches_incluses) — migration `backend/supabase/migrations/20260802121830_create_contrats_table.sql`, RLS (client voit les siens, société voit ceux de ses membres)
- [x] Créer la table `taches` (client_id, aide_menagere_id, contrat_id, description, statut, verrouillee) — migration `backend/supabase/migrations/20260802121950_create_taches_table.sql`, contrainte verrouillee/contrat_id, RLS (client + aide-ménagère assignée)
- [x] Créer la table `messages` (conversation_id, expediteur_id, contenu_texte, photo_url, horodatage) — migration `backend/supabase/migrations/20260802122055_create_messages_table.sql` ; `conversation_id` sans FK pour l'instant (table `conversations` à créer dans la tâche suivante), RLS limitée à l'expéditeur en attendant
- [ ] Implémenter inscription/connexion aide-ménagère — **web fait** (`apps/web/app/aide-menagere/connexion/page.tsx`), trigger `handle_new_user` (migration `20260802122500_create_handle_new_user_trigger.sql`) qui crée la ligne `public.users` avec le rôle depuis les métadonnées d'inscription ; connexion live à Supabase non vérifiable dans ce sandbox (accès sortant bloqué), à confirmer en local. **Mobile restant.**
- [ ] Implémenter inscription/connexion client
- [ ] Écrire les règles d'accès (un client ne voit que ses tâches/messages, une aide-ménagère ne voit que ceux qui lui sont assignés)

## Tâches

- [ ] API : créer un contrat de test avec des tâches verrouillées pour un client donné
- [ ] API : lister les tâches d'un client (verrouillées issues du contrat + libres)
- [ ] API : le client ajoute une tâche libre (texte)
- [ ] Écran web client : afficher les tâches verrouillées (non modifiables) et le formulaire d'ajout libre
- [ ] Écran mobile aide-ménagère : afficher la liste complète des tâches d'un client (verrouillées + libres), avec statut
- [ ] API : l'aide-ménagère peut cocher une tâche comme faite
- [ ] Test manuel bout en bout : créer un client avec contrat, ajouter une tâche libre, vérifier que l'aide-ménagère voit bien les deux types

## Messagerie

- [ ] Créer une conversation liée à une relation client ↔ aide-ménagère
- [ ] Envoi/réception de messages texte en temps réel (web)
- [ ] Envoi/réception de messages texte en temps réel (mobile)
- [ ] Upload et affichage d'une photo dans la conversation (web)
- [ ] Upload et affichage d'une photo dans la conversation (mobile)
- [ ] Test manuel bout en bout : un message texte + une photo envoyés côté client apparaissent côté aide-ménagère, et inversement

## Clôture du jalon

- [ ] Repasser sur les règles d'accès (aucune fuite de données entre clients/aides-ménagères différents)
- [ ] Vérifier que le parcours complet fonctionne sans bug bloquant sur web et mobile
- [ ] Mettre à jour SPEC.md et ARCHITECTURE.md si des écarts sont apparus pendant le développement
