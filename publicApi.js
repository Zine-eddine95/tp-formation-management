/**
 * publicApi.js — API externe sécurisée
 *
 * Accès : /public/api/*
 * Auth  : en-tête X-API-Key (clé communiquée par l'équipe technique)
 * IP    : restreint aux serveurs partenaires en staging/production
 *         (voir config/allowed-ips.json)
 */

const express = require("express");
const router = express.Router();
const { Project, Client, Fund, User } = require("./back/models/index");
const config = require("./config");

// ---------------------------------------------------------------------------
// Middleware : authentification par API key
// ---------------------------------------------------------------------------
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Clé API manquante. Fournissez l'en-tête X-API-Key.",
    });
  }

  if (!config.publicApi.key || apiKey !== config.publicApi.key) {
    return res.status(403).json({
      success: false,
      message: "Clé API invalide.",
    });
  }

  next();
};

router.use(apiKeyAuth);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calcule la balance financière d'un projet.
 * balance = budget alloué - dépenses engagées
 */
function computeBalance(project) {
  const budget = parseFloat(project.budget) || 0;
  const expenses = parseFloat(project.expenses) || 0;
  return parseFloat((budget - expenses).toFixed(2));
}

function serializeProject(project) {
  const p = project.toJSON ? project.toJSON() : project;
  return { ...p, balance: computeBalance(p) };
}

// ---------------------------------------------------------------------------
// PROJETS — lecture seule
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Liste tous les projets avec leur balance financière
 *     tags: [Projets]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Liste des projets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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

    res.json({ success: true, data: projects.map(serializeProject) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Détail d'un projet avec sa balance financière
 *     tags: [Projets]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du projet
 *     responses:
 *       200:
 *         description: Détail du projet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectDetail'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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

    res.json({ success: true, data: serializeProject(project) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------------------------------------------------------------------------
// APPELS DE FOND — création
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /funds:
 *   post:
 *     summary: Créer un appel de fond pour un projet
 *     description: >
 *       Soumettre une demande de financement supplémentaire lorsqu'un projet
 *       présente une balance insuffisante. La demande est créée avec le statut
 *       "pending" et doit être approuvée par un responsable.
 *     tags: [Appels de fond]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FundRequest'
 *           example:
 *             title: "Financement formation React"
 *             description: "Budget initial insuffisant suite à l'ajout de 3 participants"
 *             amount: 2500.00
 *             projectId: 1
 *             requestedById: 4
 *             notes: "Urgent - session dans 2 semaines"
 *     responses:
 *       201:
 *         description: Appel de fond créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Fund'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post("/funds", async (req, res) => {
  try {
    const { title, description, amount, projectId, requestedById, notes } =
      req.body;

    if (!title || !amount || !projectId || !requestedById) {
      return res.status(400).json({
        success: false,
        message:
          "Champs obligatoires manquants : title, amount, projectId, requestedById.",
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Le montant doit être un nombre positif.",
        });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Projet non trouvé." });
    }

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
