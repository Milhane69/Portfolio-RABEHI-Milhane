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
    const links = document.querySelectorAll('nav ul li a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
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

    /*** 🔹 Gestion des boutons "Voir plus" ***/
    document.querySelectorAll(".toggle-description").forEach(button => {
        button.addEventListener("click", function() {
            let parentLi = this.closest("li");
            let description = parentLi.querySelector(".projet-description");

            if (description) {
                description.classList.toggle("active");
                this.textContent = description.classList.contains("active") ? "Voir moins" : "Voir plus";
            }
        });
    });

    // Animation Voir plus / Voir moins
const toggleButtons = document.querySelectorAll('.toggle-description');

toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const description = button.previousElementSibling;
        description.classList.toggle('active');

        // Change texte bouton
        if (description.classList.contains('active')) {
            button.textContent = "Voir moins";
        } else {
            button.textContent = "Voir plus";
        }
    });
});


   // Animation au scroll
const sections = document.querySelectorAll('section');

function revealSections() {
    const triggerBottom = window.innerHeight / 1.2;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < triggerBottom) {
            section.classList.add('show');
        }
    });
}

window.addEventListener('scroll', revealSections);
revealSections();


