// Chargement de la configuration (remplace dotenv)
// En local : charge config/local.json — en prod/staging : variables injectées par Railway
const config = require("./config");

const express = require("express");
const app = express();
const port = config.server.port;

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const basicAuth = require("express-basic-auth");

const userRouter = require("./users");
const clientRouter = require("./clients");
const projectRouter = require("./projects");
const fundRouter = require("./funds");
const sessionRouter = require("./sessions");
const authRouter = require("./auth");
const publicApiRouter = require("./publicApi");
const { createIpWhitelist } = require("./middleware/ipWhitelist");

// Importation des modèles et initialisation de la base de données
const { testConnection } = require("./back/database");
const { syncDatabase } = require("./back/models/index");

// Initialisation de la base de données
(async () => {
  await testConnection();
  await syncDatabase();
})();

// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Swagger UI — protégé par IP (plage entreprise) + HTTP Basic Auth
// Accessible uniquement depuis le réseau interne de l'entreprise
// ---------------------------------------------------------------------------
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Formation Management — API Publique",
      version: "1.0.0",
      description:
        "API externe permettant à une application tierce d'accéder " +
        "à la balance financière des projets et de créer des appels de fond.",
      contact: { name: "Équipe technique" },
    },
    servers: [{ url: "/public/api", description: "API publique" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Clé API communiquée par l'équipe technique",
        },
      },
      schemas: {
        ProjectSummary: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            status: {
              type: "string",
              enum: ["planned", "in_progress", "completed", "cancelled"],
            },
            budget: { type: "number", description: "Budget alloué (€)" },
            expenses: { type: "number", description: "Dépenses engagées (€)" },
            balance: {
              type: "number",
              description: "Balance financière = budget - dépenses (€)",
            },
            client: {
              type: "object",
              properties: { id: { type: "integer" }, name: { type: "string" } },
            },
          },
        },
        ProjectDetail: {
          allOf: [
            { $ref: "#/components/schemas/ProjectSummary" },
            {
              type: "object",
              properties: {
                description: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" },
                notes: { type: "string" },
                manager: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                  },
                },
              },
            },
          ],
        },
        FundRequest: {
          type: "object",
          required: ["title", "amount", "projectId", "requestedById"],
          properties: {
            title: { type: "string", description: "Titre de l'appel de fond" },
            description: { type: "string" },
            amount: {
              type: "number",
              minimum: 0.01,
              description: "Montant demandé (€)",
            },
            projectId: {
              type: "integer",
              description: "ID du projet concerné",
            },
            requestedById: {
              type: "integer",
              description: "ID de l'utilisateur demandeur",
            },
            notes: { type: "string" },
          },
        },
        Fund: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            amount: { type: "number" },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
            },
            projectId: { type: "integer" },
            requestedById: { type: "integer" },
            requestDate: { type: "string", format: "date-time" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Clé API manquante",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        Forbidden: { description: "Clé API invalide ou IP non autorisée" },
        NotFound: { description: "Ressource introuvable" },
        BadRequest: { description: "Paramètres manquants ou invalides" },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: ["./publicApi.js"],
});

// Middlewares de protection du swagger :
// 1. Restriction IP (réseau entreprise uniquement)
// 2. HTTP Basic Auth
const swaggerAuthMiddleware = [];
swaggerAuthMiddleware.push(createIpWhitelist("swagger"));
if (config.swagger.password) {
  swaggerAuthMiddleware.push(
    basicAuth({
      users: { [config.swagger.user]: config.swagger.password },
      challenge: true,
      realm: "Formation Management API Docs",
    }),
  );
}
app.use(
  "/api-docs",
  ...swaggerAuthMiddleware,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

// JSON brut de la spec (utile pour import dans Postman etc.) — même protection
app.get("/api-docs.json", ...swaggerAuthMiddleware, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Authentication routes
app.use("/api/auth", authRouter);

// User management routes
app.use("/api/users", userRouter);

// Client management routes
app.use("/api/clients", clientRouter);

// Project management routes
app.use("/api/projects", projectRouter);

// Fund request management routes
app.use("/api/funds", fundRouter);

// Session management routes
app.use("/api/sessions", sessionRouter);

// Public external API — restreinte par IP en staging/production + API key
app.use("/public/api", createIpWhitelist("api"), publicApiRouter);

// Route de base
app.get("/", (req, res) => {
  res.send("Bienvenue sur l'outil de gestion budgétaire des formations!");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
