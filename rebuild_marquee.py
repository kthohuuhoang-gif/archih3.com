import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fresh and clean templates
item_template = """
              <div data-href="{link}" class="marquee-item">
                  <div class="marquee-title">{title}<a href="{link}" class="detail-link-btn" onclick="event.stopPropagation()">Xem chi tiết</a></div>
                  <div class="mini-sim-box" id="{id_prefix}-sim-mq{track_num}">
                      <div class="sim-viewport"{extra_style}>
                          {svg_content}
                      </div>
                      <div class="sim-controls"{ctrl_style}>
                          {controls}
                      </div>
                  </div>
              </div>"""

hub_svg = """<svg class="sim-svg" viewBox="0 0 200 120">
                              <g class="wf-lines">
                                  <line x1="20" y1="100" x2="60" y2="60" stroke="#4db6ac" stroke-width="1" />
                                  <line x1="60" y1="60" x2="140" y2="60" stroke="#4db6ac" stroke-width="1" />
                                  <line x1="140" y1="60" x2="180" y2="100" stroke="#4db6ac" stroke-width="1" />
                                  <line x1="20" y1="100" x2="180" y2="100" stroke="#4db6ac" stroke-width="1" />
                                  <rect x="80" y="75" width="40" height="20" fill="none" stroke="#4db6ac" stroke-width="1" />
                              </g>
                              <g class="rendered-view" clip-path="url(#{id_prefix}-clip-mq{track_num})">
                                  <rect x="0" y="0" width="200" height="120" fill="#0B061B" />
                                  <polygon points="20,100 60,60 140,60 180,100" fill="#263238" />
                                  <polygon points="60,60 140,60 120,20 80,20" fill="#FFD54F" opacity="0.15" />
                                  <rect x="80" y="75" width="40" height="20" fill="#4E342E" />
                              </g>
                              <line class="scan-line" x1="0" y1="0" x2="0" y2="120" stroke="var(--primary)" stroke-width="1.5" style="display:none;" />
                              <clipPath id="{id_prefix}-clip-mq{track_num}"><rect id="{id_prefix}-clip-rect-mq{track_num}" x="0" y="0" width="0" height="120" /></clipPath>
                          </svg>"""

tree_svg = """<svg class="sim-svg" viewBox="0 0 200 120">
                              <g class="mini-tree-wrapper" style="transform-origin: 100px 110px; --wind-factor: 1;">
                                  <path d="M100,110 Q105,70 100,30" stroke="#8D6E63" stroke-width="8" fill="none" stroke-linecap="round" />
                                  <circle cx="100" cy="30" r="22" fill="#66bb6a" opacity="0.85" />
                                  <circle cx="85" cy="40" r="16" fill="#4caf50" opacity="0.85" />
                                  <circle cx="115" cy="40" r="16" fill="#2e7d32" opacity="0.85" />
                              </g>
                          </svg>"""

mat_svg = """<div class="mini-file">diffuse</div>
                          <div class="mini-maps-grid" style="display:none; grid-template-columns: repeat(2, 1fr); gap:4px;">
                              <div class="mini-map-tile nrm">NRM</div>
                              <div class="mini-map-tile rgh">RGH</div>
                          </div>
                          <div class="mini-scene" style="perspective:400px;">
                              <div class="mini-box" id="min-box-element-mq{track_num}">
                                  <div class="mini-face f-front"></div>
                                  <div class="mini-face f-top"></div>
                                  <div class="mini-face f-right"></div>
                              </div>
                          </div>"""

cam_svg = """<svg class="sim-svg" viewBox="0 0 200 120">
                              <polygon points="120,95 120,65 150,45 180,65 180,95" fill="none" stroke="#666" stroke-width="1.5" />
                              <g class="house-interior" style="opacity: 0; transition: opacity 0.5s;">
                                  <line x1="120" y1="75" x2="180" y2="75" stroke="var(--primary)" stroke-width="1" />
                                  <rect x="135" y="75" width="10" height="20" fill="none" stroke="var(--primary)" stroke-width="1" />
                              </g>
                              <polygon class="camera-frustum" points="50,60 110,35 110,85" fill="rgba(77,182,172,0.08)" stroke="var(--primary)" stroke-width="1" stroke-dasharray="2 2" style="opacity:0; transition:opacity 0.3s;" />
                              <g class="mini-camera" stroke="var(--primary)" stroke-width="1.5" fill="none" style="transition: all 0.5s;">
                                  <rect x="15" y="53" width="24" height="14" rx="2" />
                                  <polygon points="39,56 45,53 45,67 39,64" />
                                  <circle cx="27" cy="60" r="3" />
                              </g>
                              <line class="clip-plane" x1="150" y1="20" x2="150" y2="100" stroke="#e57373" stroke-dasharray="3 3" stroke-width="1.5" style="opacity:0; transition:opacity 0.3s;" />
                          </svg>"""

