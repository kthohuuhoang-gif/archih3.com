import os
import glob
import re

directory = "C:\\AH3 Tools\\Web_archih3\\archih3.com"
html_files = glob.glob(os.path.join(directory, '*.html'))

advanced_shield_js = """
    <!-- ADVANCED ANTI THEFT SHIELD -->
    <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'none';">
    <script>
    (function(){
        // 1. Domain Binding
        var _0x1a2b=["archih3.com","localhost","127.0.0.1","hostname","location","href","https://archih3.com","body","innerHTML",""];
        var h=window[_0x1a2b[4]][_0x1a2b[3]];var a=false;for(var i=0;i<3;i++){if(h.indexOf(_0x1a2b[i])!==-1||h===_0x1a2b[9]){a=true;break;}}
        if(!a){document.addEventListener("DOMContentLoaded",function(){document[_0x1a2b[7]][_0x1a2b[8]]="<div style='padding:50px;text-align:center;color:red;font-family:sans-serif;background:#111;height:100vh;'><h1>UNAUTHORIZED COPY DETECTED</h1><p>Redirecting to original site...</p></div>";setTimeout(function(){window[_0x1a2b[4]][_0x1a2b[5]]=_0x1a2b[6];},2000);});}
        
        // 2. DevTools & Right Click Blocker
        document.addEventListener("contextmenu",function(e){e.preventDefault();});
        document.onkeydown=function(e){if(e.keyCode==123){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==73){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==67){return false;}if(e.ctrlKey&&e.shiftKey&&e.keyCode==74){return false;}if(e.ctrlKey&&e.keyCode==85){return false;}};
        
        // 3. Console Suppressor
        console.log = console.warn = console.info = console.error = function() {};
        
        // 4. Debugger Trap (Infinite Freeze)
        setInterval(function() {
            var start = new Date();
            debugger; // If DevTools is open, it freezes here
            var end = new Date();
            if (end - start > 100) {
                // They took time to resume execution, meaning DevTools is open
                document.body.innerHTML = "";
            }
        }, 100);
    })();
    </script>
"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace old shield if exists
    if '<!-- ANTI THEFT SHIELD -->' in html:
        html = re.sub(r'<!-- ANTI THEFT SHIELD -->[\s\S]*?</script>', advanced_shield_js, html)
    elif '<!-- ADVANCED ANTI THEFT SHIELD -->' not in html:
        html = html.replace('</head>', advanced_shield_js + '\n</head>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Injected ADVANCED shield into {os.path.basename(filepath)}")

