# API de Réservation de Restaurant

Cette API REST complète, développée avec Node.js et Express, permet de gérer un système de réservation pour un restaurant fictif. Elle gère l'authentification des utilisateurs, les réservations, le menu du restaurant et les tables.

## Table des Matières
- [Fonctionnalités](#fonctionnalités)
- [Équipe et contributions](#équipe-et-contributions)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Documentation des Routes](#documentation-des-routes)
- [Compte de test](#comptes-de-test)

## Équipe et contributions
- ANCEY, Paul -> Test / config /controllers / database
- BADRI, Kilian -> test / controllers / middlewares / setup
- BOUDJELAL, Redha -> test / controllers / server
- SMANIOTTO, Liam -> test / controllers / routes / utils

## Fonctionnalités

L'API propose les fonctionnalités suivantes :

### Fonctionnalités de Base (Partie Obligatoire)
- **Authentification** : Inscription, connexion et JWT
- **Gestion des réservations** : Création, modification, annulation et validation
- **Menu du restaurant** : Consultation des plats par catégorie
- **Gestion des tables** : Tables de différentes capacités attribuées automatiquement

### Fonctionnalités Bonus (En développement)
- Créneaux personnalisés et gestion des horaires
- Rôles utilisateur (admin/client) avec droits spécifiques
- Filtres dynamiques sur les réservations et le menu
- Notifications simulées

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)

## Installation rapide

Pour installer et démarrer l'API en une seule commande, exécutez :

```bash
npm run setup
```

### Étapes d'installation

1. Cloner le dépôt
```bash
git clone git@github.com:PaulAncey/resto-api.git
cd resto-api
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
   - Créer un fichier `.env` à la racine du projet en suivant le modèle du fichier `.env.example`

4. Créer la base de données et importer le schéma
```bash
mysql -u votre_utilisateur -p < database.sql
```

5. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarrera sur le port spécifié dans le fichier `.env` (par défaut : 3000).

## Structure du projet

```
restaurant-api/
│
├── config/              // Configuration (DB, env, etc.)
├── controllers/         // Logique des endpoints
├── middlewares/         // Middlewares (auth, validation)
├── models/              // Modèles de données
├── routes/              // Définition des routes
├── utils/               // Fonctions utilitaires
├── .env                 // Variables d'environnement
├── package.json         // Dépendances
├── server.js            // Point d'entrée
└── database.sql         // Script SQL pour créer la base de données
```

## Base de données

Le schéma de la base de données comprend les tables suivantes :

- **users** : Utilisateurs (clients et administrateurs)
- **reservations** : Réservations des clients
- **tables** : Tables du restaurant avec leur capacité
- **reservation_tables** : Relation entre réservations et tables
- **menu_categories** : Catégories du menu
- **menu_items** : Plats du menu

Consultez le fichier `database.sql` pour le schéma complet.

## Documentation des Routes

### Authentification

| Méthode | Route | Description | Authentification | Corps de la requête | Réponse |
|---------|-------|-------------|------------------|-------------------|---------|
| POST | `/api/signup` | Créer un compte utilisateur | Non | `{ email, password, fname, lname, phone }` | `{ message, token, user }` |
| POST | `/api/login` | Se connecter | Non | `{ email, password }` | `{ message, token, user }` |
| GET | `/api/profile` | Récupérer son profil | Oui | - | `{ user }` |

### Réservations

| Méthode | Route | Description | Authentification | Rôle | Corps de la requête | Réponse |
|---------|-------|-------------|------------------|------|-------------------|---------|
| GET | `/api/reservations` | Récupérer toutes les réservations | Oui | Admin | - | `[reservations]` |
| GET | `/api/my-reservations` | Récupérer ses propres réservations | Oui | Client | - | `[reservations]` |
| POST | `/api/reservations` | Créer une réservation | Oui | Client | `{ name, phone, number_of_people, date, time, note }` | `{ message, reservation }` |
| PUT | `/api/reservations/:id` | Modifier une réservation | Oui | Client/Admin | `{ name, phone, number_of_people, date, time, note }` | `{ message, reservation }` |
| DELETE | `/api/reservations/:id` | Annuler une réservation | Oui | Client/Admin | - | `{ message, id }` |
| PATCH | `/api/reservations/:id/validate` | Valider une réservation | Oui | Admin | - | `{ message, id }` |

### Menu

| Méthode | Route | Description | Authentification | Rôle | Corps de la requête | Réponse |
|---------|-------|-------------|------------------|------|-------------------|---------|
| GET | `/api/menu` | Récupérer le menu complet | Non | - | - | `[categories]` |
| GET | `/api/menu/:id` | Récupérer un élément du menu | Non | - | - | `{ item }` |
| POST | `/api/menu` | Ajouter un élément au menu | Oui | Admin | `{ name, description, price, category_id, image_url }` | `{ message, item }` |
| PUT | `/api/menu/:id` | Modifier un élément du menu | Oui | Admin | `{ name, description, price, category_id, image_url }` | `{ message, item }` |
| DELETE | `/api/menu/:id` | Supprimer un élément du menu | Oui | Admin | - | `{ message, id }` |

### Tables

| Méthode | Route | Description | Authentification | Rôle | Corps de la requête | Réponse |
|---------|-------|-------------|------------------|------|-------------------|---------|
| GET | `/api/tables` | Récupérer toutes les tables | Oui | Admin | - | `[tables]` |
| POST | `/api/tables` | Ajouter une table | Oui | Admin | `{ seats, name }` | `{ message, table }` |
| PUT | `/api/tables/:id` | Modifier une table | Oui | Admin | `{ seats, name }` | `{ message, table }` |
| DELETE | `/api/tables/:id` | Supprimer une table | Oui | Admin | - | `{ message, id }` |

## Comptes de test

### Administrateur
- Email : `admin@restaurant.com`
- Mot de passe : `Admin123!`

### Client
- Email : `client@example.com`
- Mot de passe : `Client123!`


