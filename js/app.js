document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    lucide.createIcons();

    // 2. Preloader
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                // Trigger initial animations
                document.querySelectorAll('.hero-content, .hero-image-wrapper').forEach(el => {
                    el.classList.add('visible');
                });
            }, 800);
        }, 1500); // Artificial delay to show the nice loader
    });

    // 3. Theme System
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else if (!systemPrefersDark) {
        htmlElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // 4. Navigation & Scroll Progress
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.querySelector('.scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Scroll Progress Bar
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;

        // Sticky Navbar (Auto-hide)
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.classList.add('hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;

        // Active Section Highlighting
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                const currentId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Back to top visibility
        if (scrollTop > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 5. Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // 6. Scroll Animations (Intersection Observer)
    const animObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If it's a metric card, trigger counter
                if (entry.target.classList.contains('metric-card')) {
                    const counter = entry.target.querySelector('.counter');
                    if (counter && !counter.classList.contains('counted')) {
                        startCounter(counter);
                        counter.classList.add('counted');
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, animObserverOptions);

    document.querySelectorAll('.fade-up-anim, .fade-in-anim').forEach(el => {
        animObserver.observe(el);
    });

    // 7. Counter Animation
    function startCounter(counterElement) {
        const target = +counterElement.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        
        const timer = setInterval(() => {
            current += 1;
            counterElement.textContent = current;
            if (current >= target) {
                counterElement.textContent = target;
                clearInterval(timer);
            }
        }, stepTime);
    }

    // 8. Project Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                card.style.display = 'none'; // reset
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    const categories = card.getAttribute('data-category').split(' ');
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    }
                }, 300);
            });
        });
    });

    // 9. Command Palette
    const cmdPaletteModal = document.getElementById('cmd-palette-modal');
    const cmdInput = document.getElementById('cmd-input');
    const closeCmdBtn = document.getElementById('close-cmd');
    const cmdPaletteBtn = document.getElementById('cmd-palette-btn');
    const cmdItems = document.querySelectorAll('.cmd-item');

    function openCommandPalette() {
        cmdPaletteModal.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        filterCommands('');
    }

    function closeCommandPalette() {
        cmdPaletteModal.classList.remove('active');
        cmdInput.blur();
    }

    // Keyboard shortcut (Ctrl + K or Cmd + K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (cmdPaletteModal.classList.contains('active')) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }
        if (e.key === 'Escape' && cmdPaletteModal.classList.contains('active')) {
            closeCommandPalette();
        }
    });

    cmdPaletteBtn.addEventListener('click', openCommandPalette);
    closeCmdBtn.addEventListener('click', closeCommandPalette);

    cmdPaletteModal.addEventListener('click', (e) => {
        if (e.target === cmdPaletteModal) {
            closeCommandPalette();
        }
    });

    // Command Search Filtering
    cmdInput.addEventListener('input', (e) => {
        filterCommands(e.target.value.toLowerCase());
    });

    function filterCommands(query) {
        cmdItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Execute Commands
    cmdItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            
            if (action === 'nav') {
                const targetId = item.getAttribute('data-target');
                document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'theme') {
                themeToggle.click();
            }
            
            closeCommandPalette();
        });
    });

    // 10. Set Current Year in Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // 11. Form Submission Simulation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Sending...';
            lucide.createIcons(); // re-init icon
            
            // Simulate API call
            setTimeout(() => {
                btn.innerHTML = '<i data-lucide="check"></i> Sent Successfully';
                btn.classList.add('success');
                btn.style.background = '#10b981';
                lucide.createIcons();
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    lucide.createIcons();
                }, 3000);
            }, 1500);
        });
    }
});
