// Gestion de l'authentification

// Fonction pour stocker le token et les informations utilisateur
function setAuthData(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("user", JSON.stringify(user));
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

// Fonction pour ajouter le token à toutes les requêtes Ajax
$(document).ajaxSend(function (event, jqxhr, settings) {
  if (isLoggedIn()) {
    jqxhr.setRequestHeader("Authorization", "Bearer " + getAuthToken());
  }
});

// Gestion de l'expiration du token et des erreurs 401
$(document).ajaxError(function (event, jqXHR, settings, error) {
  if (jqXHR.status === 401) {
    // Token expiré ou invalide
    logout();
    showAlert("warning", "Votre session a expiré. Veuillez vous reconnecter.");
  }
});

// Fonction pour afficher des alertes
function showAlert(type, message) {
  // Supprimer toute alerte existante
  $(".alert").remove();

  // Créer une nouvelle alerte
  const alert =
    $(`<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`);

  // Ajouter l'alerte au début du conteneur
  $(".container").prepend(alert);

  // Faire défiler vers le haut pour voir l'alerte
  $("html, body").animate({ scrollTop: 0 }, "slow");

  // Masquer automatiquement l'alerte après 5 secondes
  setTimeout(function () {
    alert.alert("close");
  }, 5000);
}
