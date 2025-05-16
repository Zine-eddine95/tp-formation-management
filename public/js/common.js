// Fonctions communes à toutes les pages

$(document).ready(function () {
  // Mettre à jour la navbar en fonction de l'état de connexion
  updateNavbar();

  // Vérifier les pages protégées (rediriger vers la page de connexion si non connecté)
  checkProtectedPages();
});

// Fonction pour vérifier si la page actuelle nécessite une authentification
function checkProtectedPages() {
  // Liste des pages qui nécessitent une authentification
  const protectedPages = [
    "/users.html",
    "/clients.html",
    "/projects.html",
    "/funds.html",
    "/sessions.html",
    "/dashboard.html",
  ];

  // Vérifier si la page actuelle est protégée
  const currentPath = window.location.pathname;
  if (protectedPages.includes(currentPath) && !isLoggedIn()) {
    // Rediriger vers la page de connexion
    window.location.href =
      "/auth.html?redirect=" + encodeURIComponent(currentPath);
  }
}

// Fonction pour récupérer le token
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Fonction pour récupérer les informations de l'utilisateur
function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Erreur lors du parsing des données utilisateur:", error);
    // En cas d'erreur de parsing, supprimer les données corrompues
    localStorage.removeItem("user");
    return null;
  }
}

// Fonction pour vérifier si l'utilisateur est connecté
function isLoggedIn() {
  return !!getAuthToken();
}

// Fonction pour déconnecter l'utilisateur
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// Fonction pour mettre à jour la navbar
function updateNavbar() {
  if (isLoggedIn()) {
    // L'utilisateur est connecté, afficher les options utilisateur
    const user = getCurrentUser();
    if (user) {
      // Masquer le lien de connexion
      $(".nav-link[href='auth.html']").parent().hide();

      // Vérifier si le menu utilisateur existe déjà
      if ($(".user-dropdown").length === 0) {
        // Ajouter le menu déroulant utilisateur
        $(".navbar-nav.ms-auto").append(`
          <li class="nav-item dropdown user-dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle me-1"></i> ${
                user.firstName || ""
              } ${user.lastName || ""}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Mon profil</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item btn-logout" href="#"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
            </ul>
          </li>
        `);
      }
    }
  } else {
    // L'utilisateur n'est pas connecté, afficher le lien de connexion
    $(".nav-link[href='auth.html']").parent().show();
    $(".user-dropdown").remove();
  }
}

// Fonction pour afficher des alertes
function showAlert(type, message) {
  // Vérifier si le conteneur d'alertes existe
  if ($("#alertContainer").length === 0) {
    $("body").prepend('<div id="alertContainer" class="container mt-3"></div>');
  }

  // Créer l'élément d'alerte
  const alertElement =
    $(`<div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`);

  // Ajouter l'alerte au conteneur
  $("#alertContainer").append(alertElement);

  // Faire défiler vers le haut pour voir l'alerte
  window.scrollTo(0, 0);

  // Faire disparaître l'alerte après 5 secondes
  setTimeout(() => {
    alertElement.alert("close");
  }, 5000);
}

// Ajouter des gestionnaires d'événements pour les actions communes
$(document).on("click", ".btn-logout", function (e) {
  e.preventDefault();
  logout();
});
