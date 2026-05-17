// THE ARCHI-HELL - MÀN 1: GÓC LÀM VIỆC LÚC 3 GIỜ SÁNG
// Phong cách UI: Chân thực (Realistic Computer UI / 3ds Max Theme)

const GLOBAL_STATS = {
    deadlineTime: 5 * 3600 - 1,
    stressLevel: 50,
    money: -150000,
    coffeeLevel: 100,
    progress: 0,
    hasEduWatermark: false,
    usedPinterest: false
};

// Global SFX helper
function playSound(scene, key, volume = 1.0) {
    if (scene.cache.audio.exists(key)) {
        scene.sound.play(key, { volume: volume });
    }
}

// ==========================================
// FONT SYSTEM (FONT-REFACTOR 2026-05-17)
// Be Vietnam Pro: thiết kế bởi/cho người Việt — diacritics adaptive forms
// 6 tier modular scale (Major Third 1.25 ratio): 13/16/20/24/32/48
// JetBrains Mono giữ cho clock (anti-jitter mỗi giây)
// ==========================================
const FONT_FAMILY = '"Be Vietnam Pro", "Segoe UI", "Tahoma", sans-serif';
const FONT_MONO = '"VT323", "JetBrains Mono", "Consolas", "Courier New", monospace';

// Backward-compat aliases (cho code legacy chưa migrate kịp — sẽ remove sau khi xong)
const FONT_MAIN = FONT_FAMILY;
const FONT_TITLE = '"VT323", "Courier New", monospace';

// 6 tier với weight mặc định cho mỗi tier
const FONT = {
    XS:  { fontFamily: FONT_FAMILY, fontSize: '13px', fontStyle: '400' },  // Caption, mini label
    S:   { fontFamily: FONT_FAMILY, fontSize: '16px', fontStyle: '500' },  // HUD label
    M:   { fontFamily: FONT_FAMILY, fontSize: '20px', fontStyle: '400' },  // Body, dialogue, button
    L:   { fontFamily: FONT_FAMILY, fontSize: '24px', fontStyle: '600' },  // HUD counter, modal heading, section
    XL:  { fontFamily: FONT_FAMILY, fontSize: '32px', fontStyle: '700' },  // Scene title, endgame heading
    XXL: { fontFamily: FONT_FAMILY, fontSize: '48px', fontStyle: '900' },  // Hero title (Intro, RageMode)
};

// Helper: merge tier với extras (fill, stroke, align, wordWrap, etc.)
function fontStyle(tier, extras) {
    extras = extras || {};
    return Object.assign({}, FONT[tier], extras);
}

// ==========================================
// COLOR SYSTEM (COLOR-REFACTOR 2026-05-17)
// 15 semantic tokens thay vì 48 hardcoded colors khắp project.
// Mỗi token có .hex (cho text fill) và .num (cho Phaser shape 0xRRGGBB).
// Palette: Flat UI Colors (cohesive, designed-for-web).
// ==========================================
const COLORS = {
    // --- BACKGROUNDS (modal, popup, card) ---
    bgDarkest:   { hex: '#000000', num: 0x000000 },  // Modal overlay 0.95, bg trần
    bgDark:      { hex: '#111111', num: 0x111111 },  // HUD bar, dark card
    bgMedium:    { hex: '#1e1e1e', num: 0x1e1e1e },  // Popup box, panel mid
    bgLight:     { hex: '#2c3e50', num: 0x2c3e50 },  // Button bg, navy panel
    bgLightAlt:  { hex: '#34495e', num: 0x34495e },  // Button hover, navy lighter

    // --- STROKES & BORDERS (3 shades đủ dùng) ---
    strokeDark:  { hex: '#333333', num: 0x333333 },
    strokeMid:   { hex: '#555555', num: 0x555555 },
    strokeLight: { hex: '#aaaaaa', num: 0xaaaaaa },

    // --- TEXT ---
    textPrimary:   { hex: '#ffffff', num: 0xffffff },  // White text chính
    textSecondary: { hex: '#bdc3c7', num: 0xbdc3c7 },  // HUD label xám sáng
    textMuted:     { hex: '#7f8c8d', num: 0x7f8c8d },  // Caption mờ

    // --- SEMANTIC (Flat UI - cohesive palette) ---
    danger:    { hex: '#e74c3c', num: 0xe74c3c },  // Red - thua, stress, lỗi, GameOver
    warning:   { hex: '#f1c40f', num: 0xf1c40f },  // Yellow - cảnh báo, Win highlight
    success:   { hex: '#2ecc71', num: 0x2ecc71 },  // Green - thắng, progress
    info:      { hex: '#3498db', num: 0x3498db },  // Blue - CTA, retry button, hint

    // --- THEME ACCENT ---
    purple:    { hex: '#8e44ad', num: 0x8e44ad },  // Coffee/cafe stroke
    darkRed:   { hex: '#c0392b', num: 0xc0392b },  // Scene title MÀN 3 (đỏ trầm)
};

// BUG-FIX (2026-05-16): Helper to scale PNG icon while PRESERVING aspect ratio.
// setDisplaySize(w, h) stretches/squashes — use this instead when source icon may have any ratio.
// Usage: scaleImageToFit(this.add.image(x, y, 'key'), maxSize) → fits within maxSize×maxSize box.
function scaleImageToFit(img, maxSize) {
    if (img.width > 0 && img.height > 0) {
        img.setScale(maxSize / Math.max(img.width, img.height));
    }
    return img;
}

