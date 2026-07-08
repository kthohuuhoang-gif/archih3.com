const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const indexPath = path.join(dir, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const fixJS = `
            // Fix Anchor Scrolling on file:// protocol for Chrome/Brave
            const exploreBtn = document.querySelector('a[href="#products"]');
            if (exploreBtn) {
                exploreBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.getElementById('products');
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        // Trigger AOS to recalculate offsets after scrolling
                        setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refresh(); }, 500);
                    }
                });
            }
`;

content = content.replace(/\/\/ Hero Parallax Effect/, fixJS + '\n\n        // Hero Parallax Effect');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Fixed anchor scrolling');
