import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

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
        
        .product-card:hover .bp-dot,
        .premium-card-large:hover .bp-dot,
        .marquee-item:hover .bp-dot {
            opacity: 1;
            box-shadow: 0 0 8px var(--hover-border, var(--primary));
        }
"""

bp_dots_html = '<span class="bp-dot tl"></span><span class="bp-dot tr"></span><span class="bp-dot bl"></span><span class="bp-dot br"></span>'

# Inject bp-dots HTML into product-card, premium-card-large, marquee-item
# Wait, marquee items might have them? The screenshot the user sent earlier showed dots on the marquee!
# Wait, NO! The marquee-item in the screenshot DID NOT have dots!
# But the user said "các điểm neo dấu chấm cũng biến mất" (the dot anchors also disappeared).
# They sent a screenshot of "AH3 Hub" inside index.html which is a .premium-card-large.
# And the other screenshot they sent earlier had dots on the product cards.

html = re.sub(r'(<div class="product-card"[^>]*>)', r'\1' + bp_dots_html, html)
html = re.sub(r'(<div class="premium-card-large"[^>]*>)', r'\1' + bp_dots_html, html)
html = re.sub(r'(<div class="marquee-item"[^>]*>)', r'\1' + bp_dots_html, html)

# Clean up duplicates if any
html = html.replace(bp_dots_html + bp_dots_html, bp_dots_html)

# Add CSS if missing
if '.bp-dot' not in html:
    html = html.replace('</style>', blueprint_css + '\n    </style>')

# Also, index.html might be missing dashed borders for the cards.
# Wait, in index.html, .premium-card-large and .product-card already have solid borders?
# Let's change solid borders to dashed if they are not dashed.
html = re.sub(r'\.premium-card-large\s*\{([\s\S]*?border:\s*)1px solid[^;]+;', 
              r'.premium-card-large {\g<1>1px dashed rgba(85,85,85,0.4);', html)
html = re.sub(r'\.product-card\s*\{([\s\S]*?border:\s*)1px solid[^;]+;', 
              r'.product-card {\g<1>1px dashed rgba(85,85,85,0.4);', html)
              
# And ensure relative position
html = re.sub(r'(\.premium-card-large\s*\{)', r'\1 position: relative;', html)
html = re.sub(r'(\.product-card\s*\{)', r'\1 position: relative;', html)
html = re.sub(r'(\.marquee-item\s*\{)', r'\1 position: relative;', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
    
print("Added bp-dots to index.html!")