hub_btn = '<button class="sim-action-btn" onclick="runHubSim(this)" data-vi="GENERATE AI RENDER" data-en="GENERATE AI RENDER">GENERATE AI RENDER</button>'
mat_btn = '<button class="sim-action-btn" onclick="runMaterialSim(this)" style="color:var(--primary);" data-vi="GENERATE PBR MAPS" data-en="GENERATE PBR MAPS">GENERATE PBR MAPS</button>'
cam_btn = '<button class="sim-action-btn" onclick="runCameraSim(this)" data-vi="ALIGN CAMERA &amp; CLIP" data-en="ALIGN CAMERA &amp; CLIP">ALIGN CAMERA &amp; CLIP</button>'
tree_btn = """<span style="font-size:9px; color:#888; font-family: monospace;">WIND:</span>
                          <input type="range" class="sim-slider" min="0" max="3" value="1" oninput="adjustTreeWind(this)" style="flex:1; accent-color:var(--green); cursor:pointer;" />
                          <span class="wind-label" style="font-size:9px; color:var(--green); width:40px; text-align:right; font-family: monospace; font-weight:bold;">Breeze</span>"""

def gen_hub(tn): return item_template.format(link="hub.html", title="AH3 Hub", id_prefix="hub", track_num=tn, extra_style="", ctrl_style="", svg_content=hub_svg.format(id_prefix="hub", track_num=tn), controls=hub_btn)
def gen_tree(tn): return item_template.format(link="tree.html", title="Magic Tree", id_prefix="tree", track_num=tn, extra_style="", ctrl_style=' style="display:flex; align-items:center; gap:8px; padding: 0 12px; justify-content: space-between;"', svg_content=tree_svg, controls=tree_btn)
def gen_mat(tn): return item_template.format(link="material.html", title="Magic Material", id_prefix="material", track_num=tn, extra_style=' style="display:flex; justify-content:center; align-items:center; gap:20px;"', ctrl_style="", svg_content=mat_svg.format(track_num=tn), controls=mat_btn)
def gen_cam(tn): return item_template.format(link="camera.html", title="Magic Camera", id_prefix="camera", track_num=tn, extra_style="", ctrl_style="", svg_content=cam_svg, controls=cam_btn)

# Track 1 has Hub, Tree, Mat, Cam (repeated 4 times to get 16 items)
t1_set = gen_hub(1) + gen_tree(1) + gen_mat(1) + gen_cam(1)
t1_html = t1_set * 4

# Track 2 has Cam, Mat, Tree, Hub (repeated 4 times to get 16 items)
t2_set = gen_cam(2) + gen_mat(2) + gen_tree(2) + gen_hub(2)
t2_html = t2_set * 4

marquee_html = f"""
    <!-- SIMULATIONS MARQUEE -->
    <div class="marquee-container" data-aos="fade-up" data-aos-delay="200">
        <div class="marquee-track track-1">
{t1_html}
        </div>
        <div class="marquee-track track-2">
{t2_html}
        </div>
    </div>
"""

# Replace the broken marquee section
# From <!-- SIMULATIONS MARQUEE --> to <!-- PRODUCTS GRID -->
if '<!-- SIMULATIONS MARQUEE -->' in html:
    new_html = re.sub(r'<!-- SIMULATIONS MARQUEE -->[\s\S]*?<!-- PRODUCTS GRID -->', marquee_html + '    <!-- PRODUCTS GRID -->', html)
else:
    new_html = html.replace('<!-- PRODUCTS GRID -->', marquee_html + '    <!-- PRODUCTS GRID -->')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_html)
print("Rebuilt marquee successfully!")
