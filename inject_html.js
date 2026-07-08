const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

const treeHTML = `
        <!-- INTERACTIVE SVG SIMULATION -->
        <div class="tree-sim-container" data-state="1" data-aos="fade-up">
            <div class="tree-sim-canvas">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <g class="tree-wrapper">
                        <!-- TRUNK -->
                        <path class="trunk" d="M200,380 Q220,250 200,150" fill="none" stroke-width="12" stroke-linecap="round"/>
                        
                        <!-- LEAVES -->
                        <g class="leaves-group" transform="translate(200, 150)">
                            <!-- Bottom Left -->
                            <path class="leaf leaf-1" d="M0,0 C-40,-50 -100,-40 -160,20" fill="none" stroke-width="4" stroke-linecap="round"/>
                            <!-- Bottom Right -->
                            <path class="leaf leaf-2" d="M0,0 C40,-50 100,-40 160,20" fill="none" stroke-width="4" stroke-linecap="round"/>
                            <!-- Mid Left -->
                            <path class="leaf leaf-3" d="M0,0 C-30,-80 -90,-90 -140,-40" fill="none" stroke-width="4" stroke-linecap="round"/>
                            <!-- Mid Right -->
                            <path class="leaf leaf-4" d="M0,0 C30,-80 90,-90 140,-40" fill="none" stroke-width="4" stroke-linecap="round"/>
                            <!-- Top Left -->
                            <path class="leaf leaf-5" d="M0,0 C-10,-100 -50,-120 -80,-80" fill="none" stroke-width="4" stroke-linecap="round"/>
                            <!-- Top Right -->
                            <path class="leaf leaf-6" d="M0,0 C10,-100 50,-120 80,-80" fill="none" stroke-width="4" stroke-linecap="round"/>
                        </g>

                        <!-- RIGGING NODES -->
                        <g class="nodes">
                            <!-- Trunk Nodes -->
                            <circle cx="200" cy="380" r="5" />
                            <circle cx="206" cy="300" r="4" />
                            <circle cx="209" cy="220" r="4" />
                            <circle cx="200" cy="150" r="6" />
                            
                            <!-- Leaves Nodes (Approximate) -->
                            <circle cx="120" cy="130" r="3" />
                            <circle cx="80" cy="130" r="3" />
                            
                            <circle cx="280" cy="130" r="3" />
                            <circle cx="320" cy="130" r="3" />
                            
                            <circle cx="130" cy="80" r="3" />
                            <circle cx="270" cy="80" r="3" />
                            
                            <circle cx="160" cy="50" r="3" />
                            <circle cx="240" cy="50" r="3" />
                        </g>
                    </g>
                </svg>
            </div>
            <div class="tree-sim-controls">
                <button class="sim-btn active" id="sim-btn-1" onclick="setTreeState(1)" data-vi="1. Model tĩnh" data-en="1. Static Model">1. Model tĩnh</button>
                <button class="sim-btn" id="sim-btn-2" onclick="setTreeState(2)" data-vi="2. Dò tìm sinh học (Rig)" data-en="2. Bio-Rigging">2. Dò tìm sinh học (Rig)</button>
                <button class="sim-btn" id="sim-btn-3" onclick="setTreeState(3)" data-vi="3. Đón gió (Wind Loop)" data-en="3. Wind Loop">3. Đón gió (Wind Loop)</button>
            </div>
        </div>
`;

if (!content.includes('<!-- INTERACTIVE SVG SIMULATION -->')) {
    content = content.replace('<div class="steps-grid">', treeHTML + '\n        <div class="steps-grid">');
}

fs.writeFileSync(treePath, content, 'utf8');
console.log('Injected HTML successfully');
