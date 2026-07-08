import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix stray }
html = html.replace('/* SIMULATIONS MARQUEE */\n        }', '/* SIMULATIONS MARQUEE */')

# 2. Fix orphaned 100%
orphan = "100% { transform: translate(100px, 50px) scale(1.2); } }"
if orphan in html:
    html = html.replace(orphan, '')

# 3. Fix Detail button
html = html.replace('top: -8px;', 'top: 6px;')

# 4. Mobile scaling
mobile_css = """
        @media (max-width: 768px) {
            .marquee-item.expanded {
                transform: scale(1.2);
            }
        }
"""
if '@media (max-width: 768px)' not in html:
    html = html.replace('</style>', mobile_css + '</style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Safe CSS fixes applied!")
