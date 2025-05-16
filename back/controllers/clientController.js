const { Client } = require("../models/index");

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      notes,
    } = req.body;

    const newClient = await Client.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Client créé avec succès",
      data: newClient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création du client",
      error: error.message,
    });
  }
};

// Récupérer tous les clients
exports.getAllClients = async (req, res) => {
  try {
    console.log("Récupération de tous les clients...");
    const clients = await Client.findAll();
    console.log(`${clients.length} clients trouvés`);

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération des clients",
      error: error.message,
    });
  }
};

// Récupérer un client par son ID
exports.getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération du client",
      error: error.message,
    });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updates = req.body;

    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    await client.update(updates);

    const updatedClient = await Client.findByPk(clientId);

    res.status(200).json({
      success: true,
      message: "Client mis à jour avec succès",
      data: updatedClient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour du client",
      error: error.message,
    });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    await client.destroy();

    res.status(200).json({
      success: true,
      message: "Client supprimé avec succès",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la suppression du client",
      error: error.message,
    });
  }
};
