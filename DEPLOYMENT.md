# Plan de Déploiement — Formation Management

## Environnements

| Environnement | Branche Git | URL                                | Base de données         |
| ------------- | ----------- | ---------------------------------- | ----------------------- |
| Production    | `main`      | https://formation.votredomaine.com | Railway MySQL (prod)    |
| Staging       | `dev`       | https://staging.votredomaine.com   | Railway MySQL (staging) |
| Test          | —           | localhost:3002                     | SQLite :memory: (Jest)  |
| Développement | —           | localhost:3000                     | MySQL local             |

---

## Pipeline de déploiement

```
Développeur
    │
    ├─ git push origin dev
    │       └─► Railway (staging) déploie automatiquement
    │               └─► Tests manuels / validation QA
    │
    └─ git push origin main  (après merge de dev)
            └─► Railway (production) déploie automatiquement
```

### Étapes d'un déploiement Railway

1. Push sur la branche configurée (`dev` → staging, `main` → production)
2. Railway détecte le push et lance le build (Nixpacks, détecte Node.js automatiquement)
3. `npm install` est exécuté automatiquement
4. La commande `node app.js` est lancée (définie dans `railway.json`)
5. Les variables d'environnement sont injectées depuis le dashboard Railway (pas de `.env`)
6. La base de données se synchronise via `sequelize.sync({ alter: true })`

### Rollback

En cas de problème :

- Dashboard Railway → onglet **Deployments** → cliquer **Redeploy** sur la version précédente
- Ou : `git revert` + push pour déclencher un redéploiement

---

## Gestion des secrets

**Principe : aucune clé ni credential dans le code source ou dans un fichier `.env` commité.**

| Environnement | Méthode de stockage des secrets                |
| ------------- | ---------------------------------------------- |
| Production    | Railway Variables (dashboard)                  |
| Staging       | Railway Variables (dashboard)                  |
| Développement | `config/local.json` (gitignored)               |
| Test (Jest)   | `env/test.env` (valeurs de test non sensibles) |

### Variables à configurer dans Railway

```
NODE_ENV=production          # ou staging
PORT=                        # injecté automatiquement par Railway
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DIALECT=mysql
JWT_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRATION=8h
PUBLIC_API_KEY=<clé communiquée à l'équipe partenaire>
SWAGGER_USER=admin
SWAGGER_PASSWORD=<mot de passe fort>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

## Snapshots locaux (releases/)

À chaque déploiement significatif, créer un snapshot local :

```bash
node deploy.js 1.1
```

Ce snapshot est local uniquement (dossier `releases/` gitignored) et sert d'archive de référence.

---

## Checklist avant déploiement en production

- [ ] Toutes les variables Railway sont configurées
- [ ] `config/allowed-ips.json` contient les vraies IPs des serveurs partenaires
- [ ] Tests passent : `npm test`
- [ ] `JWT_SECRET` est une clé forte (≥ 32 bytes aléatoires)
- [ ] `PUBLIC_API_KEY` communiquée à l'équipe partenaire par canal sécurisé
- [ ] `SWAGGER_PASSWORD` configuré et communiqué à l'équipe interne
- [ ] Branche `dev` validée en staging avant merge sur `main`
