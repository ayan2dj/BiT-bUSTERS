// Main JavaScript for landing page
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate crypto visualization
    animateCryptoVisualization();

    // Add intersection observer for animations
    setupScrollAnimations();
});

function animateCryptoVisualization() {
    const dataBlocks = document.querySelector('.data-blocks');
    const encryptionWaves = document.querySelector('.encryption-waves');
    
    if (!dataBlocks || !encryptionWaves) return;

    // Create floating data particles
    createDataParticles();

    // Animate encryption process
    setInterval(() => {
        createEncryptionPulse();
    }, 2000);
}

function createDataParticles() {
    const cryptoAnimation = document.querySelector('.crypto-animation');
    if (!cryptoAnimation) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'data-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
        `;

        // Random position
        const angle = (i / 20) * 2 * Math.PI;
        const radius = 100 + Math.random() * 50;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;

        // Animation
        particle.style.animation = `particleFloat 3s ease-in-out infinite ${i * 0.1}s`;

        cryptoAnimation.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }
}

function createEncryptionPulse() {
    const cryptoAnimation = document.querySelector('.crypto-animation');
    if (!cryptoAnimation) return;

    const pulse = document.createElement('div');
    pulse.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        animation: pulseExpand 2s ease-out forwards;
        pointer-events: none;
    `;

    cryptoAnimation.appendChild(pulse);

    // Remove pulse after animation
    setTimeout(() => {
        if (pulse.parentNode) {
            pulse.parentNode.removeChild(pulse);
        }
    }, 2000);
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateX(-30px)';
        step.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(step);
    });

    // Animate security features
    const securityItems = document.querySelectorAll('.security-item');
    securityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// Add dynamic styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 0;
            transform: scale(0);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
        }
    }

    @keyframes pulseExpand {
        0% {
            width: 10px;
            height: 10px;
            opacity: 1;
        }
        100% {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }

    .data-particle {
        z-index: 1;
    }
`;
document.head.appendChild(style);
