import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Change the default state background of marquee cards to a luxurious gray
gray_bg = 'background: rgba(255, 255, 255, 0.05);'

# Locate the CSS block for .marquee-item .mini-sim-box inside the NEW MARQUEE CSS
css_match = re.search(r'\/\* Default state of the mini box inside marquee \*\/\s*\.marquee-item \.mini-sim-box\s*\{([^}]*)\}', html)
if css_match:
    inner_css = css_match.group(1)
    if 'background:' not in inner_css:
        new_inner = f" {gray_bg}{inner_css}"
        html = html.replace(css_match.group(0), f'/* Default state of the mini box inside marquee */\n        .marquee-item .mini-sim-box {{{new_inner}}}')
    else:
        new_inner = re.sub(r'background:\s*[^;]+;', gray_bg, inner_css)
        html = html.replace(css_match.group(0), f'/* Default state of the mini box inside marquee */\n        .marquee-item .mini-sim-box {{{new_inner}}}')

# Change expanded state to be slightly darker/more opaque gray but not black
html = re.sub(r'(\.marquee-item\.expanded \.mini-sim-box\s*\{[^}]*?background:)\s*rgba\(15,\s*15,\s*20,\s*0\.95\);', r'\1 #1E2028;', html)

# If they meant product cards too:
html = re.sub(r'(\.product-card\s*\{[^}]*?background:)\s*#111;', r'\1 #1A1C23;', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Changed backgrounds to luxurious gray!")
