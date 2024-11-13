document.addEventListener('DOMContentLoaded', function() {
    // Sélection de tous les éléments de compétence
    const competencies = document.querySelectorAll('.competence');
    // Conteneur pour afficher la description
    const descriptionContainer = document.getElementById('competence-description');

    // Fonction qui gère l'affichage de la description
    competencies.forEach(function(competence) {
        competence.addEventListener('click', function() {
            // Récupère la description de la compétence cliquée
            const descriptionText = competence.getAttribute('data-description');
            
            // Met à jour le contenu du conteneur de description
            descriptionContainer.innerHTML = `<p>${descriptionText}</p>`;
            
            // Affiche la description avec animation
            descriptionContainer.classList.add('show');
        });
    });

    // Ferme la description si l'utilisateur clique en dehors de la compétence
    document.addEventListener('click', function(event) {
        // Vérifie si l'utilisateur a cliqué à l'extérieur de la section compétences
        if (!event.target.closest('#competences') && !event.target.closest('#competence-description')) {
            descriptionContainer.classList.remove('show');
        }
    });
});

// Sélectionne tous les liens de navigation
const links = document.querySelectorAll('nav ul li a');

// Ajoute un écouteur d'événement à chaque lien
links.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Empêche le comportement par défaut du lien
        
        // Récupère l'ID de la section cible (ex: #accueil)
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Effectue le défilement vers la section cible avec un effet
        window.scrollTo({
            top: targetElement.offsetTop - 60, // Ajuste la position si nécessaire
            behavior: 'smooth'
        });
    });
});

document.getElementById("cv-image").addEventListener("click", function() {
    this.classList.toggle("cv-fullscreen");
});
