import os
import re

# 1. Update global.css for .faq-item
global_css_path = os.path.join('assets', 'css', 'global.css')
if os.path.exists(global_css_path):
    with open(global_css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    if 'position: relative;' not in css and '.faq-item' in css:
        css = re.sub(r'(\.faq-item\s*\{)', r'\1 position: relative;', css)
        with open(global_css_path, 'w', encoding='utf-8') as f:
            f.write(css)

# 2. Fix hub.html highlight cards missing bp-dot
hub_path = 'hub.html'
if os.path.exists(hub_path):
    with open(hub_path, 'r', encoding='utf-8') as f:
        html = f.read()
    # Add bp-dot to feature-card highlight if not present
    match_highlight = r'(<div class="feature-card highlight"[^>]*>)'
    if '<span class="bp-dot tl">' not in html:
        bp_dots = '<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>'
        html = re.sub(match_highlight, r'\1' + bp_dots, html)
        with open(hub_path, 'w', encoding='utf-8') as f:
            f.write(html)

# 3. Fix camera.html pricing cards
cam_path = 'camera.html'
if os.path.exists(cam_path):
    with open(cam_path, 'r', encoding='utf-8') as f:
        html = f.read()
    html = html.replace('pricing-card', 'price-card')
    # Add bp-dot to price-card if missing
    # Actually wait, camera.html might already have bp-dot if the sync script worked on price-card, but if it was pricing-card, it missed it.
    match_price = r'(<div class="price-card[^"]*"[^>]*>)'
    # Since we can't reliably just append without checking if it already has it, let's do a safe replace
    def inject_dots(match):
        full_tag = match.group(0)
        # Assuming the next line is not bp-dots
        return full_tag + '<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>'
    
    # We will use simple replace for camera.html
    if '<span class="bp-dot tl">' not in html.split('id="pricing"')[1] if 'id="pricing"' in html else True:
        html = re.sub(match_price, inject_dots, html)
        # If we accidentally double injected, fix it
        html = html.replace('<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span><span class="bp-dot tl"></span>', '<span class="bp-dot tl"></span>')
        with open(cam_path, 'w', encoding='utf-8') as f:
            f.write(html)

print("Blueprint UI fixes applied!")
