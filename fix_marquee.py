import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the broken marquee
marquee_match = re.search(r'(<!-- SIMULATIONS MARQUEE -->[\s\S]*?)<!-- PRODUCTS GRID -->', html)
if marquee_match:
    html = html.replace(marquee_match.group(1), '')

# Extract the 4 boxes correctly!
def extract_box_correctly(id_name):
    # Find the start
    start_idx = html.find(f'<div class="mini-sim-box" id="{id_name}">')
    if start_idx == -1: return ""
    
    div_count = 0
    end_idx = -1
    for i in range(start_idx, len(html)):
        if html.startswith('<div', i):
            div_count += 1
        elif html.startswith('</div', i):
            div_count -= 1
            if div_count == 0:
                end_idx = i + 6
                break
    if end_idx != -1:
        return html[start_idx:end_idx]
    return ""

hub_sim = extract_box_correctly('hub-sim')
tree_sim = extract_box_correctly('tree-sim')
mat_sim = extract_box_correctly('material-sim')
cam_sim = extract_box_correctly('camera-sim')

def process_for_marquee(sim_html, suffix, title):
    if not sim_html: return ""
    sim_html = re.sub(r'id="([^"]+)"', r'id="\1' + suffix + '"', sim_html)
    sim_html = re.sub(r'url\(#([^)]+)\)', r'url(#\1' + suffix + ')', sim_html)
    return f'''
            <div class="marquee-item">
                <div class="marquee-title">{title}</div>
{sim_html}
            </div>'''

mq_hub = process_for_marquee(hub_sim, '-mq', 'AH3 Hub')
mq_tree = process_for_marquee(tree_sim, '-mq', 'Magic Tree')
mq_mat = process_for_marquee(mat_sim, '-mq', 'Magic Material')
mq_cam = process_for_marquee(cam_sim, '-mq', 'Magic Camera')

marquee_html = f'''
    <!-- SIMULATIONS MARQUEE -->
    <div class="marquee-container" data-aos="fade-up" data-aos-delay="200">
        <div class="marquee-track">
            {mq_hub}{mq_tree}{mq_mat}{mq_cam}
            {mq_hub}{mq_tree}{mq_mat}{mq_cam}
        </div>
    </div>
'''

html = html.replace('<!-- PRODUCTS GRID -->', marquee_html + '\n    <!-- PRODUCTS GRID -->')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed missing closing tags in marquee")
