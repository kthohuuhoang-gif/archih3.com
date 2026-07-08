import re
import glob

# 1. Fix CSP tags globally
html_files = glob.glob('*.html') + glob.glob('kindle/*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Remove any CSP tags
    html = re.sub(r'<meta[^>]*?Content-Security-Policy[^>]*?>', '', html, flags=re.IGNORECASE)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(html)

print("CSP tags cleaned!")

# 2. Fix CSS Bloat in Tool Pages
files_to_clean = ['merger.html', 'rebake.html', 'rename.html']
bloat_classes = [r'\.app-demo-wrapper', r'\.mock-header', r'\.dropzone', r'\.preview-big', r'\.rebake-window', r'\.rename-preview-panel']
for file in files_to_clean:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            html = f.read()
            
        # We need to remove all rules starting with these classes
        for cls in bloat_classes:
            html = re.sub(cls + r'[\s\S]*?\{[\s\S]*?\}', '', html)
            # Repeat to catch nested rules
            html = re.sub(cls + r'[\s\S]*?\{[\s\S]*?\}', '', html)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(html)
    except Exception as e:
        print(e)
        
print("CSS bloat cleaned!")

# 3. Fix Blueprint in hub.html, camera.html, global.css
with open('assets/css/global.css', 'r', encoding='utf-8') as f:
    global_css = f.read()
if '.faq-item { position: relative;' not in global_css:
    global_css = global_css.replace('.faq-item {', '.faq-item { position: relative;')
    with open('assets/css/global.css', 'w', encoding='utf-8') as f:
        f.write(global_css)

with open('camera.html', 'r', encoding='utf-8') as f:
    camera_html = f.read()
camera_html = camera_html.replace('class="pricing-card"', 'class="price-card"')
if 'bp-dot' not in camera_html:
    camera_html = re.sub(r'(<div class="price-card"[^>]*>)', r'\1<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>', camera_html)
with open('camera.html', 'w', encoding='utf-8') as f:
    f.write(camera_html)

with open('hub.html', 'r', encoding='utf-8') as f:
    hub_html = f.read()
if 'bp-dot' not in hub_html.split('class="feature-card highlight"')[1]:
    hub_html = re.sub(r'(<div class="feature-card highlight"[^>]*>)', r'\1<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>', hub_html)
with open('hub.html', 'w', encoding='utf-8') as f:
    f.write(hub_html)

print("Blueprint fixed!")
