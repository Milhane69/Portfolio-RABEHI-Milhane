/**
 * PORTFOLIO SCRIPT - RABEHI MILHANE
 * Focus: Performance, Accessibilité, Expérience Utilisateur & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. MENU BURGER RESPONSIVE (MOBILE)
    // ==========================================================================
    const menuBurger = document.getElementById('menu-burger');
    const navUl = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li a');

    if (menuBurger) {
        // Ouvre/Ferme le menu au clic sur le burger
        menuBurger.addEventListener('click', () => {
            navUl.classList.toggle('nav-active');
            
            // Animation de l'icône (hamburger <-> croix)
            const icon = menuBurger.querySelector('i');
            if (navUl.classList.contains('nav-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Ferme le menu automatiquement quand on clique sur un lien
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navUl.classList.contains('nav-active')) {
                    navUl.classList.remove('nav-active');
                    const icon = menuBurger.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // ==========================================================================
    // 2. SCROLL FLUIDE AVEC DÉCALAGE (POUR LE HEADER FIXE)
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Hauteur du header pour ne pas cacher le titre de la section
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

    // ==========================================================================
    // 3. BULLES INFORMATIVES DES COMPÉTENCES (TOOLTIPS)
    // ==========================================================================
    // Sur PC le CSS gère le survol, mais sur mobile/tablette il faut gérer le clic
    const competencies = document.querySelectorAll('.competence');
    
    competencies.forEach(comp => {
        comp.addEventListener('click', (e) => {
            // Ferme toutes les autres bulles avant d'ouvrir la nouvelle
            competencies.forEach(c => {
                if (c !== comp) c.classList.remove('active-tooltip');
            });
            // Alterne l'état de la bulle cliquée
            comp.classList.toggle('active-tooltip');
            e.stopPropagation(); // Empêche le clic de se propager au document
        });
    });

    // Si on clique n'importe où ailleurs sur la page, on ferme les bulles ouvertes
    document.addEventListener('click', () => {
        competencies.forEach(c => c.classList.remove('active-tooltip'));
    });

    // ==========================================================================
    // 4. ACCORDÉON DES PROJETS ("VOIR PLUS")
    // ==========================================================================
    const projectToggles = document.querySelectorAll(".toggle-description");
    
    projectToggles.forEach(button => {
        button.addEventListener("click", function() {
            const parentLi = this.closest("li");
            const description = parentLi.querySelector(".projet-description");

            if (description) {
                const isActive = description.classList.contains("active");
                
                // Ouvre ou ferme la description
                description.classList.toggle("active");
                
                // Effet visuel sur le bouton
                this.style.transform = "scale(0.95)";
                setTimeout(() => {
                    this.textContent = isActive ? "Voir plus" : "Voir moins";
                    this.style.transform = "scale(1)";
                }, 150);
            }
        });
    });

    // ==========================================================================
    // 5. ZOOM DU CV (PLEIN ÉCRAN)
    // ==========================================================================
    const cvImage = document.getElementById("cv-image");
    
    if (cvImage) {
        cvImage.addEventListener("click", function() {
            this.classList.toggle("cv-fullscreen");
            
            // Ajoute une classe au body pour assombrir le fond et bloquer le scroll
            if (this.classList.contains("cv-fullscreen")) {
                document.body.classList.add("cv-open");
                document.body.style.overflow = "hidden"; // Bloque le défilement
            } else {
                document.body.classList.remove("cv-open");
                document.body.style.overflow = "auto"; // Réactive le défilement
            }
        });
    }

    // ==========================================================================
    // 6. ANIMATIONS D'APPARITION AU SCROLL (INTERSECTION OBSERVER)
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optimisation : on arrête d'observer la section une fois qu'elle est apparue
                sectionObserver.unobserve(entry.target); 
            }
        });
    }, { 
        threshold: 0.15 // Se déclenche quand 15% de la section est visible
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ==========================================================================
    // 7. EFFET D'OMBRE SUR LA NAVBAR AU SCROLL
    // ==========================================================================
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
