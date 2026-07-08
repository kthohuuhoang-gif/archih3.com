import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix duplicated position: relative;
html = re.sub(r'(position:\s*relative;\s*)+', 'position: relative; ', html)

# 2. Add mobile media query for marquee-item.expanded
mobile_css = """
        @media (max-width: 768px) {
            .marquee-item.expanded { transform: scale(1.1); }
        }
"""
if '@media (max-width: 768px)' not in html.split('/* HORIZONTAL SCROLLJACKING */')[0]:
    html = html.replace('</style>', mobile_css + '</style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
    
print("Final polish done!")
