#!/usr/bin/env node
/**
 * deploy.js — Script de déploiement
 *
 * Usage : node deploy.js <version>
 * Exemple : node deploy.js 1.1
 *
 * Crée un snapshot du code source dans releases/<version>/
 * Déclenché à chaque push Git (ou manuellement).
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const version = process.argv[2];

if (!version) {
  console.error("Usage: node deploy.js <version>");
  console.error("Exemple: node deploy.js 1.1");
  process.exit(1);
}

// Dossiers et fichiers exclus du snapshot
const EXCLUDE = new Set([
  "node_modules",
  ".git",
  "releases",
  "shared",
  "env",
  ".env",
  "var",
]);

const releaseDir = path.join(ROOT, "releases", version);

if (fs.existsSync(releaseDir)) {
  console.error(`Erreur : la version ${version} existe déjà dans releases/`);
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (EXCLUDE.has(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log(`Création de la release ${version}...`);
fs.mkdirSync(releaseDir, { recursive: true });

for (const entry of fs.readdirSync(ROOT)) {
  if (EXCLUDE.has(entry)) continue;
  copyRecursive(path.join(ROOT, entry), path.join(releaseDir, entry));
}

// Écrire un fichier de métadonnées dans la release
const meta = {
  version,
  deployedAt: new Date().toISOString(),
  deployedBy: process.env.USERNAME || process.env.USER || "unknown",
};
fs.writeFileSync(
  path.join(releaseDir, "release.json"),
  JSON.stringify(meta, null, 2),
);

console.log(`✓ Release ${version} créée dans releases/${version}/`);
console.log(`  Déployée le : ${meta.deployedAt}`);
