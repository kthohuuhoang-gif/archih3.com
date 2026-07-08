const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

// 1. Add coconuts CSS
const coconutCSS = `
        .hifi-coconut { transition: all 0.6s ease; stroke-width: 6; }
        
        /* STATE 1 */
        .tree-sim-container[data-state="1"] .hifi-coconut { stroke: #444; fill: #222; }

        /* STATE 2 */
        .tree-sim-container[data-state="2"] .hifi-coconut { stroke: #FF9800; fill: rgba(255,152,0,0.3); filter: drop-shadow(0 0 8px rgba(255,152,0,0.8)); }

        /* STATE 3 */
        .tree-sim-container[data-state="3"] .hifi-coconut { stroke: #FF9800; fill: rgba(255,152,0,0.8); filter: drop-shadow(0 0 6px rgba(255,152,0,0.5)); }
        
        .tree-sim-container[data-state="3"] .coconuts-group {
            animation: coconutSway 2.5s ease-in-out infinite alternate;
        }
        @keyframes coconutSway {
            0% { transform: translate(200px, 100px) rotate(-3deg); }
            100% { transform: translate(200px, 100px) rotate(4deg); }
        }
`;

if (!content.includes('hifi-coconut')) {
    content = content.replace('/* STATE 1 */', coconutCSS + '\n        /* STATE 1 */');
}

// 2. Add coconuts HTML
const coconutHTML = `
                        <!-- COCONUTS -->
                        <g class="coconuts-group" transform="translate(200, 100)">
                            <circle class="hifi-coconut" cx="-20" cy="5" r="14" />
                            <circle class="hifi-coconut" cx="20" cy="5" r="14" />
                            <circle class="hifi-coconut" cx="0" cy="18" r="16" />
                        </g>
                        
                        <!-- LEAVES CANOPY -->
`;
if (!content.includes('coconuts-group')) {
    content = content.replace('<!-- LEAVES CANOPY -->', coconutHTML);
}

// Ensure the new CSS colors are correct and look nice.
fs.writeFileSync(treePath, content, 'utf8');
console.log('Added coconuts');
