import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. We need to find the Magic Cat card, and wrap everything from Magic Cat down to Magic Ripple in a scrolljack container.
# Magic Cat starts with:
#             <!-- Magic Cat -->
#             <div class="product-card" data-aos="fade-up" style="--glow-color: rgba(77, 182, 172, 0.15); --hover-border: var(--primary);">
# The end of the grid is before <!-- AUTHOR -->.
# Let's use string splitting.

split1 = html.split('<!-- Magic Cat -->')
if len(split1) > 1:
    before_cat = split1[0]
    rest = '<!-- Magic Cat -->' + split1[1]
    
    split2 = rest.split('</section>\n\n    <!-- AUTHOR -->')
    if len(split2) > 1:
        cat_to_end_of_grid = split2[0]
        after_grid = '</section>\n\n    <!-- AUTHOR -->' + split2[1]
        
        # We need to ensure we close the products-grid before the scrolljack, and then open a new container.
        # Actually, the Magic Camera is inside <div class="products-grid">
        # So we should close that grid right before Magic Cat.
        # Then create the scrolljack wrapper.
        
        scrolljack_wrapper = """
        </div> <!-- Close previous products-grid -->
        
        <div class="scroll-jack-wrapper">
            <div class="scroll-jack-sticky">
                <div class="scroll-jack-container">
                    <div class="scroll-jack-content">
"""
        
        scrolljack_footer = """
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Re-open a dummy products-grid if needed, but since this is the end of the section, we can just close the section, which is already handled by </section> in after_grid. But wait, after_grid expects </section>.
        So we just append it. Wait, the original cat_to_end_of_grid ended with `</div>` (closing products-grid)?
        Let's check the end of cat_to_end_of_grid. It should end with `</div>` (closing the product card) and then `</div>` (closing products-grid).
        If we wrap it, we don't need the closing products-grid at the end of cat_to_end_of_grid, because we already closed it before scrolljack_wrapper!
"""
        # Let's replace the last </div> in cat_to_end_of_grid with nothing, since we closed it early.
        # Let's just find the last </div>
        last_div_idx = cat_to_end_of_grid.rfind('</div>')
        if last_div_idx != -1:
            cat_to_end_of_grid = cat_to_end_of_grid[:last_div_idx] + cat_to_end_of_grid[last_div_idx+6:]

        new_html = before_cat + scrolljack_wrapper + cat_to_end_of_grid + scrolljack_footer + after_grid

        # 2. Add CSS for scrolljacking
        scrolljack_css = """
        /* HORIZONTAL SCROLLJACKING */
        .scroll-jack-wrapper {
            position: relative;
            height: 400vh; /* 4 screens of scrolling */
            margin-top: 40px;
        }
        .scroll-jack-sticky {
            position: sticky;
            top: 0;
            height: 100vh;
            width: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
        }
        .scroll-jack-container {
            width: 100%;
            padding: 0 5%;
        }
        .scroll-jack-content {
            display: flex;
            gap: 32px;
            width: max-content;
            will-change: transform;
            /* Default transform set by JS */
        }
        .scroll-jack-content .product-card {
            width: 320px;
            flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
            .scroll-jack-wrapper { height: 300vh; }
            .scroll-jack-content .product-card { width: 280px; }
        }
"""
        if '/* HORIZONTAL SCROLLJACKING */' not in new_html:
            new_html = new_html.replace('</style>', scrolljack_css + '</style>')
            
        # 3. Add JS for scrolljacking
        scrolljack_js = """
        // HORIZONTAL SCROLLJACKING LOGIC
        const scrollWrapper = document.querySelector('.scroll-jack-wrapper');
        const scrollSticky = document.querySelector('.scroll-jack-sticky');
        const scrollContent = document.querySelector('.scroll-jack-content');

        if (scrollWrapper && scrollSticky && scrollContent) {
            window.addEventListener('scroll', () => {
                const rect = scrollWrapper.getBoundingClientRect();
                const wrapperTop = rect.top;
                const wrapperHeight = rect.height;
                const stickyHeight = scrollSticky.offsetHeight;
                
                // Calculate progress (0 to 1)
                let progress = 0;
                if (wrapperTop <= 0) {
                    progress = Math.abs(wrapperTop) / (wrapperHeight - stickyHeight);
                }
                progress = Math.max(0, Math.min(1, progress));
                
                // Max scroll distance = content width - container width
                const containerWidth = document.querySelector('.scroll-jack-container').offsetWidth;
                const maxScroll = scrollContent.scrollWidth - containerWidth;
                
                if (maxScroll > 0) {
                    scrollContent.style.transform = `translate3d(-${progress * maxScroll}px, 0, 0)`;
                }
            });
        }
"""
        if 'HORIZONTAL SCROLLJACKING LOGIC' not in new_html:
            new_html = new_html.replace('</script>\n</body>', scrolljack_js + '</script>\n</body>')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print("Horizontal scrolljacking implemented!")
    else:
        print("Could not find end of section.")
else:
    print("Could not find Magic Cat.")
