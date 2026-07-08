const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

const coconutHTML = `
                        <!-- COCONUTS -->
                        <g class="coconuts-group" transform="translate(200, 100)">
                            <circle class="hifi-coconut" cx="-20" cy="5" r="14" />
                            <circle class="hifi-coconut" cx="20" cy="5" r="14" />
                            <circle class="hifi-coconut" cx="0" cy="18" r="16" />
                        </g>
                        
                        <!-- LEAVES CANOPY -->
`;
if (!content.includes('<!-- COCONUTS -->')) {
    content = content.replace('<!-- LEAVES CANOPY -->', coconutHTML);
}

fs.writeFileSync(treePath, content, 'utf8');
console.log('Injected Coconuts HTML');
