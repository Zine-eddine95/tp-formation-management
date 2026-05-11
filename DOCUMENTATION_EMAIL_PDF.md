# Documentation - Système d'Email et PDF pour les Sessions

## Vue d'ensemble

Ce système permet d'envoyer des emails aux participants des sessions de formation et de générer des documents PDF (rapports de session et certificats de participation).

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```env
# Configuration des emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
```

### 2. Configuration Gmail (exemple)

Pour utiliser Gmail :

1. Activez la validation en deux étapes sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez sur https://myaccount.google.com/security
   - Sélectionnez "Mots de passe des applications"
   - Générez un nouveau mot de passe pour "Mail"
   - Utilisez ce mot de passe dans `EMAIL_PASSWORD`

### 3. Autres fournisseurs d'email

Pour d'autres fournisseurs (Outlook, Yahoo, etc.), modifiez les variables :

**Outlook/Office365 :**

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
```

**Yahoo :**

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

## API Endpoints

### 1. Envoyer des emails aux participants

**Endpoint :** `POST /api/sessions/:id/send-email`

**Description :** Envoie un email à tous les participants d'une session.

**Paramètres :**

- `:id` - ID de la session (dans l'URL)

**Body (JSON) :**

```json
{
  "type": "enrollment",
  "changes": "Texte optionnel pour les mises à jour"
}
```

**Types d'emails disponibles :**

- `enrollment` : Confirmation d'inscription (par défaut)
- `reminder` : Rappel de session
- `update` : Notification de modification
- `cancellation` : Notification d'annulation

**Exemple de requête :**

```javascript
fetch("http://localhost:3000/api/sessions/1/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "reminder",
  }),
});
```

**Réponse (succès) :**

```json
{
  "success": true,
  "message": "Emails envoyés à 5 participant(s)",
  "data": {
    "sent": [
      {
        "participant": "John Doe",
        "email": "john@example.com",
        "status": "envoyé",
        "messageId": "abc123"
      }
    ],
    "errors": [],
    "total": 5,
    "successful": 5,
    "failed": 0
  }
}
```

### 2. Générer un PDF de session

**Endpoint :** `GET /api/sessions/:id/generate-pdf`

**Description :** Génère et télécharge un PDF contenant toutes les informations de la session et la liste des participants.

**Paramètres :**

- `:id` - ID de la session (dans l'URL)

**Exemple de requête :**

```javascript
// Dans le navigateur
window.location.href = "http://localhost:3000/api/sessions/1/generate-pdf";

// Avec fetch (pour télécharger via JS)
fetch("http://localhost:3000/api/sessions/1/generate-pdf")
  .then((response) => response.blob())
  .then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session.pdf";
    a.click();
  });
```

**Réponse :** Fichier PDF en téléchargement

### 3. Générer un certificat de participation

**Endpoint :** `GET /api/sessions/:sessionId/certificate/:participantId`

**Description :** Génère et télécharge un certificat de participation pour un participant spécifique.

**Paramètres :**

- `:sessionId` - ID de la session (dans l'URL)
- `:participantId` - ID du participant (dans l'URL)

**Exemple de requête :**

```javascript
// Dans le navigateur
window.location.href = "http://localhost:3000/api/sessions/1/certificate/5";

// Avec fetch
fetch("http://localhost:3000/api/sessions/1/certificate/5")
  .then((response) => response.blob())
  .then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificat.pdf";
    a.click();
  });
```

**Réponse :** Fichier PDF en téléchargement

## Utilisation dans le Frontend

### Exemple d'intégration HTML/JavaScript

```html
<!-- Bouton pour envoyer des emails de rappel -->
<button onclick="sendSessionEmail(sessionId, 'reminder')">
  Envoyer un rappel
</button>

<!-- Bouton pour télécharger le PDF de la session -->
<button onclick="downloadSessionPDF(sessionId)">Télécharger PDF</button>

<!-- Bouton pour télécharger un certificat -->
<button onclick="downloadCertificate(sessionId, participantId)">
  Télécharger le certificat
</button>

<script>
  // Envoyer un email
  async function sendSessionEmail(sessionId, type) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ type: type }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Emails envoyés à ${result.data.successful} participant(s)`);
      } else {
        alert("Erreur: " + result.message);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi des emails");
    }
  }

  // Télécharger le PDF de la session
  function downloadSessionPDF(sessionId) {
    window.location.href = `/api/sessions/${sessionId}/generate-pdf`;
  }

  // Télécharger un certificat
  function downloadCertificate(sessionId, participantId) {
    window.location.href = `/api/sessions/${sessionId}/certificate/${participantId}`;
  }
</script>
```

## Structure des emails

### Email de confirmation d'inscription

- Titre de la session
- Description
- Dates de début et fin
- Lieu (ou indication "En ligne")
- Nom du formateur

### Email de rappel

- Même contenu que la confirmation
- Mise en évidence de la proximité de la date

### Email de modification

- Notification des changements
- Détails des modifications

### Email d'annulation

- Notification de l'annulation
- Date prévue initialement

## Structure des PDFs

### PDF de session

Contient :

- Informations complètes de la session
- Tableau des participants avec :
  - Numéro
  - Nom complet
  - Email
  - Téléphone
  - Statut d'inscription
- Pagination automatique
- Date de génération

### Certificat de participation

Contient :

- Nom du participant
- Titre de la session
- Dates de la formation
- Bordure décorative
- Date de délivrance

## Gestion des fichiers temporaires

Les PDF générés sont stockés temporairement dans le dossier `tmp/` et sont automatiquement supprimés après le téléchargement.

## Dépannage

### Les emails ne partent pas

1. Vérifiez la configuration dans `.env`
2. Vérifiez que le mot de passe d'application est correct
3. Vérifiez les logs de la console pour les erreurs
4. Testez avec un autre fournisseur d'email

### Les PDF ne se génèrent pas

1. Vérifiez que le dossier `tmp/` est accessible en écriture
2. Vérifiez les logs de la console
3. Vérifiez que pdfkit est bien installé : `npm list pdfkit`

### Erreur "Email non disponible"

Assurez-vous que tous les participants ont une adresse email valide dans la base de données.

## Sécurité

⚠️ **Important :**

- Ne commitez JAMAIS le fichier `.env` dans Git
- Ajoutez `.env` dans votre `.gitignore`
- Utilisez des mots de passe d'application, pas votre mot de passe principal
- En production, utilisez des variables d'environnement sécurisées

## Prochaines améliorations possibles

- [ ] Planification automatique d'emails de rappel
- [ ] Templates d'emails personnalisables
- [ ] Envoi d'emails avec pièces jointes
- [ ] Statistiques d'ouverture des emails
- [ ] Personnalisation des certificats
- [ ] Signature numérique des certificats
- [ ] Export des PDF vers un stockage cloud
