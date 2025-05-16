const projectController = require("../back/controllers/projectController");
const Project = require("../back/models/project.model");
const Client = require("../back/models/client.model");

// Mock des modèles
jest.mock("../back/models/project.model");
jest.mock("../back/models/client.model");

describe("Project Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("Devrait créer un projet avec succès", async () => {
      // Arrange
      const mockClient = { id: 1, name: "Test Client" };
      const mockProject = {
        id: 1,
        title: "Test Project",
        description: "Test Description",
        startDate: "2023-01-01",
        clientId: 1,
        budget: 10000,
      };

      req.body = {
        title: "Test Project",
        description: "Test Description",
        startDate: "2023-01-01",
        clientId: 1,
        budget: 10000,
      };

      Client.findByPk.mockResolvedValue(mockClient);
      Project.create.mockResolvedValue(mockProject);

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(Client.findByPk).toHaveBeenCalledWith(1);
      expect(Project.create).toHaveBeenCalledWith({
        title: "Test Project",
        description: "Test Description",
        startDate: "2023-01-01",
        clientId: 1,
        budget: 10000,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
      });
    });

    it("Devrait retourner une erreur si les champs obligatoires sont manquants", async () => {
      // Arrange
      req.body = { description: "Test Description" };

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Le titre du projet est obligatoire",
      });
    });

    it("Devrait retourner une erreur si le client n'existe pas", async () => {
      // Arrange
      req.body = {
        title: "Test Project",
        description: "Test Description",
        startDate: "2023-01-01",
        clientId: 999,
        budget: 10000,
      };

      Client.findByPk.mockResolvedValue(null);

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(Client.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Client non trouvé",
      });
    });
  });

  describe("getAllProjects", () => {
    it("Devrait retourner tous les projets", async () => {
      // Arrange
      const mockProjects = [
        {
          id: 1,
          title: "Project 1",
          description: "Description 1",
        },
        {
          id: 2,
          title: "Project 2",
          description: "Description 2",
        },
      ];

      Project.findAll.mockResolvedValue(mockProjects);

      // Act
      await projectController.getAllProjects(req, res);

      // Assert
      expect(Project.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
      });
    });
  });

  describe("getProjectById", () => {
    it("Devrait retourner un projet par son ID", async () => {
      // Arrange
      const mockProject = {
        id: 1,
        title: "Test Project",
        description: "Test Description",
      };

      req.params.id = 1;
      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.getProjectById(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith(1, expect.anything());
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
      });
    });

    it("Devrait retourner une erreur si le projet n'existe pas", async () => {
      // Arrange
      req.params.id = 999;
      Project.findByPk.mockResolvedValue(null);

      // Act
      await projectController.getProjectById(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith(999, expect.anything());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Projet non trouvé",
      });
    });
  });

  describe("updateProject", () => {
    it("Devrait mettre à jour un projet", async () => {
      // Arrange
      const mockProject = {
        id: 1,
        title: "Test Project",
        description: "Test Description",
        update: jest.fn().mockResolvedValue(true),
      };

      req.params.id = 1;
      req.body = {
        title: "Updated Project",
        description: "Updated Description",
      };

      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.updateProject(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith(1, expect.anything());
      expect(mockProject.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Projet mis à jour avec succès",
      });
    });
  });

  describe("deleteProject", () => {
    it("Devrait supprimer un projet", async () => {
      // Arrange
      const mockProject = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      req.params.id = 1;
      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.deleteProject(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith(1);
      expect(mockProject.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Projet supprimé avec succès",
      });
    });

    it("Devrait retourner une erreur si le projet à supprimer n'existe pas", async () => {
      // Arrange
      req.params.id = 999;
      Project.findByPk.mockResolvedValue(null);

      // Act
      await projectController.deleteProject(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Projet non trouvé",
      });
    });
  });
});
