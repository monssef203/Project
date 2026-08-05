# ⌚ WatchStore — Boutique de Montres en Ligne (Maroc)

Application e-commerce full-stack pour une boutique de montres en ligne, avec tous les prix affichés en **Dirhams marocains (DH)**.

![Stack](https://img.shields.io/badge/Stack-React_+_Express-blue)
![Currency](https://img.shields.io/badge/Devise-MAD_DH-green)
![Status](https://img.shields.io/badge/Status-Production--Ready-success)

---

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Comptes de test](#comptes-de-test)
- [API Reference](#api-reference)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)

---

## ✨ Fonctionnalités

### Boutique (Frontend)
- 🏠 **Page d'accueil** avec produits vedettes et collections
- 🛍️ **Catalogue** avec recherche, filtres (marque, catégorie, prix), tri et pagination
- 📱 **Pages produit** détaillées avec sélection de quantité
- 🛒 **Panier persistant** (localStorage) avec calcul automatique
- 💳 **Checkout** avec formulaire de commande complet
- 👤 **Authentification** (inscription/connexion) avec JWT
- 📦 **Historique des commandes** pour les utilisateurs connectés

### Paiement
- 💵 **Paiement à la livraison (COD)** — Le client paie en espèces à la réception
- 💳 **Paiement par carte bancaire** — Simulation sécurisée (prêt pour intégration Stripe)

### Back-office (Admin)
- 📊 **Dashboard** avec statistiques (revenus, commandes, produits, clients)
- 📦 **Gestion des commandes** — Voir, filtrer, changer le statut, marquer comme payé
- 🛍️ **Gestion des produits** — Créer, modifier, supprimer des produits
- 👥 **Gestion des clients** — Liste des utilisateurs inscrits

---

## 🏗️ Architecture

```
Project/
├── server/              # Backend Express.js
│   ├── index.js         # Point d'entrée
│   ├── db/
│   │   ├── database.js  # Connexion SQLite
│   │   ├── schema.sql   # Schéma de la BDD
│   │   └── seed.js      # Données initiales
│   ├── middleware/
│   │   └── auth.js      # JWT + rôles
│   ├── routes/
│   │   ├── auth.js      # Auth endpoints
│   │   ├── products.js  # Produits endpoints
│   │   ├── orders.js    # Commandes endpoints
│   │   └── admin.js     # Admin endpoints
│   └── utils/
│       └── helpers.js   # Utilitaires
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Navbar, Footer
│   │   ├── pages/       # Pages de l'application
│   │   ├── context/     # AuthContext, CartContext
│   │   └── utils/       # API client
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Base de données | SQLite (better-sqlite3) |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Sécurité | Helmet, CORS, Rate Limiting |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |

---

## 🚀 Installation

### Prérequis
- Node.js >= 18
- npm >= 9

### Étapes

```bash
# 1. Installer les dépendances
cd Project
npm install

# 2. Initialiser la base de données
npm run seed

# 3. Lancer le serveur de développement
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### Build de production

```bash
# Compiler le frontend
cd client && npm run build

# Lancer en production
cd server && npm start
```

Le frontend sera servi par Express sur le port 5000.

---

## ⚙️ Configuration

Variables d'environnement (optionnel) :

```bash
# server/.env
PORT=5000
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-tres-long-et-securise
CLIENT_URL=http://localhost:5173
```

Par défaut :
- Port backend : `5000`
- Port frontend dev : `5173`
- JWT expire après : `7 jours`

---

## 👤 Comptes de test

Après avoir exécuté `npm run seed` :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@watchstore.ma` | `admin123` |
| Client | `client@test.ma` | `test123` |

---

## 📡 API Reference

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur |
| PUT | `/api/auth/profile` | Modifier profil |

### Produits
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste (filtres: search, brand, category, min_price, max_price, sort, page) |
| GET | `/api/products/brands` | Marques disponibles |
| GET | `/api/products/categories` | Catégories |
| GET | `/api/products/:id` | Détail produit |
| POST | `/api/products` | Créer produit 🔒 |
| PUT | `/api/products/:id` | Modifier produit 🔒 |
| DELETE | `/api/products/:id` | Supprimer produit 🔒 |

### Commandes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/orders` | Créer commande |
| GET | `/api/orders` | Mes commandes 🔒 |
| GET | `/api/orders/:id` | Détail commande 🔒 |

### Admin 🔒
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/dashboard` | Statistiques |
| GET | `/api/admin/orders` | Toutes commandes |
| GET | `/api/admin/orders/:id` | Détail commande |
| PUT | `/api/admin/orders/:id/status` | Changer statut |
| PUT | `/api/admin/orders/:id/payment` | Changer paiement |
| GET | `/api/admin/users` | Utilisateurs |
| GET | `/api/admin/products` | Produits (admin) |

🔒 = Authentification requise

---

## 🔒 Sécurité

- **Mots de passe** : Hashés avec bcrypt (10 rounds)
- **JWT** : Tokens sécurisés, expiration 7 jours
- **Rate Limiting** : 100 requêtes/15min (20 pour auth)
- **Helmet** : Headers HTTP de sécurité
- **CORS** : Restriction des origines
- **Validation** : Tous les inputs sont validés et sanitisés
- **Transactions** : Opérations BDD atomiques (stocks, commandes)

### Intégration paiement réel
Pour un déploiement en production, remplacez la simulation de paiement par :
- [Stripe](https://stripe.com/docs/api) (supporte les cartes marocaines)
- [PayPal](https://developer.paypal.com/docs/api/)
- [CMI](https://www.cmi.ma) (Centre Monétique Interbancaire - Maroc)

---

## 🌍 Déploiement

### Sur un VPS (Ubuntu)

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Cloner et installer
git clone <repo-url> watchstore
cd watchstore
npm install
npm run seed

# Build frontend
cd client && npm run build

# Process manager
sudo npm install -g pm2
cd ../server
pm2 start index.js --name watchstore
pm2 save
pm2 startup
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name watchstore.ma;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd client && npm run build
RUN cd server && npm install
EXPOSE 5000
CMD ["node", "server/index.js"]
```

---

## 📝 Licence

MIT © WatchStore 2024

---

## 🤝 Support

Pour toute question : contact@watchstore.ma

**WatchStore** — L'élégance au poignet 🇲🇦
