const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const matPath = path.join(dir, 'material.html');
let content = fs.readFileSync(matPath, 'utf8');

// 1. Remove old Terminal CSS
content = content.replace(/\/\* TERMINAL MOCKUP \*\/[\s\S]*?\/\* INTERFACE CONTAINER RESPONSIVE \*\//, '/* INTERFACE CONTAINER RESPONSIVE */');

// 2. Remove old HTML
content = content.replace(/<div class="interface-container"[\s\S]*?<\/section>/, '</section>');

// 3. Remove old JS
content = content.replace(/\/\/ TERMINAL SIMULATION[\s\S]*?<\/script>/, '</script>');


const pipelineCSS = `
        /* PIPELINE ANIMATION */
        .pipeline-wrapper { width: 100%; display: flex; justify-content: center; overflow: hidden; padding: 20px 0; }
        .pipeline-demo {
            width: 900px; height: 420px; position: relative;
            background: #0a0a0a; border-radius: 12px;
            border: 1px solid rgba(77,182,172,0.2);
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5);
            transform-origin: center top; font-family: 'JetBrains Mono', monospace;
        }
        
        @media (max-width: 950px) { .pipeline-demo { transform: scale(0.85); margin-bottom: -60px; } }
        @media (max-width: 768px) { .pipeline-demo { transform: scale(0.65); margin-bottom: -140px; } }
        @media (max-width: 500px) { .pipeline-demo { transform: scale(0.42); margin-bottom: -240px; } }

        /* LINES (Paths) */
        .pl-path {
            position: absolute; border: 2px dashed rgba(77,182,172,0.3);
            border-top: none; border-left: none;
        }
        .pl-path-1 { width: 160px; height: 2px; top: 190px; left: 160px; border-bottom: 2px dashed rgba(77,182,172,0.3); }
        .pl-path-2 { width: 140px; height: 2px; top: 120px; right: 180px; border-bottom: 2px dashed rgba(77,182,172,0.3); }
        .pl-path-3 { width: 2px; height: 160px; top: 120px; right: 180px; border-right: 2px dashed rgba(77,182,172,0.3); }

        /* INPUT STAGE */
        .pl-img {
            position: absolute; left: 40px; top: 130px;
            width: 120px; height: 120px; border-radius: 8px; border: 2px solid #555;
            background: #8D6E63; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10;
        }
        .pl-img::after { content: 'diffuse.jpg'; position: absolute; bottom: -24px; left: 0; right: 0; text-align: center; color: #888; font-size: 11px; }
        .pl-img.fly-in { transform: translateX(200px) scale(0.1) rotate(180deg); opacity: 0; }
        
        .pl-btn {
            position: absolute; left: 40px; top: 290px; width: 120px;
            padding: 12px 0; background: var(--primary); color: #000;
            border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
            transition: all 0.3s; font-family: 'JetBrains Mono', monospace; font-size: 13px;
        }
        .pl-btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(77,182,172,0.3); }
        .pl-btn.active { background: #444; color: #888; cursor: not-allowed; transform: none; box-shadow: none; }

        /* TERMINAL STAGE */
        .pl-term {
            position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
            width: 320px; height: 260px; background: #111; border-radius: 8px;
            border: 1px solid rgba(77,182,172,0.2); overflow: hidden;
            box-shadow: 0 15px 30px rgba(0,0,0,0.8); z-index: 5;
        }
        .pl-term-hdr { background: #1a1a1a; padding: 8px 12px; display: flex; align-items: center; border-bottom: 1px solid #333; }
        .pl-term-dots { display: flex; gap: 6px; }
        .pl-term-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .pl-term-dots span:nth-child(1) { background: #ff5f56; }
        .pl-term-dots span:nth-child(2) { background: #ffbd2e; }
        .pl-term-dots span:nth-child(3) { background: #27c93f; }
        
        .pl-term-body {
            padding: 12px; height: 210px; overflow-y: hidden;
            color: #4af626; font-size: 11px; line-height: 1.6;
            background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
        }
        .term-line { opacity: 0; animation: fadeInLine 0s forwards; }
        .term-line.info { color: #888; }
        .term-line.high { color: #fff; text-shadow: 0 0 5px #fff; }
        .term-line.succ { color: #4af626; text-shadow: 0 0 3px #4af626; }
        .term-cursor { display: inline-block; width: 6px; height: 12px; background: #4af626; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 4px; }

        /* OUTPUT STAGE */
        .pl-maps {
            position: absolute; right: 50px; top: 100px;
            display: flex; gap: 8px; width: 260px; justify-content: center;
            opacity: 0; transition: all 0.5s; z-index: 10;
        }
        .pl-map {
            width: 44px; height: 44px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: bold; color: #fff; border: 1px solid rgba(255,255,255,0.2);
            opacity: 0; transform: scale(0); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .pl-map.norm { background: #8a8fd8; }
        .pl-map.rough { background: #666; }
        .pl-map.ao { background: #ddd; color: #000; }
        .pl-map.disp { background: #fff; color: #000; }
        
        .pl-maps.pop { opacity: 1; }
        .pl-map.pop { opacity: 1; transform: scale(1); }
        .pl-maps.merge { transform: scale(0); opacity: 0; }

        .pl-sphere {
            position: absolute; right: 140px; top: 80px;
            width: 84px; height: 84px; border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #a07a62, #693c27 60%, #2c1a11);
            box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8);
            opacity: 0; transform: scale(0); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); z-index: 20;
        }
        .pl-sphere::after { content: 'PBR Material'; position: absolute; bottom: -24px; left: -10px; right: -10px; text-align: center; color: var(--primary); font-size: 10px; opacity: 0; transition: opacity 0.3s; }
        .pl-sphere.pop { opacity: 1; transform: scale(1); }
        .pl-sphere.pop::after { opacity: 1; }
        .pl-sphere.fly-box { transform: translate(0, 160px) scale(0.4); opacity: 0; }
        .pl-sphere.fly-box::after { opacity: 0; }

        /* ISOMETRIC BOX */
        .pl-scene {
            position: absolute; right: 130px; bottom: 50px;
            width: 100px; height: 100px; perspective: 800px; z-index: 5;
        }
        .pl-box {
            width: 100px; height: 100px; position: relative;
            transform-style: preserve-3d; transform: rotateX(-20deg) rotateY(45deg);
        }
        .pl-face { position: absolute; width: 100px; height: 100px; border: 1px solid rgba(255,255,255,0.1); background: #eee; transition: all 0.3s; }
        .pl-face.front { transform: translateZ(50px); }
        .pl-face.right { transform: rotateY(90deg) translateZ(50px); background: #e0e0e0; }
        .pl-face.top { transform: rotateX(90deg) translateZ(50px); background: #fff; }

        .pl-box.textured { animation: boxHit 0.6s ease-out; }
        .pl-box.textured .pl-face {
            background-color: #8D6E63;
            background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px);
            border-color: #5D4037;
        }
        .pl-box.textured .pl-face.top { background-color: #A1887F; }
        .pl-box.textured .pl-face.right { background-color: #6D4C41; }
        
        .pl-ready {
            position: absolute; right: 60px; bottom: 20px; width: 240px; text-align: center;
            font-size: 14px; font-weight: bold; color: var(--primary); opacity: 0; transition: opacity 0.5s;
            text-shadow: 0 0 10px rgba(77,182,172,0.5);
        }

        @keyframes boxHit {
            0% { filter: brightness(3) drop-shadow(0 0 30px var(--primary)); transform: rotateX(-20deg) rotateY(45deg) scale(1.1); }
            100% { filter: brightness(1) drop-shadow(0 0 0 transparent); transform: rotateX(-20deg) rotateY(45deg) scale(1); }
        }
`;

if (!content.includes('PIPELINE ANIMATION')) {
    content = content.replace('/* INTERFACE CONTAINER RESPONSIVE */', pipelineCSS + '\n        /* INTERFACE CONTAINER RESPONSIVE */');
}

const pipelineHTML = `
    <!-- INTERFACE SHOWCASE (PIPELINE DEMO) -->
    <section id="interface" style="background: var(--bg-surface);">
        <div class="section-label" data-vi="GIAO DIỆN CÔNG CỤ" data-en="INTERFACE SHOWCASE">QUY TRÌNH & GIAO DIỆN</div>
        <h2 class="section-title" data-vi="Quy trình xử lý hoàn toàn tự động" data-en="Fully Automated Pipeline"></h2>
        <p class="section-desc" data-vi="Sơ đồ minh họa trực quan quá trình Magic Material biến một bức ảnh thông thường thành vật liệu PBR 3D chuyên nghiệp." data-en="Visual demonstration of how Magic Material turns a plain image into a pro PBR material."></p>
        
        <div class="pipeline-wrapper">
            <div class="pipeline-demo" id="magic-pipeline">
                <div class="pl-path pl-path-1"></div>
                <div class="pl-path pl-path-2"></div>
                <div class="pl-path pl-path-3"></div>

                <!-- 1. INPUT -->
                <div class="pl-img" id="pl-img"></div>
                <button class="pl-btn" id="pl-btn" onclick="startPipeline()">PROCESS</button>

                <!-- 2. ENGINE -->
                <div class="pl-term">
                    <div class="pl-term-hdr">
                        <div class="pl-term-dots"><span></span><span></span><span></span></div>
                    </div>
                    <div class="pl-term-body" id="pl-term-out">
                        <div class="term-line info">Waiting for input...<span class="term-cursor"></span></div>
                    </div>
                </div>

                <!-- 3. OUTPUT MAPS -->
                <div class="pl-maps" id="pl-maps">
                    <div class="pl-map norm">NRM</div>
                    <div class="pl-map rough">RGH</div>
                    <div class="pl-map ao">AO</div>
                    <div class="pl-map disp">DSP</div>
                </div>

                <!-- 4. MATERIAL SPHERE -->
                <div class="pl-sphere" id="pl-sphere"></div>

                <!-- 5. SCENE BOX -->
                <div class="pl-scene">
                    <div class="pl-box" id="pl-box">
                        <div class="pl-face front"></div>
                        <div class="pl-face top"></div>
                        <div class="pl-face right"></div>
                    </div>
                </div>
                
                <div class="pl-ready" id="pl-ready">✓ MATERIAL ASSIGNED</div>
            </div>
        </div>
    </section>
`;

content = content.replace(/<section id="interface"[\s\S]*?<\/section>/, pipelineHTML);


const pipelineJS = `
        // PIPELINE ANIMATION LOGIC
        const plTermLines = [
            { text: "> Initializing Pipeline...", type: "info" },
            { text: "> Loading source: diffuse.jpg", type: "high" },
            { text: "[Worker] Normal Map Gen... OK", type: "succ" },
            { text: "[Worker] Roughness Gen... OK", type: "succ" },
            { text: "[Worker] AO Gen... OK", type: "succ" },
            { text: "[Worker] Displacement Gen... OK", type: "succ" },
            { text: "[Filter] Seamless Blend... 100%", type: "high" },
            { text: ">> ENGINE COMPLETE.", type: "high" }
        ];

        function runPlTerm(output, callback) {
            output.innerHTML = '';
            let delay = 0;
            plTermLines.forEach((line, index) => {
                delay += 200;
                setTimeout(() => {
                    const prevCur = output.querySelector('.term-cursor');
                    if(prevCur) prevCur.remove();
                    
                    const div = document.createElement('div');
                    div.className = 'term-line ' + line.type;
                    div.innerHTML = line.text + '<span class="term-cursor"></span>';
                    output.appendChild(div);
                    output.scrollTop = output.scrollHeight;
                    
                    if(index === plTermLines.length - 1) {
                        setTimeout(() => {
                            const finalCur = output.querySelector('.term-cursor');
                            if(finalCur) finalCur.remove();
                            if(callback) callback();
                        }, 300);
                    }
                }, delay);
            });
        }

        function startPipeline() {
            const btn = document.getElementById('pl-btn');
            if(btn.classList.contains('active')) return;
            
            btn.innerText = 'PROCESSING...';
            btn.classList.add('active');

            const img = document.getElementById('pl-img');
            const termOut = document.getElementById('pl-term-out');
            const maps = document.getElementById('pl-maps');
            const mapItems = document.querySelectorAll('.pl-map');
            const sphere = document.getElementById('pl-sphere');
            const box = document.getElementById('pl-box');
            const ready = document.getElementById('pl-ready');

            // Reset
            maps.classList.remove('merge');
            mapItems.forEach(m => m.classList.remove('pop'));
            sphere.classList.remove('pop', 'fly-box');
            box.classList.remove('textured');
            ready.style.opacity = '0';
            img.classList.remove('fly-in');
            
            // Step 1: Image Fly in
            setTimeout(() => { img.classList.add('fly-in'); }, 100);

            // Step 2: Terminal Run
            setTimeout(() => {
                runPlTerm(termOut, () => {
                    // Step 3: Maps pop out
                    maps.classList.add('pop');
                    mapItems.forEach((m, i) => {
                        setTimeout(() => m.classList.add('pop'), i * 150);
                    });

                    // Step 4: Maps merge into Sphere
                    setTimeout(() => {
                        maps.classList.add('merge');
                        setTimeout(() => sphere.classList.add('pop'), 300);
                    }, 1400);

                    // Step 5: Sphere flies to box
                    setTimeout(() => {
                        sphere.classList.add('fly-box');
                    }, 2400);

                    // Step 6: Box gets textured
                    setTimeout(() => {
                        box.classList.add('textured');
                        btn.innerText = 'RESTART';
                        btn.classList.remove('active');
                        setTimeout(() => ready.style.opacity = '1', 300);
                    }, 3000);
                });
            }, 800);
        }
        
        // Auto-run once when scrolled into view
        window.addEventListener('DOMContentLoaded', () => {
            const pipeline = document.getElementById('magic-pipeline');
            if (pipeline) {
                let hasRan = false;
                const obs = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !hasRan) {
                        hasRan = true;
                        setTimeout(startPipeline, 500);
                    }
                }, { threshold: 0.3 });
                obs.observe(pipeline);
            }
        });
`;

content = content.replace('</body>', pipelineJS + '\n    </script>\n</body>');

// We need to add the <script> tags for pipelineJS if we're replacing before </body>. Wait, I should just inject it safely.
// Let's replace </script>\n</body> with the pipelineJS inside the script tag.
content = content.replace(/<\/script>\s*<\/body>/, pipelineJS + '\n    </script>\n</body>');

fs.writeFileSync(matPath, content, 'utf8');
console.log('Injected Pipeline Animation');
