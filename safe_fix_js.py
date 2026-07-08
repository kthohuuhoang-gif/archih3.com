import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We need to find:
#             // Reset when mouse leaves
#             heroSection.addEventListener('mouseleave', () => {
#                 if (orb1) orb1.style.transform = 'translate(0, 0)';
#                 if (orb2) orb2.style.transform = 'translate(0, 0)';
#             });
#         }
#
#         const marqueeItems = document.querySelectorAll('.marquee-item');
#
# Wait, currently in index.html, marqueeItems is INSIDE if (heroSection).
# Let's locate the EXACT string:
target = """
            // Reset when mouse leaves
            heroSection.addEventListener('mouseleave', () => {
                if (orb1) orb1.style.transform = 'translate(0, 0)';
                if (orb2) orb2.style.transform = 'translate(0, 0)';
            });
            
            const marqueeItems = document.querySelectorAll('.marquee-item');
"""
if target in html:
    # Just insert the closing } before const marqueeItems, and remove the closing } later
    html = html.replace(target, """
            // Reset when mouse leaves
            heroSection.addEventListener('mouseleave', () => {
                if (orb1) orb1.style.transform = 'translate(0, 0)';
                if (orb2) orb2.style.transform = 'translate(0, 0)';
            });
        }
            
        const marqueeItems = document.querySelectorAll('.marquee-item');
""")
    # Now we need to remove the trailing } that used to close if (heroSection)
    # The trailing } is after the document.addEventListener('click', ...) block.
    # It looks like:
    #         document.addEventListener('click', function(e) {
    #             ...
    #         });
    #         }
    trailing_brace = """
        // Click outside to shrink
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.marquee-item')) {
                document.querySelectorAll('.marquee-item.expanded').forEach(el => el.classList.remove('expanded'));
                document.querySelectorAll('.marquee-track.paused').forEach(el => el.classList.remove('paused'));
            }
        });
        }"""
    html = html.replace(trailing_brace, """
        // Click outside to shrink
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.marquee-item')) {
                document.querySelectorAll('.marquee-item.expanded').forEach(el => el.classList.remove('expanded'));
                document.querySelectorAll('.marquee-track.paused').forEach(el => el.classList.remove('paused'));
            }
        });""")
    
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Safe JS fixes applied!")
