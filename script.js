/**
 * PORTFOLIO SCRIPT - RABEHI MILHANE
 * Focus: Performance, Accessibilité & Expérience Utilisateur
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURATION DES SECTIONS (REVEAL ANIMATION) ---
    // Utilisation de IntersectionObserver pour une meilleure performance que l'event 'scroll'
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // On arrête d'observer une fois affiché pour économiser des ressources
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });


    // --- 2. GESTION DES COMPÉTENCES (INTERACTIF) ---
    const competencies = document.querySelectorAll('.competence');
    const descriptionContainer = document.getElementById('competence-description');

    competencies.forEach(competence => {
        competence.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = competence.getAttribute('data-description');
            
            // Animation de changement de contenu
            descriptionContainer.style.opacity = '0';
            
            setTimeout(() => {
                descriptionContainer.innerHTML = `
                    <div class="desc-content">
                        <i class="fas fa-info-circle" style="color: var(--primary); margin-right: 10px;"></i>
                        <span>${text}</span>
                    </div>`;
                descriptionContainer.classList.add('show');
                descriptionContainer.style.opacity = '1';
            }, 200);

            // Sur mobile, on scroll légèrement vers la description
            if (window.innerWidth < 768) {
                descriptionContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // Fermer la description si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.competence') && !e.target.closest('#competence-description')) {
            descriptionContainer.classList.remove('show');
        }
    });


    // --- 3. SCROLL FLUIDE OPTIMISÉ ---
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // --- 4. GESTION DES PROJETS (ACCORDÉON) ---
    const projectToggles = document.querySelectorAll(".toggle-description");

    projectToggles.forEach(button => {
        button.addEventListener("click", function() {
            const parentLi = this.closest("li");
            const description = parentLi.querySelector(".projet-description");

            if (description) {
                const isActive = description.classList.contains("active");
                
                // Fermer les autres descriptions du même bloc (optionnel pour un look propre)
                // parentLi.parentNode.querySelectorAll('.projet-description').forEach(el => el.classList.remove('active'));

                description.classList.toggle("active");
                
                // Changement de texte avec une petite transition
                this.style.transform = "scale(0.95)";
                setTimeout(() => {
                    this.textContent = isActive ? "Voir plus" : "Voir moins";
                    this.style.transform = "scale(1)";
                }, 150);
            }
        });
    });


    // --- 5. CV & SPLASH SCREEN ---
    // Agrandissement du CV
    const cvImage = document.getElementById("cv-image");
    if (cvImage) {
        cvImage.addEventListener("click", () => {
            cvImage.classList.toggle("cv-fullscreen");
            // Empêcher le scroll quand l'image est en plein écran
            document.body.style.overflow = cvImage.classList.contains("cv-fullscreen") ? "hidden" : "auto";
        });
    }

    // Splash Screen (Chargement)
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                splashScreen.style.opacity = "0";
                splashScreen.style.transition = "opacity 0.8s ease";
                setTimeout(() => splashScreen.remove(), 800);
            }, 2000); // 2 secondes suffisent pour un effet pro
        });
    }

    // --- 6. EFFET NAVBAR AU SCROLL ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
            header.style.padding = "5px 0";
        } else {
            header.style.boxShadow = "none";
            header.style.padding = "0";
        }
    });
});
