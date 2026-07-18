// Post-build: generate English pages under dist/en/ from the built Vietnamese
// pages by swapping each element's default content to its data-en value.
// This gives English crawlable URLs (/en/...) while pages keep the existing
// data-vi/data-en client-side toggle (lang.js also re-applies EN on load as a
// safety net for anything this static pass misses).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE = 'https://archih3.com';
const DIST = 'dist';

const PAGES = {
  '': {
    title: 'AH3 Tools — AI & Automation Plugins for 3ds Max | ArchiH3',
    desc: 'Professional 3ds Max plugin toolkit: AH3 Hub, Magic Material, Magic Merger, Magic Tree and more. Developed by ArchiH3 Architecture Services.',
  },
  'hub': {
    title: 'AH3 Hub — AI Super-app for 3ds Max | ArchiH3',
    desc: 'Integrated AI hub for 3ds Max: Text-to-Image, Image-to-3D, Material Generator, Quick Render and 10+ AI technologies.',
  },
  'material': {
    title: 'Magic Material — 1-Click PBR Map Generator | ArchiH3',
    desc: 'Generate Normal, Roughness, AO and Displacement maps from a diffuse image. 100% offline, V-Ray & Corona compatible.',
  },
  'merger': {
    title: 'Magic Merger — Batch Import & Smart Relink for 3ds Max | ArchiH3',
    desc: 'Batch-merge 3ds Max files, auto-relink textures, ZIP/RAR/7z support. Professional model importer.',
  },
  'tree': {
    title: 'Magic Tree — Wind & Vegetation Simulator for 3ds Max | ArchiH3',
    desc: '4-layer physical wind simulation for vegetation. Supports Maxtree, Globe Plants, Cosmos. Corona & V-Ray proxy.',
  },
  'rebake': {
    title: 'Magic ReBake — Retopology & Map Baking for 3ds Max | ArchiH3',
    desc: 'Automatic quad retopology and material map baking. Auto UV unwrap, edge fixing, 1-Click pipeline.',
  },
  'rename': {
    title: 'Magic Rename — Batch Rename & UE5 Pipeline | ArchiH3',
    desc: 'Batch rename objects, materials and maps. Standardize assets for Unreal Engine 5. Free.',
  },
  'camera': {
    title: 'Magic Camera — Smart Camera Manager for 3ds Max | ArchiH3',
    desc: 'Professional camera management plugin. Composition guides, perspective correction, batch render. Coming soon.',
  },
};

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&');

// Astro re-emits inline HTML with normalized (double) quotes and injected
// scoped-style attributes (data-astro-cid-*), while the same markup inside
// data-* attributes keeps its original form — compare blind to both.
const comparable = (s) => decode(s)
  .replace(/ data-astro-cid-[\w-]+(="")?/g, '')
  .replace(/"/g, "'")
  .trim();

// Swap default (Vietnamese) element content for the data-en value.
function swapContent(html, file) {
  const tagRe = /<([a-zA-Z][\w-]*)((?:[^"'>]|"[^"]*"|'[^']*')*)>/g;
  let out = '';
  let pos = 0;
  let swapped = 0;
  let missed = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const [full, tag, attrs] = m;
    const vi = attrs.match(/data-vi="([^"]*)"/);
    const en = attrs.match(/data-en="([^"]*)"/);
    if (!vi || !en) continue;
    const viText = comparable(vi[1]);
    const contentStart = m.index + full.length;
    // find the matching close, allowing the content itself to nest same-name tags
    let close = html.indexOf(`</${tag}>`, contentStart);
    let matched = false;
    for (let tries = 0; tries < 3 && close !== -1; tries++) {
      const content = html.slice(contentStart, close);
      if (comparable(content) === viText) { matched = true; break; }
      close = html.indexOf(`</${tag}>`, close + 1);
    }
    if (!matched) { missed++; continue; }
    out += html.slice(pos, contentStart) + decode(en[1]);
    pos = close;
    swapped++;
    tagRe.lastIndex = close;
  }
  out += html.slice(pos);
  console.log(`  ${file}: ${swapped} swapped, ${missed} left for client JS`);
  return out;
}

let sitemapEntries = '';

for (const [slug, meta] of Object.entries(PAGES)) {
  const rel = slug ? join(slug, 'index.html') : 'index.html';
  const src = readFileSync(join(DIST, rel), 'utf8');
  const viPath = slug ? `/${slug}/` : '/';
  const enPath = slug ? `/en/${slug}/` : '/en/';

  let html = swapContent(src, rel);
  html = html.replace('<html lang="vi"', '<html lang="en"');
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}${enPath}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${SITE}${enPath}$2`);
  html = html.replace('<meta property="og:locale" content="vi_VN">', '<meta property="og:locale" content="en_US">');

  // Localized title/description across <title>, description, og: and twitter: tags
  const curTitle = html.match(/<title>([^<]*)<\/title>/)[1];
  const curDesc = html.match(/<meta name="description" content="([^"]*)"/)[1];
  html = html.split(curTitle).join(meta.title.replace(/&/g, '&amp;'));
  html = html.split(curDesc).join(meta.desc.replace(/&/g, '&amp;'));

  const outPath = join(DIST, 'en', rel);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  sitemapEntries += `<url><loc>${SITE}${enPath}</loc></url>`;
}

// Append English URLs to the sitemap
const smPath = join(DIST, 'sitemap-0.xml');
const sm = readFileSync(smPath, 'utf8');
writeFileSync(smPath, sm.replace('</urlset>', `${sitemapEntries}</urlset>`));
console.log(`English pages generated for ${Object.keys(PAGES).length} routes; sitemap updated.`);
