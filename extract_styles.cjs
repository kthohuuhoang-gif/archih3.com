const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

const styles = {};

files.forEach(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const regex = /style="([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const styleRules = match[1].split(';').map(s => s.trim()).filter(s => s);
        styleRules.forEach(rule => {
            styles[rule] = (styles[rule] || 0) + 1;
        });
    }
});

const sorted = Object.entries(styles).sort((a,b) => b[1] - a[1]);
console.log('Top 30 Inline Styles:');
sorted.slice(0, 30).forEach(([s, c]) => console.log(`${c}x: ${s}`));
