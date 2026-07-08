import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update CSS
css_updates = """
        .marquee-container {
            width: 100%; margin: 40px auto 80px;
            overflow: hidden; position: relative;
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            height: 300px;
        }
        .marquee-track {
            display: flex; gap: 20px; width: max-content;
        }
        .marquee-track.track-1 {
            animation: scroll-left 40s linear infinite;
            margin-bottom: 24px;
        }
        .marquee-track.track-2 {
            animation: scroll-right 45s linear infinite;
        }
        .marquee-item { width: 240px; flex-shrink: 0; cursor: pointer; }
        .marquee-item .marquee-title { font-size: 13px; margin-bottom: 8px; }
        .marquee-item .mini-sim-box { height: 100px; border: 1px dashed rgba(255,255,255,0.15); transition: border 0.3s; }
        .marquee-item:hover .mini-sim-box { border-color: var(--primary); }
        .marquee-item .sim-controls { display: none !important; }
        .marquee-item .sim-viewport { height: 100%; }
        
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 10px)); }
        }
        @keyframes scroll-right {
            0% { transform: translateX(calc(-50% - 10px)); }
            100% { transform: translateX(0); }
        }
"""

# Replace the old CSS rules if they exist
html = re.sub(r'\.marquee-container[\s\S]*?@keyframes scroll-left[\s\S]*?\}', css_updates, html)

# 2. Rebuild Marquee HTML
def extract_box_correctly(id_name):
    start_idx = html.find(f'<div class="mini-sim-box" id="{id_name}">')
    if start_idx == -1: return ""
    div_count = 0
    end_idx = -1
    for i in range(start_idx, len(html)):
        if html.startswith('<div', i): div_count += 1
        elif html.startswith('</div', i):
            div_count -= 1
            if div_count == 0:
                end_idx = i + 6
                break
    return html[start_idx:end_idx] if end_idx != -1 else ""

hub_sim = extract_box_correctly('hub-sim')
tree_sim = extract_box_correctly('tree-sim')
mat_sim = extract_box_correctly('material-sim')
cam_sim = extract_box_correctly('camera-sim')

def process_for_marquee(sim_html, suffix, title, link):
    if not sim_html: return ""
    sim_html = re.sub(r'id="([^"]+)"', r'id="\1' + suffix + '"', sim_html)
    sim_html = re.sub(r'url\(#([^)]+)\)', r'url(#\1' + suffix + ')', sim_html)
    return f'''
            <div class="marquee-item" onclick="window.location.href='{link}'">
                <div class="marquee-title">{title}</div>
{sim_html}
            </div>'''

mq_hub = process_for_marquee(hub_sim, '-mq1', 'AH3 Hub', 'hub.html')
mq_tree = process_for_marquee(tree_sim, '-mq1', 'Magic Tree', 'tree.html')
mq_mat = process_for_marquee(mat_sim, '-mq1', 'Magic Material', 'material.html')
mq_cam = process_for_marquee(cam_sim, '-mq1', 'Magic Camera', 'camera.html')

mq_hub2 = process_for_marquee(hub_sim, '-mq2', 'AH3 Hub', 'hub.html')
mq_tree2 = process_for_marquee(tree_sim, '-mq2', 'Magic Tree', 'tree.html')
mq_mat2 = process_for_marquee(mat_sim, '-mq2', 'Magic Material', 'material.html')
mq_cam2 = process_for_marquee(cam_sim, '-mq2', 'Magic Camera', 'camera.html')

marquee_html = f'''
    <!-- SIMULATIONS MARQUEE -->
    <div class="marquee-container" data-aos="fade-up" data-aos-delay="200">
        <div class="marquee-track track-1">
            {mq_hub}{mq_tree}{mq_mat}{mq_cam}
            {mq_hub}{mq_tree}{mq_mat}{mq_cam}
        </div>
        <div class="marquee-track track-2">
            {mq_cam2}{mq_mat2}{mq_tree2}{mq_hub2}
            {mq_cam2}{mq_mat2}{mq_tree2}{mq_hub2}
        </div>
    </div>
'''

# Replace old marquee
html = re.sub(r'<!-- SIMULATIONS MARQUEE -->[\s\S]*?<!-- PRODUCTS GRID -->', marquee_html + '\n    <!-- PRODUCTS GRID -->', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated marquee to 2 rows")
