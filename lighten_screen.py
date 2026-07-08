import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Lighten the simulated screen background from very dark #0B061B to a slightly lighter slate/navy gray
html = html.replace('fill="#0B061B"', 'fill="#1A1F2B"')

# Also there might be other SVGs with pure black or very dark backgrounds.
# Magic tree has background? No.
# Magic material has `#min-box-element-mq...` - wait, the material has `.mini-scene` which uses CSS.
# Let's just fix #0B061B which is the main screen background in Hub simulation.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Lightened the simulated screen background!")
