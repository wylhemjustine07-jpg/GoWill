# GoWill — Marketplace communautaire

GoWill est une marketplace où les visiteurs peuvent parcourir les annonces et où les membres inscrits peuvent publier et gérer leurs produits.

## Technologies

- Next.js 16, React 19 et TypeScript
- Tailwind CSS v4 et shadcn/ui
- Supabase Auth, PostgreSQL et Storage
- Zustand, Zod et next-intl

## Fonctionnalités déjà préparées

- Accueil et navigation en français.
- Inscription et connexion par e-mail et mot de passe via Supabase.
- Sessions persistantes et actualisation des cookies de session.
- Consultation des annonces publiques sur `/annonces`.
- Page de détail sur `/annonces/[id]`.
- Publication réservée aux membres connectés sur `/deposer`.
- Ajout de jusqu'à cinq photos par annonce.
- Espace vendeur sur `/account/annonces` pour remettre une annonce en ligne, la marquer comme vendue ou la supprimer.
- Profils, annonces et favoris dans PostgreSQL avec règles RLS.
- Photos stockées dans un bucket Supabase public ; l'envoi et la suppression sont limités au dossier du membre propriétaire.

## Configuration

1. Copie le fichier `.env.example` vers `.env.local`.
2. Les variables publiques du projet Supabase GoWill sont indiquées dans l'exemple.
3. Dans Supabase Auth, configure les URL de redirection autorisées pour ton environnement local et ton futur domaine.
4. Installe les dépendances et démarre le serveur.

Ne place jamais de clé secrète Supabase dans une variable `NEXT_PUBLIC_` ou dans le dépôt.

## Démarrer en local

```bash
git clone https://github.com/wylhemjustine07-jpg/GoWill.git
cd GoWill
npm install
npm run dev
```

Ouvre ensuite http://localhost:3000.

## Base de données

Les migrations SQL se trouvent dans `supabase/migrations/` :

- `20261111150000_initial_marketplace.sql` : profils, annonces, favoris et politiques RLS.
- `20261111153000_create_profile_on_signup.sql` : création automatique du profil à l'inscription.
- `20261111160000_listing_images_storage.sql` : bucket de photos et règles d'accès.

Elles ont été appliquées au projet Supabase GoWill.

## Prochaines étapes

- Relier les favoris au compte Supabase.
- Créer la messagerie entre acheteurs et vendeurs.
- Ajouter les outils de modération et le tableau d'administration.
- Concevoir le parcours de commande et intégrer un prestataire de paiement.
- Tester le build et déployer le site sur un domaine public.

## Licence

MIT.
