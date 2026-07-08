const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const indexPath = path.join(dir, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Remove pseudo-element CSS and add wrapper CSS
content = content.replace(/\.hero::before, \.hero::after \{[\s\S]*?@keyframes floatOrb \{[\s\S]*?\}/, `
        .orb-wrapper {
            position: absolute;
            z-index: 0;
            pointer-events: none;
            transition: transform 0.3s ease-out;
        }
        .orb-wrapper-1 { top: -100px; left: -100px; }
        .orb-wrapper-2 { bottom: -150px; right: -100px; }
        
        .orb {
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.5;
            animation: floatOrb 15s ease-in-out infinite alternate;
        }
        .orb-1 {
            width: 400px; height: 400px;
            background: rgba(77, 182, 172, 0.4);
        }
        .orb-2 {
            width: 500px; height: 500px;
            background: rgba(30, 100, 200, 0.3);
            animation-delay: -5s;
            animation-duration: 20s;
        }
        @keyframes floatOrb {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(100px, 50px) scale(1.2); }
        }
`);

// Also fix mobile media query CSS for orbs
content = content.replace(/\.hero::before \{ width: 300px; height: 300px; \}\s*\.hero::after \{ width: 400px; height: 400px; \}/g, '.orb-1 { width: 300px; height: 300px; }\n            .orb-2 { width: 400px; height: 400px; }');

// 2. Inject the HTML divs into the hero section
const orbsHTML = `
        <div class="orb-wrapper orb-wrapper-1" id="orb-w-1"><div class="orb orb-1"></div></div>
        <div class="orb-wrapper orb-wrapper-2" id="orb-w-2"><div class="orb orb-2"></div></div>
        <div class="hero-content"`;

content = content.replace(/<div class="hero-content"/, orbsHTML);

// Add an ID to hero
content = content.replace(/<section class="hero">/, '<section class="hero" id="main-hero">');

// 3. Inject JS for parallax
const parallaxJS = `
        // Hero Parallax Effect
        const heroSection = document.getElementById('main-hero');
        if (heroSection) {
            const orb1 = document.getElementById('orb-w-1');
            const orb2 = document.getElementById('orb-w-2');
            
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                // Calculate mouse position relative to center of hero (-1 to 1)
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                
                // Move orb 1 in opposite direction of mouse
                if (orb1) orb1.style.transform = \`translate(\${x * -60}px, \${y * -60}px)\`;
                // Move orb 2 in same direction of mouse (different depth)
                if (orb2) orb2.style.transform = \`translate(\${x * 80}px, \${y * 80}px)\`;
            });
            
            // Reset when mouse leaves
            heroSection.addEventListener('mouseleave', () => {
                if (orb1) orb1.style.transform = 'translate(0, 0)';
                if (orb2) orb2.style.transform = 'translate(0, 0)';
            });
        }
`;

content = content.replace('});\n    </script>\n</body>', parallaxJS + '\n        });\n    </script>\n</body>');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Parallax added successfully');
