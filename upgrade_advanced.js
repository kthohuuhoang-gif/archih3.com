const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const hubPath = path.join(dir, 'hub.html');
let content = fs.readFileSync(hubPath, 'utf8');

// 1. Add Typewriter logic and modify Terminal HTML
// Find terminal-body and inject ID/classes
let terminalHTML = `
                    <div class="terminal-body" id="ai-terminal">
                        <div><span class="prompt">You ></span> <span class="cmd" id="tw-cmd1" data-vi='Đổi tên tất cả Box thành "Wall_"' data-en='Rename all Boxes to "Wall_"'></span><span id="tw-cursor1" class="cursor">_</span></div>
                        <br>
                        <div class="tw-hidden"><span class="prompt">AH3 ></span> <span class="output" data-vi="Đang xử lý..." data-en="Processing..."></span></div>
                        <div class="tw-hidden"><span class="output" data-vi="  Tìm thấy 12 Box objects" data-en="  Found 12 Box objects"></span></div>
                        <div class="tw-hidden"><span class="output" data-vi="  Đang rename..." data-en="  Renaming..."></span></div>
                        <div class="tw-hidden"><span class="success" data-vi="  ✔ Đã đổi tên 12 objects thành công" data-en="  ✔ Successfully renamed 12 objects"></span></div>
                        <br>
                        <div class="tw-hidden" id="tw-step2"><span class="prompt">You ></span> <span class="cmd" id="tw-cmd2" data-vi="Tạo vật liệu gỗ cho tất cả" data-en="Create wood material for all"></span><span id="tw-cursor2" class="cursor" style="display:none;">_</span></div>
                    </div>`;

// Replace the old terminal body (using a regex that matches the div contents roughly)
content = content.replace(/<div class="terminal-body">[\s\S]*?<\/div>\s*<\/div>\s*<div class="spotlight-text">/, terminalHTML + '\n                </div>\n                <div class="spotlight-text">');

// 2. Add Before/After Slider logic
let sliderHTML = `
                    <div class="before-after-container" id="ba-slider" style="position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:12px; cursor: ew-resize;">
                        <img src="demo t-i2i B2.jpg" alt="After" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; pointer-events:none;">
                        <div class="before-image" id="ba-before" style="position:absolute; top:0; left:0; width:50%; height:100%; overflow:hidden; pointer-events:none;">
                            <img src="demo t-i2i B1.jpg" alt="Before" id="ba-before-img" style="width:200%; height:100%; object-fit:cover; max-width:none; pointer-events:none;">
                        </div>
                        <div class="slider-handle" id="ba-handle" style="position:absolute; top:0; bottom:0; left:50%; width:4px; background:var(--primary); transform:translateX(-50%); pointer-events:none;">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:32px; height:32px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                                <span style="color:#111; font-weight:bold; font-size:14px; font-family:sans-serif;">↔</span>
                            </div>
                        </div>
                    </div>`;

content = content.replace(/<div class="slideshow" id="t2iSlideshow">[\s\S]*?<\/div>\s*<\/div>\s*<div class="spotlight-text">/, sliderHTML + '\n                </div>\n                <div class="spotlight-text">');

// 3. Inject Javascript for Typewriter and Slider
let extraJS = `
    <!-- PRO EFFECTS JS -->
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            // Typewriter Effect
            const terminal = document.getElementById('ai-terminal');
            if(terminal) {
                const cmd1 = document.getElementById('tw-cmd1');
                const cmd2 = document.getElementById('tw-cmd2');
                const text1 = cmd1.getAttribute('data-vi');
                const text2 = cmd2.getAttribute('data-vi');
                const cursor1 = document.getElementById('tw-cursor1');
                const cursor2 = document.getElementById('tw-cursor2');
                
                cmd1.textContent = '';
                cmd2.textContent = '';
                
                let hasTyped = false;
                
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !hasTyped) {
                        hasTyped = true;
                        typeWriter(cmd1, text1, 0, () => {
                            cursor1.style.display = 'none';
                            const hiddens = terminal.querySelectorAll('.tw-hidden');
                            setTimeout(() => hiddens[0].classList.remove('tw-hidden'), 500);
                            setTimeout(() => hiddens[1].classList.remove('tw-hidden'), 1000);
                            setTimeout(() => hiddens[2].classList.remove('tw-hidden'), 1500);
                            setTimeout(() => hiddens[3].classList.remove('tw-hidden'), 2500);
                            setTimeout(() => {
                                hiddens[4].classList.remove('tw-hidden');
                                cursor2.style.display = 'inline';
                                setTimeout(() => {
                                    typeWriter(cmd2, text2, 0, () => {});
                                }, 500);
                            }, 3500);
                        });
                    }
                }, { threshold: 0.5 });
                
                observer.observe(terminal);
                
                function typeWriter(element, text, i, cb) {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        setTimeout(() => typeWriter(element, text, i + 1, cb), 40 + Math.random() * 60);
                    } else {
                        cb();
                    }
                }
            }

            // Before/After Slider
            const slider = document.getElementById('ba-slider');
            if (slider) {
                const beforeDiv = document.getElementById('ba-before');
                const beforeImg = document.getElementById('ba-before-img');
                const handle = document.getElementById('ba-handle');
                
                let isDragging = false;
                
                function updateSlider(e) {
                    const rect = slider.getBoundingClientRect();
                    let x = (e.clientX || e.touches[0].clientX) - rect.left;
                    if (x < 0) x = 0;
                    if (x > rect.width) x = rect.width;
                    
                    let percent = (x / rect.width) * 100;
                    beforeDiv.style.width = percent + '%';
                    handle.style.left = percent + '%';
                }
                
                slider.addEventListener('mousedown', () => isDragging = true);
                slider.addEventListener('touchstart', () => isDragging = true);
                window.addEventListener('mouseup', () => isDragging = false);
                window.addEventListener('touchend', () => isDragging = false);
                
                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    updateSlider(e);
                });
                window.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    updateSlider(e);
                }, {passive: true});
                
                // Add CSS to fix old slides css conflict
                const style = document.createElement('style');
                style.innerHTML = '.tw-hidden { display: none !important; }';
                document.head.appendChild(style);
                
                // Adjust before image width on window resize
                function resizeBeforeImg() {
                    beforeImg.style.width = slider.offsetWidth + 'px';
                }
                window.addEventListener('resize', resizeBeforeImg);
                resizeBeforeImg();
            }
        });
    </script>
`;

content = content.replace('<!-- AOS JS -->', extraJS + '\n    <!-- AOS JS -->');

fs.writeFileSync(hubPath, content, 'utf8');
console.log('Updated hub.html with advanced UI/UX effects');
