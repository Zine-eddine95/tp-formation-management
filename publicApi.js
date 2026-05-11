const express = require("express");
const router = express.Router();
const { Project, Client, Fund, User } = require("./back/models/index");

require("dotenv").config();

// Middleware d'authentification par API key
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Clé API manquante. Fournissez l'en-tête X-API-Key.",
    });
  }

  if (apiKey !== process.env.PUBLIC_API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Clé API invalide.",
    });
  }

  next();
};

// Appliquer l'auth à toutes les routes de ce router
router.use(apiKeyAuth);

// ---------------------------------------------------------------------------
// PROJETS (lecture seule)
// ---------------------------------------------------------------------------

// GET /public/api/projects - Liste tous les projets
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "contactPerson"],
        },
        {
          model: User,
          as: "manager",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "startDate",
        "endDate",
        "status",
        "budget",
        "expenses",
        "notes",
      ],
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /public/api/projects/:id - Détail d'un projet
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "contactPerson", "email", "phone"],
        },
        {
          model: User,
          as: "manager",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "startDate",
        "endDate",
        "status",
        "budget",
        "expenses",
        "notes",
      ],
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Projet non trouvé." });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------------------------------------
// APPELS DE FOND (création)
// ---------------------------------------------------------------------------

// POST /public/api/funds - Créer un appel de fond lié à un projet
router.post("/funds", async (req, res) => {
  try {
    const { title, description, amount, projectId, requestedById, notes } =
      req.body;

    // Validation des champs obligatoires
    if (!title || !amount || !projectId || !requestedById) {
      return res.status(400).json({
        success: false,
        message:
          "Champs obligatoires manquants : title, amount, projectId, requestedById.",
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant doit être un nombre positif.",
      });
    }

    // Vérifier que le projet existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Projet non trouvé." });
    }

    // Vérifier que le demandeur existe
    const user = await User.findByPk(requestedById);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur demandeur non trouvé." });
    }

    const fund = await Fund.create({
      title,
      description,
      amount: Number(amount),
      projectId,
      requestedById,
      notes,
      status: "pending",
    });

    res.status(201).json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
