# Diaspora Pay 🇬🇳

Application mobile fintech de transfert d'argent de la diaspora guinéenne vers la République de Guinée.

> MVP académique — Exercice 21 — Niveau Développeur Senior International.

## Stack

- **React Native** (Expo SDK 54)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Redux Toolkit** + **Context API**
- **React Navigation 7**

## Fonctionnalités

- Authentification e-mail/mot de passe avec persistance de session
- Création de transferts internationaux avec conversion en temps réel via taux BCRG
- Carnet de bénéficiaires (4 réseaux Mobile Money : Orange Money, MTN MoMo, Wave, virement bancaire)
- Historique persistant avec recherche et filtres
- Calcul intelligent des frais (palier × réseau × pays)
- Validation AML/KYC (plafonds mensuels, seuils, vérifications)
- Mode sombre / clair / système
- Profil utilisateur configurable (langue, devise, PIN, biométrie, notifications)

## Démarrage

```bash
npm install
npm start
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans le SQL Editor du dashboard
3. Renseigner `app.json` :

```json
"extra": {
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGc..."
}
```

4. Redémarrer Expo (`npm start`)

## Documentation

- [`docs/cdc.txt`](docs/cdc.txt) — Cahier des charges
- [`docs/plan-technique.md`](docs/plan-technique.md) — Plan technique détaillé
- [`supabase/schema.sql`](supabase/schema.sql) — Schéma PostgreSQL + RLS

## Structure

```
src/
├── components/     # Composants UI réutilisables
├── context/        # Context API (Auth, Theme)
├── data/           # Constantes métier (pays, réseaux)
├── navigation/     # React Navigation
├── screens/        # Écrans
├── services/       # Supabase, BCRG API
├── store/          # Redux Toolkit
├── theme/          # Palette + spacing + typo
└── utils/          # Logique métier pure
```

## Licence

Projet académique — usage pédagogique.
