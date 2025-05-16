const express = require("express");
const router = express.Router();
const clientController = require("./back/controllers/clientController");

// Route pour créer un nouveau client
router.post("/", clientController.createClient);

// Route pour récupérer tous les clients
router.get("/", clientController.getAllClients);

// Route pour récupérer un client par son ID
router.get("/:id", clientController.getClientById);

// Route pour mettre à jour un client
router.put("/:id", clientController.updateClient);

// Route pour supprimer un client
router.delete("/:id", clientController.deleteClient);

module.exports = router;
