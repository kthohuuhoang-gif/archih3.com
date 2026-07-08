const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';

function fixIndex() {
    let p = path.join(dir, 'index.html');
    let content = fs.readFileSync(p, 'utf8');
    // Change 900px breakpoints to 1024px to cover iPad Pro 1024px portrait
    content = content.replace(/@media \(max-width: 900px\)/g, '@media (max-width: 1024px)');
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed iPad for index.html');
}

function fixHub() {
    let p = path.join(dir, 'hub.html');
    let content = fs.readFileSync(p, 'utf8');
    // For grid layout breakpoints in hub.html, change 768px to 1024px
    // Note: We leave the general mobile optimizations at 768px if they are just font sizes
    // But for .spotlight-grid, .game-grid, .pricing-grid, 1024px is safer.
    content = content.replace(/@media \(max-width: 768px\) \{\s*\.game-grid \{/g, '@media (max-width: 1024px) {\n            .game-grid {');
    content = content.replace(/@media \(max-width: 768px\) \{\s*\.spotlight-grid-3-2 \{/g, '@media (max-width: 1024px) {\n            .spotlight-grid-3-2 {');
    content = content.replace(/@media \(max-width: 768px\) \{\s*\.req-grid-cards \{/g, '@media (max-width: 1024px) {\n            .req-grid-cards {');
    
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed iPad for hub.html');
}

fixIndex();
fixHub();
