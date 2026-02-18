console.clear();
gsap.registerPlugin(ScrollTrigger);

// ====== CONFIGURATION ======
const config = {
    folder: './images/',
    namePrefix: 'ezgif-frame-',
    fileExtension: 'jpg',
    frameCount: 240,
    startFrame: 1,
    padZeros: 3
};

const pages = ['home', 'collection', 'about', 'gallery', 'contact'];
let currentPageIndex = 0;

// ====== DOM ELEMENTS ======
const canvas = document.getElementById('hero-lightpass');
const context = canvas.getContext('2d');
const loader = document.querySelector('.loader');
const loaderProgress = document.querySelector('.loader-progress');
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-link');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const opacitySlider = document.getElementById('opacity-slider');

const frameState = { currentFrame: 0 };
const images = [];

// ====== UTILITY FUNCTIONS ======
const formatFrameNumber = (index) => index.toString().padStart(config.padZeros, '0');
const getFrameUrl = (index) => `${config.folder}${config.namePrefix}${formatFrameNumber(index)}.${config.fileExtension}`;

// ====== RENDER FUNCTION ======
const render = () => {
    const index = Math.min(config.frameCount - 1, Math.max(0, Math.round(frameState.currentFrame)));
    const img = images[index];

    if (img && img.complete) {
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgRatio;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
};

const updateCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
};

window.addEventListener('resize', updateCanvasSize);

// ====== IMAGE PRELOADING ======
const preloadImages = () => {
    let loadedCount = 0;
    for (let i = config.startFrame; i <= config.frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
            loadedCount++;
            const progress = Math.round((loadedCount / config.frameCount) * 100);
            if (loaderProgress) loaderProgress.innerText = `${progress}%`;

            if (loadedCount === config.frameCount) {
                initAnimation();
                if (loader) {
                    gsap.to(loader, { 
                        opacity: 0, 
                        duration: 1.5, 
                        ease: "power2.inOut",
                        onComplete: () => loader.style.display = 'none' 
                    });
                }
            }
        };
        images.push(img);
    }
};

// ====== MAIN ANIMATION ======
const initAnimation = () => {
    updateCanvasSize();
    gsap.to(frameState, {
        currentFrame: config.frameCount - 1,
        snap: 'currentFrame',
        ease: 'none',
        scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        },
        onUpdate: render
    });

    const tl = gsap.timeline({ delay: 0.5 });
    tl.to('.word', {
        y: 0,
        opacity: 1,
        duration: 2,
        stagger: 0.3,
        ease: "power3.out"
    })
    .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 2,
        ease: "power2.out"
    }, "-=1.5")
    .to('.hero-subtitle', {
        className: '+=active'
    }, "-=0.5");
};

// ====== CURSOR TRACKING ======
const moveCursor = (e) => {
    if (cursorDot) {
        gsap.to(cursorDot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power1.out"
        });
    }
    if (cursorCircle) {
        gsap.to(cursorCircle, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.4,
            ease: "power2.out"
        });
    }
};

window.addEventListener('mousemove', moveCursor);

// ====== HIDE CURSOR WHEN OVER NAVBAR ======
const navbar = document.querySelector('.navbar');
navbar.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '0';
    cursorCircle.style.opacity = '0';
});

navbar.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '1';
    cursorCircle.style.opacity = '1';
});

// ====== PAGE NAVIGATION ======
const navigateToPage = (pageId) => {
    const allPages = document.querySelectorAll('.page');
    
    allPages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update canvas opacity based on page
    if (pageId === 'home') {
        opacitySlider.value = 80;
        canvas.style.opacity = 0.8;
    } else {
        opacitySlider.value = 20;
        canvas.style.opacity = 0.2;
    }

    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    mobileLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Close mobile menu
    if (mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
};

// ====== NAVIGATION LISTENERS ======
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
        currentPageIndex = pages.indexOf(pageId);
    });
});

mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
        currentPageIndex = pages.indexOf(pageId);
    });
});

// ====== HAMBURGER MENU ======
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// ====== OPACITY SLIDER ======
opacitySlider.addEventListener('input', (e) => {
    const opacity = e.target.value / 100;
    canvas.style.opacity = opacity;
});

// ====== KEYBOARD CONTROLS ======
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentPageIndex = (currentPageIndex + 1) % pages.length;
        navigateToPage(pages[currentPageIndex]);
    } else if (e.key === 'ArrowLeft') {
        currentPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
        navigateToPage(pages[currentPageIndex]);
    } else if (e.key === '1') navigateToPage('home');
    else if (e.key === '2') navigateToPage('collection');
    else if (e.key === '3') navigateToPage('about');
    else if (e.key === '4') navigateToPage('gallery');
    else if (e.key === '5') navigateToPage('contact');
});

// ====== PARTICLES.JS INITIALIZATION ======
const initParticles = () => {
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#c0c0c0" },
            shape: { type: "circle" },
            opacity: {
                value: 0.3,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.05, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#c0c0c0",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 40, duration: 2, opacity: 0.8, speed: 3 },
                repulse: { distance: 150, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true,
        background: { color: "transparent" }
    });
};

// ====== SCROLL ANIMATIONS FOR PAGE ELEMENTS ======
const setupPageAnimations = () => {
    gsap.utils.toArray('.product-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1,
                markers: false
            },
            opacity: 0,
            y: 50,
            duration: 0.8
        });
    });

    gsap.utils.toArray('.gallery-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                end: 'top 15%',
                scrub: 1
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.6
        });
    });

    gsap.utils.toArray('.about-section').forEach((section, index) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1
            },
            opacity: 0,
            x: index % 2 === 0 ? -50 : 50,
            duration: 0.8
        });
    });
};

// ====== HOVER ANIMATIONS ======
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
    });
});

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(item, { scale: 1.05, duration: 0.3 });
    });
    item.addEventListener('mouseleave', () => {
        gsap.to(item, { scale: 1, duration: 0.3 });
    });
});

// ====== INITIALIZATION ======
preloadImages();
initParticles();
setupPageAnimations();

// ====== KEYBOARD SHORTCUTS INFO ======
console.log('%c🎯 KEYBOARD SHORTCUTS:', 'color: #c0c0c0; font-size: 14px; font-weight: bold;');
console.log('%c← → : Navigate between pages', 'color: #e8e8e8; font-size: 12px;');
console.log('%c1-5: Jump to specific page', 'color: #e8e8e8; font-size: 12px;');
