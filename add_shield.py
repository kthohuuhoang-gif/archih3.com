import os
import glob

directory = "C:\\AH3 Tools\\Web_archih3\\archih3.com"
html_files = glob.glob(os.path.join(directory, '*.html'))

anti_theft_js = """
    <!-- ANTI THEFT SHIELD -->
    <script>
    (function(){var _0x1a2b=["archih3.com","localhost","127.0.0.1","hostname","location","href","https://archih3.com","body","innerHTML",""];var h=window[_0x1a2b[4]][_0x1a2b[3]];var a=false;for(var i=0;i<3;i++){if(h.indexOf(_0x1a2b[i])!==-1||h===_0x1a2b[9]){a=true;break;}}if(!a){document.addEventListener("DOMContentLoaded",function(){document[_0x1a2b[7]][_0x1a2b[8]]="<div style='padding:50px;text-align:center;color:red;font-family:sans-serif;background:#111;height:100vh;'><h1>UNAUTHORIZED COPY DETECTED</h1><p>Redirecting to original site...</p></div>";setTimeout(function(){window[_0x1a2b[4]][_0x1a2b[5]]=_0x1a2b[6];},2000);});}document.addEventListener("contextmenu",function(e){e.preventDefault();});document.onkeydown=function(e){if(e.keyCode==123){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==73){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==67){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==74){return false;}if(e.ctrlKey&&e.keyCode==85){return false;}};})();
    </script>
"""

# 1. Update global.css
css_path = os.path.join(directory, 'assets', 'css', 'global.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    if 'user-select: none' not in css:
        anti_theft_css = "\n/* ANTI THEFT */\nbody { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }\ninput, textarea { user-select: auto; -webkit-user-select: auto; }\n"
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(css + anti_theft_css)
        print("Updated global.css with anti-theft CSS")

# 2. Inject JS into all HTML files
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    if '<!-- ANTI THEFT SHIELD -->' not in html:
        # inject before </head>
        html = html.replace('</head>', anti_theft_js + '\n</head>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Injected shield into {os.path.basename(filepath)}")

