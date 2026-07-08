import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Shorten Magic Ripple Description (VI and EN)
old_vi = "Hệ thống mô phỏng sóng nước vật lý và lan truyền động cho 3ds Max. Tự động tính toán va chạm vật thể để tạo sóng vỗ bờ, sóng gợn lăn tăn, sóng biển động và bọt nước chân thực."
new_vi = "Hệ thống mô phỏng sóng nước vật lý cho 3ds Max. Tự động tính toán va chạm vật thể, tạo sóng vỗ bờ, sóng gợn lăn tăn và bọt nước chân thực."

old_en = "Physics-based water ripple and wave propagation simulator for 3ds Max. Procedurally calculates object collision ripples, shore waves, open ocean swells, and realistic foam dynamics."
new_en = "Physics-based water ripple simulator for 3ds Max. Procedurally calculates collision ripples, shore waves, ocean swells, and realistic foam dynamics."

html = html.replace(old_vi, new_vi)
html = html.replace(old_en, new_en)

# 2. Add margin-top: auto to .product-cta to permanently prevent unaligned buttons
css_match = re.search(r'(\.product-cta\s*\{[^}]*?)(margin-top:.*?;)?([^}]*\})', html)
if css_match:
    # If margin-top is already there, replace it, else add it
    if 'margin-top:' not in css_match.group(0):
        html = html.replace(css_match.group(0), css_match.group(1) + ' margin-top: auto;' + css_match.group(3))
else:
    # Fallback if regex fails: append a new rule for it
    html = html.replace('</style>', '    .product-cta { margin-top: auto; }\n</style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Shortened Ripple description and fixed CTA alignment!")
