const express = require("express");
const router = express.Router();
const sessionController = require("./back/controllers/sessionController");

// Simulate sessions database
const sessions = [
  {
    id: 1,
    date: "2025-03-15",
    projectId: 1,
    projectName: "Formation Dev Web",
    clientId: 1,
    clientName: "TF1",
    groupName: "Groupe A",
    cost: 3500,
    notes: "Premier module du cursus",
  },
  {
    id: 2,
    date: "2025-03-20",
    projectId: 2,
    projectName: "Formation Management",
    clientId: 2,
    clientName: "Bouygues",
    groupName: "Groupe B",
    cost: 5000,
    notes: "Session intensive de leadership",
  },
  {
    id: 3,
    date: "2025-03-25",
    projectId: 3,
    projectName: "Formation Cybersécurité",
    clientId: 1,
    clientName: "TF1",
    groupName: "Groupe C",
    cost: 4200,
    notes: "Session spéciale sécurité réseau",
  },
];

// Simulate projects budget data (for calculations)
const projectsBudget = [
  {
    id: 1,
    name: "Formation Dev Web",
    clientId: 1,
    clientName: "TF1",
    budget: 15000,
    totalCost: 10500, // Sum of all session costs for this project
  },
  {
    id: 2,
    name: "Formation Management",
    clientId: 2,
    clientName: "Bouygues",
    budget: 20000,
    totalCost: 5000,
  },
  {
    id: 3,
    name: "Formation Cybersécurité",
    clientId: 1,
    clientName: "TF1",
    budget: 18000,
    totalCost: 17500,
  },
];

// Route pour créer une nouvelle session
router.post("/", sessionController.createSession);

// Route pour récupérer toutes les sessions
router.get("/", sessionController.getAllSessions);

// Route pour récupérer une session par son ID
router.get("/:id", sessionController.getSessionById);

// Route pour mettre à jour une session
router.put("/:id", sessionController.updateSession);

// Route pour supprimer une session
router.delete("/:id", sessionController.deleteSession);

// Get budget summary for all projects
router.get("/budget-summary", (req, res) => {
  const budgetSummary = projectsBudget.map((project) => {
    const remaining = project.budget - project.totalCost;
    const usagePercentage = (project.totalCost / project.budget) * 100;

    return {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      budget: project.budget,
      totalCost: project.totalCost,
      remaining,
      usagePercentage: Math.round(usagePercentage),
    };
  });

  res.json(budgetSummary);
});

// Get sessions for a specific project
router.get("/project/:projectId", (req, res) => {
  const projectId = parseInt(req.params.projectId);

  const projectSessions = sessions.filter((s) => s.projectId === projectId);

  if (projectSessions.length === 0) {
    return res.status(404).send("No sessions found for this project");
  }

  // Format dates
  const formattedSessions = projectSessions.map((session) => {
    const date = new Date(session.date);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    return {
      ...session,
      formattedDate,
    };
  });

  res.json(formattedSessions);
});

module.exports = router;
