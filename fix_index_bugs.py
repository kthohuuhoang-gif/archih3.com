import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix CSS syntax error: orphaned keyframes code around line 91
# Find anything like "100% { transform: translate(100px, 50px) scale(1.2); } }" inside .hero block
html = re.sub(r'100%\s*\{\s*transform:\s*translate\(100px,\s*50px\)\s*scale\(1\.2\);\s*\}\s*\}', '', html)

# 2. Fix CSS syntax error: stray } below /* SIMULATIONS MARQUEE */
# Let's replace "/* SIMULATIONS MARQUEE */\n        }" with "/* SIMULATIONS MARQUEE */"
html = re.sub(r'/\*\s*SIMULATIONS MARQUEE\s*\*/\s*\}', r'/* SIMULATIONS MARQUEE */', html)

# 3. Fix Detail link button clipping
# Find .detail-link-btn { ... top: -8px; ... }
html = re.sub(r'(\.detail-link-btn\s*\{[^}]*?top:)\s*-8px;', r'\1 6px;', html)

# 4. Mobile Marquee Scaling 
# Add a media query at the end of the <style> block for max-width: 768px
mobile_css = """
        @media (max-width: 768px) {
            .marquee-item.expanded {
                transform: scale(1.2);
            }
        }
"""
html = html.replace('</style>', mobile_css + '</style>')

# 5. Fix JS logic: Move marquee interaction logic outside if (heroSection) { ... }
# Look for the block starting with const marqueeItems = document.querySelectorAll('.marquee-item');
js_code_match = re.search(r'(\s*const marqueeItems = document\.querySelectorAll\(\'\.marquee-item\'\);[\s\S]*?\}\);)', html)
if js_code_match:
    js_code = js_code_match.group(1)
    # Remove it from inside the if (heroSection) block
    html = html.replace(js_code, '')
    # Add it right after the if (heroSection) block
    html = re.sub(r'(if \(heroSection\) \{[\s\S]*?\}\s*\n)', r'\1' + js_code + '\n', html, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html fixed!")
