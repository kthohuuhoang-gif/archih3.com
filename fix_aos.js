const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the raw AOS.init with a safe version
    content = content.replace(/AOS\.init\(\{\s*duration: 800,\s*once: true,\s*offset: 100\s*\}\);/g, `
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    once: true,
                    offset: 100
                });
            } else {
                console.warn("AOS library failed to load. Fallback to making elements visible.");
                document.querySelectorAll('[data-aos]').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            }
    `);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
}

fixFile(path.join(dir, 'index.html'));
fixFile(path.join(dir, 'hub.html'));
