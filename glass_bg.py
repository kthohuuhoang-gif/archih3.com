import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Change #1E2028 to a frosted glass effect
glass_css = "rgba(20, 25, 35, 0.75);\n              backdrop-filter: blur(12px);\n              -webkit-backdrop-filter: blur(12px);"
html = re.sub(r'background:\s*#1E2028;', f'background: {glass_css}', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied frosted glass effect to expanded marquee items!")
