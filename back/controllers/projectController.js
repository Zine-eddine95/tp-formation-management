const { Project, Client, User } = require("../models/index");

// Créer un nouveau projet
exports.createProject = async (req, res) => {
  try {
    console.log("Requête de création de projet reçue:", req.body);

    const {
      title,
      description,
      startDate,
      endDate,
      status,
      budget,
      clientId,
      managerId,
      notes,
    } = req.body;

    // Vérification des champs obligatoires
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Le titre du projet est obligatoire",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "La date de début est obligatoire",
      });
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "L'ID du client est obligatoire",
      });
    }

    // Vérifier si le client existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // Vérifier si le manager existe (si fourni)
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager non trouvé",
        });
      }
    }

    const newProject = await Project.create({
      title,
      description,
      startDate,
      endDate,
      status,
      budget,
      clientId,
      managerId,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Projet créé avec succès",
      data: newProject,
    });
  } catch (error) {
    console.error("Erreur de création de projet:", error);
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création du projet",
      error: error.message,
      details: error.toString(),
    });
  }
};

// Récupérer tous les projets
exports.getAllProjects = async (req, res) => {
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
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération des projets",
      error: error.message,
    });
  }
};

// Récupérer un projet par son ID
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findByPk(projectId, {
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
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération du projet",
      error: error.message,
    });
  }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    // Vérifier si le client existe si l'ID du client est mis à jour
    if (updates.clientId) {
      const client = await Client.findByPk(updates.clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client non trouvé",
        });
      }
    }

    // Vérifier si le manager existe si l'ID du manager est mis à jour
    if (updates.managerId) {
      const manager = await User.findByPk(updates.managerId);
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager non trouvé",
        });
      }
    }

    await project.update(updates);

    const updatedProject = await Project.findByPk(projectId, {
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
    });

    res.status(200).json({
      success: true,
      message: "Projet mis à jour avec succès",
      data: updatedProject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour du projet",
      error: error.message,
    });
  }
};

// Supprimer un projet
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: "Projet supprimé avec succès",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la suppression du projet",
      error: error.message,
    });
  }
};
