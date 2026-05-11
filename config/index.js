/**
 * config/index.js — Chargement centralisé de la configuration
 *
 * En production / staging : les variables sont injectées directement
 * par la plateforme de déploiement (Railway dashboard). Aucun fichier .env.
 *
 * En développement local : créer config/local.json à partir de
 * config/local.example.json (fichier gitignored).
 */

const fs = require("fs");
const path = require("path");

// Chargement du fichier local uniquement hors production/staging
const env = process.env.NODE_ENV || "development";
if (env !== "production" && env !== "staging") {
  const localPath = path.join(__dirname, "local.json");
  if (fs.existsSync(localPath)) {
    try {
      const local = JSON.parse(fs.readFileSync(localPath, "utf8"));
      Object.entries(local).forEach(([key, value]) => {
        if (process.env[key] === undefined) {
          process.env[key] = String(value);
        }
      });
    } catch (e) {
      console.error(
        "[config] Erreur chargement config/local.json :",
        e.message,
      );
    }
  } else {
    console.warn(
      "[config] config/local.json introuvable. " +
        "Copiez config/local.example.json vers config/local.json et remplissez les valeurs.",
    );
  }
}

module.exports = {
  server: {
    port: parseInt(process.env.PORT) || 3000,
    env,
  },
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "gestion_formation",
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || "24h",
  },
  publicApi: {
    key: process.env.PUBLIC_API_KEY,
  },
  swagger: {
    // Identifiants HTTP Basic Auth pour accéder au swagger (ne jamais mettre ici en dur)
    user: process.env.SWAGGER_USER || "admin",
    password: process.env.SWAGGER_PASSWORD,
    // IPs autorisées pour le swagger (comma-separated, ex: "10.0.0.0/8,192.168.1.5")
    // Géré dans config/allowed-ips.json — cette clé n'est pas un secret
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
};
