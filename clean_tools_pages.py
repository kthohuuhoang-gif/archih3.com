import os
import re
import glob

# Remove CSP from all HTML
html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    if '<meta http-equiv="Content-Security-Policy" content="frame-ancestors \'none\';">' in html:
        html = html.replace('<meta http-equiv="Content-Security-Policy" content="frame-ancestors \'none\';">', '')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(html)

# Clean CSS bloat in specific files
files_to_clean = ['merger.html', 'rebake.html', 'rename.html']
for file in files_to_clean:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Remove CSS related to .app-demo-wrapper, .mock-header, .dropzone etc.
    # It's usually a big block. We can just use regex to remove everything from /* Interactive Demo */ or similar
    # Since we don't know the exact comment, we can search and remove common classes
    classes_to_remove = [r'\.app-demo-wrapper\s*\{[^}]*\}', r'\.mock-header\s*\{[^}]*\}', 
                         r'\.dropzone\s*\{[^}]*\}', r'\.preview-big\s*\{[^}]*\}',
                         r'\.rebake-window\s*\{[^}]*\}', r'\.rename-preview-panel\s*\{[^}]*\}']
    for cls_regex in classes_to_remove:
        html = re.sub(cls_regex, '', html)
        
    # Add animation to rename.html
    if file == 'rename.html':
        if '.hero { animation: fadeUp' not in html:
            html = html.replace('</style>', '    .hero { animation: fadeUp 0.8s ease-out; }\n        .feature-card { animation: fadeUp 0.6s ease-out both; }\n        .feature-card:nth-child(1) { animation-delay: 0.1s; }\n        .feature-card:nth-child(2) { animation-delay: 0.2s; }\n        .feature-card:nth-child(3) { animation-delay: 0.3s; }\n</style>')
            
    # Fix inline styling in rebake.html
    if file == 'rebake.html':
        html = html.replace('style="border-color: #ff9100;"', 'class="price-card flash-sale"')
        html = html.replace('style="background:#ff9100; color:#111; border:none;"', 'class="btn-primary flash-btn"')
        if '.flash-sale' not in html:
            html = html.replace('</style>', '    .price-card.flash-sale { border-color: #ff9100; }\n        .btn-primary.flash-btn { background: #ff9100 !important; color: #111 !important; border: none; }\n</style>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(html)

print("Cleaned tools pages and CSP!")
