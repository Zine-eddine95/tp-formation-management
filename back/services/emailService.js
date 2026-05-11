const nodemailer = require("nodemailer");

// Configuration du transporteur d'emails
// Note: En production, utilisez des variables d'environnement pour les credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER || "votre-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "votre-mot-de-passe",
  },
});

/**
 * Envoie un email de confirmation d'inscription à une session
 */
const sendSessionEnrollmentEmail = async (participant, session, trainer) => {
  try {
    const mailOptions = {
      from: `"Formation Management" <${
        process.env.EMAIL_USER || "noreply@formation.com"
      }>`,
      to: participant.email,
      subject: `Confirmation d'inscription - ${session.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Confirmation d'inscription à la session</h2>
          
          <p>Bonjour ${participant.firstName} ${participant.lastName},</p>
          
          <p>Nous confirmons votre inscription à la session de formation :</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">${session.title}</h3>
            <p><strong>Description:</strong> ${
              session.description || "Non spécifiée"
            }</p>
            <p><strong>Date de début:</strong> ${new Date(
              session.startDate
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Date de fin:</strong> ${new Date(
              session.endDate
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            ${
              session.isOnline
                ? "<p><strong>Format:</strong> En ligne</p>"
                : `<p><strong>Lieu:</strong> ${
                    session.location || "À définir"
                  }</p>`
            }
            ${
              trainer
                ? `<p><strong>Formateur:</strong> ${trainer.firstName} ${trainer.lastName}</p>`
                : ""
            }
          </div>
          
          <p>Vous recevrez un email de rappel quelques jours avant le début de la session.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Formation Management</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

/**
 * Envoie un rappel de session aux participants
 */
const sendSessionReminderEmail = async (participant, session, trainer) => {
  try {
    const mailOptions = {
      from: `"Formation Management" <${
        process.env.EMAIL_USER || "noreply@formation.com"
      }>`,
      to: participant.email,
      subject: `Rappel - Session ${session.title} dans quelques jours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Rappel de session de formation</h2>
          
          <p>Bonjour ${participant.firstName} ${participant.lastName},</p>
          
          <p>Nous vous rappelons que vous êtes inscrit(e) à la session de formation suivante qui débute bientôt :</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">${session.title}</h3>
            <p><strong>Date de début:</strong> ${new Date(
              session.startDate
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            ${
              session.isOnline
                ? "<p><strong>Format:</strong> En ligne</p>"
                : `<p><strong>Lieu:</strong> ${
                    session.location || "À définir"
                  }</p>`
            }
            ${
              trainer
                ? `<p><strong>Formateur:</strong> ${trainer.firstName} ${trainer.lastName}</p>`
                : ""
            }
          </div>
          
          <p>N'oubliez pas de préparer le matériel nécessaire et d'être à l'heure !</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Formation Management</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de rappel envoyé: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de rappel:", error);
    throw error;
  }
};

/**
 * Envoie une notification de modification de session
 */
const sendSessionUpdateEmail = async (participant, session, changes) => {
  try {
    const mailOptions = {
      from: `"Formation Management" <${
        process.env.EMAIL_USER || "noreply@formation.com"
      }>`,
      to: participant.email,
      subject: `Modification de session - ${session.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Modification de la session</h2>
          
          <p>Bonjour ${participant.firstName} ${participant.lastName},</p>
          
          <p>La session de formation <strong>${session.title}</strong> à laquelle vous êtes inscrit(e) a été modifiée.</p>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-left: 4px solid #17a2b8; margin: 20px 0;">
            <h4 style="color: #0c5460; margin-top: 0;">Modifications apportées :</h4>
            <p>${changes}</p>
          </div>
          
          <p>Veuillez prendre note de ces changements.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Formation Management</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de modification envoyé: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de modification:", error);
    throw error;
  }
};

/**
 * Envoie une notification d'annulation de session
 */
const sendSessionCancellationEmail = async (participant, session) => {
  try {
    const mailOptions = {
      from: `"Formation Management" <${
        process.env.EMAIL_USER || "noreply@formation.com"
      }>`,
      to: participant.email,
      subject: `Annulation de session - ${session.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Annulation de session</h2>
          
          <p>Bonjour ${participant.firstName} ${participant.lastName},</p>
          
          <p>Nous sommes au regret de vous informer que la session de formation suivante a été annulée :</p>
          
          <div style="background-color: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">${session.title}</h3>
            <p><strong>Date prévue:</strong> ${new Date(
              session.startDate
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
          
          <p>Nous nous excusons pour ce contretemps. Vous serez informé(e) dès qu'une nouvelle date sera programmée.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Formation Management</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email d'annulation envoyé: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'annulation:", error);
    throw error;
  }
};

module.exports = {
  sendSessionEnrollmentEmail,
  sendSessionReminderEmail,
  sendSessionUpdateEmail,
  sendSessionCancellationEmail,
};
