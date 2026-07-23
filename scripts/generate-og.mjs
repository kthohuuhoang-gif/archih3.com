// Generate 1200x630 Open Graph images for each product page.
// Renders an HTML card (site branding + interface screenshot) with the
// pre-installed Chromium and saves JPEGs to public/og/.
// Run: npm i -D playwright && node scripts/generate-og.mjs
// (playwright is intentionally not a project dependency — its postinstall
// downloads browsers, which would slow every CI deploy for a one-off tool)
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = 'public/og';
mkdirSync(OUT, { recursive: true });

const PRODUCTS = [
  { slug: 'default',  name: 'AH3 Tools',      tag: 'Plugin AI & Tự động hóa cho 3ds Max', badge: 'ARCHIH3.COM', shot: 'i23d.jpg', icon: 'logo.png' },
  { slug: 'hub',      name: 'AH3 Hub',        tag: 'Siêu ứng dụng AI cho 3ds Max', badge: 'AI SUPER-APP', shot: 'demo quick render.jpg', icon: 'ArchiH3-Icon_40.png' },
  { slug: 'search',   name: 'Magic Search',   tag: 'Tìm asset 3D bằng hình ảnh · 100% Offline', badge: 'VISUAL SEARCH', shot: null, icon: 'magicsearch_icon_48.png' },
  { slug: 'material', name: 'Magic Material', tag: 'Tạo trọn bộ map PBR 1-Click · 100% Offline', badge: 'PBR GENERATOR', shot: 'interface_magicmaterial.png', icon: 'magicmat_icon_48.png' },
  { slug: 'merger',   name: 'Magic Merger',   tag: 'Import hàng loạt & Smart Relink texture', badge: 'BATCH IMPORT', shot: 'interface_magicmerger.png', icon: 'magicmerger_icon_48.png' },
  { slug: 'tree',     name: 'Magic Tree',     tag: 'Mô phỏng gió vật lý cho cây cỏ', badge: 'WIND SIMULATOR', shot: 'interface_magictree.png', icon: 'magictree_icon_48.png' },
  { slug: 'rebake',   name: 'Magic ReBake',   tag: 'Retopology tự động & Bake map tối ưu', badge: 'RETOPO + BAKE', shot: 'interface_magicrebake.png', icon: 'magicrebakepro_icon_48.png' },
  { slug: 'rename',   name: 'Magic Rename',   tag: 'Đổi tên hàng loạt · Chuẩn hóa UE5 · Miễn phí', badge: 'FREE TOOL', shot: 'interface_magicrename.png', icon: 'magicrename_icon_48.png' },
  { slug: 'camera',   name: 'Magic Camera',   tag: 'Quản lý camera & phối cảnh thông minh', badge: 'COMING SOON', shot: null, icon: 'magiccamera_icon_48.png' },
];

const dataURI = (file) => {
  const ext = file.split('.').pop().toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${readFileSync(resolve('public', file)).toString('base64')}`;
};

const html = (p) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden; position:relative;
    font-family:'Segoe UI', Roboto, Arial, sans-serif;
    background:#121212; color:#e0e0e0; display:flex; align-items:center;
  }
  .grid { position:absolute; inset:0;
    background-image:linear-gradient(rgba(77,182,172,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(77,182,172,0.05) 1px, transparent 1px);
    background-size:50px 50px; }
  .glow { position:absolute; right:-200px; top:-200px; width:800px; height:800px;
    background:radial-gradient(circle, rgba(77,182,172,0.18) 0%, transparent 65%); }
  .left { position:relative; width:${p.shot ? '46%' : '100%'}; padding:70px 30px 70px 70px;
    display:flex; flex-direction:column; justify-content:center; gap:26px;
    ${p.shot ? '' : 'align-items:center; text-align:center; padding:70px;'} }
  .brand { display:flex; align-items:center; gap:14px; font-family:'Consolas', monospace;
    font-size:26px; font-weight:600; color:#4db6ac; }
  .brand img { height:36px; }
  .brand small { color:#a0a0a0; font-weight:400; }
  .badge { display:inline-block; align-self:${p.shot ? 'flex-start' : 'center'}; padding:8px 20px;
    border:1px solid rgba(77,182,172,0.4); background:rgba(77,182,172,0.1);
    border-radius:24px; color:#4db6ac; font-size:20px; letter-spacing:3px;
    font-family:'Consolas', monospace; }
  h1 { font-size:${p.name.length > 12 ? '68px' : '76px'}; line-height:1.05; color:#fff; font-weight:700; }
  .tag { font-size:28px; color:#a0a0a0; line-height:1.4; }
  .site { font-size:22px; color:#4db6ac; font-family:'Consolas', monospace; }
  .shot-wrap { position:relative; width:54%; height:100%; display:flex; align-items:center; }
  .shot { max-width:640px; max-height:520px; border-radius:12px;
    border:1px solid rgba(77,182,172,0.35);
    box-shadow:0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(77,182,172,0.15);
    transform:rotate(-2deg); }
  .icon-big { width:140px; height:140px; object-fit:contain; }
</style></head><body>
  <div class="grid"></div><div class="glow"></div>
  <div class="left">
    <div class="brand"><img src="${dataURI('logo.png')}"> AH3 <small>Tools</small></div>
    ${p.shot ? '' : `<img class="icon-big" src="${dataURI(p.icon)}">`}
    <div class="badge">${p.badge}</div>
    <h1>${p.name}</h1>
    <div class="tag">${p.tag}</div>
    <div class="site">archih3.com</div>
  </div>
  ${p.shot ? `<div class="shot-wrap"><img class="shot" src="${dataURI(p.shot)}"></div>` : ''}
</body></html>`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of PRODUCTS) {
  await page.setContent(html(p), { waitUntil: 'load' });
  await page.screenshot({ path: `${OUT}/og-${p.slug}.jpg`, type: 'jpeg', quality: 88 });
  console.log(`og-${p.slug}.jpg`);
}
await browser.close();
