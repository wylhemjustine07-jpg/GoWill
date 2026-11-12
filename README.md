# GoWill — marketplace communautaire

GoWill est un prototype de marketplace inspiré des catalogues de mode en ligne et des petites annonces entre particuliers. Les visiteurs peuvent parcourir les annonces ; les membres connectés peuvent publier et gérer leurs produits.

## État actuel

**GoWill est encore en démonstration.** Le site n'accepte pas de paiements réels et ne transmet pas de commandes aux vendeurs. Les aperçus de commande sont conservés dans le navigateur utilisé pour la démonstration. Les tarifs Shippo, lorsqu'ils sont configurés, servent uniquement à afficher des devis ; aucune étiquette ni expédition n'est créée.

## Fonctionnalités disponibles

- Inscription et connexion par e-mail avec Supabase Auth.
- Parcours public des annonces des membres sur /annonces.
- Recherche, filtres par catégorie, état, lieu et prix, tri et pagination.
- Fiche annonce avec galerie de photos.
- Publication réservée aux membres connectés, avec jusqu'à cinq photos.
- Espace vendeur pour modifier, remettre en ligne, marquer comme vendu ou supprimer ses annonces.
- Favoris enregistrés dans Supabase.
- Messagerie privée entre acheteurs et vendeurs, avec notifications de messages non lus.
- Gestion des adresses personnelles et de l'adresse d'expédition privée du vendeur.
- Vérifications de contenu pour certaines catégories de produits réglementés.
- Affichage d'options d'expédition et, si le service est configuré, demande de devis à Shippo pour la livraison à domicile.

## Limites connues

- Le paiement réel n'est pas intégré.
- Les commandes ne sont pas enregistrées dans une base de données : l'aperçu est local au navigateur.
- Aucun vendeur ne reçoit encore de commande à traiter depuis un tableau de bord.
- Les étiquettes, enlèvements, relais officiels et suivis transporteur ne sont pas intégrés.
- Les taxes, droits de douane et conversions de devises ne sont pas calculés.
- Les tarifs transporteur exposés par le prototype sont actuellement limités aux résultats en euros.
- /shop et les catégories historiques contiennent encore des produits de démonstration ; les annonces des membres sont sur /annonces.
- Les pages d'information et les documents juridiques doivent être relus et validés avant toute ouverture commerciale.

Ne considère pas une estimation de livraison ni l'écran « aperçu de commande » comme une confirmation de vente. Pour tester, utilise des données fictives. N'ajoute pas de coordonnées personnelles ou d'adresse réelle dans le prototype sans l'aide d'un adulte responsable.

## Technologies

- Next.js 16, React 19 et TypeScript
- Tailwind CSS et composants shadcn/ui
- Supabase Auth, PostgreSQL et Storage
- Zustand, Zod et next-intl

## Configuration locale

1. Installe Node.js 22 ou une version compatible avec le projet.
2. Copie .env.example vers .env.local.
3. Vérifie les variables publiques Supabase indiquées dans le fichier.
4. Configure dans Supabase Auth les URL locales de redirection.
5. Installe les dépendances et démarre le serveur.

Variables publiques :
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_BASE_URL

Variables facultatives réservées au serveur, nécessaires uniquement pour les devis d'expédition :
- SUPABASE_SERVICE_ROLE_KEY
- SHIPPO_API_TOKEN

Les deux dernières variables sont des secrets : ne les ajoute jamais à NEXT_PUBLIC_*, au navigateur, à GitHub ou à un message. Configure-les uniquement dans l'environnement serveur approprié, avec un adulte responsable.

## Démarrer en local

git clone https://github.com/wylhemjustine07-jpg/GoWill.git
cd GoWill
git switch feature/gowill-marketplace
npm install
npm run dev

Ouvre ensuite http://localhost:3000.

## Vérifications

npm run lint
npm run build

Le contrôle ESLint global contient encore des erreurs historiques dans des composants du modèle d'origine. La CI lance également un contrôle ciblé des pages marketplace modifiées et une compilation de production.

## Base de données

Les migrations SQL sont conservées dans supabase/migrations/. Le projet Supabase de développement possède déjà les tables de profils, annonces, favoris, conversations, messages, adresses et adresses d'expédition privées. Vérifie l'état des migrations dans le tableau de bord Supabase avant d'en appliquer de nouvelles.

## Avant une ouverture publique

Il faudra notamment faire vérifier les documents juridiques et la politique de confidentialité, mettre en place la modération, vérifier les catégories autorisées, sécuriser le parcours vendeur, ajouter les commandes persistantes, puis choisir et configurer les prestataires de paiement et de transport avec un adulte responsable.

GoWill ne doit pas être présenté comme une boutique prête à encaisser des paiements tant que ces étapes ne sont pas terminées.
