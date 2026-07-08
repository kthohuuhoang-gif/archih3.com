const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const matPath = path.join(dir, 'material.html');
let content = fs.readFileSync(matPath, 'utf8');

const terminalCSS = `
        /* TERMINAL MOCKUP */
        .terminal-mockup {
            width: 100%; max-width: 800px; margin: 0 auto;
            background: #0d0d0d; border-radius: 12px;
            border: 1px solid rgba(77,182,172,0.2);
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px #222;
            overflow: hidden; position: relative;
            font-family: 'JetBrains Mono', monospace;
        }
        .term-header {
            background: #1a1a1a; padding: 12px 16px;
            display: flex; align-items: center; border-bottom: 1px solid #333;
        }
        .term-dots { display: flex; gap: 8px; margin-right: 16px; }
        .term-dots span { width: 12px; height: 12px; border-radius: 50%; }
        .term-dots span:nth-child(1) { background: #ff5f56; }
        .term-dots span:nth-child(2) { background: #ffbd2e; }
        .term-dots span:nth-child(3) { background: #27c93f; }
        .term-title { font-size: 13px; color: #888; flex: 1; text-align: center; margin-left: -40px; }

        .term-body {
            padding: 24px; min-height: 280px; overflow-y: auto;
            color: #4af626; font-size: 14px; line-height: 1.6;
            background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
            text-shadow: 0 0 5px rgba(74, 246, 38, 0.4);
            text-align: left;
        }
        .term-line { opacity: 0; animation: fadeInLine 0s forwards; }
        .term-line.info { color: #888; text-shadow: none; }
        .term-line.highlight { color: #fff; text-shadow: 0 0 5px #fff; }
        .term-line.success { color: #4af626; }
        .term-cursor { display: inline-block; width: 8px; height: 15px; background: #4af626; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 4px; }

        @keyframes fadeInLine { to { opacity: 1; } }
        @keyframes blink { 50% { opacity: 0; } }

        /* RESULT BADGES */
        .term-result {
            padding: 24px; background: #111; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
            border-top: 1px solid rgba(77,182,172,0.1);
        }
        .term-result.hidden { display: none; }
        .result-badge {
            padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 700;
            letter-spacing: 1px; color: #fff; opacity: 0; transform: translateY(20px);
            transition: all 0.3s; cursor: default;
        }
        .result-badge.show { opacity: 1; transform: translateY(0); }
        .result-badge.normal { background: rgba(156, 39, 176, 0.2); border: 1px solid #9c27b0; box-shadow: 0 0 15px rgba(156, 39, 176, 0.3); }
        .result-badge.rough { background: rgba(158, 158, 158, 0.2); border: 1px solid #9e9e9e; box-shadow: 0 0 15px rgba(158, 158, 158, 0.3); }
        .result-badge.ao { background: rgba(33, 33, 33, 0.4); border: 1px solid #555; box-shadow: 0 0 15px rgba(255, 255, 255, 0.1); }
        .result-badge.disp { background: rgba(255, 255, 255, 0.1); border: 1px solid #fff; box-shadow: 0 0 15px rgba(255, 255, 255, 0.4); color: #fff; }
        .result-badge:hover { transform: translateY(-5px); filter: brightness(1.3); }
`;

if (!content.includes('TERMINAL MOCKUP')) {
    content = content.replace('/* INTERFACE CONTAINER RESPONSIVE */', terminalCSS + '\n        /* INTERFACE CONTAINER RESPONSIVE */');
}

const terminalHTML = `
        <div class="interface-container" style="padding: 0; background: transparent; border: none; box-shadow: none;">
            <div class="terminal-mockup" id="magic-terminal">
                <div class="term-header">
                    <div class="term-dots"><span></span><span></span><span></span></div>
                    <div class="term-title">AH3 Magic Material // Core Engine v2.0</div>
                </div>
                <div class="term-body" id="term-output">
                    <!-- JS Injected -->
                </div>
                <div class="term-result hidden" id="term-result">
                    <div class="result-badge normal">NORMAL MAP</div>
                    <div class="result-badge rough">ROUGHNESS</div>
                    <div class="result-badge ao">AO (OCCLUSION)</div>
                    <div class="result-badge disp">DISPLACEMENT</div>
                </div>
            </div>
        </div>
`;

// Replace old interface-container
content = content.replace(/<div class="interface-container">[\s\S]*?<\/div>/, terminalHTML);

const terminalJS = `
        // TERMINAL SIMULATION
        const termLines = [
            { text: "> Initializing AH3 Offline PBR Engine...", type: "info", delay: 200 },
            { text: "> Engine Ready. Awaiting source...", type: "success", delay: 800 },
            { text: "> Loading source: diffuse_map.jpg (4096x4096px)", type: "highlight", delay: 1200 },
            { text: "> Analyzing color data and depth vectors...", type: "info", delay: 1800 },
            { text: "[Worker 1] Executing Sobel Filter for Normal Map... DONE", type: "success", delay: 2400 },
            { text: "[Worker 2] Inverting & Clamping for Roughness... DONE", type: "success", delay: 2600 },
            { text: "[Worker 3] Raytracing Ambient Occlusion... DONE", type: "success", delay: 2900 },
            { text: "[Worker 4] Displacing height threshold... DONE", type: "success", delay: 3100 },
            { text: "[Seamless] Applying Gaussian Blur blend to edges... 100%", type: "highlight", delay: 3600 },
            { text: ">> PROCESS COMPLETED IN 0.8 SECONDS.", type: "highlight", delay: 4200 }
        ];

        function runTerminalSim() {
            const output = document.getElementById('term-output');
            const result = document.getElementById('term-result');
            if(!output || output.getAttribute('data-ran') === 'true') return;
            
            output.setAttribute('data-ran', 'true');
            output.innerHTML = '';
            result.classList.add('hidden');
            
            termLines.forEach((line, index) => {
                setTimeout(() => {
                    const prevCursor = document.querySelector('.term-cursor');
                    if(prevCursor) prevCursor.remove();
                    
                    const div = document.createElement('div');
                    div.className = 'term-line ' + line.type;
                    div.innerHTML = line.text + '<span class="term-cursor"></span>';
                    output.appendChild(div);
                    output.scrollTop = output.scrollHeight;
                    
                    if(index === termLines.length - 1) {
                        setTimeout(() => {
                            const finalCursor = document.querySelector('.term-cursor');
                            if(finalCursor) finalCursor.remove();
                            
                            result.classList.remove('hidden');
                            const badges = result.querySelectorAll('.result-badge');
                            badges.forEach((b, i) => {
                                setTimeout(() => {
                                    b.classList.add('show');
                                }, i * 150);
                            });
                        }, 800);
                    }
                }, line.delay);
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            const terminal = document.getElementById('magic-terminal');
            if (terminal) {
                const termObserver = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        runTerminalSim();
                    }
                }, { threshold: 0.3 });
                termObserver.observe(terminal);
            }
        });
`;

if (!content.includes('runTerminalSim')) {
    content = content.replace('window.addEventListener(\'DOMContentLoaded\', () => {', terminalJS + '\n        window.addEventListener(\'DOMContentLoaded\', () => {');
}

fs.writeFileSync(matPath, content, 'utf8');
console.log('Injected Terminal Mockup');
