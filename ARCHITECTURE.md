# Architecture Serveur — Formation Management

## Vue d'ensemble

```
Internet
   │
   ▼
┌─────────────────────────────────────────────────┐
│              Railway (PaaS)                     │
│                                                 │
│  ┌────────────────────┐   ┌───────────────────┐ │
│  │  Node.js Service   │   │  MySQL Service    │ │
│  │  (Express 4)       │◄──┤  (Railway MySQL)  │ │
│  │  Port: injecté     │   │  Port: 3306        │ │
│  │  par Railway       │   │                   │ │
│  └────────┬───────────┘   └───────────────────┘ │
│           │                                     │
└───────────┼─────────────────────────────────────┘
            │ HTTPS (Railway reverse proxy)
            ▼
       ┌────────────┐
       │  Internet  │
       └────────────┘
```

---

## Couches de l'application Node.js

```
Requête HTTP
     │
     ▼
Express (app.js)
     │
     ├── express.static()         ← Fichiers HTML/JS frontend (public/)
     │
     ├── /api/auth                ← Login JWT (authRouter)
     ├── /api/users               ← CRUD utilisateurs (auth JWT requise)
     ├── /api/clients             ← CRUD clients      (auth JWT requise)
     ├── /api/projects            ← CRUD projets      (auth JWT requise)
     ├── /api/funds               ← CRUD appels fond  (auth JWT requise)
     ├── /api/sessions            ← CRUD sessions     (auth JWT requise)
     │
     ├── /public/api              ← API externe
     │       ├── ipWhitelist('api')   ← Restriction IP serveurs partenaires
     │       ├── apiKeyAuth           ← Vérification X-API-Key
     │       ├── GET  /projects       ← Balance financière (lecture seule)
     │       ├── GET  /projects/:id
     │       └── POST /funds          ← Création appel de fond
     │
     └── /api-docs                ← Swagger UI
             ├── ipWhitelist('swagger') ← Restriction IP réseau entreprise
             └── basicAuth            ← HTTP Basic Auth (user/password)
```

---

## Sécurité de l'API externe (/public/api)

### Double protection en production/staging

1. **Restriction IP** (`middleware/ipWhitelist.js`)
   - Seules les IPs des serveurs partenaires peuvent accéder à `/public/api`
   - Liste configurée dans `config/allowed-ips.json` (version, pas secret)
   - En développement : `"*"` (toutes IPs autorisées pour les tests)

2. **API Key** (en-tête `X-API-Key`)
   - Clé générée aléatoirement (256 bits hex), stockée dans Railway Variables
   - Jamais dans le code source ni dans un fichier commité
   - Rotation possible sans redéploiement (changement de variable Railway)

### Flux d'une requête API partenaire

```
Application partenaire
        │
        │  HTTPS  X-API-Key: <clé>
        ▼
Railway Edge (HTTPS termination)
        │
        │  HTTP interne
        ▼
Express /public/api
        │
        ├── ipWhitelist : IP source dans la liste ? ──Non──► 403
        │
        ├── apiKeyAuth  : X-API-Key valide ?         ──Non──► 401/403
        │
        └── Route handler : requête MySQL → JSON response
```

---

## Sécurité de la documentation Swagger (/api-docs)

```
Navigateur web
      │
      │  HTTPS
      ▼
/api-docs
      │
      ├── ipWhitelist('swagger') : IP dans plage entreprise ? ──Non──► 403
      │
      ├── HTTP Basic Auth        : user/password valides ?    ──Non──► 401
      │
      └── swagger-ui-express     : documentation interactive
```

**Plages IP autorisées pour Swagger** (configurées dans `config/allowed-ips.json`) :

- `10.0.0.0/8` — réseau interne entreprise
- `192.168.0.0/16` — VPN / LAN bureau
- À remplacer par l'IP publique réelle du bureau/VPN de l'entreprise

---

## Gestion de la configuration

```
Environnement      Source des variables
─────────────      ────────────────────
Production         Railway Variables (dashboard)        ← jamais dans .env
Staging            Railway Variables (dashboard)        ← jamais dans .env
Développement      config/local.json (gitignored)       ← copie de local.example.json
Test               process.env + SQLite :memory:
```

**Chargement** : `config/index.js` (point d'entrée unique, première ligne de app.js)

- Lit `config/local.json` si `NODE_ENV` ≠ production/staging
- Injecte les valeurs dans `process.env`
- Exporte un objet typé `config.*`

---

## Branching et environnements

```
main (production)
  ▲
  │  merge après validation staging
  │
dev (staging)
  ▲
  │  feature branches fusionnées ici
  │
feature/xxx
```

- `dev` → déploiement automatique sur **Railway Staging**
- `main` → déploiement automatique sur **Railway Production**

---

## Structure des fichiers de déploiement

```
projet/
├── config/
│   ├── index.js              ← Chargeur de config (commité)
│   ├── local.example.json    ← Template avec clés vides (commité)
│   ├── local.json            ← Secrets dev (GITIGNORED)
│   └── allowed-ips.json      ← Listes IP par environnement (commité)
│
├── middleware/
│   └── ipWhitelist.js        ← Middleware restriction IP (commité)
│
├── railway.json              ← Config Railway (commité)
├── deploy.js                 ← Script snapshot local (commité)
│
├── releases/                 ← Snapshots locaux (GITIGNORED)
│   └── 1.0/
│       └── ...
│
└── env/                      ← Templates d'environnement (commité)
    ├── prod.env
    ├── staging.env
    └── test.env
```
