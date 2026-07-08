import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# The correct interaction CSS
interaction_css = """
        /* NEW MARQUEE CSS */
        .marquee-container {
            width: 100%; margin: 0 auto 40px;
            overflow: hidden; position: relative;
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            height: 220px;
        }
        .marquee-track {
            display: flex; gap: 20px; width: max-content;
        }
        .marquee-track.track-1 {
            animation: scroll-left 40s linear infinite;
            margin-bottom: 24px;
        }
        .marquee-track.track-2 {
            animation: scroll-right 45s linear infinite;
        }
        
        .marquee-track.paused {
            animation-play-state: paused !important;
        }
        
        .marquee-item { 
            width: 220px; flex-shrink: 0; cursor: pointer; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            transform-origin: center center;
        }
        
        /* Default state of the mini box inside marquee */
        .marquee-item .mini-sim-box { 
            height: 80px !important; 
            border: 1px dashed rgba(255,255,255,0.15); 
            transition: border 0.3s; 
            margin-bottom: 0 !important;
        }
        .marquee-item:hover .mini-sim-box { border-color: var(--primary); }
        .marquee-item .sim-controls { display: none !important; }
        .marquee-item .sim-viewport { height: 100% !important; display: flex; align-items: center; justify-content: center; }
        .marquee-item .sim-svg { max-height: 70px; width: 100%; }
        
        /* State when expanded */
        .marquee-item.expanded {
            transform: scale(1.4);
            z-index: 100;
        }
        .marquee-item.expanded .mini-sim-box {
            background: rgba(15, 15, 20, 0.95);
            box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px var(--primary);
            border: none;
            height: auto !important; min-height: 120px !important;
        }
        .marquee-item.expanded .sim-controls { 
            display: flex !important; 
            padding: 8px 12px;
            border-top: 1px dashed rgba(255,255,255,0.1);
            margin-top: 5px;
        }
        .marquee-item.expanded .detail-link-btn {
            display: block !important;
        }

        .marquee-item .marquee-title { font-size: 13px; margin-bottom: 8px; font-weight: 600; color: #fff; }
        
        /* Detail Link Button */
        .detail-link-btn {
            display: none !important;
            position: absolute; top: -8px; right: 8px;
            background: rgba(255,255,255,0.1); color: #fff !important;
            font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 4px;
            text-decoration: none; z-index: 101;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(5px);
            transition: all 0.2s;
        }
        .detail-link-btn:hover { background: var(--primary); color: #111 !important; border-color: var(--primary); }
        
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 10px)); }
        }
        @keyframes scroll-right {
            0% { transform: translateX(calc(-50% - 10px)); }
            100% { transform: translateX(0); }
        }
"""

# Replace ALL old marquee CSS to avoid conflicts
# We will match from .marquee-container { to @keyframes marqueeScroll { ... }
html = re.sub(r'\.marquee-container\s*\{[\s\S]*?@keyframes marqueeScroll\s*\{[\s\S]*?\}[\s\S]*?\}', '', html)
# Also remove any partially injected CSS from earlier errors
html = re.sub(r'/\* NEW MARQUEE CSS \*/[\s\S]*?@keyframes scroll-right\s*\{[\s\S]*?\}[\s\S]*?\}', '', html)

# Inject the fresh CSS right before </style>
html = html.replace('</style>', interaction_css + '\n    </style>')

# Also fix the weird "class="marquee-item" data-href="..." class="marquee-item"" duplication
html = html.replace('class="marquee-item" data-href=', 'data-href=')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed CSS injection!")
