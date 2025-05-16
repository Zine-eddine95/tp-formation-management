const { Sequelize } = require("sequelize");

// Configuration de la connexion à la base de données MySQL
const sequelize = new Sequelize("gestion_formation", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

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
