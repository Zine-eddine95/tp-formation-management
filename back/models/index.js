const { sequelize } = require("../database");
const User = require("./User");
const Client = require("./Client");
const Project = require("./Project");
const Session = require("./Session");
const Fund = require("./Fund");
const Participant = require("./Participant");
const Enrollment = require("./Enrollment");

// Associations entre les modèles

// Relations User <-> Project (un manager peut gérer plusieurs projets)
User.hasMany(Project, { foreignKey: "managerId", as: "managedProjects" });
Project.belongsTo(User, { foreignKey: "managerId", as: "manager" });

// Relations User <-> Session (un formateur peut animer plusieurs sessions)
User.hasMany(Session, { foreignKey: "trainerId", as: "trainedSessions" });
Session.belongsTo(User, { foreignKey: "trainerId", as: "trainer" });

// Relations User <-> Fund (demandes et approbations)
User.hasMany(Fund, { foreignKey: "requestedById", as: "fundRequests" });
Fund.belongsTo(User, { foreignKey: "requestedById", as: "requestedBy" });

User.hasMany(Fund, { foreignKey: "approvedById", as: "approvedFunds" });
Fund.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });

// Relations Client <-> Project (un client peut avoir plusieurs projets)
Client.hasMany(Project, { foreignKey: "clientId", as: "projects" });
Project.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Relations Client <-> Participant (un client peut avoir plusieurs participants)
Client.hasMany(Participant, { foreignKey: "clientId", as: "participants" });
Participant.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Relations Project <-> Session (un projet peut avoir plusieurs sessions)
Project.hasMany(Session, { foreignKey: "projectId", as: "sessions" });
Session.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Relations Project <-> Fund (un projet peut avoir plusieurs demandes de fonds)
Project.hasMany(Fund, { foreignKey: "projectId", as: "funds" });
Fund.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Relations Session <-> Enrollment (une session peut avoir plusieurs inscriptions)
Session.hasMany(Enrollment, { foreignKey: "sessionId", as: "enrollments" });
Enrollment.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

// Relations Participant <-> Enrollment (un participant peut s'inscrire à plusieurs sessions)
Participant.hasMany(Enrollment, {
  foreignKey: "participantId",
  as: "enrollments",
});
Enrollment.belongsTo(Participant, {
  foreignKey: "participantId",
  as: "participant",
});

// Synchronisation des modèles avec la base de données
const syncDatabase = async () => {
  try {
    // Forcer la recréation des tables
    await sequelize.sync({ force: true });
    console.log("Base de données synchronisée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation de la base de données:",
      error
    );
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Client,
  Project,
  Session,
  Fund,
  Participant,
  Enrollment,
};
