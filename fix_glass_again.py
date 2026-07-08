import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix expanded marquee item background
# It is currently rgba(15, 15, 20, 0.95);
glass_css = "rgba(20, 25, 35, 0.75);\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);"
html = html.replace('background: rgba(15, 15, 20, 0.95);', f'background: {glass_css}')

# Let's also ensure the base mini-sim-box has the correct glass effect, because fix_glass.py might have failed too.
# fix_glass.py looked for 'background: #111;'
# Let's just do a manual check if #111 is still there.
html = re.sub(r'(\.mini-sim-box\s*\{[^}]*?background:)\s*#111;', r'\1 rgba(255, 255, 255, 0.04); backdrop-filter: blur(10px);', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Glass background fixed!")
