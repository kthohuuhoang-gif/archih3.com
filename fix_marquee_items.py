import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the mangled character
html = html.replace('Xem chi tit', 'Xem chi tiết')
html = html.replace('class="marquee-item" data-href=', 'data-href=')

# We need to duplicate the sets so there are 16 items per track instead of 8.
# Let's extract the first 4 items from track 1
def extract_items(track_class):
    start = html.find(f'<div class="marquee-track {track_class}">')
    if start == -1: return ""
    end = html.find('</div>', start)
    return html[start:end]

track1_html = extract_items('track-1')
track2_html = extract_items('track-2')

# Now let's extract just one unique set of 4 items for each track
# For track 1: Hub, Tree, Material, Camera
items_t1 = re.findall(r'<div data-href=.*?</div>\n\s*<div class="mini-sim-box" id=".*?-mq1">[\s\S]*?</div>\n\s*</div>\n\s*</div>', track1_html)

# Wait, regex for the item block might be tricky. Let's just find the pattern.
# A marquee item starts with `<div data-href="...` and ends with `</div>` but contains nested divs.
# It's easier to just rebuild it from the original templates or just string replace.

# Let's just duplicate the entire track contents.
# Track 1 currently has 8 items. If we duplicate its inner content, it will have 16 items.
if track1_html and 'marquee-item' in track1_html:
    inner_content1 = track1_html.replace('<div class="marquee-track track-1">', '')
    new_track1 = '<div class="marquee-track track-1">' + inner_content1 + inner_content1
    html = html.replace(track1_html, new_track1)

if track2_html and 'marquee-item' in track2_html:
    inner_content2 = track2_html.replace('<div class="marquee-track track-2">', '')
    new_track2 = '<div class="marquee-track track-2">' + inner_content2 + inner_content2
    html = html.replace(track2_html, new_track2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Duplicated marquee items to 16 per track and fixed encoding!")
