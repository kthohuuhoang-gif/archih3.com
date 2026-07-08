import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Hero CSS to fit viewport
html = re.sub(r'(\.hero\s*\{[^}]*?)min-height:\s*80vh;', r'\1min-height: calc(100vh - 240px);', html)
html = re.sub(r'(\.hero\s*\{[^}]*?padding:)\s*160px 24px 100px;', r'\1 140px 24px 40px;', html)

# 2. Update Marquee CSS for interaction
interaction_css = """
        .marquee-container {
            width: 100%; margin: 0 auto 40px;
            overflow: hidden; position: relative;
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            height: 240px;
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
        
        .marquee-track.paused {
            animation-play-state: paused !important;
        }
        
        .marquee-item { 
            width: 240px; flex-shrink: 0; cursor: pointer; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            transform-origin: center center;
        }
        
        /* State when expanded */
        .marquee-item.expanded {
            transform: scale(1.3);
            z-index: 100;
        }
        .marquee-item.expanded .mini-sim-box {
            background: rgba(15, 15, 20, 0.95);
            box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px var(--primary);
            border: none;
            height: auto; min-height: 110px;
        }
        .marquee-item.expanded .sim-controls { 
            display: flex !important; 
            padding: 8px 12px;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: 5px;
        }
        .marquee-item.expanded .detail-link-btn {
            display: block !important;
        }

        .marquee-item .marquee-title { font-size: 13px; margin-bottom: 8px; font-weight: 600; color: #fff; }
        .marquee-item .mini-sim-box { height: 90px; border: 1px dashed rgba(255,255,255,0.15); transition: border 0.3s; }
        .marquee-item:hover .mini-sim-box { border-color: var(--primary); }
        .marquee-item .sim-controls { display: none !important; }
        .marquee-item .sim-viewport { height: 100%; display: flex; align-items: center; justify-content: center; }
        .marquee-item .sim-svg { max-height: 80px; width: 100%; }
        
        /* Detail Link Button inside Marquee */
        .detail-link-btn {
            display: none !important;
            position: absolute; top: -5px; right: 5px;
            background: var(--primary); color: #111;
            font-size: 9px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
            text-decoration: none; z-index: 101;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            pointer-events: auto;
        }
        .detail-link-btn:hover { background: #fff; }
"""

# Replace old marquee CSS block
html = re.sub(r'\.marquee-container[\s\S]*?\.marquee-item \.sim-viewport \{ height: 100%; \}', interaction_css, html)

# 3. Update HTML inline onclick -> interactive script
# Remove onclick="window.location.href='...'" and add data-href and detail link
def replace_item(match):
    full_match = match.group(0)
    href = match.group(1)
    
    # Remove onclick from the original string
    new_html = re.sub(r'onclick="window\.location\.href=\'[^\']+\'"', f'data-href="{href}" class="marquee-item"', full_match)
    
    # Inject the detail button right after marquee-title
    detail_btn = f'<a href="{href}" class="detail-link-btn" onclick="event.stopPropagation()">Xem chi tiết</a>'
    new_html = new_html.replace('</div>\n<div class="mini-sim-box"', f'{detail_btn}\n</div>\n<div class="mini-sim-box"')
    return new_html

html = re.sub(r'<div class="marquee-item" onclick="window\.location\.href=\'([^\']+)\'">[\s\S]*?<div class="marquee-title"[^>]*>.*?</div>\n<div class="mini-sim-box"', replace_item, html)

# 4. Inject Interaction Javascript
interaction_js = """
        // MARQUEE INTERACTION LOGIC
        const marqueeItems = document.querySelectorAll('.marquee-item');
        marqueeItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // If clicking inside sim-controls or detail link, do not collapse/expand just handle it
                if (e.target.closest('.sim-controls') || e.target.closest('.detail-link-btn')) {
                    return;
                }
                
                e.stopPropagation();
                
                // If already expanded, do nothing (wait for click outside to close)
                if (this.classList.contains('expanded')) return;
                
                // Close all other expanded items and unpause tracks
                document.querySelectorAll('.marquee-item.expanded').forEach(el => el.classList.remove('expanded'));
                document.querySelectorAll('.marquee-track.paused').forEach(el => el.classList.remove('paused'));
                
                // Expand this item and pause its track
                this.classList.add('expanded');
                const track = this.closest('.marquee-track');
                if (track) track.classList.add('paused');
            });
        });
        
        // Click outside to shrink
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.marquee-item')) {
                document.querySelectorAll('.marquee-item.expanded').forEach(el => el.classList.remove('expanded'));
                document.querySelectorAll('.marquee-track.paused').forEach(el => el.classList.remove('paused'));
            }
        });
"""

# Insert JS before the end of the script block that sets up parallax
if '// MARQUEE INTERACTION LOGIC' not in html:
    html = html.replace('// Reset when mouse leaves', interaction_js + '\n            // Reset when mouse leaves')


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated marquee interaction successfully")
