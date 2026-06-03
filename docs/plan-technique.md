# Plan Technique — Diaspora Pay
## Application Fintech Mobile de Transfert d'Argent Diaspora → Guinée

---

**Version** : 1.0.0 (MVP)
**Date** : 25 mai 2026
**Auteur** : Équipe Diaspora Pay
**Référence CDC** : Exercice 21 — Application Fintech Intelligente
**Stack** : React Native (Expo SDK 54) • Supabase • Redux Toolkit • React Navigation 7

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Architecture générale](#2-architecture-générale)
3. [Choix techniques](#3-choix-techniques)
4. [Modèle de données](#4-modèle-de-données)
5. [Sécurité et conformité](#5-sécurité-et-conformité)
6. [Architecture applicative](#6-architecture-applicative)
7. [Inventaire des écrans](#7-inventaire-des-écrans)
8. [Règles métier](#8-règles-métier)
9. [Système de design](#9-système-de-design)
10. [Procédure de démarrage](#10-procédure-de-démarrage)
11. [Roadmap et extensions](#11-roadmap-et-extensions)

---

## 1. Contexte et objectifs

### 1.1 Contexte économique

Les transferts d'argent de la diaspora guinéenne représentent **plusieurs centaines de millions de dollars par an** et constituent un pilier de l'économie nationale. Ces flux alimentent les dépenses familiales, l'investissement immobilier, les études, les soins médicaux et les PME locales.

### 1.2 Pays sources couverts

| Pays | Devise | Volume estimé |
|---|---|---|
| France | EUR | Majoritaire |
| États-Unis | USD | Important |
| Canada | CAD | Important |
| Belgique, Allemagne | EUR | Significatif |
| Royaume-Uni | GBP | Croissant |
| Pays du Golfe | USD | Significatif |
| Afrique centrale | EUR | Régional |

### 1.3 Objectifs du MVP

- Permettre la création d'un transfert international en moins de 60 secondes
- Afficher en temps réel le taux officiel BCRG et la conversion vers le GNF
- Gérer un carnet de bénéficiaires avec favoris
- Stocker un historique persistant des transferts
- Appliquer les règles AML/KYC (plafonds, vérifications)
- Supporter 4 réseaux Mobile Money guinéens

---

## 2. Architecture générale

### 2.1 Schéma d'architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Application Mobile (Expo)              │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │   Screens   │  │ Components  │  │   Theme      │   │
│  │  (5 tabs +  │  │ (réutil.)   │  │ (light/dark) │   │
│  │   modales)  │  │             │  │              │   │
│  └──────┬──────┘  └─────────────┘  └──────────────┘   │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │            Couche État (State Layer)            │   │
│  │  ┌──────────────┐    ┌────────────────────┐    │   │
│  │  │  Context API │    │ Redux Toolkit      │    │   │
│  │  │ (Auth/Theme) │    │ (Transfers/Benefs) │    │   │
│  │  └──────────────┘    └────────────────────┘    │   │
│  └──────┬──────────────────────────┬───────────────┘   │
│         │                          │                    │
│  ┌──────▼──────┐          ┌────────▼────────┐         │
│  │  Services   │          │  Services Locaux│         │
│  │  Distants   │          │  (utils, calc)  │         │
│  │             │          │                 │         │
│  └──────┬──────┘          └─────────────────┘         │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase (Cloud)                     │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │ PostgreSQL │  │   Auth     │  │   Storage    │     │
│  │ (3 tables) │  │  (JWT,     │  │  (futur:     │     │
│  │  + RLS     │  │  sessions) │  │  KYC docs)   │     │
│  └────────────┘  └────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│         API BCRG (simulation actuelle)                  │
│         Endpoint réel à intégrer en production          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Principes d'architecture

| Principe | Application |
|---|---|
| **Separation of concerns** | UI / état / services / domaine isolés dans des dossiers dédiés |
| **Single source of truth** | Supabase = source ; Redux = cache local hydraté au démarrage |
| **Optimistic UI** | Les mutations Redux mettent à jour l'UI puis sont confirmées côté DB |
| **Theme-aware** | Tous les composants consomment `useTheme()` — aucune couleur hardcodée |
| **Type-safe domain** | Conversions snake_case ↔ camelCase centralisées dans les slices |

---

## 3. Choix techniques

### 3.1 Stack retenue

| Couche | Technologie | Justification |
|---|---|---|
| **Framework mobile** | Expo SDK 54 | Démarrage rapide, OTA updates, écosystème mature |
| **Langage** | JavaScript ES2022 + JSX | Cible pédagogique senior selon CDC |
| **Navigation** | React Navigation 7 (tabs + stack) | Standard de facto |
| **État global métier** | Redux Toolkit 2.x | Demande explicite du CDC, scalable, devtools |
| **État global UI/Auth** | Context API | Simple, suffisant pour theme + auth wrapper |
| **Backend / DB** | Supabase (PostgreSQL) | Auth + DB relationnelle + RLS intégrée |
| **Persistance session** | AsyncStorage | Standard RN, auto-géré par Supabase JS |
| **Icônes** | @expo/vector-icons (Ionicons) | Inclus, large bibliothèque |
| **Animations** | RN Animated + Pressable | Pas de dépendance lourde, suffisant pour le MVP |

### 3.2 Stack rejetée et pourquoi

| Option | Raison du rejet |
|---|---|
| Firebase | NoSQL inadapté à la donnée transactionnelle ; vendor lock-in |
| MongoDB + Express | Surdimensionné pour un MVP ; +2 semaines de dev backend |
| Zustand seul | Le CDC demande explicitement Redux Toolkit |
| AsyncStorage seul | Pas de synchro multi-appareils, pas d'auth |
| React Query | Redoublonne la responsabilité de Redux dans ce projet |

---

## 4. Modèle de données

### 4.1 Schéma relationnel

```
┌─────────────────────────┐
│      auth.users         │  (géré par Supabase Auth)
│  ─────────────────────  │
│  id (uuid, PK)          │
│  email                  │
│  encrypted_password     │
└───────────┬─────────────┘
            │ 1:1
            ▼
┌─────────────────────────┐
│      profiles           │
│  ─────────────────────  │
│  id (uuid, PK, FK)      │
│  full_name              │
│  phone                  │
│  country                │
│  preferred_currency     │
│  language               │
│  notifications_enabled  │
│  biometric_enabled      │
│  pin_hash               │
│  kyc_level              │
│  monthly_limit          │
│  monthly_used           │
│  avatar_initials        │
└───────────┬─────────────┘
            │ 1:N
            ├──────────────────────────────────┐
            ▼                                  ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    beneficiaries        │    │       transfers         │
│  ─────────────────────  │    │  ─────────────────────  │
│  id (uuid, PK)          │    │  id (uuid, PK)          │
│  user_id (FK)           │    │  user_id (FK)           │
│  name                   │    │  receiver_name          │
│  phone                  │    │  receiver_phone         │
│  network                │    │  network                │
│  relation               │    │  country_code           │
│  favorite               │    │  currency               │
│  created_at             │    │  amount                 │
└─────────────────────────┘    │  fees                   │
                               │  rate                   │
                               │  received_gnf           │
                               │  status                 │
                               │  reference (unique)     │
                               │  created_at             │
                               └─────────────────────────┘
```

### 4.2 Contraintes métier en base

| Champ | Contrainte |
|---|---|
| `kyc_level` | `pending`, `verified`, `rejected` |
| `network` | `orange-money`, `mtn-momo`, `wave`, `bank-transfer` |
| `status` | `pending`, `completed`, `failed` |
| `amount` | `> 0` |
| `reference` | unique global |

### 4.3 Trigger automatique

À la création d'un compte (`auth.users` insert), un trigger PostgreSQL crée automatiquement la ligne correspondante dans `profiles` à partir des `raw_user_meta_data` fournies au `signUp`.

---

## 5. Sécurité et conformité

### 5.1 Authentification

- Supabase Auth (e-mail + mot de passe)
- Sessions JWT auto-rafraîchies (`autoRefreshToken: true`)
- Persistance via AsyncStorage (`persistSession: true`)
- Détection d'état centralisée via `onAuthStateChange`

### 5.2 Row Level Security (RLS)

**Chaque utilisateur ne voit et ne modifie que ses propres données.** Aucune fuite possible côté client, même en cas de manipulation du JWT.

Policies actives :

| Table | Lecture | Insertion | Modification | Suppression |
|---|---|---|---|---|
| `profiles` | `id = auth.uid()` | (trigger) | `id = auth.uid()` | — |
| `beneficiaries` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `transfers` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | — |

### 5.3 Conformité AML/KYC (côté client)

| Règle | Seuil | Action |
|---|---|---|
| Montant minimum | 5 unités | Bloque l'envoi |
| KYC renforcé | ≥ 3 000 EUR | Avertissement visible |
| Plafond unique | 10 000 EUR | Bloque l'envoi |
| Plafond mensuel | Personnalisé par user | Bloque l'envoi |
| Validation téléphone | 8 chiffres min. | Erreur de saisie |

### 5.4 Sécurité côté code

- Aucun secret n'est stocké dans le bundle (clés Supabase = `anon` public uniquement)
- Les opérations sensibles passent par les RLS PostgreSQL côté serveur
- Le PIN local sera hashé (futur : `expo-crypto`)

---

## 6. Architecture applicative

### 6.1 Arborescence du projet

```
fintechapp/
├── App.js                          # Racine: Providers + Navigation
├── app.json                        # Config Expo + extras Supabase
├── index.js                        # Entry point Expo
├── docs/
│   ├── cdc.txt                     # Cahier des charges original
│   └── plan-technique.md           # Ce document
├── supabase/
│   └── schema.sql                  # DDL PostgreSQL + RLS + triggers
└── src/
    ├── components/                 # Composants UI réutilisables
    │   ├── Card.js
    │   ├── PrimaryButton.js
    │   ├── TextField.js
    │   ├── SegmentedPicker.js
    │   ├── TransferCard.js
    │   └── StatBlock.js
    ├── context/                    # Context API
    │   ├── AuthContext.js          # Session Supabase + profil
    │   └── ThemeContext.js         # Mode light/dark/système
    ├── data/                       # Constantes métier
    │   ├── countries.js            # Pays + devises
    │   └── networks.js             # Réseaux Mobile Money
    ├── navigation/
    │   └── RootNavigator.js        # Stack auth / stack app
    ├── screens/                    # Vues principales
    │   ├── LoginScreen.js
    │   ├── SignupScreen.js
    │   ├── HomeScreen.js
    │   ├── TransferScreen.js
    │   ├── HistoryScreen.js
    │   ├── BeneficiariesScreen.js
    │   ├── TransferDetailScreen.js
    │   └── ProfileScreen.js
    ├── services/                   # Couche réseau
    │   ├── supabase.js             # Client Supabase configuré
    │   └── bcrgApi.js              # Simulation API BCRG
    ├── store/                      # Redux Toolkit
    │   ├── store.js
    │   ├── transferSlice.js        # CRUD transferts + thunks
    │   └── beneficiariesSlice.js   # CRUD bénéficiaires + thunks
    ├── theme/
    │   └── index.js                # Palette + spacing + typo
    └── utils/                      # Logique métier pure
        ├── feeUtils.js             # Calcul des frais
        ├── currencyUtils.js        # Formatage monétaire
        └── validation.js           # Validation AML/KYC
```

### 6.2 Gestion d'état détaillée

| Type d'état | Outil | Exemples |
|---|---|---|
| **État local UI** | `useState` | Champ de saisie, ouverture de modale |
| **Auth / profil** | Context API | Session, langue, devise préférée |
| **Thème** | Context API | Mode sombre, palette active |
| **Données métier** | Redux Toolkit | Transferts, bénéficiaires, taux BCRG |
| **Persistance session** | AsyncStorage (auto) | JWT, refresh token |
| **Persistance données** | Supabase PostgreSQL | Toutes les données métier |

### 6.3 Flux d'un transfert (séquence)

```
User             TransferScreen        Redux           Supabase
 │                     │                 │                │
 │  Saisie montant     │                 │                │
 ├────────────────────►│                 │                │
 │                     │ calculateBreakdown()             │
 │                     │ (utils local)   │                │
 │                     │                 │                │
 │  Tap "Confirmer"    │                 │                │
 ├────────────────────►│                 │                │
 │                     │ validateTransfer()               │
 │                     │ (utils local)   │                │
 │                     │                 │                │
 │                     │ dispatch(createTransfer(...))    │
 │                     ├────────────────►│                │
 │                     │                 │ supabase       │
 │                     │                 │ .from('transfers')
 │                     │                 │ .insert(...)   │
 │                     │                 ├───────────────►│
 │                     │                 │                │ RLS check
 │                     │                 │                │ Insert row
 │                     │                 │◄───────────────┤
 │                     │                 │ unshift in     │
 │                     │                 │ state.transfers│
 │                     │◄────────────────┤                │
 │                     │ Alert succès    │                │
 │◄────────────────────┤                 │                │
 │                     │ navigate('Historique')           │
```

---

## 7. Inventaire des écrans

| Écran | Rôle | État source | Composants clés |
|---|---|---|---|
| **LoginScreen** | Connexion + bandeau config Supabase | AuthContext | TextField, PrimaryButton |
| **SignupScreen** | Inscription + acceptation CGU | AuthContext | TextField, SegmentedPicker |
| **HomeScreen** | Dashboard, taux BCRG live, favoris, stats | Redux + Context | Card, StatBlock, TransferCard |
| **TransferScreen** | Création transfert (pavé numérique, breakdown) | Redux + Context | SegmentedPicker, Card |
| **HistoryScreen** | FlatList optimisée + recherche + filtres | Redux | TransferCard, SegmentedPicker |
| **BeneficiariesScreen** | CRUD bénéficiaires (modale d'ajout) | Redux | TextField, PrimaryButton |
| **TransferDetailScreen** | Reçu détaillé + partage natif | Redux | Card |
| **ProfileScreen** | Préférences, langue, devise, PIN, KYC, logout | Context | Switch, Modal, Alert |

---

## 8. Règles métier

### 8.1 Calcul des frais

Les frais dépendent de trois facteurs combinés :

**a) Palier de montant**

| Tranche (devise envoi) | Frais de base |
|---|---|
| 0 – 100 | 2.5 |
| 100 – 500 | 5 |
| 500 – 1 000 | 9 |
| 1 000 – 3 000 | 18 |
| > 3 000 | 30 |

**b) Multiplicateur réseau**

| Réseau | Multiplicateur |
|---|---|
| Wave | × 0.85 (le moins cher) |
| Orange Money | × 1.0 |
| MTN MoMo | × 1.05 |
| Virement bancaire | × 1.4 |

**c) Surcharge pays**

| Origine | Surcharge |
|---|---|
| Zone Euro (FR/BE/DE) | 0 % |
| US / CA / GB | + 0.5 % du montant |
| Autres | + 0.8 % du montant |

**Formule finale :**
```
fees = round((baseFee × networkMultiplier + amount × countrySurcharge / 10) × 100) / 100
```

### 8.2 Conversion monétaire

```
receivedGNF = amount × rate(currency)
totalDebit  = amount + fees
```

Le taux est récupéré au démarrage de HomeScreen via `refreshRates` (simule l'API BCRG avec une variation aléatoire de ±0.5 % pour le réalisme).

### 8.3 Statuts d'un transfert

```
[création]──►  pending  ──► completed (succès)
                  │
                  └──────► failed (rejet réseau / KYC)
```

Dans le MVP actuel, le statut est figé à `pending`. Une Edge Function Supabase pourra simuler/réaliser la transition.

---

## 9. Système de design

### 9.1 Palette

Inspirée du drapeau guinéen (vert, jaune, rouge) déclinée en tons fintech modernes.

**Mode clair :**

| Rôle | Couleur | Usage |
|---|---|---|
| `primary` | `#0B7A3B` (vert Guinée) | CTA, accents |
| `accent` | `#F5B400` (or) | Badges, mises en valeur |
| `danger` | `#D7263D` | Erreurs, suppression |
| `background` | `#F4F6FB` | Fond d'écran |
| `surface` | `#FFFFFF` | Cartes |
| `text` | `#0F172A` | Texte principal |

**Mode sombre :** dérivation cohérente, vert vif `#22C55E`, or `#FBBF24`, fond `#0B1220`.

### 9.2 Typographie

| Niveau | Taille | Poids | Usage |
|---|---|---|---|
| `display` | 32 | 800 | Titres de page |
| `h1` | 24 | 700 | En-têtes sections |
| `h2` | 20 | 700 | Sous-titres |
| `h3` | 17 | 600 | Lignes importantes |
| `body` | 15 | 500 | Texte courant |
| `small` | 13 | 500 | Métadonnées |
| `tiny` | 11 | 600 | Étiquettes (uppercase) |

### 9.3 Espacement et rayons

| Token | Valeur |
|---|---|
| `spacing.xs / sm / md / lg / xl / xxl / xxxl` | 4 / 8 / 12 / 16 / 24 / 32 / 48 |
| `radius.sm / md / lg / xl / pill` | 8 / 12 / 16 / 24 / 999 |

### 9.4 Composants atomiques fournis

- `Card` — conteneur avec ombre, padding et bordure
- `PrimaryButton` — variants `primary`, `ghost`, `soft`, `danger` + état `loading`
- `TextField` — label, hint, erreur, focus animé
- `SegmentedPicker` — chips horizontaux scrollables
- `TransferCard` — ligne d'historique avec avatar, statut, montant
- `StatBlock` — KPI compact pour dashboard

---

## 10. Procédure de démarrage

### 10.1 Installation locale

```bash
git clone <repo>
cd fintechapp
npm install
npm start
```

### 10.2 Configuration Supabase

**Étape 1 — Créer le projet**
1. Aller sur https://supabase.com et créer un nouveau projet
2. Région recommandée : `West EU (Paris)` ou `West US`
3. Plan : `Free` (suffisant pour 50 000 utilisateurs / 500 Mo)

**Étape 2 — Initialiser le schéma**
1. Ouvrir `Supabase Dashboard → SQL Editor → New query`
2. Coller le contenu intégral de `supabase/schema.sql`
3. Exécuter (`Run`)
4. Vérifier dans `Table Editor` la présence de `profiles`, `beneficiaries`, `transfers`

**Étape 3 — Récupérer les clés**
1. `Project Settings → API`
2. Copier `Project URL` et `anon public key`
3. Coller dans `app.json` :

```json
"extra": {
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGciOi..."
}
```

**Étape 4 — Désactiver la confirmation e-mail (MVP uniquement)**
1. `Authentication → Providers → Email`
2. Décocher `Confirm email`
3. Permet de tester l'inscription sans recevoir d'e-mail

**Étape 5 — Redémarrer Expo**
```bash
# Ctrl+C pour stopper, puis:
npm start
```

### 10.3 Tests fonctionnels

| Scénario | Attendu |
|---|---|
| Créer un compte | Redirection auto vers Home, profil créé en DB |
| Ajouter un bénéficiaire | Visible dans `beneficiaries` côté Supabase |
| Créer un transfert | Visible dans `transfers`, référence unique générée |
| Recharger l'app | Données conservées, session restaurée |
| Se déconnecter | Retour à LoginScreen |
| Changer la langue | Hint mis à jour, sauvegardé en DB |

---

## 11. Roadmap et extensions

### 11.1 Sprint 2 (prioritaire)

| Item | Effort | Impact |
|---|---|---|
| Intégration vraie API BCRG (HTTP) | M | Élevé |
| Confirmation e-mail + reset password | S | Moyen |
| Upload documents KYC (Supabase Storage) | M | Élevé |
| Edge Function de transition de statut | M | Moyen |
| Notifications push (Expo Notifications) | M | Moyen |

### 11.2 Sprint 3 (différenciation)

| Item | Effort | Impact |
|---|---|---|
| QR Code pour bénéficiaires | S | Moyen |
| Biométrie (`expo-local-authentication`) | S | Élevé |
| Statistiques mensuelles + graphiques | M | Moyen |
| Mode hors-ligne (SQLite cache) | L | Moyen |
| Internationalisation complète (i18n) | M | Moyen |

### 11.3 Vision long terme

| Item | Effort | Impact |
|---|---|---|
| Intégration partenaires Mobile Money réels | XL | Critique |
| IA de détection de fraude | L | Élevé |
| Blockchain (ledger immuable des transferts) | XL | Différenciant |
| Multi-bénéficiaires (un transfert vers N) | M | Élevé |
| Programme de fidélité / cashback | M | Moyen |

### 11.4 Conformité réglementaire à compléter

- Licence d'agrément BCRG (établissement de paiement)
- Audit AML/KYC indépendant
- Conformité RGPD complète (DPO, registre, droit à l'oubli)
- ISO 27001 (sécurité de l'information)
- PCI-DSS si stockage de données carte

---

## Annexes

### A. Glossaire

| Acronyme | Définition |
|---|---|
| AML | Anti-Money Laundering (lutte anti-blanchiment) |
| BCRG | Banque Centrale de la République de Guinée |
| GNF | Franc Guinéen (code ISO 4217) |
| KYC | Know Your Customer (vérification d'identité) |
| MoMo | Mobile Money |
| MVP | Minimum Viable Product |
| OTA | Over-The-Air (mise à jour à distance) |
| RGPD | Règlement Général sur la Protection des Données |
| RLS | Row Level Security (PostgreSQL) |
| RN | React Native |

### B. Dépendances clés (package.json)

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

### C. Références externes

- [Documentation Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Documentation Supabase](https://supabase.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation 7](https://reactnavigation.org/)
- [Cahier des charges initial](./cdc.txt)

---

**Fin du document.**
