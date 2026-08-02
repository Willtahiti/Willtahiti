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
- [x] Implémenter inscription/connexion aide-ménagère — web (`apps/web/app/aide-menagere/connexion/page.tsx`) et mobile (`apps/mobile/App.tsx`), trigger `handle_new_user` (migration `20260802122500_create_handle_new_user_trigger.sql`) qui crée la ligne `public.users` avec le rôle depuis les métadonnées d'inscription. Connexion live à Supabase non vérifiable dans ce sandbox (accès sortant bloqué) ; côté mobile, `expo start --web` est aussi bloqué par la politique réseau du sandbox (typecheck OK, rendu non vérifié visuellement) — à confirmer en local.
- [x] Implémenter inscription/connexion client — web (`apps/web/app/client/connexion/page.tsx`, formulaire factorisé dans `apps/web/app/_components/AuthForm.tsx`) et mobile (choix de rôle dans `apps/mobile/App.tsx` + `apps/mobile/components/AuthForm.tsx`), même trigger `handle_new_user` que pour l'aide-ménagère. Mêmes limites de vérification que la tâche précédente (accès réseau sortant bloqué dans ce sandbox).
- [x] Écrire les règles d'accès (un client ne voit que ses tâches/messages, une aide-ménagère ne voit que ceux qui lui sont assignés) — vérifié : les policies RLS déjà posées sur `taches` (migration `20260802121950`) donnent exactement cette règle (`client_id = auth.uid()` OU `aide_menagere_id = auth.uid()`, combinées en OR par Postgres) ; `users`/`societes`/`contrats` sont scopés sans fuite croisée. Aucune policy d'écriture n'existe encore nulle part (RLS activé + pas de policy = refus par défaut) — elles arriveront avec les tâches API. `messages` reste volontairement limité à l'expéditeur en attendant la table `conversations` (voir section Messagerie).

## Tâches

- [x] API : créer un contrat de test avec des tâches verrouillées pour un client donné — script `backend/supabase/seed/seed_test_contrat.sql` (connexion Postgres directe, bypass RLS), pris deux emails déjà inscrits (client + aide-ménagère) et crée société + contrat + 3 tâches verrouillées. Testé de bout en bout sur un Postgres 16 local dans ce sandbox (migrations + trigger + seed) — voir `backend/README.md`
- [ ] API : lister les tâches d'un client (verrouillées issues du contrat + libres)
- [x] API : le client ajoute une tâche libre (texte) — policy RLS `client can insert own free tache` (migration `20260802130400_taches_write_policies.sql`) : le client ne peut créer une tâche libre que pour une aide-ménagère avec qui il a déjà une relation. Testé contre 4 tentatives de contournement (aide-ménagère sans relation, fausse tâche verrouillée, usurpation de client_id) — toutes rejetées
- [ ] Écran web client : afficher les tâches verrouillées (non modifiables) et le formulaire d'ajout libre
- [ ] Écran mobile aide-ménagère : afficher la liste complète des tâches d'un client (verrouillées + libres), avec statut
- [x] API : l'aide-ménagère peut cocher une tâche comme faite — policy RLS `aide_menagere can update assigned tache` + trigger `taches_prevent_protected_update` qui interdit toute modification hors `statut` (même migration). Testé : aide-ménagère assignée peut changer le statut, une autre aide-ménagère non assignée ne peut rien modifier (0 ligne), une tentative de modifier la description échoue, le client ne peut pas changer le statut
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
