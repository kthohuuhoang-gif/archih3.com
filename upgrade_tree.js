const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

// 1. Remove old CSS block
content = content.replace(/\/\* MAGIC TREE SIMULATION \*\/[\s\S]*?\/\* Controls \*\/[\s\S]*?\}\s*\}/, '');

// 2. Remove old HTML block
content = content.replace(/<!-- INTERACTIVE SVG SIMULATION -->[\s\S]*?<\/div>\s*<\/div>/, '');

// 3. Remove old JS block
content = content.replace(/<!-- MAGIC TREE SIM SCRIPT -->[\s\S]*?<\/script>/, '');

// Define new CSS
const newCSS = `
        /* MAGIC TREE SIMULATION - HI-FI */
        .tree-sim-container {
            width: 100%; max-width: 800px; margin: 0 auto 60px;
            background: rgba(10, 10, 10, 0.9);
            border: 1px solid rgba(102, 187, 106, 0.3);
            border-radius: 12px; overflow: hidden;
            display: flex; flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }
        .tree-sim-canvas {
            width: 100%; height: 420px; position: relative;
            display: flex; align-items: flex-end; justify-content: center;
            background: 
                radial-gradient(circle at 50% 50%, rgba(102,187,106,0.05) 0%, transparent 60%),
                repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 20px), 
                repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 20px);
        }
        .tree-sim-canvas svg { width: 100%; height: 100%; overflow: visible; }

        .hifi-trunk, .hifi-leaf { fill: none; stroke-linecap: round; stroke-linejoin: round; transition: all 0.6s ease; }
        .hifi-trunk { stroke-width: 18; }
        .hifi-leaf { stroke-width: 10; }
        .hifi-leaf-top { stroke-width: 8; }
        
        .hifi-bone { stroke: rgba(255,255,255,0.6); stroke-width: 2; stroke-dasharray: 4 4; opacity: 0; transition: opacity 0.4s; }
        .hifi-node { fill: #fff; opacity: 0; transition: opacity 0.4s; }

        /* STATE 1 */
        .tree-sim-container[data-state="1"] .hifi-trunk,
        .tree-sim-container[data-state="1"] .hifi-leaf,
        .tree-sim-container[data-state="1"] .hifi-leaf-top { stroke: #444; }

        /* STATE 2 */
        .tree-sim-container[data-state="2"] .hifi-trunk { stroke: #9c27b0; filter: drop-shadow(0 0 8px rgba(156,39,176,0.8)); }
        .tree-sim-container[data-state="2"] .hifi-leaf-bottom { stroke: #03a9f4; filter: drop-shadow(0 0 8px rgba(3,169,244,0.8)); }
        .tree-sim-container[data-state="2"] .hifi-leaf-mid { stroke: #4caf50; filter: drop-shadow(0 0 8px rgba(76,175,80,0.8)); }
        .tree-sim-container[data-state="2"] .hifi-leaf-top { stroke: #ffeb3b; filter: drop-shadow(0 0 8px rgba(255,235,59,0.8)); }
        .tree-sim-container[data-state="2"] .hifi-bone,
        .tree-sim-container[data-state="2"] .hifi-node { opacity: 1; animation: pulseGlow 1.5s infinite alternate; }

        /* STATE 3 */
        .tree-sim-container[data-state="3"] .hifi-trunk,
        .tree-sim-container[data-state="3"] .hifi-leaf,
        .tree-sim-container[data-state="3"] .hifi-leaf-top { stroke: var(--primary); filter: drop-shadow(0 0 6px rgba(102,187,106,0.5)); }
        
        .tree-sim-container[data-state="3"] .tree-wrapper { transform-origin: 200px 380px; animation: treeSwayHiFi 3.5s ease-in-out infinite alternate; }
        .tree-sim-container[data-state="3"] .hifi-leaf { animation: leafFlutterHiFi 1.8s ease-in-out infinite alternate; }
        .tree-sim-container[data-state="3"] .hifi-leaf-top { animation: leafFlutterHiFi 1.4s ease-in-out infinite alternate; }
        
        .tree-sim-container[data-state="3"] .l-b-l { animation-delay: 0.1s; }
        .tree-sim-container[data-state="3"] .l-b-r { animation-delay: 0.5s; }
        .tree-sim-container[data-state="3"] .l-m-l { animation-delay: 0.3s; }
        .tree-sim-container[data-state="3"] .l-m-r { animation-delay: 0.7s; }
        .tree-sim-container[data-state="3"] .l-t-l { animation-delay: 0.2s; }
        .tree-sim-container[data-state="3"] .l-t-r { animation-delay: 0.6s; }

        @keyframes pulseGlow { from { opacity: 0.5; filter: drop-shadow(0 0 2px #fff); } to { opacity: 1; filter: drop-shadow(0 0 6px #fff); } }
        @keyframes treeSwayHiFi { 0% { transform: rotate(-6deg); } 100% { transform: rotate(8deg); } }
        @keyframes leafFlutterHiFi { 0% { transform: rotate(-5deg); } 100% { transform: rotate(7deg); } }

        .tree-sim-controls { display: flex; border-top: 1px solid rgba(102,187,106,0.2); background: #111; }
        .sim-btn { flex: 1; padding: 18px; background: transparent; border: none; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; font-size: 14px; cursor: pointer; transition: all 0.3s; border-right: 1px solid rgba(102,187,106,0.2); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .sim-btn:last-child { border-right: none; }
        .sim-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .sim-btn.active { background: rgba(102,187,106,0.15); color: var(--primary); font-weight: 600; }
        .sim-color-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; opacity: 0; transition: opacity 0.3s; }
        .sim-btn.active .sim-color-dot { opacity: 1; box-shadow: 0 0 5px currentColor; }
        @media (max-width: 600px) { .tree-sim-controls { flex-direction: column; } .sim-btn { border-right: none; border-bottom: 1px solid rgba(102,187,106,0.2); } .sim-btn:last-child { border-bottom: none; } }
        
        .step-item { transition: all 0.4s; }
        .step-item.synced-active { background: rgba(102,187,106,0.05); border-color: rgba(102,187,106,0.4); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(102,187,106,0.1); }
        .step-item.synced-active .step-num { background: var(--primary); color: #000; box-shadow: 0 0 15px rgba(102,187,106,0.5); }
`;
content = content.replace('/* BUTTONS */', newCSS + '\n        /* BUTTONS */');

