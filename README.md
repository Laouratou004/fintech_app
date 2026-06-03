# Diaspora Pay

> Application mobile fintech de transfert d'argent de la diaspora guinéenne vers la République de Guinée.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)]()

---

## Table des matières

- [Présentation](#présentation)
- [Compte de démonstration](#compte-de-démonstration)
- [Fonctionnalités](#fonctionnalités)
- [Captures d'écran](#captures-décran)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration Supabase](#configuration-supabase)
- [Lancement de l'app](#lancement-de-lapp)
- [Modèle de données](#modèle-de-données)
- [Sécurité](#sécurité)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contexte académique](#contexte-académique)

---

## Présentation

**Diaspora Pay** est une application mobile React Native qui permet aux membres de la diaspora guinéenne (vivant en France, aux États-Unis, au Canada, en Belgique, en Allemagne, au Royaume-Uni, dans les pays du Golfe ou en Afrique centrale) d'envoyer de l'argent à leurs proches en République de Guinée de manière simple, rapide et sécurisée.

L'application gère :

- La **conversion automatique** vers le Franc Guinéen (GNF) au taux officiel BCRG
- Les principaux **réseaux Mobile Money** guinéens (Orange Money, MTN MoMo, Wave, virement bancaire)
- Le calcul intelligent des **frais de service** (palier x réseau x pays)
- La **conformité AML/KYC** (plafonds mensuels, seuils de vérification, plafond unique)
- Un **carnet de bénéficiaires** persistant avec favoris
- Un **historique complet** des transferts avec recherche et filtres

L'app est entièrement traduite en français et propose un design fintech moderne avec **mode sombre/clair** automatique.

---

## Compte de démonstration

Pour tester l'application sans créer de compte, utilisez les identifiants pré-configurés visibles sur l'écran de connexion :

| Champ | Valeur |
|---|---|
| **E-mail** | `demo@diasporapay.com` |
| **Mot de passe** | `Demo2026!` |

Sur l'écran de login, touchez le bloc vert en pointillés pour pré-remplir automatiquement les champs.

Ce compte contient déjà quelques bénéficiaires et transferts pour démonstration.

---

## Fonctionnalités

### Authentification
- Inscription avec validation (nom, e-mail, téléphone, pays, mot de passe + confirmation)
- Connexion sécurisée (Supabase Auth + JWT)
- **Session persistante** entre les redémarrages de l'app (AsyncStorage)
- Déconnexion avec confirmation

### Création de transferts
- **Pavé numérique intégré** pour la saisie rapide du montant
- Sélection du pays d'origine (11 pays supportés)
- Choix de la devise (EUR, USD, CAD, GBP, GNF)
- Sélection du réseau Mobile Money
- **Conversion en temps réel** affichée pendant la saisie
- Récapitulatif détaillé avant confirmation (montant, frais, taux, total)
- Génération d'une référence unique
- Avertissements KYC automatiques au-delà de 3 000 EUR

### Carnet de bénéficiaires
- CRUD complet (ajout, suppression, modification)
- Système de **favoris** avec affichage rapide sur l'accueil
- Validation des numéros Mobile Money
- Catégorisation par relation (mère, frère, ami, etc.)

### Tableau de bord
- Carte hero avec taux BCRG live (EUR / USD / CAD / GBP vers GNF)
- Statistiques de l'utilisateur (total envoyé, nombre de transferts, économies)
- Barre de progression du plafond mensuel
- Badge KYC (vérifié / en attente)
- Actions rapides (envoyer, bénéficiaires, historique, QR)
- Liste des transferts récents

### Historique
- FlatList **optimisée** (`initialNumToRender`, `windowSize`, `maxToRenderPerBatch`)
- Recherche par nom de bénéficiaire ou référence
- Filtres par statut (tous / reçus / en cours / échec)
- Détail complet de chaque transfert avec **partage natif**

### Profil et préférences
- Édition des informations personnelles
- Choix de la **langue** (Français / English / العربية)
- Choix de la **devise par défaut**
- Toggle **mode sombre** / clair / système
- Toggle **notifications**
- Toggle **authentification biométrique**
- Configuration d'un **code PIN** (4 chiffres)
- Documents KYC, méthodes de paiement, support, CGU
- **Synchronisation immédiate avec Supabase** pour toutes les préférences

---

## Captures d'écran

> _À ajouter : captures de Home, Transfert, Historique, Profil._

```
[Login]  [Home Dashboard]  [Transfer Screen]  [Beneficiaries]
```

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| **Framework mobile** | Expo (React Native) | SDK 54 |
| **Langage** | JavaScript ES2022 + JSX | - |
| **UI** | React Native + composants atomiques custom | 0.81.5 |
| **Navigation** | React Navigation (tabs + stack) | 7.x |
| **État global** | Redux Toolkit | 2.x |
| **État UI/Auth** | Context API | natif React |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) | Cloud |
| **Persistance session** | AsyncStorage | 2.x |
| **Icônes** | @expo/vector-icons (Ionicons) | inclus Expo |
| **Animations** | RN Animated + Pressable | natif RN |

---

## Architecture

```
+---------------------------------------------------------+
|              Application Mobile (Expo)                  |
|                                                         |
|   +---------+  +----------+  +------------+             |
|   | Screens |  |Components|  |   Theme    |             |
|   +----+----+  +----------+  +------------+             |
|        |                                                |
|   +----v----------------------------------+             |
|   |      Couche État (State)              |             |
|   |  +------------+  +------------------+ |             |
|   |  | Context API|  | Redux Toolkit    | |             |
|   |  |(Auth/Theme)|  |(Transfers/Benefs)| |             |
|   |  +------------+  +------------------+ |             |
|   +----+--------------------+-------------+             |
|        |                    |                           |
|   +----v------+       +-----v----------+                |
|   | Services  |       | Logique pure   |                |
|   | distants  |       | (utils, calc)  |                |
|   +----+------+       +----------------+                |
+--------+------------------------------------------------+
         |
         v
+---------------------------------------------------------+
|              Supabase Cloud (PostgreSQL)                |
|   +------------+  +------------+  +--------------+      |
|   | Database   |  |   Auth     |  |   Storage    |      |
|   | + RLS      |  |  (JWT)     |  |  (futur)     |      |
|   +------------+  +------------+  +--------------+      |
+---------------------------------------------------------+
```

### Principes

- **Single source of truth** : Supabase = source persistante, Redux = cache local hydraté
- **Optimistic UI** : actions instantanées côté UI puis confirmation DB
- **Theme-aware** : aucune couleur en dur, tout passe par `useTheme()`
- **Type-safe domain** : conversions snake_case vers camelCase centralisées dans les slices

---

## Structure du projet

```
fintechapp/
├── App.js                              # Racine : Providers + Navigation
├── app.json                            # Config Expo + clés Supabase
├── index.js                            # Entry point Expo
├── package.json
│
├── docs/                               # Documentation
│   ├── cdc.txt                         # Cahier des charges
│   └── plan-technique.md               # Plan technique détaillé
│
├── supabase/                           # Backend
│   └── schema.sql                      # DDL PostgreSQL + RLS + triggers
│
└── src/
    ├── components/                     # Composants UI réutilisables
    │   ├── Card.js
    │   ├── PrimaryButton.js
    │   ├── TextField.js
    │   ├── SegmentedPicker.js
    │   ├── TransferCard.js
    │   └── StatBlock.js
    │
    ├── context/                        # Context API
    │   ├── AuthContext.js              # Session Supabase + profil
    │   └── ThemeContext.js             # Mode light/dark/système
    │
    ├── data/                           # Constantes métier
    │   ├── countries.js                # 11 pays + devises
    │   └── networks.js                 # Orange Money / MTN / Wave / Bank
    │
    ├── navigation/
    │   └── RootNavigator.js            # Stack auth + stack app
    │
    ├── screens/                        # Vues
    │   ├── LoginScreen.js
    │   ├── SignupScreen.js
    │   ├── HomeScreen.js
    │   ├── TransferScreen.js
    │   ├── HistoryScreen.js
    │   ├── BeneficiariesScreen.js
    │   ├── TransferDetailScreen.js
    │   └── ProfileScreen.js
    │
    ├── services/                       # Couche réseau
    │   ├── supabase.js                 # Client Supabase
    │   └── bcrgApi.js                  # Simulation API BCRG
    │
    ├── store/                          # Redux Toolkit
    │   ├── store.js
    │   ├── transferSlice.js            # CRUD transferts + thunks
    │   └── beneficiariesSlice.js       # CRUD bénéficiaires + thunks
    │
    ├── theme/
    │   └── index.js                    # Palette + spacing + typo
    │
    └── utils/                          # Logique métier pure
        ├── feeUtils.js                 # Calcul frais
        ├── currencyUtils.js            # Formatage monétaire
        └── validation.js               # Validation AML/KYC
```

---

## Installation

### Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** 9+ (inclus avec Node)
- Un éditeur de code ([VS Code](https://code.visualstudio.com/) recommandé)
- **Pour iOS** : Xcode (Mac uniquement, depuis l'App Store)
- **Pour Android** : Android Studio
- **Sur smartphone** : l'app [Expo Go](https://expo.dev/client) (iOS ou Android)

### Clonage et dépendances

```bash
# Cloner le dépôt
git clone https://github.com/Laouratou004/fintech_app.git
cd fintech_app

# Installer les dépendances
npm install
```

---

## Configuration Supabase

> Cette étape est obligatoire pour que l'authentification et la persistance fonctionnent.

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un compte
2. Cliquer sur **`New project`**
3. Choisir :
   - **Name** : `diaspora-pay`
   - **Region** : `West EU (Paris)` ou la plus proche
   - **Plan** : `Free`
4. Patienter ~2 minutes que la base soit provisionnée

### 2. Exécuter le schéma SQL

1. Dans le dashboard Supabase, ouvrir **`SQL Editor`** puis **`+ New query`**
2. Copier le contenu intégral du fichier [`supabase/schema.sql`](supabase/schema.sql)
3. Coller dans l'éditeur et cliquer **`Run`**
4. Vérifier dans **`Table Editor`** que les 3 tables sont créées :
   - `profiles`
   - `beneficiaries`
   - `transfers`

### 3. Désactiver la confirmation par e-mail (recommandé pour le développement)

1. Aller dans **`Authentication`** puis **`Sign In / Providers`**
2. Trouver l'option **`Confirm email`**
3. **Désactiver** le toggle puis **`Save changes`**

### 4. Récupérer les clés API

1. Aller dans **`Project Settings`** puis **`API Keys`**
2. Copier **`Project URL`** (format : `https://xxxxx.supabase.co`)
3. Copier **`anon` `public` key** (sous l'onglet **`Legacy anon, service_role API keys`**)

### 5. Renseigner `app.json`

Ouvrir `app.json` à la racine et remplir la section `extra` :

```json
"extra": {
  "supabaseUrl": "https://VOTRE-PROJET.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIs..."
}
```

Les variables `extra` ne se rechargent **pas à chaud** : il faut redémarrer Expo après modification.

---

## Lancement de l'app

### Démarrer le serveur de développement

```bash
npm start
```

### Choisir une plateforme

Une fois Metro lancé, dans le terminal :

| Touche | Plateforme |
|---|---|
| `i` | **iOS Simulator** (Mac + Xcode requis) |
| `a` | **Android Emulator** (Android Studio requis) |
| `w` | **Web** (navigateur, démarrage instantané) |
| QR Code | **Smartphone physique** (via app Expo Go) |

### Mode Web (recommandé pour démarrer)

```bash
npm run web
```

L'app s'ouvre automatiquement sur `http://localhost:8081`. Utile pour debug rapide avec les DevTools du navigateur.

---

## Modèle de données

### Schéma simplifié

```
auth.users (Supabase Auth)
    |
    +--1:1-- profiles               (nom, KYC, plafond, préférences)
    |
    +--1:N-- beneficiaries          (carnet personnel)
    |
    +--1:N-- transfers              (historique des transferts)
```

### Table `transfers` (extrait)

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid | Clé primaire |
| `user_id` | uuid FK | vers auth.users(id) |
| `receiver_name` | text | Nom du bénéficiaire |
| `receiver_phone` | text | Numéro Mobile Money |
| `network` | enum | orange-money / mtn-momo / wave / bank-transfer |
| `currency` | text | EUR / USD / CAD / GBP / GNF |
| `amount` | numeric | Montant envoyé |
| `fees` | numeric | Frais de service |
| `rate` | numeric | Taux de change appliqué |
| `received_gnf` | numeric | Montant reçu en GNF |
| `status` | enum | pending / completed / failed |
| `reference` | text unique | Référence transaction (ex: TR-A8K2P) |
| `created_at` | timestamptz | Date de création |

Voir le schéma complet dans [`supabase/schema.sql`](supabase/schema.sql).

---

## Sécurité

### Row Level Security (RLS)

**Toutes les tables sont protégées par RLS PostgreSQL.** Chaque utilisateur ne peut **lire/modifier que ses propres données**, même en cas de manipulation du JWT côté client.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `id = auth.uid()` | (trigger auto) | `id = auth.uid()` | - |
| `beneficiaries` | `user_id = auth.uid()` | oui | oui | oui |
| `transfers` | `user_id = auth.uid()` | oui | oui | - |

### Conformité AML/KYC (client)

| Règle | Seuil | Comportement |
|---|---|---|
| Montant minimum | 5 unités | Bloque |
| Plafond unique | 10 000 unités | Bloque |
| Plafond mensuel | Variable par user | Bloque |
| KYC renforcé | >= 3 000 unités | Avertissement |
| Validation téléphone | min 8 chiffres | Erreur |

### Authentification

- Mot de passe : minimum 6 caractères, hashé côté Supabase (bcrypt)
- Session JWT auto-rafraîchie
- Persistance via AsyncStorage chiffré

---

## Documentation

| Document | Description |
|---|---|
| [`docs/cdc.txt`](docs/cdc.txt) | Cahier des charges fonctionnel (Exercice 21) |
| [`docs/plan-technique.md`](docs/plan-technique.md) | Plan technique détaillé (architecture, choix, roadmap) |
| [`supabase/schema.sql`](supabase/schema.sql) | Schéma PostgreSQL complet + policies RLS |

---

## Roadmap

### Sprint 1 — MVP (livré)

- [x] Authentification Supabase
- [x] CRUD transferts + bénéficiaires
- [x] Calcul intelligent des frais
- [x] Conversion BCRG simulée
- [x] Design system complet (light/dark)
- [x] FlatList optimisée
- [x] Validation AML/KYC

### Sprint 2 — Production-ready

- [ ] Intégration **réelle** de l'API BCRG (HTTP)
- [ ] Upload de documents KYC (Supabase Storage)
- [ ] Edge Function de transition de statut (pending vers completed)
- [ ] Notifications push (Expo Notifications)
- [ ] Réactivation de la confirmation e-mail
- [ ] Captures d'écran et démo vidéo

### Sprint 3 — Différenciation

- [ ] QR Code pour bénéficiaires
- [ ] Authentification biométrique (`expo-local-authentication`)
- [ ] Internationalisation FR/EN/AR
- [ ] Mode hors-ligne (cache SQLite)
- [ ] Statistiques mensuelles + graphiques

### Vision long terme

- Intégration partenaires Mobile Money réels (Orange, MTN, Wave APIs)
- IA de détection de fraude
- Blockchain (ledger immuable)
- Multi-bénéficiaires (un transfert vers N personnes)
- Programme de fidélité / cashback

---

## Contexte académique

Ce projet est réalisé dans le cadre de l'**Exercice 21 — Application Fintech Intelligente de Transfert d'Argent de la Diaspora Guinéenne vers la République de Guinée**.

### Compétences travaillées

- React Native avancé (Expo SDK 54)
- FlatList professionnelle avec optimisations
- Gestion d'état moderne (Redux Toolkit + Context API)
- Architecture mobile scalable
- Intégration backend (Supabase / PostgreSQL)
- UI/UX fintech moderne (dark mode, accessibilité)
- Calculs monétaires et conversion de devises
- Réglementation bancaire (BCRG, AML/KYC)
- Sécurité mobile (RLS, JWT, validation)
- Conformité financière

### Domaines de recherche ouverts

- Digital Remittance Systems
- Financial Inclusion
- Mobile Banking
- RegTech
- IA pour la détection de fraude
- Blockchain financière

---

## Dépendances principales

```json
{
  "expo": "~54.0.33",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@reduxjs/toolkit": "^2.x",
  "react-redux": "^9.x",
  "@react-navigation/native": "^7.x",
  "@react-navigation/bottom-tabs": "^7.x",
  "@react-navigation/native-stack": "^7.x",
  "@supabase/supabase-js": "^2.x",
  "@react-native-async-storage/async-storage": "~2.x",
  "react-native-url-polyfill": "~2.x",
  "react-native-screens": "~4.x",
  "react-native-safe-area-context": "~5.x",
  "react-native-gesture-handler": "~2.x"
}
```

---

## Contribution

Ce projet est **académique** : les contributions externes ne sont pas attendues pendant la durée de l'exercice. Une fois l'évaluation passée, le projet pourra être ouvert.

---

## Licence

Projet académique — usage pédagogique uniquement. Tous droits réservés.

---

## Auteur

**Laouratou Diallo**
- GitHub : [@Laouratou004](https://github.com/Laouratou004)
- E-mail : laouratoudbah@gmail.com

---

## Remerciements

- **Banque Centrale de la République de Guinée (BCRG)** — référence réglementaire
- **Supabase** — backend open-source
- **Expo** — framework mobile
- L'équipe pédagogique pour l'énoncé de l'Exercice 21
