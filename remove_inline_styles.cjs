const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

const styleToClassMap = {
    'display: flex': 'flex',
    'display:flex': 'flex',
    'align-items: center': 'items-center',
    'align-items:center': 'items-center',
    'justify-content: center': 'justify-center',
    'justify-content:center': 'justify-center',
    'display: none': 'hidden',
    'display:none': 'hidden',
    'display: block': 'block',
    'display:block': 'block',
    'position: absolute': 'absolute',
    'position:absolute': 'absolute',
    'position: relative': 'relative',
    'position:relative': 'relative',
    'opacity: 0': 'opacity-0',
    'opacity:0': 'opacity-0',
    'pointer-events: none': 'pointer-events-none',
    'pointer-events:none': 'pointer-events-none',
    'width: 100%': 'w-full',
    'width:100%': 'w-full',
    'text-align: center': 'text-center',
    'text-align:center': 'text-center',
    'text-align: left': 'text-left',
    'text-align:left': 'text-left',
    'font-weight: 600': 'font-semibold',
    'font-weight:600': 'font-semibold',
    'font-weight: 300': 'font-light',
    'font-weight:300': 'font-light',
    'color: var(--primary)': 'text-primary',
    'color:var(--primary)': 'text-primary',
    'color: var(--text-secondary)': 'text-muted',
    'color:var(--text-secondary)': 'text-muted',
    'background: var(--bg-surface)': 'bg-surface',
    'background:var(--bg-surface)': 'bg-surface',
    'inset: 0': 'inset-0',
    'inset:0': 'inset-0',
    'margin-top: 16px': 'mt-4',
    'margin-top:16px': 'mt-4',
    'margin-top: 24px': 'mt-6',
    'margin-top:24px': 'mt-6',
    'margin-bottom: 8px': 'mb-2',
    'margin-bottom:8px': 'mb-2',
    'margin-bottom: 16px': 'mb-4',
    'margin-bottom:16px': 'mb-4',
    'margin-bottom: 24px': 'mb-6',
    'margin-bottom:24px': 'mb-6',
    'margin-bottom: 32px': 'mb-8',
    'margin-bottom:32px': 'mb-8',
    'padding: 0': 'p-0',
    'padding:0': 'p-0',
};

let count = 0;

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all HTML tags with style="..."
    const regex = /<([a-zA-Z0-9\-]+)([^>]*)style="([^"]+)"([^>]*)>/g;
    
    const newContent = content.replace(regex, (match, tag, before, styleStr, after) => {
        const rules = styleStr.split(';').map(s => s.trim()).filter(s => s);
        const classesToAdd = [];
        const remainingRules = [];
        
        rules.forEach(rule => {
            // Check map
            let matched = false;
            for (const [k, v] of Object.entries(styleToClassMap)) {
                if (rule.replace(/\s+/g, '') === k.replace(/\s+/g, '')) {
                    classesToAdd.push(v);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                remainingRules.push(rule);
            }
        });
        
        let isSelfClosing = after.trim().endsWith('/');
        let cleanAfter = after;
        if (isSelfClosing) {
            cleanAfter = after.replace(/\/\s*$/, '');
        }
        
        let attributes = (before + cleanAfter);
        
        if (classesToAdd.length > 0) {
            count += classesToAdd.length;
            if (attributes.includes('class="')) {
                attributes = attributes.replace(/class="([^"]*)"/, (m, c) => {
                    return `class="${c} ${classesToAdd.join(' ')}"`;
                });
            } else {
                attributes += ` class="${classesToAdd.join(' ')}"`;
            }
        }
        
        const closeTag = isSelfClosing ? ' />' : '>';
        
        if (remainingRules.length > 0) {
            return `<${tag}${attributes} style="${remainingRules.join('; ')};"${closeTag}`;
        } else {
            return `<${tag}${attributes}${closeTag}`;
        }
    });
    
    fs.writeFileSync(filePath, newContent);
});

console.log(`Successfully replaced ${count} inline styles with utility classes.`);
