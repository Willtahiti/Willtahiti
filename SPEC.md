# SPEC.md — Application de mise en relation pour sociétés de ménage

## Problème

Les sociétés de ménage et les aides-ménagères manquent d'un outil simple pour organiser les tâches, échanger avec le client, gérer les besoins en produits et professionnaliser la relation client. Les particuliers eux-mêmes ont peu de visibilité sur ce qui est fait et manquent de conseils pratiques (produits, DIY).

## Utilisateurs et priorités (v1)

1. **Aide-ménagère** (prioritaire v1) — reçoit les tâches, échange avec le client, demande les produits, accède aux tutoriels DIY.
2. **Gérant de société** (v2 proche) — supervise, valide, a une vue d'ensemble.
3. **Client** (v3) — particulier passant par une société existante ou un(e) indépendant(e), donne les tâches, échange, consulte les tutoriels.

## Périmètre v1

- Création de compte aide-ménagère.
- Liste de tâches : combinaison liste prédéfinie (cases à cocher) + champ texte libre.
- Messagerie client ↔ aide-ménagère : texte + envoi de photos.
- Demande de produits : l'aide-ménagère envoie une liste de produits au client. Scraping/recommandation de produits mieux notés (labels type Yuka, Ecocert) en complément.
- Tutoriels DIY : contenu généré par IA à partir de transcriptions de vidéos courtes (ex. réels Instagram), puis régénéré sous forme de vidéo IA — corpus de départ à constituer manuellement ou via un pipeline dédié.
- Cible technique : mobile (iOS/Android) + web.

## Hors périmètre v1 (explicitement reporté)

- Remplacement du planning et de la facturation déjà utilisés par les sociétés (prévu pour une version ultérieure — intégration plutôt que remplacement).
- Gestion complète du profil "gérant" (tableau de bord avancé, reporting).
- Paiement en ligne intégré.
- Pipeline de génération vidéo IA en production (v1 peut se limiter à des tutoriels texte/photo générés par IA, la vidéo étant un objectif v2).

## Contraintes

- Projet développé de zéro, à but commercial réel (pas un simple prototype portfolio).
- Doit fonctionner à la fois pour des sociétés existantes et des indépendant(e)s.
- Besoin d'une grille tarifaire crédible avant mise sur le marché.

## Paysage concurrentiel (aperçu à approfondir)

| Acteur | Positionnement | Modèle économique |
|---|---|---|
| Wecasa | Marketplace grand public (ménage, beauté, garde d'enfants) | Commission ~25% sur chaque prestation, prélevée sur le prix client |
| Helpling | Marketplace ménage, leader Europe (150+ villes) | Commission sur mise en relation |
| Shiva / AXEO / Dwého | Réseaux d'agences physiques (franchise), logiciel interne | Vente directe de prestations, pas une plateforme ouverte |
| Cleanyz | Concurrent le plus proche : marketplace + logiciel métier + logistique du linge, pour indépendants et sociétés | Freemium : recherche et fonctionnalités essentielles gratuites, options avancées payantes |

**Enseignement clé pour le positionnement** : les marketplaces pures (Wecasa, Helpling) visent le grand public et prennent une commission par mission. Cleanyz est le seul acteur identifié qui, comme ce projet, s'adresse aussi aux sociétés/indépendants pour outiller leur activité plutôt que seulement les mettre en relation avec des clients — c'est le concurrent de référence à analyser en profondeur avant de figer le modèle économique.

## Grille tarifaire (hypothèse de travail)

Modèle retenu : **freemium indexé sur la taille de l'équipe (nombre d'aides-ménagères), pas sur le nombre de clients.** Le palier gratuit reste généreux sur les fonctionnalités d'engagement (tâches, messagerie, demande de produits + scraping, tutoriels DIY) — ce sont des leviers d'adoption, pas de monétisation. Le payant se déclenche dès qu'il y a coordination d'équipe, là où la vraie douleur business apparaît.

| Palier | Cible | Prix indicatif | Inclus |
|---|---|---|---|
| **Gratuit** | Indépendant(e) (1 seule aide-ménagère = le compte lui-même) | 0€ | Tâches, messagerie texte + photo, demande de produits + scraping, tutoriels DIY IA — illimité en nombre de clients |
| **Pro** | Société avec équipe (dès la 2e aide-ménagère) | À définir, ex. par siège/mois ou forfait équipe | Tout le gratuit + preuve de prestation horodatée (photos avant/après archivées), tableau de bord multi-aides-ménagères, badges de confiance |
| **Business** | Société structurée / plusieurs agences | Sur devis | Tout le Pro + intégration avec le logiciel de planning/facturation déjà utilisé par la société, support prioritaire, marque blanche |

**Pourquoi ce découpage plutôt qu'un seuil sur le nombre de clients :** un seuil bas (ex. 2 clients) pénalise surtout les indépendants qui restent naturellement petits, sans capter la vraie valeur créée pour les sociétés. Le seuil "équipe" fait payer au moment où l'app résout un vrai problème de coordination, et laisse le palier gratuit servir de vitrine généreuse face à Cleanyz plutôt qu'un modèle bridé dès le départ.

Ces montants sont une hypothèse de départ, pas un résultat validé — à tester auprès de quelques sociétés réelles avant de les figer.

## Risques majeurs

1. **Concurrence déjà installée** (Cleanyz notamment) — nécessite une différenciation claire (ex. tutoriels DIY générés par IA, scraping produits labellisés) plutôt qu'une simple redite.
2. **Double dépendance IA** — génération de tutoriels texte→vidéo par IA : coût, qualité et droits d'usage du contenu source (réels Instagram) à sécuriser juridiquement.
3. **Adoption par les sociétés déjà équipées** — elles ont déjà un outil de planning/facturation ; il faut une valeur ajoutée immédiate qui ne demande pas de tout migrer d'un coup.

## Critères de réussite v1

À définir précisément lors du prochain échange — proposition de départ : une aide-ménagère peut recevoir une liste de tâches, échanger avec le client (texte + photo), envoyer une demande de produits, et consulter au moins un tutoriel DIY généré par IA, de bout en bout sur mobile et web.
