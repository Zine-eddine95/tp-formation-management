const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");
const http = require("http");

// Importer les modèles Sequelize et les fonctions de connexion
const { User, syncDatabase } = require("./back/models/index");
const { testConnection } = require("./back/database");

const app = express();
const port = 3001;
const JWT_SECRET = "your-secret-key";

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Utiliser les routes des projets
app.use("/api/projects", require("./projects"));

// Initialiser la connexion à la base de données
(async () => {
  try {
    await testConnection();
    await syncDatabase();
    console.log("Connexion à la base de données réussie");

    // Vérifier si l'utilisateur admin existe, sinon le créer
    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
      await User.create({
        username: "admin",
        password: "admin123", // Le hook bcrypt dans le modèle User hashera automatiquement le mot de passe
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      console.log("Utilisateur admin créé avec succès");
    }
  } catch (error) {
    console.error("Erreur d'initialisation de la base de données:", error);
  }
})();

// Authentication routes
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Vérifier le mot de passe
    const passwordMatch = await user.verifyPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });

    // Retourner les infos utilisateur sans le mot de passe
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      message: "Authentification réussie",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Cet utilisateur existe déjà (nom d'utilisateur ou email déjà utilisé)",
      });
    }

    // Créer un nouvel utilisateur
    const newUser = await User.create({
      username,
      password, // Le hook dans le modèle User hachera automatiquement le mot de passe
      email,
      firstName,
      lastName,
      role: "user",
    });

    // Créer le token JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Retourner les infos utilisateur sans le mot de passe
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
});

// Get all users (for testing)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Erreur de récupération des utilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
});

// Protected route example
app.get("/api/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Aucun token fourni",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer l'utilisateur de la base de données
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
});

// Start the server
app
  .listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  })
  .on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.log(
        `Le port ${port} est déjà utilisé, tentative avec le port ${port + 1}`
      );
      app.listen(port + 1, () => {
        console.log(`Server running at http://localhost:${port + 1}`);
      });
    } else {
      console.error(e);
    }
  });
