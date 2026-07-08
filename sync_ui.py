import os
import re

directory = "C:\\AH3 Tools\\Web_archih3\\archih3.com"
files_to_sync = ['tree.html', 'material.html', 'hub.html', 'camera.html']

blueprint_css = """
        /* BLUEPRINT CORNER VERTICES (DOTS) */
        .bp-dot {
            position: absolute; width: 6px; height: 6px;
            background: var(--hover-border, var(--primary));
            border-radius: 1px;
            opacity: 0.35; transition: all 0.3s;
            pointer-events: none; z-index: 10;
        }
        .bp-dot.tl { top: -3px; left: -3px; }
        .bp-dot.tr { top: -3px; right: -3px; }
        .bp-dot.bl { bottom: -3px; left: -3px; }
        .bp-dot.br { bottom: -3px; right: -3px; }
        
        .feature-card:hover .bp-dot,
        .price-card:hover .bp-dot,
        .faq-item:hover .bp-dot {
            opacity: 1;
            box-shadow: 0 0 8px var(--hover-border, var(--primary));
        }
"""

bp_dots_html = '<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>'

for filename in files_to_sync:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Inject bp-dots HTML
    html = re.sub(r'(<div class="feature-card"[^>]*>)', r'\1' + bp_dots_html, html)
    html = re.sub(r'(<div class="price-card"[^>]*>)', r'\1' + bp_dots_html, html)
    html = re.sub(r'(<div class="price-card featured"[^>]*>)', r'\1' + bp_dots_html, html)
    html = re.sub(r'(<div class="faq-item"[^>]*>)', r'\1' + bp_dots_html, html)
    
    html = html.replace(bp_dots_html + bp_dots_html, bp_dots_html)
    
    # 2. Modify CSS
    html = re.sub(r'\.feature-card\s*\{[\s\S]*?\}', 
                  r'.feature-card {\n            background: var(--bg-main); border: 1px dashed rgba(85,85,85,0.4);\n            border-radius: 12px; padding: 32px;\n            transition: all 0.3s; position: relative;\n        }', html)
                  
    html = re.sub(r'\.feature-card:hover\s*\{[\s\S]*?\}',
                  r'.feature-card:hover {\n            border-color: var(--primary); transform: translateY(-4px);\n            box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02);\n            background: rgba(255,255,255,0.015);\n        }', html)
                  
    html = re.sub(r'\.price-card\s*\{([\s\S]*?border:\s*)1px solid[^;]+;', 
                  r'.price-card {\g<1>1px dashed rgba(85,85,85,0.4);', html)
    
    if '.price-card:hover' not in html:
        html = html.replace('.price-card.featured', 
                            '.price-card:hover {\n            border-color: var(--primary); transform: translateY(-4px);\n            box-shadow: 0 15px 40px rgba(0,0,0,0.6);\n        }\n        .price-card.featured')
    
    html = re.sub(r'\.faq-item\s*\{([\s\S]*?border:\s*)1px solid[^;]+;', 
                  r'.faq-item {\g<1>1px dashed rgba(85,85,85,0.4);', html)

    if '.bp-dot' not in html:
        html = html.replace('</style>', blueprint_css + '\n    </style>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
print("Updated layouts for: ", files_to_sync)
