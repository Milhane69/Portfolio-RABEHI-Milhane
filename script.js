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
        menuBurger.addEventListener('click', () => {
            navUl.classList.toggle('nav-active');
            
            const icon = menuBurger.querySelector('i');
            if (navUl.classList.contains('nav-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

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
    const competencies = document.querySelectorAll('.competence');
    
    competencies.forEach(comp => {
        comp.addEventListener('click', (e) => {
            competencies.forEach(c => {
                if (c !== comp) c.classList.remove('active-tooltip');
            });
            comp.classList.toggle('active-tooltip');
            e.stopPropagation();
        });
    });

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
                
                description.classList.toggle("active");
                
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
            
            if (this.classList.contains("cv-fullscreen")) {
                document.body.classList.add("cv-open");
                document.body.style.overflow = "hidden"; 
            } else {
                document.body.classList.remove("cv-open");
                document.body.style.overflow = "auto"; 
            }
        });
    }

    // ==========================================================================
    // 6. ANIMATIONS D'APPARITION AU SCROLL (LE CORRECTIF EST ICI)
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                sectionObserver.unobserve(entry.target); 
            }
        });
    }, { 
        // On n'utilise plus threshold (pourcentage de taille)
        // On déclenche l'animation dès que la section approche du bas de l'écran (à -50px)
        rootMargin: "0px 0px -50px 0px" 
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
