const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

const treeCSS = `
        /* MAGIC TREE SIMULATION */
        .tree-sim-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto 60px;
            background: rgba(10, 10, 10, 0.8);
            border: 1px solid rgba(102, 187, 106, 0.2);
            border-radius: 12px;
            overflow: hidden;
            display: flex; flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .tree-sim-canvas {
            width: 100%; height: 400px;
            position: relative;
            display: flex; align-items: flex-end; justify-content: center;
            background: repeating-linear-gradient(
                0deg,
                rgba(102, 187, 106, 0.03) 0px,
                rgba(102, 187, 106, 0.03) 1px,
                transparent 1px,
                transparent 20px
            ), repeating-linear-gradient(
                90deg,
                rgba(102, 187, 106, 0.03) 0px,
                rgba(102, 187, 106, 0.03) 1px,
                transparent 1px,
                transparent 20px
            );
        }
        .tree-sim-canvas svg {
            width: 100%; height: 100%;
            overflow: visible;
        }

        .trunk, .leaf {
            stroke: #444;
            transition: all 0.5s ease;
        }
        .nodes circle {
            fill: var(--primary);
            opacity: 0;
            transition: opacity 0.5s ease;
            transform-origin: center;
        }

        /* State 2: Rigging */
        .tree-sim-container[data-state="2"] .trunk,
        .tree-sim-container[data-state="2"] .leaf,
        .tree-sim-container[data-state="3"] .trunk,
        .tree-sim-container[data-state="3"] .leaf {
            stroke: var(--primary);
            filter: drop-shadow(0 0 5px rgba(102,187,106,0.6));
        }
        .tree-sim-container[data-state="2"] .nodes circle {
            opacity: 1;
            animation: nodePulse 1s infinite alternate;
        }
        @keyframes nodePulse {
            from { transform: scale(0.6); opacity: 0.6; }
            to { transform: scale(1.4); opacity: 1; }
        }

        /* State 3: Wind Physics */
        .tree-sim-container[data-state="3"] .tree-wrapper {
            transform-origin: 200px 380px;
            animation: treeSway 3s ease-in-out infinite alternate;
        }
        .tree-sim-container[data-state="3"] .leaf {
            animation: leafFlutter 1.5s ease-in-out infinite alternate;
        }
        .tree-sim-container[data-state="3"] .leaf-1 { animation-delay: 0.1s; }
        .tree-sim-container[data-state="3"] .leaf-2 { animation-delay: 0.5s; }
        .tree-sim-container[data-state="3"] .leaf-3 { animation-delay: 0.3s; }
        .tree-sim-container[data-state="3"] .leaf-4 { animation-delay: 0.7s; }
        .tree-sim-container[data-state="3"] .leaf-5 { animation-delay: 0.2s; }
        .tree-sim-container[data-state="3"] .leaf-6 { animation-delay: 0.6s; }

        @keyframes treeSway {
            0% { transform: rotate(-4deg); }
            100% { transform: rotate(6deg); }
        }
        @keyframes leafFlutter {
            0% { transform: rotate(-3deg); }
            100% { transform: rotate(5deg); }
        }

        /* Controls */
        .tree-sim-controls {
            display: flex; border-top: 1px solid rgba(102,187,106,0.2);
            background: #111;
        }
        .sim-btn {
            flex: 1; padding: 16px; background: transparent; border: none;
            color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; font-size: 13px;
            cursor: pointer; transition: all 0.3s; border-right: 1px solid rgba(102,187,106,0.2);
        }
        .sim-btn:last-child { border-right: none; }
        .sim-btn:hover { background: rgba(255,255,255,0.05); }
        .sim-btn.active {
            background: rgba(102,187,106,0.15); color: var(--primary); font-weight: 600;
        }
        
        @media (max-width: 600px) {
            .tree-sim-controls { flex-direction: column; }
            .sim-btn { border-right: none; border-bottom: 1px solid rgba(102,187,106,0.2); }
            .sim-btn:last-child { border-bottom: none; }
        }
`;

if (!content.includes('tree-sim-container')) {
    content = content.replace('/* BUTTONS */', treeCSS + '\n        /* BUTTONS */');
}

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

if (!content.includes('tree-sim-container')) {
    content = content.replace('<div class="steps-grid">', treeHTML + '\n        <div class="steps-grid">');
}

const treeJS = `
    <!-- MAGIC TREE SIM SCRIPT -->
    <script>
        function setTreeState(state) {
            const container = document.querySelector('.tree-sim-container');
            if(container) {
                container.setAttribute('data-state', state);
                
                // Update buttons
                for(let i = 1; i <= 3; i++) {
                    const btn = document.getElementById('sim-btn-' + i);
                    if(btn) {
                        if(i === state) btn.classList.add('active');
                        else btn.classList.remove('active');
                    }
                }
            }
        }
        
        // Auto-play simulation when scrolled into view
        document.addEventListener("DOMContentLoaded", function() {
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

if (!content.includes('MAGIC TREE SIM SCRIPT')) {
    content = content.replace('</body>', treeJS + '\n</body>');
}

fs.writeFileSync(treePath, content, 'utf8');
console.log('Tree simulation added to tree.html');