// Add IDs to step-items
content = content.replace(/<div class="step-item">/g, function(match) {
    this.stepIndex = (this.stepIndex || 0) + 1;
    return `<div class="step-item" id="step-desc-${this.stepIndex}">`;
});

const newHTML = `
        <!-- INTERACTIVE SVG SIMULATION -->
        <div class="tree-sim-container" data-state="1" data-aos="fade-up">
            <div class="tree-sim-canvas">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <g class="tree-wrapper">
                        <!-- BONES (State 2) -->
                        <g class="hifi-bone-group">
                            <line class="hifi-bone" x1="200" y1="380" x2="208" y2="280" />
                            <line class="hifi-bone" x1="208" y1="280" x2="204" y2="180" />
                            <line class="hifi-bone" x1="204" y1="180" x2="200" y2="100" />
                            
                            <line class="hifi-bone" x1="200" y1="100" x2="100" y2="150" />
                            <line class="hifi-bone" x1="200" y1="100" x2="300" y2="150" />
                            <line class="hifi-bone" x1="200" y1="100" x2="120" y2="60" />
                            <line class="hifi-bone" x1="200" y1="100" x2="280" y2="60" />
                            <line class="hifi-bone" x1="200" y1="100" x2="150" y2="20" />
                            <line class="hifi-bone" x1="200" y1="100" x2="250" y2="20" />
                        </g>

                        <!-- TRUNK -->
                        <!-- A thicker curved path representing the coconut trunk -->
                        <path class="hifi-trunk" d="M200,380 Q220,240 200,100" />
                        
                        <!-- LEAVES CANOPY -->
                        <g class="leaves-group" transform="translate(200, 100)">
                            <!-- Bottom Leaves (Blue in State 2) -->
                            <path class="hifi-leaf hifi-leaf-bottom l-b-l" d="M0,0 C-30,-20 -100,-20 -170,40" />
                            <path class="hifi-leaf hifi-leaf-bottom l-b-r" d="M0,0 C30,-20 100,-20 170,40" />
                            
                            <!-- Mid Leaves (Green in State 2) -->
                            <path class="hifi-leaf hifi-leaf-mid l-m-l" d="M0,0 C-40,-50 -120,-60 -180,0" />
                            <path class="hifi-leaf hifi-leaf-mid l-m-r" d="M0,0 C40,-50 120,-60 180,0" />
                            
                            <!-- Top Leaves (Yellow in State 2) -->
                            <path class="hifi-leaf hifi-leaf-top l-t-l" d="M0,0 C-20,-90 -80,-130 -110,-90" />
                            <path class="hifi-leaf hifi-leaf-top l-t-r" d="M0,0 C20,-90 80,-130 110,-90" />
                        </g>

                        <!-- NODES (State 2) -->
                        <g class="hifi-node-group">
                            <circle class="hifi-node" cx="200" cy="380" r="6" />
                            <circle class="hifi-node" cx="208" cy="280" r="5" />
                            <circle class="hifi-node" cx="204" cy="180" r="5" />
                            <circle class="hifi-node" cx="200" cy="100" r="7" />
                            
                            <circle class="hifi-node" cx="100" cy="150" r="4" />
                            <circle class="hifi-node" cx="300" cy="150" r="4" />
                            <circle class="hifi-node" cx="120" cy="60" r="4" />
                            <circle class="hifi-node" cx="280" cy="60" r="4" />
                            <circle class="hifi-node" cx="150" cy="20" r="4" />
                            <circle class="hifi-node" cx="250" cy="20" r="4" />
                        </g>
                    </g>
                </svg>
            </div>
            <div class="tree-sim-controls">
                <button class="sim-btn active" id="sim-btn-1" onclick="setTreeState(1)" data-vi="1. Model tĩnh" data-en="1. Static Model"><div class="sim-color-dot"></div>1. Model tĩnh</button>
                <button class="sim-btn" id="sim-btn-2" onclick="setTreeState(2)" data-vi="2. Dò tìm sinh học (Rig)" data-en="2. Bio-Rigging"><div class="sim-color-dot"></div>2. Dò tìm sinh học (Rig)</button>
                <button class="sim-btn" id="sim-btn-3" onclick="setTreeState(3)" data-vi="3. Đón gió (Wind Loop)" data-en="3. Wind Loop"><div class="sim-color-dot"></div>3. Đón gió (Wind Loop)</button>
            </div>
        </div>
`;
content = content.replace('<div class="steps-grid">', newHTML + '\n        <div class="steps-grid">');

