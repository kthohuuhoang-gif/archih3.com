import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

sim_js = """
        // --- MINI SIMULATIONS LOGIC ---
        function runHubSim(btn) {
            if (btn.classList.contains('active')) return;
            btn.classList.add('active');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'RENDERING...';
            const box = btn.closest('.mini-sim-box');
            const scanLine = box.querySelector('.scan-line');
            const clipRect = box.querySelector('clipPath rect');
            
            if (scanLine) {
                scanLine.style.display = 'block';
                scanLine.style.transition = 'transform 2s linear';
                setTimeout(() => scanLine.style.transform = 'translateX(200px)', 50);
            }
            if (clipRect) {
                clipRect.style.transition = 'width 2s linear';
                setTimeout(() => clipRect.setAttribute('width', '200'), 50);
            }
            
            setTimeout(() => {
                btn.innerHTML = 'RENDER COMPLETE';
                btn.style.background = 'var(--primary)';
                btn.style.color = '#111';
                setTimeout(() => {
                    btn.classList.remove('active');
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    if (scanLine) {
                        scanLine.style.transition = 'none';
                        scanLine.style.transform = 'translateX(0)';
                        scanLine.style.display = 'none';
                    }
                    if (clipRect) {
                        clipRect.style.transition = 'none';
                        clipRect.setAttribute('width', '0');
                    }
                }, 3000);
            }, 2050);
        }

        function adjustTreeWind(btn) {
            const box = btn.closest('.mini-sim-box');
            const leaves = box.querySelector('.tree-leaves');
            const isStorm = btn.classList.contains('active');
            
            if (!isStorm) {
                btn.classList.add('active');
                btn.innerHTML = 'WIND: STORM (80km/h)';
                btn.style.background = '#e57373';
                btn.style.color = '#111';
                btn.style.borderColor = '#e57373';
                if (leaves) {
                    leaves.style.animationDuration = '0.5s';
                    leaves.style.transformOrigin = 'bottom center';
                }
            } else {
                btn.classList.remove('active');
                btn.innerHTML = 'WIND: BREEZE (15km/h)';
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
                if (leaves) {
                    leaves.style.animationDuration = '3s';
                }
            }
        }

        function runMaterialSim(btn) {
            if (btn.classList.contains('active')) return;
            btn.classList.add('active');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'GENERATING PBR...';
            const box = btn.closest('.mini-sim-box');
            const pbr1 = box.querySelector('.pbr-layer-1');
            const pbr2 = box.querySelector('.pbr-layer-2');
            
            setTimeout(() => {
                if (pbr1) pbr1.style.opacity = '1';
                btn.innerHTML = 'NORMAL MAP...';
            }, 800);
            
            setTimeout(() => {
                if (pbr2) pbr2.style.opacity = '1';
                btn.innerHTML = 'DISPLACEMENT...';
            }, 1600);
            
            setTimeout(() => {
                btn.innerHTML = 'PBR COMPLETE';
                btn.style.background = 'var(--primary)';
                btn.style.color = '#111';
                setTimeout(() => {
                    btn.classList.remove('active');
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    if (pbr1) pbr1.style.opacity = '0';
                    if (pbr2) pbr2.style.opacity = '0';
                }, 3000);
            }, 2400);
        }

        function runCameraSim(btn) {
            if (btn.classList.contains('active')) return;
            btn.classList.add('active');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'ALIGNING...';
            const box = btn.closest('.mini-sim-box');
            const cam = box.querySelector('.mini-camera');
            const frustum = box.querySelector('.camera-frustum');
            const clipPlane = box.querySelector('.clip-plane');
            const interior = box.querySelector('.house-interior');
            
            if (cam) cam.style.transform = 'translateY(-15px) rotate(5deg)';
            
            setTimeout(() => {
                btn.innerHTML = 'CLIPPING...';
                if (frustum) frustum.style.opacity = '1';
                if (clipPlane) clipPlane.style.opacity = '1';
            }, 1000);
            
            setTimeout(() => {
                if (interior) interior.style.opacity = '1';
                btn.innerHTML = 'ALIGNED & CLIPPED';
                btn.style.background = 'var(--primary)';
                btn.style.color = '#111';
                setTimeout(() => {
                    btn.classList.remove('active');
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    if (cam) cam.style.transform = '';
                    if (frustum) frustum.style.opacity = '0';
                    if (clipPlane) clipPlane.style.opacity = '0';
                    if (interior) interior.style.opacity = '0';
                }, 3000);
            }, 2000);
        }
        // --- END MINI SIMULATIONS LOGIC ---
"""

if 'function runHubSim' not in html:
    html = html.replace('</script>\n</body>', sim_js + '\n</script>\n</body>')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Injected JS simulation functions!")
else:
    print("JS simulation functions already exist!")
