# ARCHITECTURE.md — Application de mise en relation pour sociétés de ménage

Architecture retenue : **hybride**. Le cœur sensible (comptes, données clients, messagerie) tourne sur du managé fiable. Les composants IA/scraping, moins critiques, tournent sur l'infra personnelle (homelab → Kubernetes), qui sert aussi de terrain d'apprentissage.

## Composants

| Composant | Rôle | Hébergement |
|---|---|---|
| Web app | Interface client/gérant/aide-ménagère sur navigateur | Cloud managé (Vercel ou équivalent) |
| App mobile | Interface aide-ménagère/client sur iOS/Android | Store (app), backend partagé |
| Backend managé (type Supabase) | Auth, base de données (Postgres), messagerie temps réel, stockage des photos | Cloud managé |
| Service de scraping produits | Interroge/agrège des sources produits (labels type Yuka, Ecocert) et pousse les recommandations vers le backend managé | Homelab → Kubernetes |
| Pipeline tutoriels DIY | Transcrit du contenu source, génère texte + vidéo via IA, publie dans le backend managé | Homelab → Kubernetes |
| Passerelle API | Point d'entrée unique et authentifié entre l'infra perso et le backend managé | Homelab |

Le web et le mobile partagent la même logique métier (stack JS/TS commune : Next.js pour le web, React Native pour le mobile).

## Flux de données

1. **Comptes & tâches** : l'aide-ménagère et le client s'authentifient via le backend managé. Le client crée des tâches (liste prédéfinie + texte libre), stockées directement en base managée.
2. **Messagerie** : texte et photos transitent en temps réel via le backend managé (aucun passage par le homelab — c'est la partie la plus sensible et la plus critique en disponibilité).
3. **Demande de produits** : l'aide-ménagère envoie une demande, stockée en base managée. Cette demande déclenche un appel à la passerelle API vers le service de scraping (homelab), qui renvoie une liste de produits recommandés, réinjectée en base managée pour affichage au client.
4. **Tutoriels DIY** : pipeline asynchrone, non déclenché en temps réel par un utilisateur. Le service tourne sur le homelab, génère le contenu, et le publie dans le backend managé via la passerelle API pour être consultable dans l'app.
5. **Preuve de prestation** (palier Pro) : photos avant/après horodatées, stockées directement dans le backend managé (données sensibles → pas sur le homelab).

## Modèle de données (simplifié)

- `societes` (id, nom, palier: gratuit/pro/business)
- `users` (id, rôle: aide_menagere / gerant / client, societe_id nullable pour un indépendant)
- `contrats` (id, societe_id, client_id, taches_incluses[]) — définit les tâches prévues au contrat, verrouillées par défaut pour ce client
- `taches` (id, client_id, aide_menagere_id, contrat_id nullable, description, statut, verrouillee: bool) — `verrouillee=true` et `contrat_id` renseigné pour les tâches issues du contrat ; `verrouillee=false` et `contrat_id=null` pour les tâches ajoutées librement par le client
- `messages` (id, conversation_id, expediteur_id, contenu_texte, photo_url, horodatage)
- `demandes_produits` (id, aide_menagere_id, client_id, statut)
- `produits_recommandes` (id, demande_id, nom, marque, score_label, source_url)
- `tutoriels` (id, titre, contenu_texte, video_url, source_url, date_generation)
- `preuves_prestation` (id, tache_id, photo_avant_url, photo_apres_url, horodatage) — palier Pro

## Choix figés et raisons

1. **Backend managé pour tout ce qui touche aux données clients et à la messagerie.** C'est un produit commercial réel — la fiabilité et la sécurité de cette partie ne peuvent pas dépendre d'une connexion internet personnelle ou d'un serveur qu'on redémarre soi-même.
2. **Scraping produits et pipeline tutoriels sur l'infra perso.** Ces composants ne manipulent aucune donnée personnelle de client — juste des données produits publiques et du contenu généré. Une panne dégrade l'expérience (pas de nouveaux tutoriels ce jour-là) sans jamais bloquer le cœur du produit.
3. **Communication homelab ↔ cloud managé uniquement via une passerelle API authentifiée**, jamais d'accès direct à la base de données managée depuis l'extérieur.
4. **Une seule stack frontend (JS/TS) pour web et mobile**, pour limiter la charge de maintenance en solo.
5. **Ordre d'implémentation aligné sur la priorité utilisateurs de la SPEC** : comptes + tâches + messagerie pour l'aide-ménagère d'abord, dashboard gérant ensuite, expérience client en dernier.

## Risques majeurs

1. **Deux environnements à maintenir** (managé + auto-hébergé) — charge de supervision et de sécurité doublée en solo ; risque d'oubli de mise à jour côté homelab.
2. **Disponibilité du homelab** pour le scraping et les tutoriels — une coupure internet ou matérielle chez toi dégrade ces fonctionnalités ; acceptable si rare et bien géré côté UX (ex. dernier tutoriel en cache), risqué si ça arrive souvent.
3. **Pipeline vidéo IA (tutoriels)** — coût de génération, complexité technique, et question des droits sur le contenu source (réels Instagram) à clarifier avant d'industrialiser cette fonctionnalité ; v1 peut s'en tenir à des tutoriels texte + photo générés par IA, la vidéo IA venant en v2.