// ==========================================
// ROUNDED BUTTON HELPER (Qt-style)
// ==========================================
// Phaser Rectangle KHÔNG support border-radius. Graphics.fillRoundedRect có bo góc nhưng KHÔNG
// interactive. Helper này combo: Graphics (visual bo góc) + Rectangle invisible (bắt event).
// Style mặc định theo Qt theme của AH3 Hub (04_ui/qt/theme.py): radius 4-6, hover sang màu lighter.
//
// Usage:
//   let btn = createRoundedButton(scene, x, y, w, h, label, {
//     bgColor: 0x4db6ac,        // Default: teal Qt primary
//     bgHover: 0x5ec4ba,         // Default: teal Qt primary_hover
//     borderColor: 0x5ec4ba,     // Default: same as bgHover
//     radius: 6,                 // Default: 6 (Qt SIZING.border_radius_lg)
//     fontSize: '20px',          // Default: '20px'
//     fontColor: '#ffffff',       // Default: white
//     onClick: () => {...}       // Required
//   });
//
// Returns: { hit, gfx, txt, destroy() } — hit là Rectangle invisible, gfx là Graphics, txt là Text.
function createRoundedButton(scene, x, y, w, h, label, opts) {
    opts = opts || {};
    const bgColor = opts.bgColor !== undefined ? opts.bgColor : 0x4db6ac;
    const bgHover = opts.bgHover !== undefined ? opts.bgHover : 0x5ec4ba;
    const borderColor = opts.borderColor !== undefined ? opts.borderColor : bgHover;
    const radius = opts.radius !== undefined ? opts.radius : 6;
    const fontSize = opts.fontSize || '20px';
    const fontColor = opts.fontColor || '#ffffff';
    const fontStyle = opts.fontStyle || 'bold';
    const depth = opts.depth !== undefined ? opts.depth : 0;

    // Graphics layer cho visual bo góc
    let gfx = scene.add.graphics().setDepth(depth);
    let drawBg = (fillColor) => {
        gfx.clear();
        gfx.fillStyle(fillColor, 1);
        gfx.lineStyle(1, borderColor, 0.9);
        gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
        gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
    };
    drawBg(bgColor);

    // Text layer
    let txt = scene.add.text(x, y, label, {
        fontFamily: opts.fontFamily || FONT_MAIN,
        fontSize: fontSize,
        fill: fontColor,
        fontStyle: fontStyle
    }).setOrigin(0.5).setDepth(depth + 1);

    // Hit area invisible (bắt event)
    let hit = scene.add.rectangle(x, y, w, h, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(depth + 2);

    hit.on('pointerover', () => drawBg(bgHover));
    hit.on('pointerout', () => drawBg(bgColor));
    hit.on('pointerdown', () => {
        // Press feedback: 1 frame dịch scắc xuống nhẹ
        txt.setY(y + 1);
        scene.time.delayedCall(80, () => txt.setY(y));
        if (opts.onClick) opts.onClick();
    });

    return {
        hit: hit,
        gfx: gfx,
        txt: txt,
        destroy: function () {
            hit.destroy();
            gfx.destroy();
            txt.destroy();
        }
    };
}

Phaser.Scene.prototype.showInstructionPopup = function (title, lines, onStart) {
    // BUG-FIX (2026-05-16): All popup elements at depth 100 to render ON TOP of any scene layers
    // (clouds=1, buildings=2, ground=3, characters=5-6, obstacles=10, HUD=20). Popup must be modal-level.
    // MIGRATION (2026-05-17 v7): Migrate "ĐÃ HIỂU - CHIẾN!" bắng sang createRoundedButton (Qt-style bo góc).
    // Shared helper này được dùng bởi 4 màn (M1, M1.5, M2, M4) → fix 1 chỗ, tác động 4 màn.
    const POPUP_DEPTH = 100;

    let overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.8).setInteractive().setDepth(POPUP_DEPTH);
    let box = this.add.rectangle(640, 360, 850, 450, COLORS.bgMedium.num, 0.85).setStrokeStyle(4, COLORS.warning.num).setDepth(POPUP_DEPTH);

    let t = this.add.text(640, 200, title, { fontFamily: FONT_TITLE, fontSize: '32px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5).setDepth(POPUP_DEPTH);
    let d = this.add.text(640, 320, lines.join('\n'), { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textPrimary.hex, align: 'left', lineSpacing: 15 }).setOrigin(0.5).setDepth(POPUP_DEPTH);

    // CTA bo góc Qt-style (radius 8, success green, hover lighter, press feedback)
    let btnStart = createRoundedButton(this, 640, 480, 300, 60, 'ĐÃ HIỂU - CHIẾN!', {
        bgColor: COLORS.success.num,
        bgHover: 0x40d97f,
        borderColor: COLORS.textPrimary.num,
        radius: 8,
        fontSize: '24px',
        fontStyle: 'bold',
        depth: POPUP_DEPTH,
        onClick: () => {
            overlay.destroy();
            box.destroy();
            t.destroy();
            d.destroy();
            btnStart.destroy();
            if (onStart) onStart();
        }
    });
};

// ==========================================
// BOOT SCENE - Pre-load Base64 Assets
// Phaser's this.load.image() does NOT support data URIs.
// Must use this.textures.addBase64() instead.
// ==========================================
class SceneBoot extends Phaser.Scene {
    constructor() { super('SceneBoot'); }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.bgMedium.hex);
        this.add.text(640, 340, 'THE ARCHI-HELL', { fontFamily: FONT_TITLE, fontSize: '64px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let statusText = this.add.text(640, 400, 'Loading assets...', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.strokeLight.hex }).setOrigin(0.5);

        if (typeof GAME_ASSETS === 'undefined' || GAME_ASSETS === null) {
            statusText.setText('No assets bundle found. Starting...');
            this.time.delayedCall(500, () => this.scene.start('SceneIntro'));
            return;
        }

        let keys = Object.keys(GAME_ASSETS);
        let loaded = 0;
        let total = keys.length;

        if (total === 0) {
            this.scene.start('SceneIntro');
            return;
        }

        let checkReady = () => {
            loaded++;
            statusText.setText('Loading assets... (' + loaded + '/' + total + ')');
            if (loaded >= total) {
                statusText.setText('Loading fonts...');
                // FONT-FIX (2026-05-17): EXPLICIT load từng weight thay vì document.fonts.ready (lazy-load race).
                // document.fonts.ready resolve ngay vì không có font nào đang trong queue download.
                // Phaser Canvas render frozen → text bị stuck với Segoe UI fallback dù font có load sau.
                // Giải pháp: explicit document.fonts.load(spec) + timeout 3s fallback nếu mạng chậm.
                let startNext = () => {
                    statusText.setText('Ready!');
                    this.time.delayedCall(200, () => this.scene.start('SceneIntro'));
                };
                if (document.fonts && document.fonts.load) {
                    const fontPromises = [
                        document.fonts.load('400 16px "Be Vietnam Pro"'),
                        document.fonts.load('500 16px "Be Vietnam Pro"'),
                        document.fonts.load('600 16px "Be Vietnam Pro"'),
                        document.fonts.load('700 16px "Be Vietnam Pro"'),
                        document.fonts.load('900 16px "Be Vietnam Pro"'),
                        document.fonts.load('700 16px "JetBrains Mono"'),
                        document.fonts.load('400 16px "VT323"')
                    ];
                    const timeout = new Promise(r => setTimeout(r, 3000));
                    Promise.race([Promise.all(fontPromises), timeout])
                        .then(startNext).catch(startNext);
                } else {
                    startNext(); // Old browser fallback
                }
            }
        };

        this.textures.on('addtexture', checkReady);

        keys.forEach(key => {
            let uri = GAME_ASSETS[key];
            if (uri.startsWith('data:audio')) {
                if (this.cache.audio.exists(key)) {
                    checkReady();
                } else {
                    fetch(uri)
                        .then(res => res.arrayBuffer())
                        .then(buffer => this.sound.context.decodeAudioData(buffer))
                        .then(decodedData => {
                            this.cache.audio.add(key, decodedData);
                            checkReady();
                        }).catch(err => {
                            console.error('Audio load error:', err);
                            checkReady(); // Skip error
                        });
                }
            } else {
                // Image
                if (this.textures.exists(key)) {
                    checkReady();
                } else {
                    this.textures.addBase64(key, uri);
                }
            }
        });
    }
}

// ==========================================
// MÀN GIỚI THIỆU (INTRO SCENE)
// ==========================================
class SceneIntro extends Phaser.Scene {
    constructor() { super('SceneIntro'); }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.bgMedium.hex);

        this.add.text(640, 80, 'THE ARCHI-HELL', { fontFamily: FONT_TITLE, fontSize: '48px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 6 }).setOrigin(0.5);
        this.add.text(640, 130, 'MÀN 1: GÓC LÀM VIỆC LÚC 3 GIỜ SÁNG', { fontFamily: FONT_TITLE, fontSize: '24px', fill: COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);

        // LAYOUT-OVERHAUL (2026-05-17 v7): Box height 250→270 (+20px) cho text breathing room tốt hơn.
        // V5→26 (Range bớt 70 từ 320), v7 +20 cộng lại thành 270, ROOK chuẩn cho 7 dòng text + padding.
        let box = this.add.rectangle(640, 280, 900, 270, COLORS.bgMedium.num, 0.82);
        box.setStrokeStyle(2, COLORS.warning.num);

        let instructions = [
            "📜 HƯỚNG DẪN SINH TỒN (HOÀN THÀNH TRONG 45 GIÂY!):",
            "",
            "🖱️ GIAI ĐOẠN 1: MULTI-TASKING LIÊN TỤC",
            "   -> Liên tục luân phiên giữa BẤM NÚT LỆNH 3DS MAX (Màu cam) và GÕ PHÍM (Audition).",
            "   -> Phải căn thời gian! Gõ đúng: Tăng tiến độ. Chậm trễ / Gõ sai: Bị cộng Stress!",
            "☕ UỐNG CÀ PHÊ: Thanh Cà phê cạn = Stress tăng. Nhớ bấm Cốc Cà phê ở góc phải!",
            "⚠️ BẪY BẢN QUYỀN: Bị quét IP thì chọn 'DÙNG THỬ', tuyệt đối không bấm Edu.",
            "🔥 GIAI ĐOẠN 2 (95%): Cứu File khi bị Crash & BẤM NÚT RENDER CUỐI CÙNG!"
        ];

        this.add.text(640, 280, instructions.join('\n'), { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textSecondary.hex, align: 'left', lineSpacing: 10 }).setOrigin(0.5);

        // CTA chính — dùng helper createRoundedButton (Qt-style bo góc).
        // Màu: success xanh lá (theo COLORS.success #2ecc71) — giữ nguyên tông game, không đổi sang teal Qt
        // vì context game energetic hơn Qt dialog nội bộ.
        createRoundedButton(this, 640, 475, 350, 70, 'START', {
            bgColor: COLORS.success.num,
            bgHover: 0x40d97f, // success lighter
            borderColor: COLORS.textPrimary.num,
            radius: 8,
            fontFamily: FONT_TITLE,
            fontSize: '48px',
            fontStyle: 'bold',
            onClick: () => {
                GLOBAL_STATS.progress = 0;
                GLOBAL_STATS.stressLevel = 50;
                GLOBAL_STATS.coffeeLevel = 100;
                GLOBAL_STATS.deadlineTime = 5 * 3600 - 1;
                GLOBAL_STATS.hasEduWatermark = false;
                GLOBAL_STATS.usedPinterest = false;
                this.scene.start('Scene1');
            }
        });

        // --- NHẢY NHANH CÁC MÀN (DEV MODE / QUICK PLAY) ---
        // v6: text y=535, jump btn y=575 (lên 25-30px so với v5). Dùng helper rơunded button với navy theme.
        this.add.text(640, 535, '-- ĐI TẮT ĐẾN CÁC MÀN TIẾP THEO --', { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.textMuted.hex }).setOrigin(0.5);

        // Jump button helper gọn (giữ navy theme như cũ, chỉ bo góc radius=4)
        // Hover: 0x4a6480 = navy lighter (sang hơn bgLightAlt #34495e ~30%). bgLight #2c3e50 tối hơn nên không dùng cho hover.
        let createJumpBtn = (x, text, targetScene, setupStats) => {
            createRoundedButton(this, x, 575, 230, 34, text, {
                bgColor: COLORS.bgLightAlt.num,       // navy #34495e
                bgHover: 0x4a6480,                      // navy lighter (custom — không có trong palette)
                borderColor: COLORS.textMuted.num,
                radius: 4,
                fontFamily: FONT_MAIN,
                fontSize: '16px',
                fontStyle: '800',
                fontColor: COLORS.textPrimary.hex,
                onClick: () => {
                    GLOBAL_STATS.progress = 0;
                    GLOBAL_STATS.stressLevel = 50;
                    GLOBAL_STATS.hasEduWatermark = false;
                    GLOBAL_STATS.usedPinterest = false;
                    if (setupStats) setupStats();
                    this.scene.start(targetScene);
                }
            });
        };

        createJumpBtn(140, 'Màn 1 (Render)', 'Scene1', () => { });
        createJumpBtn(390, 'Màn 1.5 (Tẩy Xóa)', 'SceneCloneStamp', () => { GLOBAL_STATS.hasEduWatermark = true; });
        createJumpBtn(640, 'Màn 2 (Họp Khách)', 'Scene2', () => { });
        createJumpBtn(890, 'Màn 3 (Đòi Nợ)', 'SceneDebtRunner', () => { });
        createJumpBtn(1140, 'Màn 4 (Rage Mode)', 'SceneRageMode', () => { });

        // --- FOOTER CREDIT ARCHIH3 (style bo tròn như Qt Python dialog) ---
        // LAYOUT-OVERHAUL (2026-05-17 v6): Footer y=615-690, padding-bottom 30px (cũ v5 = 14px).
        // Style: rounded panel dùng Graphics.fillRoundedRect(radius=8) — giống base_dialog.py Qt theme.

        // Separator line trên footer (gạch ngang mờ tách biệt với jump buttons)
        let sep = this.add.graphics();
        sep.lineStyle(1, COLORS.strokeMid.num, 0.5);
        sep.lineBetween(440, 615, 840, 615);

        // Footer panel bo tròn (Qt-style dark card, opacity 0.6 để hiểu là secondary content)
        let footerGfx = this.add.graphics();
        footerGfx.fillStyle(COLORS.bgDark.num, 0.6);
        footerGfx.lineStyle(1, COLORS.strokeDark.num, 0.8);
        footerGfx.fillRoundedRect(440, 630, 400, 60, 8);
        footerGfx.strokeRoundedRect(440, 630, 400, 60, 8);

        // Logo ArchiH3 bên trái (40×40, fallback vẽ badge "H3" nếu PNG chưa load được)
        if (this.textures.exists('archih3_logo')) {
            scaleImageToFit(this.add.image(475, 660, 'archih3_logo'), 40).setOrigin(0.5, 0.5);
        } else {
            // Fallback Graphics badge nếu logo PNG chưa có trong assets.js (chưa chạy make_assets.py)
            let fb = this.add.graphics();
            fb.fillStyle(COLORS.danger.num, 1);
            fb.fillRoundedRect(457, 642, 36, 36, 6);
            this.add.text(475, 660, 'H3', { fontFamily: FONT_TITLE, fontSize: '18px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        }

        // Brand name + tagline bên phải logo (origin left, 3 dòng xếp dọc)
        this.add.text(510, 645, 'ArchiH3 Studio', { fontFamily: FONT_TITLE, fontSize: '16px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(510, 663, 'archih3.com  •  AH3 Hub v1.8', { fontFamily: FONT_MAIN, fontSize: '13px', fill: COLORS.textMuted.hex }).setOrigin(0, 0.5);
        this.add.text(510, 679, '"Game cho KTS, mới chuẩn chứ"', { fontFamily: FONT_MAIN, fontSize: '12px', fill: COLORS.textMuted.hex, fontStyle: 'italic' }).setOrigin(0, 0.5);
    }
}

// ==========================================
// MÀN 1: GAMEPLAY
// ==========================================
class Scene1 extends Phaser.Scene {
    constructor() { super('Scene1'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        // Only attempt file load as fallback (e.g. local dev server)
        if (!this.textures.exists('bg_scene1')) {
            this.load.image('bg_scene1', './assets/bg_scene1.png');
        }
    }

    create() {
        // --- BACKGROUND (starts grayscale/dark = "unrendered" look) ---
        this.bgImage = this.add.image(640, 360, 'bg_scene1');
        let scale = 1.5;
        if (this.bgImage.width > 32) scale = Math.max(1280 / this.bgImage.width, 720 / this.bgImage.height);
        this.bgImage.setScale(scale);
        this.bgImage.setTint(COLORS.strokeMid.num); // Grayscale/dark tint = unrendered

        // --- RENDER GRID (bucket rendering visualization) ---
        this.createRenderGrid();

        // Lớp phủ tối nhẹ phía trên grid để UI đọc được
        this.uiOverlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.2);

        this.createHUD();
        this.createMaxWindow();

        // --- CỐC CAFE UI ---
        // LAYOUT-FIX (2026-05-17): Refactor từ 200x80 text-only → 90x90 vuông icon + text dưới.
        // Cũ: (1150, 620) 200x80 → đè 15px lên Progress Bar (y=645) + cách bottom maxWindow chỉ 20px.
        // Mới: (1220, 605) 90x90 → tránh hoàn toàn maxWindow (bottom y=600) và Progress Bar (top y=645).
        // Icon ui_coffee.png ở giữa-trên, text "UỐNG CAFE" ở giữa-dưới.
        this.coffeeBtn = this.add.rectangle(1220, 605, 90, 90, COLORS.bgLight.num, 0.9).setInteractive();
        this.coffeeBtn.setStrokeStyle(2, COLORS.purple.num);
        this.coffeeIcon = scaleImageToFit(this.add.image(1220, 590, 'ui_coffee'), 50);
        this.coffeeTxt = this.add.text(1220, 635, 'UỐNG CAFE', { fontFamily: FONT_MAIN, fontSize: '13px', fill: COLORS.textPrimary.hex, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
        this.coffeeCooldown = false;

        this.coffeeBtn.on('pointerdown', () => {
            if (!this.coffeeCooldown && !this.eventActive) {
                GLOBAL_STATS.coffeeLevel += 40;
                if (GLOBAL_STATS.coffeeLevel > 100) GLOBAL_STATS.coffeeLevel = 100;

                this.coffeeCooldown = true;
                this.coffeeBtn.setFillStyle(COLORS.textMuted.num);
                this.coffeeIcon.setAlpha(0.4); // Dim icon khi đang pha
                this.coffeeTxt.setText('ĐANG PHA...');

                this.time.delayedCall(5000, () => {
                    this.coffeeCooldown = false;
                    this.coffeeBtn.setFillStyle(COLORS.bgLight.num);
                    this.coffeeIcon.setAlpha(1.0);
                    this.coffeeTxt.setText('UỐNG CAFE');
                });
                this.updateUI();
            }
        });

        this.eventActive = false;
        this.crashTriggered = false;
        this.isGameOver = false;
        this.auditionBound = false;
        this.arrowLevel = 3; // BUG-008: Reset on scene restart

        this.startToolMode();

        // Timers
        this.time.addEvent({ delay: 1000, callback: this.onTick, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 12000, callback: this.triggerLicenseAudit, callbackScope: this, loop: true });
    }

    createHUD() {
        // Khung UI tổng (Top Left)
        // Bỏ hudBox1 (Khung bao quanh Deadline) để layout thoáng hơn
        this.add.text(45, 35, 'DEADLINE:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' });
        // Nới rộng chiều ngang (300 -> 360) và chiều cao (60 -> 80) để chứa đủ font pixel to
        this.add.rectangle(200, 95, 360, 80, COLORS.bgDark.num, 0.7).setStrokeStyle(2, COLORS.danger.num);
        this.txtDeadline = this.add.text(200, 95, '04:59:59', { fontFamily: FONT_TITLE, fontSize: '64px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 2 }).setOrigin(0.5);

        // Khung UI tổng (Top Right)
        let rightX = 1080;
        // Bỏ hudBox2 (Khung bao quanh Stats) để layout thoáng hơn

        let startY = 45;
        this.add.text(rightX - 150, startY, 'STRESS:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightX + 50, startY, 180, 16, COLORS.bgDark.num).setStrokeStyle(1, COLORS.strokeMid.num);
        this.barStress = this.add.rectangle(rightX - 40, startY, 0, 16, COLORS.danger.num).setOrigin(0, 0.5);
        this.txtStress = this.add.text(rightX + 150, startY, '50%', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        startY += 35;
        this.add.text(rightX - 150, startY, 'TÀI KHOẢN:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.txtMoney = this.add.text(rightX + 150, startY, `-150.000 VNĐ`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        startY += 35;
        this.add.text(rightX - 150, startY, 'CÀ PHÊ:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightX + 50, startY, 180, 16, COLORS.bgDark.num).setStrokeStyle(1, COLORS.strokeMid.num);
        this.barCoffee = this.add.rectangle(rightX - 40, startY, 180, 16, COLORS.purple.num).setOrigin(0, 0.5);
        this.txtCoffee = this.add.text(rightX + 150, startY, '100%', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        // Progress Bar (Bottom Center)
        // Bỏ progBox (Khung bao quanh Tiến độ Render) để layout thoáng hơn
        this.add.text(210, 660, 'TIẾN ĐỘ RENDER:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(640, 690, 860, 24, COLORS.bgDark.num).setStrokeStyle(1, COLORS.strokeMid.num);
        this.barProgress = this.add.rectangle(210, 690, 0, 24, COLORS.success.num).setOrigin(0, 0.5);
    }

    createMaxWindow() {
        // Cửa sổ 3ds Max giả lập
        this.maxWindow = this.add.container(640, 380);

        let winWidth = 720;
        let winHeight = 440;

        // Main window bg (semi-transparent)
        let bg = this.add.rectangle(0, 0, winWidth, winHeight, COLORS.strokeDark.num, 0.8).setStrokeStyle(2, COLORS.bgMedium.num);

        // Title bar
        let titleBar = this.add.rectangle(0, -winHeight / 2 + 15, winWidth, 30, COLORS.bgMedium.num);
        let titleTxt = this.add.text(-winWidth / 2 + 10, -winHeight / 2 + 15, 'Ao-Tu-Đét 3D Mắc 2026 - Render_Cuoi_Cung_Chot_V9.max', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.strokeLight.hex }).setOrigin(0, 0.5);

        // Window buttons (fake)
        let btnMin = this.add.text(winWidth / 2 - 80, -winHeight / 2 + 15, '—', { fontFamily: FONT_MAIN, fontSize: '18px', fill: COLORS.strokeLight.hex, fontStyle: 'bold' }).setOrigin(0.5);
        let btnMax = this.add.text(winWidth / 2 - 45, -winHeight / 2 + 15, '☐', { fontFamily: FONT_MAIN, fontSize: '18px', fill: COLORS.strokeLight.hex, fontStyle: 'bold' }).setOrigin(0.5);
        
        // Nút Close nền đỏ Windows
        let closeBg = this.add.rectangle(winWidth / 2 - 15, -winHeight / 2 + 15, 30, 30, COLORS.danger.num);
        let closeTxt = this.add.text(winWidth / 2 - 15, -winHeight / 2 + 15, '✕', { fontFamily: FONT_MAIN, fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        this.maxWindow.add([bg, titleBar, titleTxt, btnMin, btnMax, closeBg, closeTxt]);

        // Tạo lưới nút lệnh (Toolbar)
        let toolNames = [
            'Extrude', 'Chamfer', 'TurboSmooth', 'ProBoolean',
            'Symmetry', 'Attach', 'Ctrl + Z', 'Ctrl + S',
            'Test Vi-Rách', 'Cô-Hồn-Na', 'AI Denoise', 'Render (F9)'
        ];

        this.toolBtns = [];
        this.activeToolIndex = -1;

        let startX = -245;
        let startY = -120;
        let spacingX = 163;
        let spacingY = 100;

        for (let i = 0; i < 12; i++) {
            let row = Math.floor(i / 4);
            let col = i % 4;
            let bx = startX + col * spacingX;
            let by = startY + row * spacingY;

            // Nút kiểu UI phần mềm
            let btnBg = this.add.rectangle(bx, by, 150, 80, COLORS.strokeDark.num, 0.8).setInteractive();
            btnBg.setStrokeStyle(1, COLORS.strokeMid.num);

            let txt = this.add.text(bx, by, toolNames[i], { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.strokeLight.hex, fontStyle: 'bold', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5);

            this.toolBtns.push({ bg: btnBg, txt: txt, index: i });
            this.maxWindow.add([btnBg, txt]);

            btnBg.on('pointerover', () => { if (this.activeToolIndex !== i) btnBg.setFillStyle(COLORS.strokeMid.num); });
            btnBg.on('pointerout', () => { if (this.activeToolIndex !== i) btnBg.setFillStyle(COLORS.strokeDark.num); });
            btnBg.on('pointerdown', () => this.handleToolClick(i));
        }

        // Tạo thanh thời gian cho Minigame (Time Bar)
        this.maxWindow.add(this.add.text(0, 160, 'TIME LIMIT', { fontFamily: FONT_MAIN, fontSize: '13px', fill: COLORS.strokeLight.hex }).setOrigin(0.5));
        this.miniTimerBg = this.add.rectangle(0, 180, 500, 15, COLORS.bgDark.num).setStrokeStyle(1, COLORS.strokeMid.num);
        this.miniTimerBar = this.add.rectangle(-250, 180, 500, 15, COLORS.info.num).setOrigin(0, 0.5);
        this.maxWindow.add([this.miniTimerBg, this.miniTimerBar]);

        this.miniTimeMax = 0;
        this.miniTimeLeft = 0;
        this.miniTimerActive = false;
        this.consecutiveClicks = 0;
    }

    createRenderGrid() {
        // Create a grid of dark tiles covering the background
        // Simulates V-Ray bucket rendering - tiles disappear as progress builds
        this.gridTiles = [];
        let cols = 16, rows = 8;
        let tileW = 1280 / cols; // 80px
        let tileH = 720 / rows;  // 90px

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let x = c * tileW + tileW / 2;
                let y = r * tileH + tileH / 2;
                let tile = this.add.rectangle(x, y, tileW - 1, tileH - 1, COLORS.bgDark.num, 0.85);
                tile.gridCol = c;
                tile.gridRow = r;
                this.gridTiles.push(tile);
            }
        }

        // Shuffle for random reveal order
        Phaser.Utils.Array.Shuffle(this.gridTiles);
        this.tilesRevealed = 0;
    }

    revealTiles(count) {
        // Reveal N tiles with pop animation (simulates render buckets completing)
        let revealed = 0;
        for (let i = this.tilesRevealed; i < this.gridTiles.length && revealed < count; i++) {
            let tile = this.gridTiles[i];
            if (tile && tile.alpha > 0) {
                this.tweens.add({
                    targets: tile,
                    alpha: 0,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 300,
                    ease: 'Back.easeIn',
                    delay: revealed * 80,
                    onComplete: () => tile.setVisible(false)
                });
                revealed++;
                this.tilesRevealed++;
            }
        }
    }

    burstRevealAllTiles() {
        // Cascade-reveal ALL remaining tiles during Final Render
        let remaining = [];
        for (let i = this.tilesRevealed; i < this.gridTiles.length; i++) {
            let tile = this.gridTiles[i];
            if (tile && tile.visible) remaining.push(tile);
        }

        // Sort by position for a sweep effect (top-left to bottom-right)
        remaining.sort((a, b) => (a.gridRow * 16 + a.gridCol) - (b.gridRow * 16 + b.gridCol));

        remaining.forEach((tile, idx) => {
            this.tweens.add({
                targets: tile,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 200,
                ease: 'Power2',
                delay: idx * 20, // Staggered cascade (20ms per tile)
                onComplete: () => tile.setVisible(false)
            });
        });
    }

    activateRandomTool() {
        this.toolBtns.forEach((btn, i) => {
            btn.bg.setFillStyle(COLORS.strokeDark.num);
            btn.bg.setStrokeStyle(1, COLORS.strokeMid.num);
            btn.txt.setColor(COLORS.strokeLight.hex);
            btn.txt.setScale(1);
        });

        let newIndex;
        do { newIndex = Phaser.Math.Between(0, 11); } while (newIndex === this.activeToolIndex);
        this.activeToolIndex = newIndex;

        let activeBtn = this.toolBtns[this.activeToolIndex];
        activeBtn.bg.setFillStyle(COLORS.warning.num); // Màu cam vàng kiểu select trong Max
        activeBtn.bg.setStrokeStyle(2, COLORS.textPrimary.num);
        activeBtn.txt.setColor(COLORS.textPrimary.hex);

        if (this.toolTween) this.toolTween.stop();
        this.toolTween = this.tweens.add({
            targets: activeBtn.txt,
            scaleX: 1.1, scaleY: 1.1,
            duration: 200, yoyo: true, repeat: -1
        });

        // Đặt Timer cho mỗi click
        this.miniTimeMax = 4000;
        this.miniTimeLeft = this.miniTimeMax;
        this.miniTimerActive = true;
    }

    handleToolClick(index) {
        if (this.eventActive || this.gamePhase !== 1) return;

        let realX = 640 + this.toolBtns[index].bg.x;
        let realY = 380 + this.toolBtns[index].bg.y;

        if (index === this.activeToolIndex) {
            playSound(this, 'sfx_click');
            GLOBAL_STATS.progress += 3.0;
            this.consecutiveClicks++;
            this.showMiniFeedback(realX, realY - 40, '+3%', COLORS.success.hex);
            this.revealTiles(3); // Reveal 3 render buckets
            this.updateUI();

            if (GLOBAL_STATS.progress >= 95 && !this.crashTriggered) {
                this.crashTriggered = true;
                this.miniTimerActive = false;
                this.triggerCrashEvent();
            } else if (this.consecutiveClicks >= 3) {
                this.startAuditionMode();
            } else {
                this.activateRandomTool();
            }
        } else {
            playSound(this, 'sfx_error');
            GLOBAL_STATS.stressLevel += 1;
            this.cameras.main.shake(100, 0.005);
            this.showMiniFeedback(realX, realY - 40, 'SAI LỆNH!\n+1% Stress', COLORS.danger.hex);
            this.updateUI();
        }
    }

    startToolMode() {
        this.gamePhase = 1;
        this.consecutiveClicks = 0;

        if (this.auditionTitle) this.auditionTitle.setVisible(false);
        if (this.auditionDesc) this.auditionDesc.setVisible(false);
        if (this.arrowContainer) this.arrowContainer.setVisible(false);

        this.toolBtns.forEach(b => { b.bg.setVisible(true); b.txt.setVisible(true); });

        this.activateRandomTool();
    }

    // ================= GIAI ĐOẠN 2: AUDITION MODE =================
    startAuditionMode() {
        this.gamePhase = 2;

        this.toolBtns.forEach(b => { b.bg.setVisible(false); b.txt.setVisible(false); });

        if (!this.auditionTitle) {
            this.auditionTitle = this.add.text(0, -100, '🔥 RAM ĐÃ BỐC KHÓI (99%) 🔥', { fontFamily: FONT_MAIN, fontSize: '32px', fill: COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);
            this.auditionDesc = this.add.text(0, -50, 'Tràn RAM! Gõ phím liên tục để tắt bớt 50 tab Cốc Cốc & cứu file:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.strokeLight.hex }).setOrigin(0.5);
            this.arrowContainer = this.add.container(0, 40);
            this.maxWindow.add([this.auditionTitle, this.auditionDesc, this.arrowContainer]);
        } else {
            this.auditionTitle.setVisible(true);
            this.auditionDesc.setVisible(true);
            this.arrowContainer.setVisible(true);
        }

        if (!this.arrowLevel) this.arrowLevel = 3;
        this.generateArrowSequence();

        if (!this.auditionBound) {
            this.input.keyboard.on('keydown', (event) => this.handleAuditionKey(event));
            this.auditionBound = true;
        }
    }

    generateArrowSequence() {
        this.arrowSequence = [];
        this.currentArrowIndex = 0;
        this.arrowSprites = [];
        this.arrowContainer.removeAll(true);

        let startX = -((this.arrowLevel * 65) / 2);
        let arrows = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
        let chars = { 'LEFT': '⬅️', 'UP': '⬆️', 'RIGHT': '➡️', 'DOWN': '⬇️' };

        for (let i = 0; i < this.arrowLevel; i++) {
            let dir = Phaser.Utils.Array.GetRandom(arrows);
            this.arrowSequence.push(dir);
            let box = this.add.rectangle(startX + i * 65, 0, 50, 50, COLORS.bgMedium.num).setStrokeStyle(2, COLORS.strokeMid.num);
            let txt = this.add.text(startX + i * 65, 0, chars[dir], { fontSize: '32px' }).setOrigin(0.5);
            this.arrowSprites.push({ box: box, txt: txt });
            this.arrowContainer.add([box, txt]);
        }

        this.arrowSequence.push('SPACE');
        let spaceBox = this.add.rectangle(startX + this.arrowLevel * 65 + 60, 0, 100, 50, COLORS.bgMedium.num).setStrokeStyle(2, COLORS.strokeMid.num);
        let spaceTxt = this.add.text(startX + this.arrowLevel * 65 + 60, 0, 'SPACE', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        this.arrowSprites.push({ box: spaceBox, txt: spaceTxt });
        this.arrowContainer.add([spaceBox, spaceTxt]);

        // Thời gian Audit giảm dần (Nhanh dần)
        this.miniTimeMax = Math.max(3000, 7500 - this.arrowLevel * 400);
        this.miniTimeLeft = this.miniTimeMax;
        this.miniTimerActive = true;
    }

    handleAuditionKey(event) {
        if (this.eventActive || this.gamePhase !== 2) return;

        let keyMap = { 37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN', 32: 'SPACE' };
        let pressedKey = keyMap[event.keyCode];
        if (!pressedKey) return;

        let expectedKey = this.arrowSequence[this.currentArrowIndex];
        let currentSprite = this.arrowSprites[this.currentArrowIndex];

        if (pressedKey === expectedKey) {
            playSound(this, 'sfx_click');
            currentSprite.box.setFillStyle(COLORS.success.num);
            currentSprite.box.setStrokeStyle(2, COLORS.textPrimary.num);

            this.currentArrowIndex++;

            if (this.currentArrowIndex >= this.arrowSequence.length) {
                this.showMiniFeedback(640, 480, 'PERFECT! +8%', COLORS.warning.hex, 40);
                GLOBAL_STATS.progress += 8;
                this.revealTiles(8); // Reveal 8 render buckets

                if (GLOBAL_STATS.progress >= 95 && !this.crashTriggered) {
                    this.crashTriggered = true;
                    this.miniTimerActive = false; // STOP TIMER
                    this.triggerCrashEvent();
                }
                this.updateUI();

                if (GLOBAL_STATS.progress < 95) {
                    if (this.arrowLevel < 5) this.arrowLevel++;
                    this.startToolMode(); // Trở lại Tool mode
                }
            }
        } else {
            playSound(this, 'sfx_error');
            this.showMiniFeedback(640, 480, 'SEQUENCE FAILED!\n+3% Stress', COLORS.danger.hex, 30);
            GLOBAL_STATS.stressLevel += 3;
            this.cameras.main.shake(100, 0.015);
            this.updateUI();
            this.generateArrowSequence();
        }
    }

    // ================= GIAI ĐOẠN 3: FINAL RENDER =================
    startFinalRenderPhase() {
        this.gamePhase = 3;
        this.miniTimerActive = false;
        this.eventActive = false; // Mở lại để click

        this.toolBtns.forEach(b => { b.bg.setVisible(false); b.txt.setVisible(false); });
        if (this.auditionTitle) this.auditionTitle.setVisible(false);
        if (this.auditionDesc) this.auditionDesc.setVisible(false);
        if (this.arrowContainer) this.arrowContainer.setVisible(false);
        if (this.miniTimerBg) this.miniTimerBg.setVisible(false);
        if (this.miniTimerBar) this.miniTimerBar.setVisible(false);

        this.btnBigRender = this.add.rectangle(0, 0, 350, 100, COLORS.success.num).setInteractive();
        this.btnBigRender.setStrokeStyle(4, COLORS.textPrimary.num);
        this.txtBigRender = this.add.text(0, 0, '⚡ RENDER FINAL ⚡', { fontFamily: FONT_MAIN, fontSize: '32px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        this.maxWindow.add([this.btnBigRender, this.txtBigRender]);

        this.tweens.add({
            targets: [this.btnBigRender, this.txtBigRender],
            scaleX: 1.1, scaleY: 1.1,
            duration: 400, yoyo: true, repeat: -1
        });

        this.btnBigRender.on('pointerdown', () => this.executeFinalRender());
    }

    executeFinalRender() {
        if (this.gamePhase !== 3) return;
        this.gamePhase = 4;
        this.eventActive = true;

        this.btnBigRender.destroy();
        this.txtBigRender.destroy();

        let msg = this.add.text(0, -30, 'Vi-Rách: Rendering image...', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.success.hex, fontStyle: 'bold' }).setOrigin(0.5);
        let renderBg = this.add.rectangle(0, 20, 500, 30, COLORS.bgDark.num).setStrokeStyle(2, COLORS.strokeMid.num);
        let renderBar = this.add.rectangle(-250, 20, 0, 30, COLORS.success.num).setOrigin(0, 0.5);
        this.maxWindow.add([msg, renderBg, renderBar]);

        // Burst reveal remaining tiles during render bar
        this.burstRevealAllTiles();

        this.tweens.add({
            targets: renderBar,
            width: 500,
            duration: 3500,
            ease: 'Linear',
            onUpdate: (tween) => {
                let pct = tween.progress;
                GLOBAL_STATS.progress = 95 + pct * 5;
                this.updateUI();
            },
            onComplete: () => {
                playSound(this, 'sfx_win');
                // Color burst: grayscale → full vibrant color!
                this.tweens.add({
                    targets: this.bgImage,
                    duration: 1500,
                    ease: 'Sine.easeOut',
                    onUpdate: (tw) => {
                        let p = tw.progress;
                        let v = Math.floor(0x55 + (0xFF - 0x55) * p);
                        let tint = (v << 16) | (v << 8) | v;
                        this.bgImage.setTint(tint);
                    },
                    onComplete: () => {
                        this.bgImage.clearTint(); // Full color!
                        this.cameras.main.flash(500, 255, 255, 255);
                    }
                });

                // Fade UI overlay for dramatic reveal
                this.tweens.add({ targets: this.uiOverlay, alpha: 0.05, duration: 1500 });

                this.showFeedback("🎉 HOÀN THÀNH DỰ ÁN! BOOM! 🎉", COLORS.warning.hex);
                this.time.delayedCall(3000, () => {
                    if (GLOBAL_STATS.hasEduWatermark) {
                        this.scene.start('SceneCloneStamp');
                    } else {
                        this.scene.start('Scene2');
                    }
                });
            }
        });
    }

    update(time, delta) {
        if (this.eventActive || !this.miniTimerActive) return;

        this.miniTimeLeft -= delta;

        let pct = Math.max(0, this.miniTimeLeft / this.miniTimeMax);
        this.miniTimerBar.width = pct * 500;

        if (pct > 0.5) this.miniTimerBar.setFillStyle(COLORS.info.num);
        else if (pct > 0.25) this.miniTimerBar.setFillStyle(COLORS.warning.num);
        else this.miniTimerBar.setFillStyle(COLORS.danger.num);

        if (this.miniTimeLeft <= 0) {
            this.miniTimeLeft = 0;
            this.miniTimerActive = false;

            GLOBAL_STATS.stressLevel += 4;
            this.cameras.main.shake(100, 0.01);
            this.showMiniFeedback(640, 560, 'TIME OUT!\n+4% Stress', COLORS.danger.hex, 28);
            this.updateUI();

            if (this.gamePhase === 1) {
                this.activateRandomTool();
            } else if (this.gamePhase === 2) {
                this.generateArrowSequence();
            }
        }
    }

    onTick() {
        if (this.eventActive) return;

        GLOBAL_STATS.coffeeLevel -= 1;
        if (GLOBAL_STATS.coffeeLevel <= 0) {
            GLOBAL_STATS.coffeeLevel = 0;
            GLOBAL_STATS.stressLevel += 5;
        } else {
            GLOBAL_STATS.stressLevel += 1;
        }

        if (GLOBAL_STATS.deadlineTime > 0) GLOBAL_STATS.deadlineTime -= 400;

        this.updateUI();
        this.checkGameover();
    }

    updateUI() {
        this.barProgress.width = Math.max(0, Math.min(860, (GLOBAL_STATS.progress / 100) * 860));
        let pStress = Math.max(0, Math.min(100, GLOBAL_STATS.stressLevel));
        this.barStress.width = (pStress / 100) * 180;
        this.txtStress.setText(`${Math.floor(pStress)}%`);

        let pCoffee = Math.max(0, Math.min(100, GLOBAL_STATS.coffeeLevel));
        this.barCoffee.width = (pCoffee / 100) * 180;
        this.txtCoffee.setText(`${Math.floor(pCoffee)}%`);

        let t = Math.max(0, GLOBAL_STATS.deadlineTime);
        let h = Math.floor(t / 3600);
        let m = Math.floor((t % 3600) / 60);
        let s = t % 60;
        this.txtDeadline.setText(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    checkGameover() {
        if ((GLOBAL_STATS.stressLevel >= 100 || GLOBAL_STATS.deadlineTime <= 0) && !this.isGameOver) {
            this.isGameOver = true;
            this.eventActive = true;
            this.miniTimerActive = false;

            let reason = GLOBAL_STATS.stressLevel >= 100 ? "TRẦM CẢM QUÁ MỨC!" : "CHÁY DEADLINE!";

            // Popup Overlay
            let overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.85).setInteractive();
            // Tăng chiều cao box từ 350 lên 420 và dịch xuống y=370 để chứa đủ 3 nút bấm
            let box = this.add.rectangle(640, 370, 600, 420, COLORS.bgLight.num).setStrokeStyle(4, COLORS.danger.num);

            this.add.text(640, 220, '💀 THẤT BẠI 💀', { fontFamily: FONT_TITLE, fontSize: '64px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
            this.add.text(640, 280, reason, { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);

            // Option 1: Retry
            // BUG-FIX (2026-05-17 v4): Đổi wording "CÀY LẠI TỪ ĐẦU" → "THỬ LẠI MÀN 1" — consistent với
            // các màn khác (Màn 2 "THỬ LẠI MÀN 2", Màn 3 "THỬ LẠI MÀN 3"). Logic không đổi (reset GLOBAL_STATS
            // + scene.start) vì đây thực chất là retry Màn 1 đầu chuỗi, không phải retry toàn game.
            // MIGRATION (2026-05-17 v7): 3 nút đổi sang createRoundedButton (bo góc Qt-style, hover lighter).
            createRoundedButton(this, 640, 340, 450, 50, '🔄 THỬ LẠI MÀN 1', {
                bgColor: COLORS.info.num,
                bgHover: 0x5dade2,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    GLOBAL_STATS.progress = 0;
                    GLOBAL_STATS.stressLevel = 50;
                    GLOBAL_STATS.coffeeLevel = 100;
                    GLOBAL_STATS.deadlineTime = 5 * 3600 - 1;
                    GLOBAL_STATS.hasEduWatermark = false;
                    GLOBAL_STATS.usedPinterest = false;
                    this.scene.start('Scene1');
                }
            });

            // Option 2: Pinterest
            createRoundedButton(this, 640, 410, 450, 50, '🤫 LẤY ẢNH PINTEREST NỘP ĐẠI', {
                bgColor: COLORS.success.num,
                bgHover: 0x40d97f,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    GLOBAL_STATS.usedPinterest = true;
                    this.scene.start('Scene2');
                }
            });

            // Option 3: Rage Quit
            createRoundedButton(this, 640, 480, 450, 50, '🔥 TỨC QUÁ! ĐẬP MÁY NGHỈ VIỆC!', {
                bgColor: COLORS.danger.num,
                bgHover: 0xec7063,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    this.scene.start('SceneRageMode');
                }
            });

        }
    }

    showMiniFeedback(x, y, text, color, size = 24) {
        // LAYOUT-FIX (2026-05-17): setDepth(100) để text feedback luôn render TRÊN maxWindow container.
        // Trước fix: TIME OUT/PERFECT/SAI LỆNH bị maxWindow (container, default depth 0) che mất.
        // Số 100 đủ lớn để vượt mọi UI khác (HUD default 0), không cần 1000 theo Phaser docs.
        let txt = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: `${size}px`, fill: color, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: txt, y: y - 50, alpha: 0, duration: 1000,
            onComplete: () => txt.destroy()
        });
    }

    triggerLicenseAudit() {
        if (this.eventActive || GLOBAL_STATS.progress >= 95) return;
        if (Phaser.Math.Between(1, 100) > 40) return;

        this.eventActive = true;

        let popup = this.add.container(640, 360);
        // Tăng chiều rộng bảng từ 560 lên 780 để text không bị tràn ra ngoài
        let bg = this.add.rectangle(0, 0, 780, 320, COLORS.bgDark.num, 0.95).setStrokeStyle(2, COLORS.danger.num);

        let txtTitle = this.add.text(0, -100, '⚠️ CẢNH BÁO BẢN QUYỀN ⚠️', { fontFamily: FONT_TITLE, fontSize: '40px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let txtSub = this.add.text(0, -40, 'Hãng Ao-Tu-Đét phát hiện bạn xài bản Crack!\nXử lý ngay trong 5 giây nếu không muốn lên phường uống trà:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, align: 'center', lineSpacing: 8 }).setOrigin(0.5);

        // Nới rộng khoảng cách 2 nút
        let btnEdu = this.add.rectangle(-180, 60, 240, 60, COLORS.darkRed.num).setInteractive();
        btnEdu.setStrokeStyle(2, COLORS.textPrimary.num);
        let txtEdu = this.add.text(-180, 60, 'BẢN GIÁO DỤC\n(Dính Watermark)', { fontFamily: FONT_MAIN, fontSize: '22px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let btnTrial = this.add.rectangle(180, 60, 240, 60, COLORS.success.num).setInteractive();
        btnTrial.setStrokeStyle(2, COLORS.textPrimary.num);
        let txtTrial = this.add.text(180, 60, 'DÙNG THỬ\n(30 Days Trial)', { fontFamily: FONT_MAIN, fontSize: '22px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let timer = 5;
        let timerTxt = this.add.text(0, 130, `⏳ ${timer}s`, { fontFamily: FONT_MAIN, fontSize: '32px', fill: COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);

        popup.add([bg, txtTitle, txtSub, btnEdu, txtEdu, btnTrial, txtTrial, timerTxt]);

        let countdown = this.time.addEvent({
            delay: 1000, repeat: 4,
            callback: () => {
                timer--;
                timerTxt.setText(`⏳ ${timer}s`);
                if (timer <= 0) {
                    GLOBAL_STATS.progress -= 30;
                    GLOBAL_STATS.stressLevel += 20;
                    this.showFeedback("HẾT GIỜ! PHẦN MỀM BỊ KHÓA!\nTrừ 30% tiến độ!", COLORS.danger.hex);
                    this.cleanupEvent(popup, countdown);
                }
            }
        });

        btnEdu.on('pointerdown', () => {
            GLOBAL_STATS.stressLevel += 30;
            GLOBAL_STATS.progress -= 20;
            GLOBAL_STATS.hasEduWatermark = true;
            this.showFeedback("NGU NGỐC!\nBản vẽ dính Watermark bản Giáo Dục!\nStress +30%", COLORS.danger.hex);
            this.cleanupEvent(popup, countdown);
        });

        btnTrial.on('pointerdown', () => {
            this.showFeedback("MAY QUÁ!\nGia hạn Trial thành công!", COLORS.success.hex);
            this.cleanupEvent(popup, countdown);
        });
    }

    triggerCrashEvent() {
        this.eventActive = true;

        let popup = this.add.container(640, 360);
        let bg = this.add.rectangle(0, 0, 560, 280, COLORS.bgDark.num, 0.95).setStrokeStyle(2, COLORS.info.num);

        let txtTitle = this.add.text(0, -80, '🔥 3D MẮC ĐÃ LĂN ĐÙNG RA CHẾT 🔥', { fontFamily: FONT_MAIN, fontSize: '32px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let txtSub = this.add.text(0, -30, 'Máy treo cứng! Bấm điên cuồng để kích hoạt Auto-Backup trước khi màn hình xanh:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex }).setOrigin(0.5);

        let btnSave = this.add.rectangle(0, 50, 350, 70, COLORS.warning.num).setInteractive();
        btnSave.setStrokeStyle(2, COLORS.textPrimary.num);
        let txtSave = this.add.text(0, 50, '⚡ CLICK ĐIÊN CUỒNG ⚡\n(Còn 15 click)', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let timer = 5;
        let timerTxt = this.add.text(0, 120, `⏳ ${timer}s`, { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0.5);

        popup.add([bg, txtTitle, txtSub, btnSave, txtSave, timerTxt]);

        let clicksNeeded = 15;
        let countdown = this.time.addEvent({
            delay: 1000, repeat: 4,
            callback: () => {
                timer--;
                timerTxt.setText(`⏳ ${timer}s`);
                if (timer <= 0) {
                    GLOBAL_STATS.progress -= 50;
                    GLOBAL_STATS.stressLevel += 40;
                    this.showFeedback("VĂNG RỒI!\nBay màu 50% công sức. Stress +40%", COLORS.darkRed.hex);
                    this.cleanupEvent(popup, countdown);
                }
            }
        });

        btnSave.on('pointerdown', () => {
            if (clicksNeeded <= 0) return;
            clicksNeeded--;
            txtSave.setText(`⚡ CLICK ĐIÊN CUỒNG ⚡\n(Còn ${clicksNeeded} click)`);

            this.tweens.add({ targets: btnSave, scaleX: 0.95, scaleY: 0.95, duration: 30, yoyo: true });

            if (clicksNeeded <= 0) {
                GLOBAL_STATS.stressLevel += 5;
                this.showFeedback("HÚ HỒN!\nCứu được file Auto-Backup!", COLORS.success.hex);
                this.cleanupEvent(popup, countdown);
            }
        });
    }

    showFeedback(text, color) {
        let fb = this.add.text(640, 180, text, { fontFamily: FONT_MAIN, fontSize: '32px', fill: color, fontStyle: 'bold', align: 'center', backgroundColor: '#111111dd', padding: { x: 20, y: 20 } }).setOrigin(0.5);
        fb.setStroke(COLORS.textPrimary.hex, 2);

        this.tweens.add({
            targets: fb, y: 100, alpha: 0, duration: 3000, ease: 'Power2',
            onComplete: () => { if (fb && fb.active) fb.destroy(); }
        });
    }

    cleanupEvent(popup, countdown) {
        if (countdown) countdown.remove();
        popup.destroy();

        if (this.crashTriggered && GLOBAL_STATS.progress >= 95 && this.gamePhase !== 3 && this.gamePhase !== 4) {
            this.startFinalRenderPhase();
        } else {
            this.eventActive = false;
            this.updateUI();

            if (this.gamePhase === 1) this.activateRandomTool();
            if (this.gamePhase === 2) this.generateArrowSequence();

            this.checkGameover();
        }
    }
}

// ==========================================
// MÀN 2: HỌP HÚT MÁU
// ==========================================
class Scene2 extends Phaser.Scene {
    constructor() { super('Scene2'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        if (!this.textures.exists('bg_scene2')) {
            this.load.image('bg_scene2', './assets/bg_scene2.png');
        }
        if (!this.textures.exists('bg_edu_watermark')) {
            this.load.image('bg_edu_watermark', './assets/bg_edu_watermark.png');
        }
    }

    create() {
        // --- BACKGROUND ---
        let bgKey = 'bg_scene2';
        if (GLOBAL_STATS.hasEduWatermark) bgKey = 'bg_edu_watermark';

        let bg = this.add.image(640, 360, bgKey);
        let scale = 1.5;
        if (bg.width > 32) scale = Math.max(1280 / bg.width, 720 / bg.height);
        bg.setScale(scale);
        this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.3);

        if (GLOBAL_STATS.usedPinterest) {
            // OPACITY-SYNC (2026-05-17): 0.7 → 0.3 để cân với BG dimmer nhánh chính (0.3)
            // Tránh nhánh Pinterest tối hơn nhánh chính. Watermark text giữ nguyên để vẫn lộ "lý do" mood
            let pinBox = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDark.num, 0.3);
            this.add.text(640, 470, 'ẢNH "MƯỢN" TRÊN PINTEREST', { fontFamily: FONT_TITLE, fontSize: '32px', fill: COLORS.danger.hex, fontStyle: 'bold', alpha: 0.2, stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        }

        // --- TITLE ---
        // OPACITY-SYNC (2026-05-17): Thêm container ambient (0.5) để title không trần trên BG, đồng bộ với patience box dưới
        this.add.rectangle(640, 55, 720, 50, COLORS.bgDarkest.num, 0.5).setStrokeStyle(2, COLORS.warning.num);
        this.add.text(640, 55, 'THE ARCHI-HELL: CUỘC HỌP HÚT MÁU', { fontFamily: FONT_TITLE, fontSize: '32px', fill: COLORS.danger.hex, fontStyle: 'bold', align: 'center', stroke: COLORS.bgDarkest.hex, strokeThickness: 6 }).setOrigin(0.5);

        // --- PATIENCE BAR (Top center, below title) ---
        let patienceBox = this.add.rectangle(640, 105, 500, 40, COLORS.bgDark.num, 0.8).setStrokeStyle(2, COLORS.danger.num);
        this.add.text(420, 105, 'SỨC CHỊU ĐỰNG:', { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(750, 105, 250, 20, COLORS.strokeDark.num).setStrokeStyle(2, COLORS.textPrimary.num);
        this.barPatience = this.add.rectangle(625, 105, 250, 20, COLORS.danger.num).setOrigin(0, 0.5);
        this.txtPatience = this.add.text(890, 105, '100%', { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);

        this.patience = 100;
        if (GLOBAL_STATS.usedPinterest) this.patience = 40;
        if (GLOBAL_STATS.hasEduWatermark) this.patience = 30;
        this.barPatience.width = (this.patience / 100) * 250;
        this.txtPatience.setText(Math.floor(this.patience) + '%');

        // --- SPEECH BUBBLE (Below patience, centered, semi-transparent) ---
        let bubbleGfx = this.add.graphics();
        bubbleGfx.fillStyle(COLORS.textPrimary.num, 0.82);
        bubbleGfx.lineStyle(2, 0x999999, 1);
        bubbleGfx.fillRoundedRect(640 - 350, 280 - 100, 700, 200, 16);
        bubbleGfx.strokeRoundedRect(640 - 350, 280 - 100, 700, 200, 16);
        this.bubbleText = this.add.text(640, 280, '', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.bgDark.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10 }).setOrigin(0.5);

        // --- BUTTONS (Lower area, safe from edge) ---
        this.btnA = this.createChoiceBtn(300, 560, '');
        this.btnB = this.createChoiceBtn(640, 560, '');
        this.btnC = this.createChoiceBtn(980, 560, '');

        this.currentTurn = 0;

        this.showInstructionPopup(
            'MÀN 2: CUỘC HỌP HÚT MÁU',
            [
                "📜 HƯỚNG DẪN ĐẤU KHẨU:",
                "-> Chủ đầu tư sẽ dùng mọi lý lẽ để 'ép giá' hoặc 'xù tiền'.",
                "-> Hãy cân nhắc kỹ từng câu trả lời để không làm SỨC CHỊU ĐỰNG của đối phương về 0.",
                "-> Lựa chọn LƯƠN LẸO hay CỨNG RẮN? Tùy thuộc vào bạn!",
                "-> Lựa chọn tàn bạo nhất sẽ dẫn đến: KÍCH HOẠT RAGE MODE!"
            ],
            () => {
                this.loadTurn(0);
            }
        );
    }

    createChoiceBtn(x, y, text) {
        let w = 320; let h = 120;
        let gfx = this.add.graphics();
        
        let drawBg = (color) => {
            gfx.clear();
            gfx.fillStyle(color, 0.82);
            gfx.lineStyle(2, COLORS.bgLightAlt.num, 1);
            gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        };
        drawBg(COLORS.bgLight.num);

        let txtObj = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 8, wordWrap: { width: 300 } }).setOrigin(0.5);

        let hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
        
        let btnObj = { txt: txtObj, onClick: null };

        hit.on('pointerover', () => drawBg(COLORS.bgLightAlt.num));
        hit.on('pointerout', () => drawBg(COLORS.bgLight.num));
        hit.on('pointerdown', () => {
            txtObj.setY(y + 1);
            this.time.delayedCall(80, () => txtObj.setY(y));
            if (btnObj.onClick) btnObj.onClick();
        });

        return btnObj;
    }

    updatePatience(amount) {
        this.patience = Math.max(0, Math.min(100, this.patience + amount));
        this.tweens.add({ targets: this.barPatience, width: (this.patience / 100) * 250, duration: 400 });
        if (this.txtPatience) this.txtPatience.setText(Math.floor(this.patience) + '%');

        if (this.patience <= 0) {
            this.time.delayedCall(600, () => this.endScene("Khách hàng đã CẠN KIÊN NHẪN!\nHọ vác bản vẽ sang công ty đối thủ.\nCÔNG TY BẠN PHÁ SẢN NHƯNG VẪN PHẢI ĐI ĐÒI NỢ CŨ!", 'SceneDebtRunner'));
            return false;
        }
        return true;
    }

    loadTurn(turn) {
        if (this.patience <= 0) return;

        let script = this.getScript(turn);
        if (!script) return;

        this.bubbleText.setText(script.boss);

        this.btnA.txt.setText(script.optA.text);
        this.btnA.onClick = () => this.handleChoice(script.optA);

        this.btnB.txt.setText(script.optB.text);
        this.btnB.onClick = () => this.handleChoice(script.optB);

        this.btnC.txt.setText(script.optC.text);
        this.btnC.onClick = () => this.handleChoice(script.optC);
    }

    handleChoice(option) {
        if (option.rage) playSound(this, 'sfx_hit');
        else if (option.patience < 0) playSound(this, 'sfx_error');
        else playSound(this, 'sfx_click');

        let isAlive = this.updatePatience(option.patience);
        if (!isAlive) return;

        if (option.rage) {
            this.endScene("Bạn không kìm được và ĐẤM VÀO MẶT KHÁCH HÀNG!\nMọi thứ nổ tung. BẠN CHÍNH THỨC NỔI ĐIÊN!", 'SceneRageMode');
            return;
        }

        if (option.endReason) {
            this.endScene(option.endReason, 'SceneDebtRunner');
            return;
        }

        if (option.nextTurn !== undefined) {
            this.currentTurn = option.nextTurn;
            this.loadTurn(this.currentTurn);
        }
    }

    getScript(turn) {
        // ==========================================
        // NHÁNH PINTEREST (Ảnh mượn trên mạng)
        // ==========================================
        if (GLOBAL_STATS.usedPinterest) {
            if (turn === 0) return {
                boss: 'Góc này nhìn quen quen giống\ntrên mạng nhỉ? Thôi tôi trả 1 củ\ntiền công copy nhé?',
                optA: { text: 'A. "Dạ lấy 1 củ cũng được..." (End)', patience: 10, endReason: 'Bạn chấp nhận làm thợ cóp nhặt.\nBạn sống sót qua ngày nhưng TỰ TRỌNG = 0!' },
                optB: { text: 'B. "Ý tưởng lớn gặp nhau thôi anh!\nTrên mạng nó học lỏm em đấy!"', patience: -30, nextTurn: 10 },
                optC: { text: 'C. Lật bàn, đấm khách vì bị bóc phốt\n(Rage Mode)', patience: 0, rage: true }
            };
            if (turn === 10) return {
                boss: 'Tự nghĩ cái quái gì cái logo mờ mờ\nở góc kìa! Anh lừa ai?\nCút ra khỏi phòng họp!',
                optA: { text: 'A. Quỳ gối xin lỗi (End)', patience: 0, endReason: 'Bạn quỳ xin lỗi để giữ lại dự án.\nBẠN ĐÃ ĐÁNH MẤT LIÊM SỈ NGHỀ NGHIỆP!' },
                optB: { text: 'B. "Dạ đây là thủ pháp Thiết kế Mở\n(Open-source), giao thoa toàn cầu!"', patience: 20, nextTurn: 11 },
                optC: { text: 'C. Hất nước vào mặt khách\n(Rage Mode)', patience: 0, rage: true }
            };
            if (turn === 11) return {
                boss: 'Open source cái đầu mày! Lươn lẹo!\nPhạt trừ nửa tháng lương, không cãi!',
                optA: { text: 'A. Ngậm ngùi chịu phạt (End)', patience: 0, endReason: 'Bị trừ lương vì tội ăn cắp ý tưởng.\nBài học đắt giá cho sự lười biếng!' },
                optB: { text: 'B. "Sếp cho em 1 cơ hội làm lại nhé!"\n(Restart)', patience: 10, endReason: 'Sếp mủi lòng cho bạn cơ hội làm lại từ đầu.\n(Quay về Màn 1)' },
                optC: { text: 'C. Đấm sếp (Rage Mode)', patience: 0, rage: true }
            };
        }

        // ==========================================
        // NHÁNH WATERMARK EDU
        // ==========================================
        if (GLOBAL_STATS.hasEduWatermark) {
            if (turn === 0) return {
                boss: 'Trời đất! Sao ảnh nát bét,\nlại còn chữ "Educational Product"?\nAnh đùa tôi à?',
                optA: { text: 'A. "Dạ máy tính em tự nhiên bị virus..."', patience: -40, nextTurn: 20 },
                optB: { text: 'B. "Đây là ý đồ! Tinh thần\nHọc tập suốt đời (Lifelong Learning)!"', patience: 10, nextTurn: 21 },
                optC: { text: 'C. "Đó là nghệ thuật trừu tượng!"\n(Rage Mode)', patience: 0, rage: true }
            };
            if (turn === 20) return {
                boss: 'Virus cái đầu anh! Làm ăn vô trách nhiệm.\nPhạt nửa tháng lương!',
                optA: { text: 'A. "Dạ em xin chịu phạt..." (End)', patience: 10, endReason: 'Bạn làm mất mặt công ty nên bị trừ lương.\nTHÁNG NÀY ĂN MÌ TÔM!' },
                optB: { text: 'B. "Sếp phải trừ lương thằng IT chứ!"', patience: 20, nextTurn: 22 },
                optC: { text: 'C. Tức tưởi nộp đơn nghỉ việc (End)', patience: -50, endReason: 'Bạn nộp đơn nghỉ việc trong cơn tức giận.\nVề nhà nằm nhìn trần nhà suy nghĩ đời.' }
            };
            if (turn === 21) return {
                boss: 'Tải nhầm? Công ty trả tiền phần mềm\nmà anh xài lậu để tôi lên phường à?',
                optA: { text: 'A. "Dạ do team IT quên cài..." (End)', patience: -50, endReason: 'Đổ lỗi cho IT nhưng sếp không tin.\nBị đuổi việc vì thiếu trung thực!' },
                optB: { text: 'B. "Em xin đền bù bằng cách\nOT cả tháng!" (End)', patience: 10, endReason: 'Sếp tha cho bạn 1 lần nhưng bắt OT nguyên tháng.\nGAN BẠN ĐÃ KIỆT QUỆ!' },
                optC: { text: 'C. "Dùng tạm cho kịp deadline\nthôi sếp ơi!"', patience: 10, nextTurn: 22 }
            };
            if (turn === 22) return {
                boss: 'Kịp deadline hay không thì mai\nanh cũng phải bỏ tiền túi mua\nbản quyền xịn cho tôi!',
                optA: { text: 'A. Tự bỏ nguyên tháng lương\nmua bản quyền... (End)', patience: 20, endReason: 'Bạn tự mua bản quyền bằng tiền túi.\nTháng này nhịn đói uống nước lã!' },
                optB: { text: 'B. "Công ty cấp ngân sách\nthì em mới mua được!"', patience: -30, nextTurn: 23 },
                optC: { text: 'C. Đấm sếp (Rage Mode)', patience: 0, rage: true }
            };
            if (turn === 23) return {
                boss: 'Ngân sách công ty đang âm!\nTự bỏ tiền túi hoặc cút khỏi công ty!',
                optA: { text: 'A. Ngậm đắng nuốt cay tự móc ví... (End)', patience: 10, endReason: 'Làm thuê nhưng phải mua dụng cụ cho Sếp.\nNỖI ĐAU DÂN KIẾN TRÚC!' },
                optB: { text: 'B. "Thế thì em CÚT khỏi công ty!" (End)', patience: -10, endReason: 'Bạn bước ra khỏi công ty với cái đầu ngẩng cao.\nNhưng sáng mai ngủ dậy không có tiền ăn sáng.' },
                optC: { text: 'C. Đập nát máy tính (Rage Mode)', patience: 0, rage: true }
            };
        }

        // ==========================================
        // NHÁNH CHÍNH (ẢNH RENDER ĐẸP) - 5 LEVELS
        // ==========================================
        if (turn === 0) return {
            boss: 'Có mấy cái nét gạch gạch trên máy tính\nmà đắt thế em? Giảm 50% mở bát cho may!',
            optA: { text: 'A. Chấp nhận bớt 50% cho lẹ (End)', patience: 20, endReason: 'Bạn gật đầu đồng ý bán rẻ chất xám.\nBẠN CHÍNH THỨC TRỞ THÀNH NÔ LỆ CỦA NGÀNH!' },
            optB: { text: 'B. "Giờ điện tăng, mì tôm tăng,\nchất xám cũng phải tăng chứ anh!"', patience: -20, nextTurn: 1 },
            optC: { text: 'C. "Chất xám thì giá phải cao!"', patience: -10, nextTurn: 101 }
        };

        if (turn === 1) return {
            boss: 'Thôi giảm 30% đi! Anh đang ôm mấy héc-ta\nđất nền, dự án sau giao chú vẽ mỏi tay!',
            optA: { text: 'A. "Vâng, anh nhớ dự án sau\nphải giao em nhé!" (End)', patience: 20, endReason: 'Bạn tin lời hứa "dự án sau" của khách.\nVà tất nhiên... CHẲNG CÓ DỰ ÁN NÀO SAU ĐÓ CẢ!' },
            optB: { text: 'B. "Dự án nào tính tiền dự án đó anh ơi!"', patience: -30, nextTurn: 2 },
            optC: { text: 'C. "Thế anh ứng trước 50% tiền cọc đi?"', patience: 10, nextTurn: 102 }
        };

        if (turn === 101) return {
            boss: 'Chất xám gì? Công ty X kia\nbáo giá thiết kế rẻ bằng nửa bên em kìa!',
            optA: { text: 'A. "Thế anh sang bên đó mà làm!"', patience: -40, nextTurn: 2 },
            optB: { text: 'B. "Bên đó copy mạng,\ncòn bên em là độc bản!"', patience: 20, nextTurn: 3 },
            optC: { text: 'C. Đấm khách (Rage Mode)', patience: 0, rage: true }
        };

        if (turn === 102) return {
            boss: 'Thôi anh em tin nhau là chính.\nGiờ anh đang kẹt dòng tiền.\nGiảm 20% đi em.',
            optA: { text: 'A. Nhượng bộ giảm 20% tiền thiết kế (End)', patience: 20, endReason: 'Bạn đánh mất 20% lợi nhuận.\nCông ty thâm hụt tài chính.' },
            optB: { text: 'B. "Không có tiền thì đừng xây nhà anh ạ!"\n(End)', patience: -50, endReason: 'Khách hàng bỏ đi vì bị xúc phạm.\nBạn đúng nhưng mất khách!' },
            optC: { text: 'C. "Bớt 10% nhưng cam kết\nkhông được sửa file!"', patience: 10, nextTurn: 4 }
        };

        if (turn === 2) return {
            boss: 'Mày chảnh thế? Khách hàng là thượng đế!\nKhông bớt thì anh mang bản vẽ\nsang công ty khác xây!',
            optA: { text: 'A. "Thôi anh ở lại, em bớt cho..." (End)', patience: 10, endReason: 'Bạn vất vả giữ được khách.\nNHƯNG LỢI NHUẬN = 0. LÀM DÂU TRĂM HỌ!' },
            optB: { text: 'B. "Anh đi đâu thì đi, em không sửa giá!"\n(End)', patience: -50, endReason: 'Khách vác bản vẽ sang công ty đối thủ.\nBạn mất dự án nhưng giữ được tự trọng!' },
            optC: { text: 'C. "File em đặt Pass rồi,\nanh cầm file PDF về mà xây!"', patience: 30, nextTurn: 5 }
        };

        if (turn === 3) return {
            boss: 'Độc bản à... Ừ thì đẹp thật.\nThôi giữ nguyên giá nhưng KM phần\nnội thất nhé?',
            optA: { text: 'A. "Dạ vâng, để em thiết kế luôn" (End)', patience: 20, endReason: 'Bạn phải cày cuốc thêm nguyên bộ nội thất Free.\nLàm kiệt sức đến nhập viện!' },
            optB: { text: 'B. "Nội thất là gói riêng, không Khuyến Mãi!"', patience: -20, nextTurn: 2 },
            optC: { text: 'C. "Giá này em chỉ KM anh\ncái thiết kế cổng rào thôi!"', patience: 10, nextTurn: 5 }
        };

        if (turn === 4) return {
            boss: 'Không được sửa bản vẽ? \nThế lỡ thi công thực tế bị lỗi\nthì bên em tính sao?',
            optA: { text: 'A. "Lỗi thi công bên em chịu hoàn toàn!" (End)', patience: 20, endReason: 'Bạn tự tin thái quá.\nRa công trường lỗi be bét, đền bù sạt nghiệp!' },
            optB: { text: 'B. "Thợ xây làm sai thì anh\nđi mà chửi thợ chứ!"', patience: -20, nextTurn: 2 },
            optC: { text: 'C. "Bên em bám sát 100%, anh cứ yên tâm"', patience: 20, nextTurn: 5 }
        };

        if (turn === 5) return {
            boss: 'Thôi được rồi, cậu cứng quá.\nAnh chốt giá này, in hợp đồng đi!',
            optA: { text: 'A. "Đội ơn anh đã cứu đói\ncông ty em tháng này!" (WIN)', patience: 10, endReason: '🎉 TRUE ENDING: BẠN BẢO VỆ ĐƯỢC CHẤT XÁM! 🎉\nBạn đã chứng minh được giá trị của Thiết kế!' },
            optB: { text: 'B. "Anh chuyển khoản cọc luôn 50%\ncho nóng nha!" (WIN)', patience: -10, endReason: '💰 EPIC WIN: CỌC TIỀN TƯƠI THÓC THẬT! 💰\nBạn thao túng tâm lý Chủ đầu tư thành công!' },
            optC: { text: 'C. "Đùa thôi, em ĐẾCH thèm làm cho anh!"\n(Rage Mode)', patience: 0, rage: true }
        };
    }

    endScene(reason, nextScene) {
        let overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.95).setInteractive();

        // OPACITY-SYNC (2026-05-17): Thêm container box cho reason text — đồng bộ pattern popup (tier 0.85 + stroke)
        this.add.rectangle(640, 260, 1000, 200, COLORS.bgMedium.num, 0.85).setStrokeStyle(3, COLORS.danger.num);
        this.add.text(640, 260, reason, { fontFamily: FONT_TITLE, fontSize: '36px', fill: COLORS.danger.hex, fontStyle: 'bold', align: 'center', lineSpacing: 10, stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);

        if (nextScene === 'SceneRageMode') {
            // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton.
            createRoundedButton(this, 640, 480, 400, 60, '🔥 BƯỚC VÀO RAGE MODE', {
                bgColor: COLORS.danger.num,
                bgHover: 0xec7063,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '24px',
                fontStyle: 'bold',
                onClick: () => this.scene.start('SceneRageMode')
            });
        } else {
            // Cung cấp 3 nhánh lựa chọn để tránh soft-lock (bao gồm cả quay về Màn 1 như user yêu cầu)
            // Nút 1: Về Màn 1
            createRoundedButton(this, 300, 480, 280, 60, '⏪ VỀ MÀN 1', {
                bgColor: COLORS.warning.num,
                bgHover: 0xf4d03f,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    GLOBAL_STATS.progress = 0;
                    GLOBAL_STATS.stressLevel = 50;
                    GLOBAL_STATS.coffeeLevel = 100;
                    GLOBAL_STATS.deadlineTime = 5 * 3600 - 1;
                    GLOBAL_STATS.hasEduWatermark = false;
                    GLOBAL_STATS.usedPinterest = false;
                    this.scene.start('Scene1');
                }
            });

            // Nút 2: Thử lại Màn 2
            createRoundedButton(this, 640, 480, 280, 60, '🔄 THỬ LẠI MÀN 2', {
                bgColor: COLORS.info.num,
                bgHover: 0x5dade2,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => this.scene.restart()
            });

            // Nút 3: Tiếp tục Màn 3 (Dù phá sản vẫn phải đi đòi nợ)
            createRoundedButton(this, 980, 480, 280, 60, '⏩ ĐI ĐÒI NỢ', {
                bgColor: COLORS.success.num,
                bgHover: 0x40d97f,
                borderColor: COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => this.scene.start(nextScene)
            });
        }
    }
}

// ==========================================
// MÀN 4: RAGE MODE - TRẢ THÙ
// (Renamed from Scene3 → SceneRageMode on 2026-05-16 to fix naming legacy confusion.
//  See nhật ký 2026-05-16_ArchiHell_Scene3_Bug_Fix.md)
// ==========================================
class SceneRageMode extends Phaser.Scene {
    constructor() { super('SceneRageMode'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        if (!this.textures.exists('bg_scene3')) {
            this.load.image('bg_scene3', './assets/bg_scene3.png');
        }
    }

    create() {
        this.destruction = 0;

        // --- BACKGROUND ---
        let bg = this.add.image(640, 360, 'bg_scene3');
        let scale = 1.5;
        if (bg.width > 32) scale = Math.max(1280 / bg.width, 720 / bg.height);
        bg.setScale(scale);

        // Red tint overlay for RAGE
        this.rageOverlay = this.add.rectangle(640, 360, 1280, 720, COLORS.danger.num, 0.2);
        this.tweens.add({ targets: this.rageOverlay, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });

        // --- TITLE ---
        let title = this.add.text(640, 60, '🔥 RAGE MODE - TRẢ THÙ! 🔥', { fontFamily: FONT_TITLE, fontSize: '48px', fill: COLORS.danger.hex, fontStyle: 'bold', align: 'center', stroke: COLORS.bgDarkest.hex, strokeThickness: 8 }).setOrigin(0.5);
        this.tweens.add({ targets: title, scaleX: 1.05, scaleY: 1.05, duration: 100, yoyo: true, repeat: -1 });

        // --- DESTRUCTION BAR ---
        let hudBox = this.add.rectangle(640, 150, 700, 80, COLORS.bgDark.num, 0.7).setStrokeStyle(2, COLORS.danger.num);
        this.add.text(640, 130, 'DESTRUCTION', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0.5);
        this.add.rectangle(640, 165, 600, 30, COLORS.strokeDark.num, 0.7).setStrokeStyle(2, COLORS.textPrimary.num);
        this.barDestruction = this.add.rectangle(340, 165, 0, 30, COLORS.danger.num).setOrigin(0, 0.5);
        this.txtDestruction = this.add.text(940, 165, '0%', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        // --- INTERACTIVE AREA (SMASH) ---
        let smashArea = this.add.rectangle(640, 450, 1280, 500, COLORS.danger.num, 0).setInteractive();

        this.gameStarted = false; // Disable until popup is dismissed

        smashArea.on('pointerdown', (pointer) => {
            if (!this.gameStarted) return;
            this.addDestruction(3);
            this.showHitEffect(pointer.x, pointer.y, '💥 BÙM!', 60);

            // Vẽ vết xước/nứt tạm thời
            let crack = this.add.text(pointer.x, pointer.y, '❌', { fontSize: '32px', color: COLORS.bgDarkest.hex }).setOrigin(0.5);
            this.tweens.add({ targets: crack, alpha: 0, duration: 1500, onComplete: () => crack.destroy() });
        });

        // --- SKILLS (BOTTOM LEFT) ---
        this.btnFire = this.createSkillBtn(150, 620, '🛢️\nXăng', COLORS.danger.num);
        this.btnCrane = this.createSkillBtn(300, 620, '🏗️\nCần Cẩu', COLORS.warning.num);

        this.fireCooldown = false;
        this.craneUsed = false;

        this.btnFire.on('pointerdown', () => {
            if (!this.gameStarted) return;
            if (!this.fireCooldown) {
                this.addDestruction(15);
                this.showHitEffect(640, 450, '🔥 CHÁY NHÀ!', 100);
                this.fireCooldown = true;
                this.btnFire.setAlpha(0.3);
                this.cameras.main.flash(500, 255, 0, 0); // Flash đỏ màn hình
                this.time.delayedCall(2000, () => {
                    this.fireCooldown = false;
                    this.btnFire.setAlpha(1);
                });
            }
        });

        this.btnCrane.on('pointerdown', () => {
            if (!this.gameStarted) return;
            if (!this.craneUsed && this.destruction >= 50) {
                this.addDestruction(50);
                this.showHitEffect(640, 450, '🏗️ SẬP!!!', 150);
                this.craneUsed = true;
                this.btnCrane.setAlpha(0.2);
                this.cameras.main.shake(1000, 0.05); // Rung cực mạnh
            } else if (this.craneUsed) {
                this.showHitEffect(300, 550, 'Đã dùng hết!', 24);
            } else {
                this.showHitEffect(300, 550, 'Cần 50% Destruction!', 24);
            }
        });

        this.showInstructionPopup(
            'MÀN 4: RAGE MODE - TRẢ THÙ ĐỜI',
            [
                "📜 HƯỚNG DẪN ĐẬP PHÁ:",
                "-> Tức nước vỡ bờ! Bạn quyết định san bằng văn phòng/công trường của khách.",
                "-> CLICK CHUỘT điên cuồng vào màn hình để tăng % Phá Hoại (Destruction).",
                "-> Sử dụng XĂNG và CẦN CẨU (ở góc trái) để tăng sức tàn phá.",
                "-> Đập nát tất cả lên 100% để xem Kết Cục Cuối Cùng!"
            ],
            () => { this.gameStarted = true; }
        );
    }

    createSkillBtn(x, y, text, color) {
        let btn = this.add.rectangle(x, y, 120, 120, COLORS.bgDark.num, 0.75).setInteractive();
        btn.setStrokeStyle(3, color);
        this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(COLORS.strokeDark.num));
        btn.on('pointerout', () => btn.setFillStyle(COLORS.bgDark.num));
        return btn;
    }

    addDestruction(amount) {
        if (!this.gameStarted) return; // BUG-014: Prevent input after game ends
        this.destruction += amount;

        this.barDestruction.width = (Math.min(this.destruction, 100) / 100) * 600;
        this.txtDestruction.setText(`${Math.min(this.destruction, 100)}%`);
        this.cameras.main.shake(150, 0.02);

        if (this.destruction >= 100) {
            this.destruction = 100;
            this.gameStarted = false; // BUG-014: Block further clicks
            this.winGame();
        }
    }

    showHitEffect(x, y, text, size = 60) {
        let hitTxt = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: `${size}px`, fill: COLORS.warning.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 8 }).setOrigin(0.5);
        this.tweens.add({
            targets: hitTxt, y: y - 120, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 800,
            onComplete: () => hitTxt.destroy()
        });
    }

    winGame() {
        let overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.95).setInteractive();
        this.add.text(640, 200, '🏢 VĂN PHÒNG ĐÃ THÀNH ĐỐNG TRO TÀN!', { fontFamily: FONT_MAIN, fontSize: '48px', fill: COLORS.danger.hex, align: 'center', fontStyle: 'bold', lineSpacing: 20 }).setOrigin(0.5);
        this.add.text(640, 280, 'Bạn đã được giải thoát khỏi kiếp làm thuê.', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, align: 'center' }).setOrigin(0.5);

        // Option 1: Mở công ty riêng
        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton (bo góc Qt-style).
        createRoundedButton(this, 640, 420, 500, 60, '🤵 MỞ CÔNG TY RIÊNG LÀM SẾP', {
            bgColor: COLORS.info.num,
            bgHover: 0x5dade2,
            borderColor: COLORS.textPrimary.num,
            radius: 6,
            fontSize: '24px',
            fontStyle: 'bold',
            onClick: () => this.showEpilogue("Bạn vay nợ mở công ty riêng làm Sếp.\nVà giờ đến lượt bạn đi quỳ lạy Chủ Đầu Tư...\nVòng luân hồi Kiến Trúc không bao giờ kết thúc!")
        });

        // Option 2: Đi phụ hồ
        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton (bo góc Qt-style).
        createRoundedButton(this, 640, 520, 500, 60, '🧱 BỎ NGHỀ, ĐI LÀM PHỤ HỒ CHO LÀNH', {
            bgColor: COLORS.warning.num,
            bgHover: 0xf4d03f,
            borderColor: COLORS.textPrimary.num,
            radius: 6,
            fontSize: '24px',
            fontStyle: 'bold',
            onClick: () => this.showEpilogue("Đi phụ hồ lương cao hơn Kiến Trúc Sư.\nNgủ ngon, không lo deadline!")
        });
    }

    showEpilogue(text) {
        let overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 1).setInteractive();
        this.add.text(640, 360, text, { fontFamily: FONT_MAIN, fontSize: '32px', fill: COLORS.success.hex, align: 'center', fontStyle: 'bold', lineSpacing: 20 }).setOrigin(0.5);

        this.time.delayedCall(5000, () => {
            GLOBAL_STATS.progress = 0;
            GLOBAL_STATS.stressLevel = 50;
            GLOBAL_STATS.coffeeLevel = 100;
            GLOBAL_STATS.deadlineTime = 5 * 3600 - 1;
            GLOBAL_STATS.hasEduWatermark = false;
            GLOBAL_STATS.usedPinterest = false;
            this.scene.start('SceneIntro');
        });
    }
}

// ==========================================
// MÀN 1.5: SỬA LỖI WATERMARK (CLONE STAMP)
// ==========================================
class SceneCloneStamp extends Phaser.Scene {
    constructor() { super('SceneCloneStamp'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        if (!this.textures.exists('bg_edu_watermark')) {
            this.load.image('bg_edu_watermark', './assets/bg_edu_watermark.png');
        }
    }

    create() {
        // Nền chung của game (để Window nổi lên)
        this.cameras.main.setBackgroundColor(COLORS.bgMedium.hex);

        // --- KHUNG CỬA SỔ OS (Giống Màn 1) ---
        let winWidth = 1100; let winHeight = 660;
        let winX = 640; let winY = 360;

        // Nền cửa sổ Photoshop
        this.add.rectangle(winX, winY, winWidth, winHeight, 0x282828).setStrokeStyle(2, COLORS.strokeDark.num);

        // Thanh Tiêu đề (OS Title Bar)
        let titleBarY = winY - winHeight / 2 + 20;
        this.add.rectangle(winX, titleBarY, winWidth, 40, COLORS.bgDark.num);
        this.add.text(winX - winWidth / 2 + 15, titleBarY, 'Ps Adobe Photoshop 2026 (Unlicensed) - Render_Cuoi_Cung_Chot_V9.jpg', { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.textSecondary.hex }).setOrigin(0, 0.5);

        // OS Buttons (Min, Max, Close)
        let rightEdge = winX + winWidth / 2;
        this.add.text(rightEdge - 110, titleBarY, '—', { fontSize: '16px', fill: COLORS.textSecondary.hex }).setOrigin(0.5);
        this.add.text(rightEdge - 70, titleBarY, '☐', { fontSize: '18px', fill: COLORS.textSecondary.hex }).setOrigin(0.5);
        this.add.rectangle(rightEdge - 20, titleBarY, 40, 40, COLORS.danger.num);
        this.add.text(rightEdge - 20, titleBarY, 'X', { fontFamily: FONT_MAIN, fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // --- GIAO DIỆN PHOTOSHOP GIẢ ---
        let menuBarY = titleBarY + 30; // Thanh Menu (File, Edit...)
        this.add.rectangle(winX, menuBarY, winWidth, 20, 0x383838);
        this.add.text(winX - winWidth / 2 + 15, menuBarY, 'File    Edit    Image    Layer    Type    Select    Filter    3D    View    Window    Help', { fontFamily: FONT_MAIN, fontSize: '12px', fill: COLORS.textPrimary.hex }).setOrigin(0, 0.5);

        // Vùng làm việc (Workspace)
        let workspaceTop = menuBarY + 10;
        let workspaceBottom = winY + winHeight / 2;
        let workspaceHeight = workspaceBottom - workspaceTop;

        // Tools Bar (Trái) & Layers Bar (Phải)
        this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + workspaceHeight / 2, 60, workspaceHeight, COLORS.strokeDark.num, 1);
        this.add.rectangle(rightEdge - 125, workspaceTop + workspaceHeight / 2, 250, workspaceHeight, COLORS.strokeDark.num, 1);

        // Nút Clone Stamp (Dùng hình chữ nhật vô hình làm hitbox cho an toàn)
        this.btnCloneHitbox = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 40, 50, 50, 0x000000, 0).setInteractive({ useHandCursor: true });
        this.btnCloneActive = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 40, 40, 40, COLORS.bgDarkest.num, 0.3).setStrokeStyle(2, COLORS.info.num);
        this.add.text(winX - winWidth / 2 + 30, workspaceTop + 40, '🖌️', { fontSize: '24px' }).setOrigin(0.5);

        // Nút Eraser
        this.btnEraserHitbox = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 90, 50, 50, 0x000000, 0).setInteractive({ useHandCursor: true });
        this.btnEraserActive = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 90, 40, 40, COLORS.bgDarkest.num, 0.3).setStrokeStyle(2, COLORS.info.num).setVisible(false);
        this.add.text(winX - winWidth / 2 + 30, workspaceTop + 90, '🧽', { fontSize: '24px' }).setOrigin(0.5);

        this.currentTool = 'clone';
        this.paintedObjects = [];

        this.btnCloneHitbox.on('pointerdown', () => {
            this.currentTool = 'clone';
            this.btnCloneActive.setVisible(true);
            this.btnEraserActive.setVisible(false);
        });

        this.btnEraserHitbox.on('pointerdown', () => {
            this.currentTool = 'eraser';
            this.btnEraserActive.setVisible(true);
            this.btnCloneActive.setVisible(false);
        });

        // Chữ Layer
        this.add.text(rightEdge - 240, workspaceTop + 20, 'LAYERS', { fontFamily: FONT_MAIN, fontSize: '14px', fill: COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightEdge - 125, workspaceTop + 50, 230, 40, 0x444444).setStrokeStyle(1, 0x555555);
        this.add.text(rightEdge - 230, workspaceTop + 50, '👁️ Background', { fontFamily: FONT_MAIN, fontSize: '14px', fill: COLORS.textPrimary.hex }).setOrigin(0, 0.5);

        // --- ẢNH NỀN ---
        // Tính toán lại tâm Workspace: Left = 60, Right = 250 -> Còn lại 790 cho ảnh. Tâm X = 150 + 790/2 = 545.
        let wsWidth = winWidth - 60 - 250;
        let wsCenterX = (winX - winWidth / 2 + 60) + wsWidth / 2;
        let wsCenterY = workspaceTop + workspaceHeight / 2;

        let bg = this.add.image(wsCenterX, wsCenterY, 'bg_edu_watermark').setInteractive();
        let scale = Math.min(wsWidth / bg.width, workspaceHeight / bg.height);
        bg.setScale(scale);

        // --- CHỮ CẢNH BÁO ---
        let header = this.add.text(wsCenterX, workspaceTop + 60, 'SẾP ĐANG GỌI!\nCÒN ĐÚNG 15s ĐỂ XÓA WATERMARK!', { fontFamily: FONT_TITLE, fontSize: '32px', fill: COLORS.danger.hex, fontStyle: 'bold', align: 'center', stroke: COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5);
        this.tweens.add({ targets: header, scaleX: 1.05, scaleY: 1.05, duration: 300, yoyo: true, repeat: -1 });

        this.timeLeft = 15;
        this.txtTimer = this.add.text(wsCenterX, workspaceTop + 140, '⏳ 15s', { fontFamily: FONT_MAIN, fontSize: '48px', fill: COLORS.warning.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);

        this.showInstructionPopup(
            'MÀN 1.5: SỬA LỖI WATERMARK',
            [
                "📜 LUẬT CHƠI:",
                "-> Bạn lỡ bấm nhầm bản Giáo Dục (Edu). Ảnh render bị lỗi chữ chình ình!",
                "-> Hãy dùng Clone Stamp (Click & Kéo chuột) để tẩy chữ.",
                "-> Bạn có đúng 15 giây trước khi sếp kiểm tra!",
                "-> Cẩn thận: Chữa lợn lành thành lợn què!"
            ],
            () => {
                // Chuột kéo đến đâu thì áp dụng tool (Chỉ kích hoạt khi chuột nằm TRONG VÙNG ẢNH bg)
                bg.on('pointermove', (pointer) => {
                    if (pointer.isDown) {
                        this.applyTool(pointer);
                    }
                });

                bg.on('pointerdown', (pointer) => {
                    this.applyTool(pointer);
                    if (this.currentTool === 'clone') this.cameras.main.shake(50, 0.005);
                });

                // Đếm ngược
                this.time.addEvent({
                    delay: 1000, repeat: 14,
                    callback: () => {
                        this.timeLeft--;
                        this.txtTimer.setText(`⏳ ${this.timeLeft}s`);
                        if (this.timeLeft <= 0) {
                            this.finishMinigame();
                        }
                    }
                });
            }
        );
    }

    applyTool(pointer) {
        if (this.currentTool === 'clone') {
            this.smearMissingTexture(pointer.x, pointer.y);
        } else if (this.currentTool === 'eraser') {
            this.eraseTexture(pointer.x, pointer.y);
        }
    }

    eraseTexture(x, y) {
        // Tìm các vết vẽ gần chuột và xóa chúng
        for (let i = this.paintedObjects.length - 1; i >= 0; i--) {
            let b = this.paintedObjects[i];
            let dist = Phaser.Math.Distance.Between(x, y, b.x, b.y);
            if (dist < 40) { // Bán kính tẩy
                b.objects.forEach(obj => obj.destroy());
                this.paintedObjects.splice(i, 1);
            }
        }
    }

    smearMissingTexture(x, y) {
        if (!this.lastWipeTime || this.time.now - this.lastWipeTime > 150) {
            playSound(this, 'sfx_wipe', 0.5);
            this.lastWipeTime = this.time.now;
        }
        // Tạo các ô caro hồng đen gớm ghiếc
        let size = 30;
        let c1 = this.add.rectangle(x - size / 2, y - size / 2, size, size, 0xff00ff);
        let c2 = this.add.rectangle(x + size / 2, y - size / 2, size, size, COLORS.bgDarkest.num);
        let c3 = this.add.rectangle(x - size / 2, y + size / 2, size, size, COLORS.bgDarkest.num);
        let c4 = this.add.rectangle(x + size / 2, y + size / 2, size, size, 0xff00ff);

        let block = { x, y, objects: [c1, c2, c3, c4] };

        // Kèm chữ lỗi
        if (Phaser.Math.Between(0, 5) === 0) {
            let txt = this.add.text(x, y, 'MISSING', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.textPrimary.hex, backgroundColor: COLORS.bgDarkest.hex }).setOrigin(0.5);
            block.objects.push(txt);
        }

        this.paintedObjects.push(block);
    }

    finishMinigame() {
        GLOBAL_STATS.stressLevel += 10;
        
        let failMsg = '';
        if (this.paintedObjects.length > 0) {
            failMsg = 'CÀNG CHỮA CÀNG NÁT!\nTRẦM CẢM +10%';
        } else {
            failMsg = 'ẢNH VẪN CÒN LOGO "EDU" KÌA!\nSẾP GỌI CHỬI SẤP MẶT!\nTRẦM CẢM +10%';
        }

        let failTxt = this.add.text(640, 360, failMsg, { fontFamily: FONT_TITLE, fontSize: '48px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 6, align: 'center' }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: failTxt, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true, repeat: 5,
            onComplete: () => {
                this.scene.start('Scene2');
            }
        });
    }
}
// ==========================================
// MÀN 3: CUỘC CHIẾN ĐÒI NỢ (RUNNER)
// ==========================================
class SceneDebtRunner extends Phaser.Scene {
    constructor() { super('SceneDebtRunner'); }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');

        // BUG-006: Reset gravity for this scene (may have been 0 from other scenes)
        this.physics.world.gravity.y = 2000;

        // Cảnh quan: 1 mặt trời (cloudy-day) cố định + 3 mây (cloud) trôi parallax
        // BUG-FIX (2026-05-17): Emoji ☁ → PNG asset. Phaser docs ghi rõ emoji render "depends entirely
        // on the browser" → không reliable cross-OS/WebView2. Asset PNG đảm bảo nhất quán.
        // Logic: cloudy-day có mặt trời → CHỈ 1 cái cố định trên trời (mặt trời không trôi).
        //        cloud thuần xanh → 3 cái trôi parallax như mây thật.
        // Depth: sun=1 (thấp), cloud=2 (cao hơn) → mây trôi che mặt trời thoáng qua = hiện tượng thật.
        this.sun = scaleImageToFit(this.add.image(960, 130, 'cloudy-day'), 130).setOrigin(0.5, 0.5).setDepth(1);

        this.clouds = [];
        for (let i = 0; i < 3; i++) {
            let c = scaleImageToFit(this.add.image(300 + i * 400, 150, 'cloud'), 100).setOrigin(0.5, 0.5);
            c.setDepth(2); // Layer: clouds trôi đè trên mặt trời (realistic)
            this.clouds.push(c);
        }

        // Parallax Buildings (BUG-FIX 2026-05-16: lighter color + depth 2 to sit BEHIND ground)
        // Old color COLORS.bgLightAlt.num (dark slate) made buildings look like foreground; new COLORS.strokeMid.num (light gray) reads as distant city silhouette
        this.buildings = [];
        for (let i = 0; i < 15; i++) {
            let h = Phaser.Math.Between(100, 400);
            let b = this.add.rectangle(i * 100, 640, 90, h, COLORS.strokeMid.num).setOrigin(0.5, 1);
            b.setDepth(2);
            this.buildings.push(b);
        }

        // Mặt đất công trường (BUG-FIX 2026-05-16: depth 3 to render ON TOP of buildings)
        this.ground = this.add.rectangle(640, 640, 1280, 160, COLORS.purple.num).setOrigin(0.5, 0).setDepth(3);
        // BUG-FIX (2026-05-17 v3): Xóa "CÔNG TRƯỜNG THI CÔNG" footer text.
        // Lý do: Text ở y=680 bị obstacle (depth 10) trôi qua che ngắt quãng → trông như glitch.
        // Hơn nữa context "công trường" đã rõ qua ground tím + parallax buildings + obstacles → text thừa.
        this.add.text(640, 50, 'MÀN 3: CUỘC CHIẾN ĐÒI NỢ', { fontFamily: FONT_TITLE, fontSize: '32px', fill: COLORS.darkRed.hex, fontStyle: 'bold', stroke: COLORS.textPrimary.hex, strokeThickness: 4 }).setOrigin(0.5).setDepth(20);

        let instruct = this.add.text(640, 120, 'Bấm SPACE hoặc CLICK CHUỘT để nhảy né bẫy!\nNhấp đúp trên không để NHẢY KÉP!\nUống HEO HÚC để ép nhịp tim đập nhanh hơn Deadline!', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.bgDarkest.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5).setDepth(20);
        // BUG-FIX (2026-05-17 v3): Instruction fade out sau 6s thay vì blink alpha 0.2..1.0 suốt game.
        // Theo Inworld game tutorial UX: tutorial popup nên dynamic, không persistent.
        // Cũ: repeat -1 → mỏi mắt, distract khỏi obstacle. Mới: blink 3 lần (báo hiệu nhìn ngay), rồi fade ra.
        this.tweens.add({ targets: instruct, alpha: 0.3, duration: 600, yoyo: true, repeat: 4 });
        this.time.delayedCall(6500, () => {
            this.tweens.add({
                targets: instruct, alpha: 0, duration: 800,
                onComplete: () => instruct.destroy()
            });
        });

        // Ground physics (Extended to x=2000 so obstacles spawned off-screen don't fall off)
        // BUG-FIX (2026-05-17): y=640→660. Default origin (0.5,0.5) + height 40 → top=y-20.
        // Old y=640: physics top=620, 20px ABOVE purple ground visual (top=640). Player landed at y=620 lơ lửng.
        // New y=660: physics top=640, khớp đúng đỉnh ground tím. Player chân chạm y=640.
        let groundBody = this.add.rectangle(640, 660, 2000, 40, COLORS.bgDarkest.num, 0);
        this.physics.add.existing(groundBody, true); // static

        // BUG-FIX (2026-05-16): Pure image for Thanh Tra — replaces rect + text container.
        // PNG icon (police) recognizable on its own, no label needed.
        // BUG-FIX (2026-05-16): Use scaleImageToFit to preserve aspect ratio (avoid stretch/squash).
        // SIZE-REFACTOR (2026-05-17): Scale 1.8x để nhân vật có presence rõ hơn.
        // Cũ: inspector 130, player 100, boss 110 → player nhỏ nhất, thiếu hero feel.
        // Mới: inspector 230 (uy quyền), player 180 (= boss), boss 200, obstacle 140, power-up 130.
        this.inspector = scaleImageToFit(this.add.image(50, 640, 'char_thanh_tra'), 230).setOrigin(0.5, 1).setDepth(5);
        // Inspector starts off-screen-left at x=-130 (player x=150 + xOffset=-280 = -130).
        // Intentional ~45s warning before capture at normal pace (xOffset increment 0.08/frame × 60fps ≈ 4.8/s).
        // DO NOT lower the magnitude without rebalancing — game wins in ~50s, capture must be slower.
        this.inspector.xOffset = -280;
        // BUG-FIX (2026-05-17): Init x = player.x + xOffset (= -130, off-screen-left) thay vì = xOffset (= -280).
        // Cũ: frame 0 inspector ở x=-280, frame 1 update() nhảy sang x=-130 → flash 150px.
        this.inspector.x = 150 + this.inspector.xOffset;

        // BUG-FIX (2026-05-16): Pure image for KTS player — replaces rect + text label.
        // PNG icon (construction worker with hard hat) is iconic for KTS Việt Nam theme.
        // SIZE-REFACTOR (2026-05-17): 100 → 180 (1.8x) - hero presence rõ hơn.
        // POSITION-FIX (2026-05-17): y=400 → y=550 (feet sát ground y=640). Player 180px height,
        // half=90 → feet=550+90=640. Trước đây player lơ lửng 150px trên ground → low obstacle (y=600) KHÔNG cản được.
        // PIVOT-FIX (2026-05-17): Origin 0.5, 0.5 (Tâm) và y=550 để khi lộn nhào sẽ xoay quanh bụng chứ không xoay quanh gót chân.
        this.player = scaleImageToFit(this.add.image(150, 550, 'char_kts'), 180).setOrigin(0.5, 0.5).setDepth(6);
        this.physics.add.existing(this.player);
        // POSITION-FIX v2 (2026-05-17): Body align voi visual origin (0.5, 0.5).
        // Visual 180x180, origin day -> body offset y = displayHeight-bodyHeight ngay phia tren day anh.
        // Body 120x170: hep hon visual de hitbox fair, cao gan = visual.
        this.player.body.setSize(120, 170);
        this.player.body.setOffset((this.player.displayWidth - 120) / 2, this.player.displayHeight - 170);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, groundBody);

        // BUG-FIX (2026-05-16): Pure image for Shark Lươn boss — replaces rect + text container.
        // PNG icon (investor in suit) is recognizable as the runaway client.
        // SIZE-REFACTOR (2026-05-17): 110 → 200 (1.82x) - ngang player để đối đầu cân bằng.
        this.boss = scaleImageToFit(this.add.image(1150, 640, 'char_shark_luon'), 200).setOrigin(0.5, 1).setDepth(5);

        // BUG-017: Distance text as HUD (fixed top-right, not following boss)
        this.distance = 12000;
        this.txtDistance = this.add.text(1200, 100, 'Còn: ' + this.distance, { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.textPrimary.hex, strokeThickness: 3 }).setOrigin(0.5).setDepth(20);

        // BUG-FIX (2026-05-16): Warning queue HUD — shows 3 upcoming obstacles by name so player can read
        // ahead of time. Solves UX issue where fast obstacles + multi-line text are hard to parse in real-time.
        // BUG-FIX (2026-05-17 v3): Thêm icon mini cạnh text — chuẩn industry (Subway Surfers, Sonic Dash).
        // 18 obstacles text-only quá nhiều để học, icon visual giúp player match nhanh hơn khi obs lao tới.
        // Panel mở rộng 270→290 để chứa icon 28px + gap.
        this.warningQueue = [];
        this.warningPanelBg = this.add.rectangle(180, 115, 290, 145, COLORS.bgDarkest.num, 0.75).setStrokeStyle(2, COLORS.warning.num).setDepth(20);
        this.warningTitle = this.add.text(180, 65, '⚠ BẪY SẮP TỚI', { fontFamily: FONT_MAIN, fontSize: '20px', fill: COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
        // Text slots: align trái (so với icon bên trái)
        this.warningSlots = [
            this.add.text(90, 100, '', { fontFamily: FONT_MAIN, fontSize: '16px', fill: COLORS.textPrimary.hex, fontStyle: 'bold', align: 'left' }).setOrigin(0, 0.5).setDepth(21),
            this.add.text(90, 130, '', { fontFamily: FONT_MAIN, fontSize: '13px', fill: COLORS.strokeLight.hex, align: 'left' }).setOrigin(0, 0.5).setDepth(21),
            this.add.text(90, 158, '', { fontFamily: FONT_MAIN, fontSize: '13px', fill: COLORS.textMuted.hex, align: 'left' }).setOrigin(0, 0.5).setDepth(21)
        ];
        // Icon slots: image 28px ở cột trái panel, alpha giảm dần theo distance
        this.warningIcons = [
            this.add.image(65, 100, '__DEFAULT').setVisible(false).setDepth(21),
            this.add.image(65, 130, '__DEFAULT').setVisible(false).setDepth(21),
            this.add.image(65, 158, '__DEFAULT').setVisible(false).setDepth(21)
        ];

        this.obstacles = this.physics.add.group();
        this.physics.add.collider(this.obstacles, groundBody);
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

        this.collectibles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.collectibles, this.collectCoin, null, this);

        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-UP', this.jump, this);
        this.input.on('pointerdown', this.jump, this);

        this.isGameOver = true; // Dừng lúc hiển thị popup
        // BUG-FIX (2026-05-16): Reduced initial gameSpeed 600→400 + softer acceleration for readability
        // Players reported obstacles too fast to react. Cap at 750 to prevent late-game chaos.
        this.gameSpeed = 400;

        this.showInstructionPopup(
            'MÀN 3: CUỘC CHIẾN ĐÒI NỢ',
            [
                "📜 HƯỚNG DẪN CHẠY TRỐN & ĐUỔI BẮT:",
                "-> 'Shark Lươn' đã chuồn mất. Bạn phải rượt theo để đòi tiền thiết kế!",
                "-> Bấm SPACE hoặc Click Chuột để nhảy qua bẫy (Khất nợ, Block Zalo...).",
                "-> Phía sau lưng là Thanh Tra Bản Quyền đang truy đuổi sát nút.",
                "-> Vấp bẫy = Giảm tốc độ. Bị Thanh tra tóm = Phạt 1 Tỷ (Phá Sản)!",
                "-> NHẢY KÉP (Nháy 2 lần) để qua bẫy cao. Uống 'Heo Húc' ép tim đập nhanh hơn Deadline!"
            ],
            () => {
                this.isGameOver = false;
                this.spawnTimer = this.time.addEvent({ delay: 1200, callback: this.spawnObstacle, callbackScope: this, loop: true });
                this.coinTimer = this.time.addEvent({ delay: 3500, callback: this.spawnCollectible, callbackScope: this, loop: true });
            }
        );
    }

    jump() {
        if (this.isGameOver) return;
        if (this.player.body.touching.down) {
            playSound(this, 'sfx_jump');
            this.player.body.setVelocityY(-900);
            this.canDoubleJump = true;
            // BUG-FIX (2026-05-16): Use relative '+=360' so angle doesn't accumulate reverse rotation across jumps
            this.tweens.add({ targets: this.player, angle: '+=360', duration: 400 });
        } else if (this.canDoubleJump) {
            playSound(this, 'sfx_jump');
            this.player.body.setVelocityY(-700);
            this.canDoubleJump = false;
            // BUG-FIX (2026-05-16): Use relative '+=360' for consistent rotation direction
            this.tweens.add({ targets: this.player, angle: '+=360', duration: 400 });
        }
    }

    spawnObstacle() {
        if (this.isGameOver) return;
        // BUG-FIX (2026-05-16): Refactored to PNG icon design (replaces emoji).
        // Each obstacle has { text, iconKey } - rect shows 60x60 PNG image, Warning HUD shows full text.
        // PNG images render center-perfect (unlike emoji which had baseline offset issue).
        // Total 18 obstacles - 16 original + 2 new (Mẹ vợ ốm, Bản vẽ KM nha em).
        let types = [
            { text: 'Block Zalo',        iconKey: 'obs_block_zalo' },
            { text: 'Khất nợ!',          iconKey: 'obs_khat_no' },
            { text: 'Chưa có dòng tiền', iconKey: 'obs_chua_co_dong_tien' },
            { text: 'Cuối tháng!',       iconKey: 'obs_cuoi_thang' },
            { text: 'Đang bận họp!',     iconKey: 'obs_dang_ban_hop' },
            { text: 'Kế toán đi đẻ',     iconKey: 'obs_vo_em_om' },
            { text: 'Để mai chốt',       iconKey: 'obs_de_mai_chot' },
            { text: 'Anh đang đi tỉnh',  iconKey: 'obs_anh_quen_vi' },
            { text: 'Em chưa duyệt',     iconKey: 'obs_em_chua_duyet' },
            { text: 'Sếp đi vắng',       iconKey: 'obs_bay_vo_em_om' },
            { text: 'Bank bảo trì',      iconKey: 'obs_bank_bao_tri' },
            { text: 'Render lại nha',    iconKey: 'obs_render_lai' },
            { text: 'Sửa file lỗi',      iconKey: 'obs_sua_file_loi' },
            { text: 'Thêm 5 góc nha',    iconKey: 'obs_them_5_goc' },
            { text: 'Bản vẽ tay chứ',    iconKey: 'obs_ban_ve_tay' },
            { text: 'Bớt 30% nha em',    iconKey: 'obs_bot_30_phan_tram' },
            { text: 'Xem phong thủy',    iconKey: 'obs_me_vo_om' },
            { text: 'Tặng bộ nội thất',  iconKey: 'obs_ban_ve_km' }
        ];
        let type = Phaser.Utils.Array.GetRandom(types);

        // BUG-FIX (2026-05-17): 3 tier obstacle thay vì 2.
        // - Low (75%, y=640): chân sát ground → single jump qua dư dả.
        // - High-easy (12.5%, y=480): obs nhô lên 60px → single jump qua sát nút (max jump height 202px > 60px clearance, nhưng timing chặt).
        // - High-hard (12.5%, y=440): obs nhô lên 100px → BẮT BUỘC double jump (single chỉ với tới top obs y=380, body top player khi peak = 437).
        // Random distribution: 0-5=low, 6=high-easy, 7=high-hard (Phaser.Math.Between inclusive 0-7).
        let tier = Phaser.Math.Between(0, 7);
        let yPos;
        if (tier === 7) {
            yPos = 440; // high-hard, double jump
        } else if (tier === 6) {
            yPos = 480; // high-easy, single jump tight timing
        } else {
            yPos = 640; // low, single jump
        }

        // BUG-FIX (2026-05-16): Pure image obstacle — replaces rect + companion icon.
        // PNG icon IS the obstacle (has physics body).
        // BUG-FIX (2026-05-16): Use scaleImageToFit to preserve aspect ratio (avoid stretch/squash).
        // SIZE (2026-05-17): Giữ obstacle 80px (chỉ scale nhân vật, không scale obstacle để giữ dễ né).
        let obs = scaleImageToFit(this.add.image(1350, yPos, type.iconKey), 80).setOrigin(0.5, 1).setDepth(10);

        this.physics.add.existing(obs);
        obs.body.setSize(60, 60); // Forgiving hitbox
        // POSITION-FIX v2 (2026-05-17): Body align voi origin (0.5, 1) - hitbox o phia day visual.
        obs.body.setOffset((obs.displayWidth - 60) / 2, obs.displayHeight - 60);
        obs.body.allowGravity = false; // BUG-FIX (2026-05-17): Tắt gravity cho cả low/high - tránh visual giật khi spawn

        this.obstacles.add(obs);

        // BUG-FIX (2026-05-16): Set velocity AFTER adding to physics group.
        // Physics.Arcade.Group resets body properties (velocity=0) when child is added → set last.
        obs.body.setVelocityX(-this.gameSpeed);
        obs.body.allowGravity = false; // Re-apply since group may reset

        // BUG-FIX (2026-05-16): Push to warning queue with text + iconKey (no more emoji needed)
        this.warningQueue.push({ type: type.text, iconKey: type.iconKey, obs: obs });
        this.updateWarningDisplay();

        // BUG-FIX (2026-05-16): Softer acceleration +2 (was +5) + cap at 750 for fair difficulty curve
        this.gameSpeed = Math.min(750, this.gameSpeed + 2);
    }

    // BUG-FIX (2026-05-16): Helper for warning HUD — render 3 slots text-only (icons now in obstacle via PNG)
    // BUG-FIX (2026-05-17 v3): Mỗi slot giờ có icon mini cạnh text. Icon scale về 28px,
    // alpha giảm dần (1.0/0.7/0.5) cho 3 slot để player biết thứ tự ưu tiên.
    updateWarningDisplay() {
        if (!this.warningSlots) return;
        const alphas = [1.0, 0.75, 0.55];
        for (let i = 0; i < 3; i++) {
            let item = this.warningQueue[i];
            this.warningSlots[i].setText(item ? item.type : '');
            this.warningSlots[i].setAlpha(alphas[i]);
            if (item && this.textures.exists(item.iconKey)) {
                this.warningIcons[i].setTexture(item.iconKey);
                this.warningIcons[i].setVisible(true);
                this.warningIcons[i].setAlpha(alphas[i]);
                // Scale icon về 28px (giữ tỉ lệ)
                let img = this.warningIcons[i];
                if (img.width > 0 && img.height > 0) {
                    img.setScale(28 / Math.max(img.width, img.height));
                }
            } else {
                this.warningIcons[i].setVisible(false);
            }
        }
    }

    hitObstacle(player, obs) {
        playSound(this, 'sfx_hit');
        // BUG-FIX (2026-05-16): Obstacle is now pure image — single destroy, no companions to clean up.
        obs.destroy();

        // BALANCE (2026-05-17 v2): inspector.xOffset += 30 (cũ 50 → bỏ → 30).
        // Phân tích: game ~35s, thanh tra cần 45s không vấp để tóm (xOffset từ -280 → -60, +0.08/frame).
        // Không có penalty → thanh tra thành trang trí. Có +50 → vấp 3 lần là chết (frustrate).
        // Mới: vấp +30 → 7-8 vấp mới đủ thanh tra tóm, balance giữa "có sức ép" và "công bằng".
        // Vấp = player lùi 80 + inspector tiến 30 = 110px khoảng cách mất. Heo Húc -50 → 2.2 power-up gỡ 1 vấp.
        this.player.x -= 80;
        this.inspector.xOffset += 30;

        this.cameras.main.shake(150, 0.02);
        let f = this.add.text(this.player.x, this.player.y - 100, '- TỐC ĐỘ!', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.textPrimary.hex, strokeThickness: 4 }).setOrigin(0.5);
        this.tweens.add({ targets: f, y: f.y - 100, alpha: 0, duration: 1000, onComplete: () => f.destroy() });
    }

    spawnCollectible() {
        if (this.isGameOver) return;
        let isHigh = Phaser.Math.Between(0, 1) === 0;
        // BUG-FIX (2026-05-17 v2): Power-up y tinh chỉnh để cảm giác "Bò Húc trên kệ vs trên cao".
        // High y=355: trên đầu player (top y=460) 105px → cần single jump (max 202px) để với.
        // Low y=620: sát ground line (cách 20px), tay player cầm chai khi chạy → cảm giác "lượm đồ trên đất" thật.
        //   Cũ y=505 = ngang vai (overlap thân 35px) → cảm giác "lượm gió", không gắn với scene.
        let yPos = isHigh ? 355 : 620;

        // BUG-FIX (2026-05-16): PNG icon design — single Bò Húc cola can image (no rect/label needed).
        // Image is recognizable by shape + color → player instantly distinguishes power-up from obstacles.
        // BUG-FIX (2026-05-16): Use scaleImageToFit to preserve aspect ratio (cola can is taller than wide).
        // SIZE (2026-05-17): Giữ power-up 70px (chỉ scale nhân vật, không scale collectibles).
        let can = scaleImageToFit(this.add.image(1350, yPos, 'pu_heo_huc'), 70).setOrigin(0.5, 1).setDepth(10);

        this.physics.add.existing(can);
        can.body.setSize(40, 60); // Hitbox slightly smaller than visual
        // POSITION-FIX v2 (2026-05-17): Body align voi origin (0.5, 1)
        can.body.setOffset((can.displayWidth - 40) / 2, can.displayHeight - 60);
        can.body.allowGravity = false;

        // No companions - image IS the collectible (no separate label/text)
        can.companions = [];

        this.collectibles.add(can);

        // BUG-FIX (2026-05-16): Set velocity AFTER adding to physics group (group resets body props)
        can.body.setVelocityX(-this.gameSpeed);
        can.body.allowGravity = false; // Re-apply

        // Hiệu ứng bay lên xuống nhẹ
        this.tweens.add({ targets: can, y: yPos - 15, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.easeInOut' });
    }

    collectCoin(player, coin) {
        playSound(this, 'sfx_coin');
        // BUG-FIX (2026-05-16): Coin is now pure image — single destroy, no companions to clean up.
        coin.destroy();

        // BUG-FIX (2026-05-16) + BALANCE (2026-05-16):
        // - Clamp xOffset to prevent exploit (spamming Bò Húc → inspector pushed off-screen permanently).
        // - Nerfed Bò Húc push-back from -150 to -50 to match hit penalty (+50). 1:1 ratio keeps tension.
        //   Old -150 = ăn 1 lon chuộc 3 lỗi vấp bẫy → game quá dễ. Now: ăn 1 lon = chuộc 1 lỗi.
        this.inspector.xOffset = Math.max(-400, this.inspector.xOffset - 50);

        let f = this.add.text(this.player.x, this.player.y - 100, '+ HEO HÚC!', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.info.hex, fontStyle: 'bold', stroke: COLORS.textPrimary.hex, strokeThickness: 4 }).setOrigin(0.5);
        this.tweens.add({ targets: f, y: f.y - 100, alpha: 0, duration: 1000, onComplete: () => f.destroy() });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Di chuyển mây
        this.clouds.forEach(c => {
            c.x -= 1;
            if (c.x < -100) c.x = 1380;
        });

        // BUG-004: Collect-then-destroy to avoid modifying array during iteration
        let toDestroy = [];
        this.obstacles.getChildren().forEach(obs => {
            // BUG-FIX (2026-05-16): Obstacle is now pure image — no companion sync needed.
            if (obs.x < -100) toDestroy.push(obs);
            // BUG-FIX (2026-05-17 v2): Sync velocity với gameSpeed hiện tại.
            // Cũ: obs giữ velocity lúc spawn (vd 400) trong khi gameSpeed tăng dần (→750).
            // → Obs cũ trôi chậm, obs mới trôi nhanh, dồn vào player cùng lúc → chaos cuối game.
            else if (obs.body) obs.body.setVelocityX(-this.gameSpeed);
        });

        // BUG-FIX (2026-05-16): Pop warning queue when obstacle passed player or destroyed.
        // Keep only items whose obstacle is still active AND ahead of player (x > player.x - 60).
        let oldLen = this.warningQueue.length;
        this.warningQueue = this.warningQueue.filter(item =>
            item.obs && item.obs.active && item.obs.x > this.player.x - 60
        );
        if (this.warningQueue.length !== oldLen) this.updateWarningDisplay();

        this.collectibles.getChildren().forEach(coin => {
            // BUG-FIX (2026-05-16): Coin is single image now, no companion sync needed.
            // Tween moves the image directly; physics body follows automatically.
            if (coin.x < -100) toDestroy.push(coin);
            // BUG-FIX (2026-05-17 v2): Sync velocity với gameSpeed (xem comment ở obstacles).
            else if (coin.body) coin.body.setVelocityX(-this.gameSpeed);
        });

        // BUG-FIX (2026-05-16): Pure image obstacles/coins — single destroy, no companions to clean up.
        toDestroy.forEach(obj => obj.destroy());

        // Parallax buildings
        // BUG-FIX (2026-05-17): KHÔNG đổi height khi recycle - gây hiện tượng "tòa nhà lên xuống đột ngột".
        // Building giờ giữ height cố định (random lúc tạo) để parallax mượt như skyline thực tế.
        this.buildings.forEach(b => {
            b.x -= 2;
            if (b.x < -100) {
                b.x = 1380;
                // Height giữ nguyên - skyline ổn định
            }
        });

        // BUG-FIX (2026-05-16): Player is now pure image (char_kts.png), no playerTxt sync needed.

        // Hồi phục vị trí KTS chậm rãi
        // BUG-FIX (2026-05-17 v2): += 1 → += 2 px/frame (60fps → 120px/s).
        // Cũ: vấp 2 lần liên tiếp → x=60 sát mép trái, hồi phục 340px mất 5.67s passive play.
        // Mới: hồi phục cùng quãng đường trong 2.83s, vẫn slow nhưng không stuck quá lâu.
        if (this.player.x < 400) {
            this.player.x += 2;
        }

        // BUG-003: Thanh tra bám đuổi - slower approach rate (was 0.12)
        this.inspector.xOffset += 0.08;
        this.inspector.x = this.player.x + this.inspector.xOffset;
        // BUG-FIX (2026-05-17): 640+sin*10 → 640-abs(sin)*8. Cũ: feet dao động 630..650 → khi >640 thì chìm
        // dưới ground line. Mới: 632..640, luôn ≤ ground line, lắc lư nhẹ như thanh tra đang theo dõi.
        this.inspector.y = 640 - Math.abs(Math.sin(time / 100) * 8);

        // Boss chạy nhảy (container follows)
        // BUG-FIX (2026-05-17): 500+abs→640-abs — Boss phải nhảy nhảy TỪ ground (y=640) lên, không bay giữa trời.
        this.boss.y = 640 - Math.abs(Math.sin(time / 150) * 30);
        // NOTE (2026-05-17 v2): Boss đứng yên x=1150 là đúng side-scrolling logic — world chạy, mọi vật trôi trái,
        // boss giữ position cố định cho cảm giác "ngang tầm KTS đang đuổi". Distance HUD đã feedback progress đầy đủ.
        // Trước có thử boss.x giảm linear theo distance nhưng visual ngược chiều flow (boss như đi lùi) → revert.

        if (this.inspector.x >= this.player.x - 60) {
            this.triggerGameOver('BỊ THANH TRA BẢN QUYỀN BẮT!\nPhạt 1 Tỷ Đồng. Bạn vỡ nợ!');
        }

        this.distance -= (this.gameSpeed / 100);
        this.txtDistance.setText('Còn: ' + Math.floor(Math.max(0, this.distance)));

        if (this.distance <= 0) {
            this.triggerWin();
        }
    }

    triggerGameOver(msg) {
        playSound(this, 'sfx_error');
        this.isGameOver = true;
        if (this.spawnTimer) this.spawnTimer.remove();
        if (this.coinTimer) this.coinTimer.remove();

        // CINEMATIC-LOSE (2026-05-17 v8): Đối xứng với triggerWin() — cutscene 3s trước popup.
        // KHÔNG pause physics ngay, reset player velocity + gravity để đứng yên cho cutscene.
        this.player.body.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        this.playLoseCutscene(msg);
    }

    // ==========================================
    // CINEMATIC LOSE CUTSCENE (2026-05-17 v8)
    // ==========================================
    // Đối xứng với playWinCutscene(): clear màn → Thanh Tra tóm KTS + Boss chạy mất → popup.
    // Boss lùi ra phải (mặt không nhìn lại — "chạy mất không quan tâm"),
    // Thanh Tra từng sau tiến tới tóm KTS đứng bất lực.
    playLoseCutscene(msg) {
        // ====== PHASE 1 (0-400ms): Clear màn ======
        this.obstacles.getChildren().forEach(obs => {
            this.tweens.add({
                targets: obs, alpha: 0, y: obs.y - 30,
                duration: 400, ease: 'Power2',
                onComplete: () => obs.destroy()
            });
        });

        this.collectibles.getChildren().forEach(coin => {
            this.tweens.add({
                targets: coin, alpha: 0,
                duration: 300,
                onComplete: () => coin.destroy()
            });
        });

        // Fade out warning HUD + distance text
        let warningGroup = [
            this.warningPanelBg, this.warningTitle,
            ...this.warningSlots, ...this.warningIcons,
            this.txtDistance
        ];
        this.tweens.add({ targets: warningGroup, alpha: 0, duration: 300 });

        // ====== PHASE 1.5: Reset KTS về tư thế chuẩn (đứng thẳng, bất lực) ======
        // KTS đang chạy rượt → dừng lại bị tóm. Kill rotation tween, reset angle.
        this.tweens.killTweensOf(this.player);
        this.player.setAngle(0);
        this.tweens.add({
            targets: this.player,
            y: 550,
            duration: 300, ease: 'Sine.easeOut'
        });

        // ====== PHASE 2 (400-1800ms): Cinematic — Thanh Tra tóm KTS, Boss chạy mất ======
        this.time.delayedCall(400, () => {
            // 2a. Boss chạy mất về phía bên phải (x=1150 → x=1500, off-screen)
            // Boss "thách thức", vụt biến khỏi màn hình — hero feel ngược (player thua, boss thắng)
            this.tweens.add({
                targets: this.boss,
                x: 1500,
                duration: 1200, ease: 'Sine.easeIn'
            });

            // 2b. Thanh Tra từng sau lưng tiến tới tóm KTS
            // Inspector hiện tại ở x ≈ player.x - 60 (bắt kịp). Tắng về ngay cạnh player bên trái.
            // KTS x=150 → Inspector mục tiêu x=70 (sát bên trái KTS, đang đứng).
            this.tweens.add({
                targets: this.inspector,
                xOffset: -80,    // x = player.x - 80 = 150-80 = 70
                duration: 1400, ease: 'Sine.easeOut',
                onUpdate: () => {
                    this.inspector.x = this.player.x + this.inspector.xOffset;
                }
            });

            // 2c. KTS run rẩy (lắc nhẹ trái phải ±5°) — bất lực bị tóm
            this.tweens.add({
                targets: this.player,
                angle: { from: -5, to: 5 },
                duration: 120, yoyo: true, repeat: 11
            });

            // 2d. Text "🚨 BỊ TÓM!" pop in sau 1000ms (icon còi ú, đối xứng với "✋ ĐÃ TÓM" bên win)
            this.time.delayedCall(1000, () => {
                let caughtTxt = this.add.text(305, 420, '🚨 BỊ TÓM!', {
                    fontFamily: FONT_TITLE, fontSize: '56px', fill: COLORS.danger.hex,
                    fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 8
                }).setOrigin(0.5).setDepth(15).setScale(0);

                // Pop in animation (Back.easeOut)
                this.tweens.add({
                    targets: caughtTxt,
                    scaleX: 1, scaleY: 1,
                    duration: 300, ease: 'Back.easeOut'
                });
                // Pulse nhẹ
                this.time.delayedCall(300, () => {
                    this.tweens.add({
                        targets: caughtTxt, scaleX: 1.15, scaleY: 1.15,
                        duration: 200, yoyo: true, repeat: 1
                    });
                });
            });
        });

        // ====== PHASE 3 (4500ms): Dừng cảnh ~3s sau text "BỊ TÓM" → show popup ======
        // Timeline: P1 fade (0-400) → P2 movement (400-1800) → "BỊ TÓM" hiện @1400-2100ms
        //          → dừng frame ~2.4s cho người chơi ngắm cảnh thua → popup @4500ms
        this.time.delayedCall(4500, () => {
            this.physics.pause();
            this.showGameOverPopup(msg);
        });
    }

    showGameOverPopup(msg) {
        // BUG-FIX (2026-05-16): depth 100 for popup to render above scene layers (buildings=2, ground=3, etc.)
        // BUG-FIX (2026-05-17 v3): Thêm dim overlay 0.6 phủ scene (chuẩn UX Planet popup pattern).
        // Lý do: popup box opacity 0.95 không đủ tách bạch với scene, mắt khó focus vào CTA. Dim layer cho thấy
        // "session đã pause, vẫn còn ngữ cảnh nhưng cần action".
        // BUG-FIX (2026-05-17 v4): Thêm nút RETRY (chuẩn runner game Subway Surfers/Temple Run).
        // Popup giờ có 2 CTA: THỬ LẠI (restart Màn 3) + ĐẬP MÁY (sang Rage Mode).
        // Layout: box cao 360px (cũ 300), msg y=270, btn Retry y=400 info-blue, btn Rage y=475 danger-red.
        // Button color theo GameDev.net convention: positive=info-blue, negative/extreme=danger-red.
        // CINEMATIC-LOSE (2026-05-17 v8): Tách từ triggerGameOver() ra method riêng để gọi sau cutscene.
        const POPUP_DEPTH = 100;
        this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.6).setDepth(POPUP_DEPTH);
        let box = this.add.rectangle(640, 360, 650, 360, COLORS.bgDarkest.num, 0.95).setStrokeStyle(4, COLORS.danger.num).setDepth(POPUP_DEPTH + 1);

        let parts = msg.split('\n');
        let title = parts[0] || 'THẤT BẠI';
        let reason = parts[1] || '';

        this.add.text(640, 240, title, { fontFamily: FONT_TITLE, fontSize: '48px', fill: COLORS.danger.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);
        if (reason) {
            this.add.text(640, 300, reason, { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);
        }

        // Nút THỬ LẠI (Retry màn này)
        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton (bo góc Qt-style).
        createRoundedButton(this, 640, 400, 350, 56, '🔄 THỬ LẠI MÀN 3', {
            bgColor: COLORS.info.num,
            bgHover: 0x5dade2,
            borderColor: COLORS.textPrimary.num,
            radius: 6,
            fontSize: '22px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.restart()
        });

        // Nút ĐẬP MÁY (sang Rage Mode) — Player giving up → surrenders to Màn 4 per GDD narrative.
        createRoundedButton(this, 640, 475, 350, 56, '🔥 ĐẬP MÁY TỰ TỬ (RAGE)', {
            bgColor: COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.start('SceneRageMode')
        });
    }

    triggerWin() {
        playSound(this, 'sfx_win');
        this.isGameOver = true;
        if (this.spawnTimer) this.spawnTimer.remove();
        if (this.coinTimer) this.coinTimer.remove();

        // CINEMATIC-WIN (2026-05-17 v8): KHÔNG pause physics ngay — cần cutscene chạy tiếp.
        // Reset player velocity + tắt gravity để player đứng yên không rơi giữa không trung.
        this.player.body.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        this.playWinCutscene();
    }

    // ==========================================
    // CINEMATIC WIN CUTSCENE (2026-05-17 v8)
    // ==========================================
    // 3 phase: clear màn → camera transition → popup.
    // Mục đích: cinematic payoff cho ~50s rượt đuổi, thay vì popup hiện cụt ngủn.
    // KHÔNG dùng camera zoom (gây vỡ popup sau này, đã bàn và quyết tạm bỏ).
    playWinCutscene() {
        // ====== PHASE 1 (0-400ms): Clear màn ======
        // Fade out tất cả obstacles còn lại — không còn cản đường nữa, biến mất ma thuật
        this.obstacles.getChildren().forEach(obs => {
            this.tweens.add({
                targets: obs, alpha: 0, y: obs.y - 30,
                duration: 400, ease: 'Power2',
                onComplete: () => obs.destroy()
            });
        });

        // Fade out collectibles (lon Heo Húc còn trên màn)
        this.collectibles.getChildren().forEach(coin => {
            this.tweens.add({
                targets: coin, alpha: 0,
                duration: 300,
                onComplete: () => coin.destroy()
            });
        });

        // Fade out warning HUD + distance text (đã hết ý nghĩa)
        let warningGroup = [
            this.warningPanelBg, this.warningTitle,
            ...this.warningSlots, ...this.warningIcons,
            this.txtDistance
        ];
        this.tweens.add({ targets: warningGroup, alpha: 0, duration: 300 });

        // ====== PHASE 1.5: Reset KTS về tư thế chuẩn ======
        // Nếu player thắng đúng lúc đang giữa rotation tween (lộn 360°) hoặc đang trên không,
        // freeze trong tư thế xấu. Kill tween + reset angle + đưa về y=550 (chân chạm ground).
        this.tweens.killTweensOf(this.player);
        this.player.setAngle(0);
        this.tweens.add({
            targets: this.player,
            y: 550,
            duration: 300, ease: 'Sine.easeOut'
        });

        // ====== PHASE 2 (400-1800ms): Cinematic action — KTS bắt Boss ======
        this.time.delayedCall(400, () => {
            // 2a. Boss lùi về phía KTS (x=1150 → x=380). Cảm giác Boss "bị tóm".
            this.tweens.add({
                targets: this.boss,
                x: 380,
                duration: 1400, ease: 'Sine.easeInOut'
            });

            // 2b. Inspector lùi xa khỏi player. Phải dùng onUpdate vì update() đã ngừng
            // (isGameOver=true block đầu update() → không tự động sync inspector.x = player.x + xOffset).
            this.tweens.add({
                targets: this.inspector,
                xOffset: -600,
                duration: 1400, ease: 'Sine.easeOut',
                onUpdate: () => {
                    this.inspector.x = this.player.x + this.inspector.xOffset;
                }
            });

            // 2c. KTS bước nhẹ về phía boss (x=150 → x=230) — hero feel, chủ động túm boss
            this.tweens.add({
                targets: this.player,
                x: 230,
                duration: 1400, ease: 'Sine.easeOut'
            });

            // 2d. Boss panicking — lắc nhẹ trái phải (cảm giác sợ hãi, vùng vẫy)
            this.tweens.add({
                targets: this.boss,
                angle: { from: -8, to: 8 },
                duration: 100, yoyo: true, repeat: 13
            });

            // 2e. Text "✋ ĐÃ TÓM!" pop in sau 1000ms — visual confirmation
            this.time.delayedCall(1000, () => {
                let caughtTxt = this.add.text(305, 420, '✋ ĐÃ TÓM!', {
                    fontFamily: FONT_TITLE, fontSize: '56px', fill: COLORS.warning.hex,
                    fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 8
                }).setOrigin(0.5).setDepth(15).setScale(0);

                // Pop in animation (Back.easeOut = bounce nhẹ)
                this.tweens.add({
                    targets: caughtTxt,
                    scaleX: 1, scaleY: 1,
                    duration: 300, ease: 'Back.easeOut'
                });
                // Pulse nhẹ sau khi pop in
                this.time.delayedCall(300, () => {
                    this.tweens.add({
                        targets: caughtTxt, scaleX: 1.15, scaleY: 1.15,
                        duration: 200, yoyo: true, repeat: 1
                    });
                });
            });
        });

        // ====== PHASE 3 (4500ms): Dừng cảnh bắt ~3s sau khi text "ĐÃ TÓM" hiện → show popup ======
        // Timeline: P1 fade (0-400) → P2 movement (400-1800) → "ĐÃ TÓM" hiện @1400-2100ms
        //          → dừng frame ~2.4s cho người chơi ngắm cảnh → popup @4500ms
        this.time.delayedCall(4500, () => {
            this.physics.pause();
            this.showWinPopup();
        });
    }

    showWinPopup() {
        // BUG-FIX (2026-05-16): depth 100 for popup to render above scene layers
        // BUG-FIX (2026-05-17 v3): Dim overlay 0.6 phủ scene cho focus rõ vào popup.
        // CINEMATIC-WIN (2026-05-17 v8): Tách từ triggerWin() ra method riêng để gọi sau cutscene.
        const POPUP_DEPTH = 100;
        this.add.rectangle(640, 360, 1280, 720, COLORS.bgDarkest.num, 0.6).setDepth(POPUP_DEPTH);
        let box = this.add.rectangle(640, 360, 800, 300, COLORS.bgDarkest.num, 0.95).setStrokeStyle(4, COLORS.warning.num).setDepth(POPUP_DEPTH + 1);

        this.add.text(640, 250, 'BẠN ĐÃ ĐUỔI KỊP SHARK LƯƠN!', { fontFamily: FONT_TITLE, fontSize: '48px', fill: COLORS.warning.hex, fontStyle: 'bold', stroke: COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);
        this.add.text(640, 310, 'Nhưng hắn vừa leo lên chiếc Maybach rồ ga chạy mất.\nTiền tài khoản của bạn: -500.000 VNĐ', { fontFamily: FONT_MAIN, fontSize: '24px', fill: COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);

        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton.
        createRoundedButton(this, 640, 420, 350, 60, '🔥 NỔI ĐIÊN (SANG MÀN 4) 🔥', {
            bgColor: COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.start('SceneRageMode')
        });
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    parent: 'game-container',
    backgroundColor: COLORS.bgDarkest.hex,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [SceneBoot, SceneIntro, Scene1, SceneCloneStamp, Scene2, SceneDebtRunner, SceneRageMode]
};

const game = new Phaser.Game(config);
