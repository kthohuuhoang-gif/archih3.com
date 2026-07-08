import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update .mini-sim-box base background
html = re.sub(r'(\.mini-sim-box\s*\{[^}]*?background:)\s*#111;', r'\1 rgba(255, 255, 255, 0.04); backdrop-filter: blur(10px);', html)

# Update .marquee-item .mini-sim-box
new_css = """background: rgba(255, 255, 255, 0.06); 
            height: 80px !important; 
            border: 1px solid rgba(255,255,255,0.08); 
            border-top: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s; 
            margin-bottom: 0 !important;"""
            
html = re.sub(r'\.marquee-item \.mini-sim-box\s*\{[^}]*\}', f'.marquee-item .mini-sim-box {{\n            {new_css}\n        }}', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied luxury glassmorphism to all mini-sim-boxes!")
