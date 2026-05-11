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
- Gestion des sessions de formation
- **Système d'envoi d'emails automatisés** pour les sessions
- **Génération de PDF** pour les sessions et certificats de participation
- Interface utilisateur intuitive

## Nouvelles Fonctionnalités : Emails et PDF

### Configuration requise

1. Copiez le fichier `.env.example` vers `.env`
2. Configurez vos paramètres d'email dans `.env` :

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
```

### Fonctionnalités emails

- Envoi automatique d'emails de confirmation d'inscription
- Envoi de rappels de session
- Notifications de modification de session
- Notifications d'annulation

### Fonctionnalités PDF

- Génération de rapports de session avec liste des participants
- Génération de certificats de participation personnalisés
- Téléchargement automatique des documents

📖 **Documentation complète** : Consultez [DOCUMENTATION_EMAIL_PDF.md](./DOCUMENTATION_EMAIL_PDF.md) pour plus de détails.

## Technologies utilisées

- Node.js
- Express
- Sequelize (ORM)
- MySQL
- Bootstrap
- DataTables
- Jest (Tests)
- Nodemailer (Emails)
- PDFKit (Génération PDF)
