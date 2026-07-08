import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add padding to marquee-container and increase height so expanded items aren't clipped
# Current: height: 220px;
html = re.sub(r'(\.marquee-container\s*\{[^}]*?height:)\s*220px;', r'\1 300px;\n            padding: 40px 0;', html)

# 2. Adjust hero min-height to account for the taller marquee-container
# Current: min-height: calc(100vh - 280px);
html = re.sub(r'(\.hero\s*\{[^}]*?min-height:)\s*calc\(100vh - 280px\);', r'\1 calc(100vh - 340px);', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Added padding to marquee container to prevent clipping!")
