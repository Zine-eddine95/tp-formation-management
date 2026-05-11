const {
  Session,
  Project,
  User,
  Enrollment,
  Participant,
} = require("../models/index");

const emailService = require("../services/emailService");
const pdfService = require("../services/pdfService");
const fs = require("fs");
const path = require("path");

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

// Envoyer un email de confirmation aux participants d'une session
exports.sendSessionEmail = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { type } = req.body; // type: 'enrollment', 'reminder', 'update', 'cancellation'

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

    if (!session.enrollments || session.enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun participant inscrit à cette session",
      });
    }

    const results = [];
    const errors = [];

    for (const enrollment of session.enrollments) {
      const participant = enrollment.participant;

      if (!participant.email) {
        errors.push({
          participant: `${participant.firstName} ${participant.lastName}`,
          error: "Email non disponible",
        });
        continue;
      }

      try {
        let emailResult;

        switch (type) {
          case "reminder":
            emailResult = await emailService.sendSessionReminderEmail(
              participant,
              session,
              session.trainer
            );
            break;
          case "update":
            const changes =
              req.body.changes ||
              "Des modifications ont été apportées à la session.";
            emailResult = await emailService.sendSessionUpdateEmail(
              participant,
              session,
              changes
            );
            break;
          case "cancellation":
            emailResult = await emailService.sendSessionCancellationEmail(
              participant,
              session
            );
            break;
          case "enrollment":
          default:
            emailResult = await emailService.sendSessionEnrollmentEmail(
              participant,
              session,
              session.trainer
            );
            break;
        }

        results.push({
          participant: `${participant.firstName} ${participant.lastName}`,
          email: participant.email,
          status: "envoyé",
          messageId: emailResult.messageId,
        });
      } catch (error) {
        errors.push({
          participant: `${participant.firstName} ${participant.lastName}`,
          email: participant.email,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Emails envoyés à ${results.length} participant(s)`,
      data: {
        sent: results,
        errors: errors,
        total: session.enrollments.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi des emails",
      error: error.message,
    });
  }
};

// Générer un PDF pour une session
exports.generateSessionPDF = async (req, res) => {
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

    const { filePath, fileName } = await pdfService.generateSessionPDF(
      session.toJSON(),
      session.enrollments
    );

    // Envoyer le fichier
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi du PDF:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoi du PDF",
            error: err.message,
          });
        }
      }

      // Supprimer le fichier temporaire après l'envoi
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(
              "Erreur lors de la suppression du fichier temporaire:",
              unlinkErr
            );
          }
        });
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du PDF",
      error: error.message,
    });
  }
};

// Générer un certificat de participation pour un participant
exports.generateParticipationCertificate = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const participantId = req.params.participantId;

    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: Enrollment,
          as: "enrollments",
          where: { participantId: participantId },
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

    if (!session.enrollments || session.enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Participant non inscrit à cette session",
      });
    }

    const participant = session.enrollments[0].participant;

    const { filePath, fileName } =
      await pdfService.generateParticipationCertificate(participant, session);

    // Envoyer le fichier
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi du certificat:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoi du certificat",
            error: err.message,
          });
        }
      }

      // Supprimer le fichier temporaire après l'envoi
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(
              "Erreur lors de la suppression du fichier temporaire:",
              unlinkErr
            );
          }
        });
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du certificat",
      error: error.message,
    });
  }
};
