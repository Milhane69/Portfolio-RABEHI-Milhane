document.addEventListener('DOMContentLoaded', function() {
    /*** 🔹 Gestion des descriptions de compétences ***/
    const competencies = document.querySelectorAll('.competence');
    const descriptionContainer = document.getElementById('competence-description');

    competencies.forEach(function(competence) {
        competence.addEventListener('click', function() {
            const descriptionText = competence.getAttribute('data-description');
            descriptionContainer.innerHTML = `<p>${descriptionText}</p>`;
            descriptionContainer.classList.add('show');
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('#competences') && !event.target.closest('#competence-description')) {
            descriptionContainer.classList.remove('show');
        }
    });

    /*** 🔹 Gestion du scroll fluide pour la navigation ***/
    const links = document.querySelectorAll('nav ul li a');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 60, 
                behavior: 'smooth'
            });
        });
    });

    /*** 🔹 Agrandissement de l'image du CV ***/
    const cvImage = document.getElementById("cv-image");
    if (cvImage) {
        cvImage.addEventListener("click", function() {
            this.classList.toggle("cv-fullscreen");
        });
    }

    /*** 🔹 Disparition de l'écran de chargement ***/
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
        setTimeout(function() {
            splashScreen.style.display = "none";
        }, 5000);
    }

    /*** 🔹 Gestion du mode sombre ***/
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
        });
    }

    /*** 🔹 Gestion du bouton "Voir plus" dans les projets ***/
    document.querySelectorAll(".toggle-description").forEach(button => {
        button.addEventListener("click", function() {
            let description = this.previousElementSibling;

            if (description && description.classList.contains("projet-description")) {
                description.classList.toggle("active");
                this.textContent = description.classList.contains("active") ? "Voir moins" : "Voir plus";
            }
        });
    });

    /*** 🔹 Ajout de l'effet de scroll pour l'apparition des sections ***/
    const sections = document.querySelectorAll("section");

    function checkScroll() {
        sections.forEach((section) => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight * 0.85) {
                section.classList.add("show");
            }
        });
    }

    window.addEventListener("scroll", checkScroll);
    checkScroll();
});
