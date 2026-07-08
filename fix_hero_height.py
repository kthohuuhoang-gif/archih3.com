import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update hero padding and min-height
html = re.sub(r'(\.hero\s*\{[^}]*?padding:)\s*140px 24px 40px;', r'\1 100px 24px 20px;', html)
html = re.sub(r'(\.hero\s*\{[^}]*?min-height:)\s*calc\(100vh - 240px\);', r'\1 calc(100vh - 280px);', html)

# 2. Update marquee margin-bottom to save space
html = re.sub(r'(\.marquee-container\s*\{[^}]*?margin:)\s*0 auto 40px;', r'\1 0 auto 20px;', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Adjusted hero height and padding!")
