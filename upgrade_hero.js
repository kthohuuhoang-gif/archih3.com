const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const indexPath = path.join(dir, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const newHeroCSS = `/* ADVANCED HERO */
        .hero {
            position: relative;
            padding: 160px 24px 100px;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            text-align: center;
            overflow: hidden;
            min-height: 80vh;
        }
        .hero::before, .hero::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            opacity: 0.5;
            animation: floatOrb 15s ease-in-out infinite alternate;
            pointer-events: none;
        }
        .hero::before {
            width: 400px; height: 400px;
            background: rgba(77, 182, 172, 0.4);
            top: -100px; left: -100px;
        }
        .hero::after {
            width: 500px; height: 500px;
            background: rgba(30, 100, 200, 0.3);
            bottom: -150px; right: -100px;
            animation-delay: -5s;
            animation-duration: 20s;
        }
        @keyframes floatOrb {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(100px, 50px) scale(1.2); }
        }

        .hero-content {
            position: relative; z-index: 1;
            max-width: 800px;
        }
        .hero-badge {
            display: inline-block; font-family: 'JetBrains Mono', monospace;
            font-size: 12px; color: var(--primary);
            border: 1px solid rgba(77,182,172,0.3);
            padding: 8px 20px; border-radius: 20px;
            margin-bottom: 24px; background: rgba(77,182,172,0.1); 
            backdrop-filter: blur(10px);
            letter-spacing: 1.5px;
            box-shadow: 0 4px 15px rgba(77,182,172,0.15);
        }
        .hero h1 {
            font-size: clamp(40px, 6vw, 76px); font-weight: 700;
            line-height: 1.1; margin-bottom: 24px; letter-spacing: -2px;
            color: #fff;
        }
        .hero h1 .teal {
            background: linear-gradient(135deg, #80cbc4, #4db6ac, #00796b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 40px rgba(77, 182, 172, 0.3);
        }
        .hero-sub {
            font-size: clamp(16px, 2.5vw, 20px); color: var(--text-secondary);
            max-width: 640px; margin: 0 auto 40px; font-weight: 300;
            line-height: 1.6;
        }
        .hero-cta-group {
            display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
        }
        .hero-cta-btn {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;
            text-decoration: none; transition: all 0.3s;
            min-height: 48px; /* Touch target optimization */
        }
        .hero-cta-primary {
            background: var(--primary); color: #111;
            box-shadow: 0 0 20px rgba(77, 182, 172, 0.4);
        }
        .hero-cta-primary:hover {
            background: #5ec4ba; transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(77, 182, 172, 0.6);
        }
        .hero-cta-secondary {
            background: rgba(255,255,255,0.05); color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
        }
        .hero-cta-secondary:hover {
            background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4);
            transform: translateY(-2px);
        }

        /* Mobile & iPad Optimizations */
        @media (max-width: 1024px) {
            .hero { min-height: 60vh; padding: 140px 24px 80px; }
            .hero::before { width: 300px; height: 300px; }
            .hero::after { width: 400px; height: 400px; }
        }
        @media (max-width: 768px) {
            .hero { padding: 120px 20px 60px; }
            .hero-cta-group { flex-direction: column; width: 100%; max-width: 350px; margin: 0 auto; gap: 12px; }
            .hero-cta-btn { width: 100%; font-size: 15px; padding: 14px 24px; }
            .hero h1 { letter-spacing: -1px; }
        }`;

// Replace CSS
content = content.replace(/\/\* HERO \*\/[\s\S]*?\/\* PRODUCTS GRID \*\//, newHeroCSS + '\n\n        /* PRODUCTS GRID */');

const newHeroHTML = `<!-- HERO -->
    <section class="hero">
        <div class="hero-content" data-aos="zoom-in" data-aos-duration="1000">
            <div class="hero-badge" data-vi="AI & TỰ ĐỘNG HÓA KIẾN TRÚC" data-en="AI & ARCHITECTURE AUTOMATION">AI & TỰ ĐỘNG HÓA KIẾN TRÚC</div>
            <h1 data-vi="Chào mừng tới <span class='teal'>AH3 Tools</span>" data-en="Welcome to <span class='teal'>AH3 Tools</span>">Chào mừng tới <span class='teal'>AH3 Tools</span></h1>
            <p class="hero-sub" data-vi="Cổng thông tin và các sản phẩm plugin tối ưu quy trình thiết kế 3ds Max được phát triển bởi Kiến trúc sư Hồ Hữu Hoàng." data-en="Architecture design optimization plugins & tools for 3ds Max developed by Architect Ho Huu Hoang.">Cổng thông tin và các sản phẩm plugin tối ưu quy trình thiết kế 3ds Max được phát triển bởi Kiến trúc sư Hồ Hữu Hoàng.</p>
            <div class="hero-cta-group">
                <a href="#products" class="hero-cta-btn hero-cta-primary" data-vi="Khám phá ngay" data-en="Explore Now">Khám phá ngay</a>
                <a href="https://www.youtube.com/@ArchiH3" target="_blank" class="hero-cta-btn hero-cta-secondary" data-vi="▶ Xem Video" data-en="▶ Watch Video">▶ Xem Video</a>
            </div>
        </div>
    </section>`;

// Replace HTML
content = content.replace(/<!-- HERO -->[\s\S]*?<\/section>/, newHeroHTML);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Updated index.html Hero Section');
