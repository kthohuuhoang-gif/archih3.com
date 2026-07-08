const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

// Replace State 2 colors
// Trunk: Purple -> Brown (#8D6E63)
content = content.replace(/stroke: #9c27b0; filter: drop-shadow\(0 0 8px rgba\(156,39,176,0\.8\)\);/, 'stroke: #8D6E63; filter: drop-shadow(0 0 8px rgba(141,110,99,0.8));');
// Bottom leaves: Blue -> Dark Green (#2E7D32)
content = content.replace(/stroke: #03a9f4; filter: drop-shadow\(0 0 8px rgba\(3,169,244,0\.8\)\);/, 'stroke: #2E7D32; filter: drop-shadow(0 0 8px rgba(46,125,50,0.8));');
// Mid leaves: Green -> Medium Green (#4CAF50)
content = content.replace(/stroke: #4caf50; filter: drop-shadow\(0 0 8px rgba\(76,175,80,0\.8\)\);/, 'stroke: #4CAF50; filter: drop-shadow(0 0 8px rgba(76,175,80,0.8));');
// Top leaves: Yellow -> Light Green (#81C784)
content = content.replace(/stroke: #ffeb3b; filter: drop-shadow\(0 0 8px rgba\(255,235,59,0\.8\)\);/, 'stroke: #81C784; filter: drop-shadow(0 0 8px rgba(129,199,132,0.8));');

// Replace State 3 colors
// State 3 currently unifies to var(--primary) which is a Teal color.
// If the user wants separate colors for trunk, branches, leaves, maybe I should let State 3 retain the natural colors?
// Let's change State 3 to also use natural colors but maybe brighter, or just keep the State 2 colors but without the strong pulsing glow.
// Wait, currently State 3 forces everything to var(--primary).
// I will replace State 3 CSS block to inherit the specific colors instead of unifying them.

// Find State 3 block:
/*
        .tree-sim-container[data-state="3"] .hifi-trunk,
        .tree-sim-container[data-state="3"] .hifi-leaf,
        .tree-sim-container[data-state="3"] .hifi-leaf-top { stroke: var(--primary); filter: drop-shadow(0 0 6px rgba(102,187,106,0.5)); }
*/
const oldState3Colors = `        .tree-sim-container[data-state="3"] .hifi-trunk,
        .tree-sim-container[data-state="3"] .hifi-leaf,
        .tree-sim-container[data-state="3"] .hifi-leaf-top { stroke: var(--primary); filter: drop-shadow(0 0 6px rgba(102,187,106,0.5)); }`;

const newState3Colors = `        
        /* STATE 3 */
        .tree-sim-container[data-state="3"] .hifi-trunk { stroke: #8D6E63; filter: drop-shadow(0 0 6px rgba(141,110,99,0.5)); }
        .tree-sim-container[data-state="3"] .hifi-leaf-bottom { stroke: #2E7D32; filter: drop-shadow(0 0 6px rgba(46,125,50,0.5)); }
        .tree-sim-container[data-state="3"] .hifi-leaf-mid { stroke: #4CAF50; filter: drop-shadow(0 0 6px rgba(76,175,80,0.5)); }
        .tree-sim-container[data-state="3"] .hifi-leaf-top { stroke: #81C784; filter: drop-shadow(0 0 6px rgba(129,199,132,0.5)); }
`;
content = content.replace(oldState3Colors, newState3Colors);

fs.writeFileSync(treePath, content, 'utf8');
console.log('Fixed colors');
