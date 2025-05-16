const { sequelize } = require("./back/database");
const { Client, syncDatabase } = require("./back/models/index");

const seedClients = async () => {
  try {
    await syncDatabase();
    console.log("Base de données synchronisée avec succès");

    // Données des clients de test
    const clientsData = [
      {
        name: "TF1",
        contactPerson: "Jean Dupont",
        email: "jdupont@tf1.fr",
        phone: "01 23 45 67 89",
        address: "1 Quai du Point du Jour",
        city: "Boulogne-Billancourt",
        postalCode: "92100",
        country: "France",
      },
      {
        name: "Bouygues Telecom",
        contactPerson: "Marie Martin",
        email: "mmartin@bouyguestelecom.fr",
        phone: "01 23 45 67 90",
        address: "37 rue Boissière",
        city: "Paris",
        postalCode: "75116",
        country: "France",
      },
      {
        name: "Orange",
        contactPerson: "Paul Leroy",
        email: "pleroy@orange.fr",
        phone: "01 23 45 67 91",
        address: "78 rue Olivier de Serres",
        city: "Paris",
        postalCode: "75015",
        country: "France",
      },
    ];

    // Vérifier si des clients existent déjà dans la base de données
    const existingClients = await Client.findAll();
    console.log(
      `${existingClients.length} clients existent déjà dans la base de données.`
    );

    // Si aucun client n'existe, les créer tous
    if (existingClients.length === 0) {
      await Client.bulkCreate(clientsData);
      console.log(`${clientsData.length} clients ont été créés avec succès !`);
    } else {
      // Si des clients existent, mettre à jour ou créer au besoin
      console.log("Mise à jour des clients existants...");

      for (const clientData of clientsData) {
        // Chercher un client existant avec le même nom
        const existingClient = existingClients.find(
          (c) => c.name === clientData.name
        );

        if (existingClient) {
          // Mettre à jour le client existant
          await existingClient.update(clientData);
          console.log(`Client '${clientData.name}' mis à jour avec succès.`);
        } else {
          // Créer un nouveau client
          await Client.create(clientData);
          console.log(`Client '${clientData.name}' créé avec succès.`);
        }
      }
    }

    const updatedClients = await Client.findAll();
    console.log(
      `Nombre total de clients dans la base de données: ${updatedClients.length}`
    );

    // Afficher tous les clients
    console.log("Liste des clients dans la base de données:");
    updatedClients.forEach((client) => {
      console.log(`- ${client.id}: ${client.name} (${client.email})`);
    });

    // Fermer la connexion à la base de données
    await sequelize.close();
    console.log("Connexion à la base de données fermée");
  } catch (error) {
    console.error("Erreur lors de l'insertion des données :", error);
  }
};

// Exécuter la fonction
seedClients();
