# Application de Gestion de Projets

Cette application permet de gérer des projets, des clients et des sessions de formation.

## Installation

```bash
npm install
```

## Démarrage du serveur

```bash
npm start
```

Le serveur démarrera sur http://localhost:3001.

## Tests Unitaires

Des tests unitaires ont été mis en place pour assurer la qualité du code. Pour exécuter les tests :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch (relance automatique lors des modifications)
npm run test:watch

# Exécuter les tests avec rapport de couverture
npm run test:coverage
```

### Structure des tests

- `__tests__/projectController.test.js` : Tests du contrôleur de projets
- `__tests__/api.test.js` : Tests d'intégration de l'API des projets
- `__tests__/project.model.test.js` : Tests du modèle Project

## Fonctionnalités

- Création, consultation, modification et suppression de projets
- Gestion des clients
- Gestion des utilisateurs
- Interface utilisateur intuitive

## Technologies utilisées

- Node.js
- Express
- Sequelize (ORM)
- MySQL
- Bootstrap
- DataTables
- Jest (Tests)
