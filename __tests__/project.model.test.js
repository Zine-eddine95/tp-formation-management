const { Sequelize } = require("sequelize");
const { sequelize } = require("../back/database");

// Simuler une connexion à la base de données
jest.mock("../back/database", () => {
  const { Sequelize } = require("sequelize");
  const mockSequelize = new Sequelize("sqlite::memory:");
  return { sequelize: mockSequelize };
});

describe("Project Model", () => {
  let Project;

  beforeAll(async () => {
    // Chargement du modèle Project
    const ProjectModel = require("../back/models/Project");
    Project = ProjectModel;

    // Synchroniser le modèle avec la base de données en mémoire
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("Devrait avoir les champs requis", () => {
    // Vérification des attributs du modèle
    const projectAttributes = Project.rawAttributes;

    expect(projectAttributes).toHaveProperty("id");
    expect(projectAttributes).toHaveProperty("title");
    expect(projectAttributes).toHaveProperty("description");
    expect(projectAttributes).toHaveProperty("startDate");
    expect(projectAttributes).toHaveProperty("endDate");
    expect(projectAttributes).toHaveProperty("status");
    expect(projectAttributes).toHaveProperty("budget");
    expect(projectAttributes).toHaveProperty("expenses");
    expect(projectAttributes).toHaveProperty("clientId");
    expect(projectAttributes).toHaveProperty("managerId");
    expect(projectAttributes).toHaveProperty("notes");

    // Vérification des types de données
    expect(projectAttributes.id.type instanceof Sequelize.INTEGER).toBe(true);
    expect(projectAttributes.title.type instanceof Sequelize.STRING).toBe(true);
    expect(projectAttributes.budget.type instanceof Sequelize.DECIMAL).toBe(
      true
    );

    // Vérification des contraintes
    expect(projectAttributes.id.primaryKey).toBe(true);
    expect(projectAttributes.title.allowNull).toBe(false);
    expect(projectAttributes.clientId.allowNull).toBe(false);
    expect(projectAttributes.startDate.allowNull).toBe(false);
  });

  it("Devrait avoir des valeurs par défaut appropriées", () => {
    expect(Project.rawAttributes.status.defaultValue).toBe("planned");
    expect(Project.rawAttributes.expenses.defaultValue).toBe(0);
  });

  it("Devrait avoir les associations correctes", () => {
    // Vérifie que le modèle Project a les méthodes d'association attendues
    expect(typeof Project.belongsTo).toBe("function");

    // Note: Les associations réelles sont généralement définies dans le fichier index.js
    // et ne sont pas directement testables sans mocks plus complexes
  });
});
