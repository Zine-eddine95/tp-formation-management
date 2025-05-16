const {
  Session,
  Project,
  User,
  Enrollment,
  Participant,
} = require("../models/index");

// Créer une nouvelle session
exports.createSession = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      isOnline,
      capacity,
      price,
      projectId,
      trainerId,
      status,
      notes,
    } = req.body;

    // Vérifier si le projet existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    // Vérifier si le formateur existe (si fourni)
    if (trainerId) {
      const trainer = await User.findByPk(trainerId);
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: "Formateur non trouvé",
        });
      }
    }

    const newSession = await Session.create({
      title,
      description,
      startDate,
      endDate,
      location,
      isOnline,
      capacity,
      price,
      projectId,
      trainerId,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Session créée avec succès",
      data: newSession,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création de la session",
      error: error.message,
    });
  }
};

// Récupérer toutes les sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: [
        { model: Project, as: "project" },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération des sessions",
      error: error.message,
    });
  }
};

// Récupérer une session par son ID
exports.getSessionById = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findByPk(sessionId, {
      include: [
        { model: Project, as: "project" },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Enrollment,
          as: "enrollments",
          include: [{ model: Participant, as: "participant" }],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération de la session",
      error: error.message,
    });
  }
};

// Mettre à jour une session
exports.updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const updates = req.body;

    const session = await Session.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session non trouvée",
      });
    }

    // Vérifier si le projet existe si l'ID du projet est mis à jour
    if (updates.projectId) {
      const project = await Project.findByPk(updates.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Projet non trouvé",
        });
      }
    }

    // Vérifier si le formateur existe si l'ID du formateur est mis à jour
    if (updates.trainerId) {
      const trainer = await User.findByPk(updates.trainerId);
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: "Formateur non trouvé",
        });
      }
    }

    await session.update(updates);

    const updatedSession = await Session.findByPk(sessionId, {
      include: [
        { model: Project, as: "project" },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Session mise à jour avec succès",
      data: updatedSession,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour de la session",
      error: error.message,
    });
  }
};

// Supprimer une session
exports.deleteSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session non trouvée",
      });
    }

    await session.destroy();

    res.status(200).json({
      success: true,
      message: "Session supprimée avec succès",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la suppression de la session",
      error: error.message,
    });
  }
};
