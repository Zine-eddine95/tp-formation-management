const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Génère un PDF pour une session avec la liste des participants
 */
const generateSessionPDF = async (session, enrollments) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer un document PDF
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Session - ${session.title}`,
          Author: "Formation Management System",
        },
      });

      // Créer le dossier tmp s'il n'existe pas
      const tmpDir = path.join(__dirname, "..", "..", "tmp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Nom du fichier
      const fileName = `session-${session.id}-${Date.now()}.pdf`;
      const filePath = path.join(tmpDir, fileName);

      // Pipe le PDF vers un fichier
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // En-tête du document
      doc
        .fontSize(24)
        .fillColor("#2c3e50")
        .text("Session de Formation", { align: "center" })
        .moveDown();

      // Ligne de séparation
      doc
        .strokeColor("#007bff")
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(2);

      // Informations de la session
      doc.fontSize(18).fillColor("#007bff").text(session.title).moveDown();

      doc.fontSize(12).fillColor("#2c3e50");

      if (session.description) {
        doc.text(`Description: ${session.description}`).moveDown(0.5);
      }

      // Dates
      doc
        .text(
          `Date de début: ${new Date(session.startDate).toLocaleDateString(
            "fr-FR",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}`
        )
        .moveDown(0.5);

      doc
        .text(
          `Date de fin: ${new Date(session.endDate).toLocaleDateString(
            "fr-FR",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}`
        )
        .moveDown(0.5);

      // Lieu
      if (session.isOnline) {
        doc.text("Format: En ligne").moveDown(0.5);
      } else if (session.location) {
        doc.text(`Lieu: ${session.location}`).moveDown(0.5);
      }

      // Capacité et statut
      doc
        .text(
          `Capacité: ${enrollments ? enrollments.length : 0}/${
            session.capacity
          } participants`
        )
        .moveDown(0.5);

      doc.text(`Statut: ${getStatusLabel(session.status)}`).moveDown(0.5);

      // Prix
      if (session.price) {
        doc
          .text(`Prix: ${parseFloat(session.price).toFixed(2)} €`)
          .moveDown(0.5);
      }

      // Formateur
      if (session.trainer) {
        doc
          .text(
            `Formateur: ${session.trainer.firstName} ${session.trainer.lastName}`
          )
          .moveDown();
      }

      // Notes
      if (session.notes) {
        doc
          .moveDown()
          .fontSize(14)
          .fillColor("#007bff")
          .text("Notes:")
          .fontSize(12)
          .fillColor("#2c3e50")
          .text(session.notes)
          .moveDown();
      }

      // Liste des participants
      if (enrollments && enrollments.length > 0) {
        doc
          .moveDown(2)
          .fontSize(16)
          .fillColor("#007bff")
          .text("Liste des Participants")
          .moveDown();

        // Ligne de séparation
        doc
          .strokeColor("#dee2e6")
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown();

        // En-têtes du tableau
        doc.fontSize(10).fillColor("#6c757d");

        const tableTop = doc.y;
        const colWidths = {
          number: 40,
          name: 150,
          email: 180,
          phone: 100,
          status: 80,
        };

        let x = 50;
        doc.text("#", x, tableTop, {
          width: colWidths.number,
          continued: false,
        });
        x += colWidths.number;
        doc.text("Nom", x, tableTop, {
          width: colWidths.name,
          continued: false,
        });
        x += colWidths.name;
        doc.text("Email", x, tableTop, {
          width: colWidths.email,
          continued: false,
        });
        x += colWidths.email;
        doc.text("Téléphone", x, tableTop, {
          width: colWidths.phone,
          continued: false,
        });
        x += colWidths.phone;
        doc.text("Statut", x, tableTop, {
          width: colWidths.status,
          continued: false,
        });

        doc.moveDown();

        // Ligne de séparation
        doc
          .strokeColor("#dee2e6")
          .lineWidth(0.5)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(0.5);

        // Données des participants
        doc.fontSize(9).fillColor("#2c3e50");

        enrollments.forEach((enrollment, index) => {
          const participant = enrollment.participant;

          // Vérifier s'il faut ajouter une nouvelle page
          if (doc.y > 700) {
            doc.addPage();
            doc.moveDown();
          }

          const rowY = doc.y;
          let x = 50;

          doc.text(`${index + 1}`, x, rowY, {
            width: colWidths.number,
            continued: false,
          });
          x += colWidths.number;

          doc.text(
            `${participant.firstName} ${participant.lastName}`,
            x,
            rowY,
            { width: colWidths.name, continued: false }
          );
          x += colWidths.name;

          doc.text(participant.email || "N/A", x, rowY, {
            width: colWidths.email,
            continued: false,
          });
          x += colWidths.email;

          doc.text(participant.phone || "N/A", x, rowY, {
            width: colWidths.phone,
            continued: false,
          });
          x += colWidths.phone;

          doc.text(getEnrollmentStatusLabel(enrollment.status), x, rowY, {
            width: colWidths.status,
            continued: false,
          });

          doc.moveDown(0.8);

          // Ligne de séparation légère
          if (index < enrollments.length - 1) {
            doc
              .strokeColor("#f8f9fa")
              .lineWidth(0.5)
              .moveTo(50, doc.y)
              .lineTo(550, doc.y)
              .stroke()
              .moveDown(0.5);
          }
        });
      } else {
        doc
          .moveDown(2)
          .fontSize(12)
          .fillColor("#6c757d")
          .text("Aucun participant inscrit pour le moment.", {
            align: "center",
          });
      }

      // Pied de page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        doc
          .fontSize(8)
          .fillColor("#6c757d")
          .text(
            `Document généré le ${new Date().toLocaleDateString(
              "fr-FR"
            )} à ${new Date().toLocaleTimeString("fr-FR")}`,
            50,
            doc.page.height - 50,
            { align: "center" }
          );

        doc.text(`Page ${i + 1} sur ${pageCount}`, 50, doc.page.height - 35, {
          align: "center",
        });
      }

      // Finaliser le PDF
      doc.end();

      // Attendre que le stream soit fermé
      stream.on("finish", () => {
        resolve({ filePath, fileName });
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Génère un certificat de participation pour un participant
 */
const generateParticipationCertificate = async (participant, session) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
        info: {
          Title: `Certificat - ${participant.firstName} ${participant.lastName}`,
          Author: "Formation Management System",
        },
      });

      // Créer le dossier tmp s'il n'existe pas
      const tmpDir = path.join(__dirname, "..", "..", "tmp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const fileName = `certificat-${participant.id}-${
        session.id
      }-${Date.now()}.pdf`;
      const filePath = path.join(tmpDir, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Bordure décorative
      doc
        .strokeColor("#007bff")
        .lineWidth(5)
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke();

      doc
        .strokeColor("#17a2b8")
        .lineWidth(2)
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .stroke();

      // Titre
      doc
        .fontSize(36)
        .fillColor("#2c3e50")
        .text("CERTIFICAT DE PARTICIPATION", 0, 120, { align: "center" })
        .moveDown(2);

      // Texte principal
      doc
        .fontSize(16)
        .fillColor("#495057")
        .text("Ce certificat atteste que", { align: "center" })
        .moveDown();

      doc
        .fontSize(28)
        .fillColor("#007bff")
        .text(`${participant.firstName} ${participant.lastName}`, {
          align: "center",
        })
        .moveDown(1.5);

      doc
        .fontSize(16)
        .fillColor("#495057")
        .text("a participé avec succès à la formation", { align: "center" })
        .moveDown();

      doc
        .fontSize(22)
        .fillColor("#2c3e50")
        .text(`"${session.title}"`, { align: "center" })
        .moveDown(1.5);

      // Dates
      doc
        .fontSize(14)
        .fillColor("#6c757d")
        .text(
          `Du ${new Date(session.startDate).toLocaleDateString(
            "fr-FR"
          )} au ${new Date(session.endDate).toLocaleDateString("fr-FR")}`,
          { align: "center" }
        )
        .moveDown(3);

      // Date d'émission
      doc
        .fontSize(12)
        .text(`Délivré le ${new Date().toLocaleDateString("fr-FR")}`, {
          align: "center",
        });

      doc.end();

      stream.on("finish", () => {
        resolve({ filePath, fileName });
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Fonctions utilitaires
function getStatusLabel(status) {
  const labels = {
    scheduled: "Programmée",
    in_progress: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  return labels[status] || status;
}

function getEnrollmentStatusLabel(status) {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  };
  return labels[status] || status;
}

module.exports = {
  generateSessionPDF,
  generateParticipationCertificate,
};
