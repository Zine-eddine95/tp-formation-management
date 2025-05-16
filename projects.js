const express = require("express");
const router = express.Router();
const projectController = require("./back/controllers/projectController");

// Route pour créer un nouveau projet
router.post("/", projectController.createProject);

// Route pour récupérer tous les projets
router.get("/", projectController.getAllProjects);

// Route pour récupérer un projet par son ID
router.get("/:id", projectController.getProjectById);

// Route pour mettre à jour un projet
router.put("/:id", projectController.updateProject);

// Route pour supprimer un projet
router.delete("/:id", projectController.deleteProject);

module.exports = router;
