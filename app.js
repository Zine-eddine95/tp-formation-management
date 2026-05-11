// Charger les variables d'environnement
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const userRouter = require("./users");
const clientRouter = require("./clients");
const projectRouter = require("./projects");
const fundRouter = require("./funds");
const sessionRouter = require("./sessions");
const authRouter = require("./auth");
const publicApiRouter = require("./publicApi");

// Importation des modèles et initialisation de la base de données
const { testConnection } = require("./back/database");
const { syncDatabase } = require("./back/models/index");

// Initialisation de la base de données
(async () => {
  await testConnection();
  await syncDatabase();
})();

// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRouter);

// User management routes
app.use("/api/users", userRouter);

// Client management routes
app.use("/api/clients", clientRouter);

// Project management routes
app.use("/api/projects", projectRouter);

// Fund request management routes
app.use("/api/funds", fundRouter);

// Session management routes
app.use("/api/sessions", sessionRouter);

// Public external API (API key protected)
app.use("/public/api", publicApiRouter);

// Route de base
app.get("/", (req, res) => {
  res.send("Bienvenue sur l'outil de gestion budgétaire des formations!");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
