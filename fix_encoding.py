import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the mangled "Xem chi tit"
html = re.sub(r'Xem chi ti.t', 'Xem chi tiết', html)
# Fix the mangled "Xem chi tit +'"
html = re.sub(r'Xem chi tiết .\+', 'Xem chi tiết ->', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Encoding fixed!")
