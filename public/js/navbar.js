// Gestion de l'affichage de la navbar en fonction de l'état de connexion

$(document).ready(function () {
  updateNavbar();
});

// Fonction pour mettre à jour la navbar
function updateNavbar() {
  // Vérifier si l'utilisateur est connecté
  if (isLoggedIn()) {
    // Récupérer les informations de l'utilisateur
    const user = getCurrentUser();

    // Vérifier que les informations utilisateur sont disponibles
    if (user) {
      // Remplacer le bouton de connexion par le menu utilisateur
      const userMenuHtml = `
              <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
                     data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-person-circle me-1"></i> ${
                        user.username || "Utilisateur"
                      }
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li><a class="dropdown-item" href="profile.html">
                          <i class="bi bi-person me-2"></i>Mon profil
                      </a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item btn-logout" href="#">
                          <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                      </a></li>
                  </ul>
              </li>
          `;

      // Supprimer le lien de connexion s'il existe
      $('.navbar-nav .nav-link:contains("Connexion")').parent().remove();

      // Ajouter le menu utilisateur à la navbar
      if ($("#userDropdown").length === 0) {
        $(".navbar-nav").append(userMenuHtml);
      }
    } else {
      // L'utilisateur est connecté mais ses données sont corrompues
      // Déconnecter et afficher le bouton de connexion
      logout();
    }
  } else {
    // L'utilisateur n'est pas connecté, afficher le bouton de connexion
    const loginBtnHtml = `
            <li class="nav-item">
                <a class="nav-link" href="auth.html">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Connexion
                </a>
            </li>
        `;

    // Supprimer le menu utilisateur s'il existe
    $(".navbar-nav .dropdown:has(#userDropdown)").remove();

    // Ajouter le bouton de connexion s'il n'existe pas déjà
    if ($('.navbar-nav .nav-link:contains("Connexion")').length === 0) {
      $(".navbar-nav").append(loginBtnHtml);
    }
  }

  // Ajouter un gestionnaire d'événement pour le bouton de déconnexion
  $(document).on("click", ".btn-logout", function (e) {
    e.preventDefault();
    logout();
  });
}