const newJS = `
    <!-- MAGIC TREE SIM SCRIPT -->
    <script>
        function setTreeState(state) {
            const container = document.querySelector('.tree-sim-container');
            if(container) {
                container.setAttribute('data-state', state);
                
                for(let i = 1; i <= 3; i++) {
                    // Update buttons
                    const btn = document.getElementById('sim-btn-' + i);
                    if(btn) {
                        if(i === state) btn.classList.add('active');
                        else btn.classList.remove('active');
                    }
                    
                    // Sync with descriptions below
                    const desc = document.getElementById('step-desc-' + i);
                    if(desc) {
                        if(i === state) desc.classList.add('synced-active');
                        else desc.classList.remove('synced-active');
                    }
                }
            }
        }
        
        document.addEventListener("DOMContentLoaded", function() {
            // Initial sync
            setTreeState(1);
            
            const simContainer = document.querySelector('.tree-sim-container');
            if (simContainer) {
                let played = false;
                const simObserver = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !played) {
                        played = true;
                        setTimeout(() => setTreeState(2), 1500);
                        setTimeout(() => setTreeState(3), 3500);
                    }
                }, { threshold: 0.5 });
                simObserver.observe(simContainer);
            }
        });
    </script>
`;
content = content.replace('</body>', newJS + '\n</body>');

fs.writeFileSync(treePath, content, 'utf8');
console.log('Successfully upgraded Tree to Hi-Fi with Color Parsing and Syncing.');
