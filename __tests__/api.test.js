const request = require("supertest");
const express = require("express");
const { Project, Client, User } = require("../back/models/index");
const projectRoutes = require("../projects");

// Mock des modules
jest.mock("../back/models/index", () => {
  const mockProject = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockClient = {
    findByPk: jest.fn(),
  };

  const mockUser = {
    findByPk: jest.fn(),
  };

  return {
    Project: mockProject,
    Client: mockClient,
    User: mockUser,
  };
});

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.use("/api/projects", projectRoutes);

describe("API Routes des Projets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("Devrait retourner tous les projets", async () => {
      // Arrange
      const mockProjects = [
        {
          id: 1,
          title: "Project 1",
          clientId: 1,
          client: { name: "Client 1" },
        },
        {
          id: 2,
          title: "Project 2",
          clientId: 2,
          client: { name: "Client 2" },
        },
      ];

      Project.findAll.mockResolvedValue(mockProjects);

      // Act
      const response = await request(app).get("/api/projects");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        count: 2,
        data: mockProjects,
      });
      expect(Project.findAll).toHaveBeenCalled();
    });
  });

  describe("GET /api/projects/:id", () => {
    it("Devrait retourner un projet par son ID", async () => {
      // Arrange
      const mockProject = {
        id: 1,
        title: "Project 1",
        clientId: 1,
        client: { name: "Client 1" },
      };

      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      const response = await request(app).get("/api/projects/1");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockProject,
      });
      expect(Project.findByPk).toHaveBeenCalled();
    });

    it("Devrait retourner 404 si le projet n'existe pas", async () => {
      // Arrange
      Project.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get("/api/projects/999");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Projet non trouvé",
      });
    });
  });

  describe("POST /api/projects", () => {
    it("Devrait créer un nouveau projet", async () => {
      // Arrange
      const projectData = {
        title: "New Project",
        description: "A new project",
        startDate: "2023-01-01",
        clientId: 1,
        budget: 10000,
      };

      const createdProject = {
        id: 1,
        ...projectData,
        status: "planned",
        expenses: 0,
      };

      Client.findByPk.mockResolvedValue({ id: 1, name: "Client 1" });
      Project.create.mockResolvedValue(createdProject);

      // Act
      const response = await request(app)
        .post("/api/projects")
        .send(projectData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Projet créé avec succès",
        data: createdProject,
      });
      expect(Client.findByPk).toHaveBeenCalledWith(1);
      expect(Project.create).toHaveBeenCalledWith({
        title: "New Project",
        description: "A new project",
        startDate: "2023-01-01",
        clientId: 1,
        budget: 10000,
        status: "planned",
        expenses: 0,
      });
    });

    it("Devrait retourner 400 si les champs obligatoires sont manquants", async () => {
      // Arrange
      const incompleteData = {
        description: "Missing required fields",
      };

      // Act
      const response = await request(app)
        .post("/api/projects")
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: "Les champs titre, date de début et client sont obligatoires",
      });
    });
  });

  describe("PUT /api/projects/:id", () => {
    it("Devrait mettre à jour un projet existant", async () => {
      // Arrange
      const updateData = {
        title: "Updated Project",
        budget: 20000,
      };

      const existingProject = {
        id: 1,
        title: "Original Project",
        description: "Original description",
        budget: 10000,
        clientId: 1,
        update: jest.fn().mockResolvedValue({}),
      };

      Project.findByPk.mockResolvedValue(existingProject);

      // Act
      const response = await request(app)
        .put("/api/projects/1")
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Projet mis à jour avec succès");
      expect(Project.findByPk).toHaveBeenCalledWith("1");
      expect(existingProject.update).toHaveBeenCalled();
    });

    it("Devrait retourner 404 si le projet à mettre à jour n'existe pas", async () => {
      // Arrange
      Project.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put("/api/projects/999")
        .send({ title: "Updated Project" });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Projet non trouvé",
      });
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("Devrait supprimer un projet existant", async () => {
      // Arrange
      const existingProject = {
        id: 1,
        title: "Project to delete",
        destroy: jest.fn().mockResolvedValue({}),
      };

      Project.findByPk.mockResolvedValue(existingProject);

      // Act
      const response = await request(app).delete("/api/projects/1");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Projet supprimé avec succès",
      });
      expect(Project.findByPk).toHaveBeenCalledWith("1");
      expect(existingProject.destroy).toHaveBeenCalled();
    });

    it("Devrait retourner 404 si le projet à supprimer n'existe pas", async () => {
      // Arrange
      Project.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).delete("/api/projects/999");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Projet non trouvé",
      });
    });
  });
});
