const { Sequelize } = require("sequelize");

// Charger les variables d'environnement si pas déjà fait
require('dotenv').config();

// Configuration de la connexion à la base de données MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || "gestion_formation",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

// Tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion à la base de données établie avec succès.");
  } catch (error) {
    console.error("Impossible de se connecter à la base de données:", error);
  }
};

// Exporter l'instance Sequelize pour l'utiliser dans les modèles
module.exports = { sequelize, testConnection };
