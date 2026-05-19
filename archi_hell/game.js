/*!
 * ════════════════════════════════════════════════════════════════
 *  THE ARCHI-HELL
 *  A satirical mini-game for architects (KTS) about the year 2026.
 * ════════════════════════════════════════════════════════════════
 *
 *  Build ID    : AH3-ARCHI-HELL-7f3c92e8a4d1
 *  Version     : v1.1.5g (2026-05-18)
 *  Author      : Hoàng - ArchiH3 Studio
 *  Website     : https://archih3.com
 *  Contact     : hohuuhoang@archih3.com
 *  License     : PROPRIETARY — All rights reserved.
 *
 *  ⚠️ COPYRIGHT NOTICE
 *  This source code, assets (images, sounds, fonts), game design,
 *  characters, story, and all related materials are the exclusive
 *  intellectual property of Hoàng / ArchiH3 Studio.
 *
 *  Unauthorized copying, modification, distribution, redistribution,
 *  republication, reverse engineering, or commercial use of this
 *  software — in whole or in part — is STRICTLY PROHIBITED without
 *  prior written permission from the author.
 *
 *  For licensing inquiries, partnerships, or permissions, contact:
 *      📧 hohuuhoang@archih3.com
 *      🌐 https://archih3.com
 *
 *  This game is also distributed as part of AH3 Hub plugin for
 *  Autodesk 3ds Max, available at https://archih3.com
 *
 * ════════════════════════════════════════════════════════════════
 */

// THE ARCHI-HELL - MÀN 1: GÓC LÀM VIỆC LÚC 3 GIỜ SÁNG
// Phong cách UI: Chân thực (Realistic Computer UI / 3ds Max Theme)

const AH3_GAME_STATS = {
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
const AH3_COLORS = {
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

    let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.8).setInteractive().setDepth(POPUP_DEPTH);
    let box = this.add.rectangle(640, 310, 850, 320, AH3_COLORS.bgMedium.num, 0.85).setStrokeStyle(4, AH3_COLORS.warning.num).setDepth(POPUP_DEPTH);

    let t = this.add.text(640, 110, title, { fontFamily: FONT_TITLE, fontSize: '32px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5).setDepth(POPUP_DEPTH);
    let d = this.add.text(640, 180, lines.join('\n'), { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, align: 'left', lineSpacing: 15, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5, 0).setDepth(POPUP_DEPTH);

    // CTA bo góc Qt-style (radius 8, success green, hover lighter, press feedback)
    let btnStart = createRoundedButton(this, 640, 540, 300, 60, 'ĐÃ HIỂU - CHIẾN!', {
        bgColor: AH3_COLORS.success.num,
        bgHover: 0x40d97f,
        borderColor: AH3_COLORS.textPrimary.num,
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
class AH3_SceneBoot extends Phaser.Scene {
    constructor() { super('SceneBoot'); }

    create() {
        this.cameras.main.setBackgroundColor(AH3_COLORS.bgMedium.hex);
        this.add.text(640, 340, 'THE ARCHI-HELL', { fontFamily: FONT_TITLE, fontSize: '64px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let statusText = this.add.text(640, 400, 'Loading assets...', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.strokeLight.hex }).setOrigin(0.5);

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
class AH3_SceneIntro extends Phaser.Scene {
    constructor() { super('SceneIntro'); }

    init(data) {
        this.level = data.level || 1;
    }

    create() {
        let sceneTitle = '';
        let instructions = [];
        let targetScene = '';
        let onStartFn = null;
        let bgColor = AH3_COLORS.bgMedium.hex;
        let borderColor = AH3_COLORS.warning.num;

        if (this.level === 1) {
            bgColor = '#111827';
            borderColor = AH3_COLORS.info.num;
            sceneTitle = 'MÀN 1: GÓC LÀM VIỆC LÚC 3 GIỜ SÁNG';
            instructions = [
                "📜 HƯỚNG DẪN SINH TỒN (HOÀN THÀNH TRONG 45 GIÂY!):",
                "",
                "🖱️ GIAI ĐOẠN 1: MULTI-TASKING LIÊN TỤC",
                "   -> Liên tục luân phiên giữa BẤM NÚT LỆNH 3DS MAX (Màu cam) và GÕ PHÍM (Audition).",
                "   -> Phải căn thời gian! Gõ đúng: Tăng tiến độ. Chậm trễ / Gõ sai: Bị cộng Stress!",
                "☕ UỐNG CÀ PHÊ: Thanh Cà phê cạn = Stress tăng. Nhớ bấm Cốc Cà phê ở góc phải!",
                "⚠️ BẪY BẢN QUYỀN: Bị quét IP thì chọn 'DÙNG THỬ', tuyệt đối không bấm Edu.",
                "🔥 GIAI ĐOẠN 2 (95%): Cứu File khi bị Crash & BẤM NÚT RENDER CUỐI CÙNG!"
            ];
            targetScene = 'Scene1';
            onStartFn = () => {
                AH3_GAME_STATS.progress = 0;
                AH3_GAME_STATS.stressLevel = 50;
                AH3_GAME_STATS.coffeeLevel = 100;
                AH3_GAME_STATS.deadlineTime = 5 * 3600 - 1;
                AH3_GAME_STATS.hasEduWatermark = false;
                AH3_GAME_STATS.usedPinterest = false;
            };
        } else if (this.level === 1.5) {
            bgColor = '#2d261a';
            borderColor = AH3_COLORS.warning.num;
            sceneTitle = 'MÀN 1.5: SỬA LỖI WATERMARK';
            instructions = [
                "📜 LUẬT CHƠI:",
                "-> Bạn lỡ bấm nhầm bản Giáo Dục (Edu). Ảnh render bị lỗi chữ chình ình!",
                "-> Hãy dùng Clone Stamp (Click & Kéo chuột) để tẩy chữ.",
                "-> Bạn có đúng 15 giây trước khi sếp kiểm tra!",
                "-> Cẩn thận: Chữa lợn lành thành lợn què!"
            ];
            targetScene = 'SceneCloneStamp';
        } else if (this.level === 2) {
            bgColor = '#0f292e';
            borderColor = AH3_COLORS.info.num;
            sceneTitle = 'MÀN 2: CUỘC HỌP HÚT MÁU';
            instructions = [
                "📜 HƯỚNG DẪN ĐẤU KHẨU:",
                "-> Chủ đầu tư sẽ dùng mọi lý lẽ để 'ép giá' hoặc 'xù tiền'.",
                "-> Hãy cân nhắc kỹ từng câu trả lời để không làm SỨC CHỊU ĐỰNG của đối phương về 0.",
                "-> Lựa chọn hiền lành sẽ giúp an toàn, nhưng mất Tự Trọng (Trầm cảm).",
                "-> Lựa chọn tàn bạo nhất sẽ dẫn đến: KÍCH HOẠT RAGE MODE!"
            ];
            targetScene = 'Scene2';
        } else if (this.level === 3) {
            bgColor = '#2c1b18';
            borderColor = AH3_COLORS.success.num;
            sceneTitle = 'MÀN 3: CUỘC CHIẾN ĐÒI NỢ';
            instructions = [
                "📜 HƯỚNG DẪN CHẠY TRỐN & ĐUỔI BẮT:",
                "-> 'Shark Lươn' đã chuồn mất. Bạn phải rượt theo để đòi tiền thiết kế!",
                "-> Bấm SPACE hoặc Click Chuột để nhảy qua bẫy (Khất nợ, Block Zalo...).",
                "-> Phía sau lưng là Thanh Tra Bản Quyền đang truy đuổi sát nút.",
                "-> Vấp bẫy = Giảm tốc độ. Bị Thanh tra tóm = Phạt 1 Tỷ (Phá Sản)!",
                "-> NHẢY KÉP (Nháy 2 lần) cần ≥50% NĂNG LƯỢNG, đập NÁT bẫy khi rơi xuống!",
                "-> Uống 'Heo Húc' → +50% năng lượng. Hết năng lượng → không nhảy đúp được nữa!"
            ];
            targetScene = 'SceneDebtRunner';
        } else if (this.level === 4) {
            bgColor = '#3a0a0a';
            borderColor = AH3_COLORS.danger.num;
            sceneTitle = 'MÀN 4: RAGE MODE - TRẢ THÙ ĐỜI';
            instructions = [
                "📜 LUẬT CHƠI ĐẬP PHÁ:",
                "-> Văn phòng Shark Lươn chia thành 96 Ô. PHÁ SẠCH = THẮNG!",
                "-> 🔨 CLICK Ô = Búa (1 ô) - vô hạn, không cần câu đố.",
                "-> 🛢️ XĂNG (2x2) và 🏗️ CẨU (3x3) - trả câu đố KTS mới được dùng.",
                "-> 🔥 Phá liên tục trong 2 giây = COMBO! Combo cao = trào phúng đỉnh!",
                "-> Theo dõi Shark Lươn van xin và thống kê bên phải khi đập phá!"
            ];
            targetScene = 'SceneRageMode';
        }

        this.cameras.main.setBackgroundColor(bgColor);

        this.add.text(640, 80, 'THE ARCHI-HELL', { fontFamily: FONT_TITLE, fontSize: '48px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 6 }).setOrigin(0.5);
        this.add.text(640, 130, sceneTitle, { fontFamily: FONT_TITLE, fontSize: '24px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);

        let box = this.add.rectangle(640, 280, 900, 270, AH3_COLORS.bgMedium.num, 0.82);
        box.setStrokeStyle(2, borderColor);

        this.add.text(640, 280, instructions.join('\n'), { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textSecondary.hex, align: 'left', lineSpacing: 10, wordWrap: { width: 850, useAdvancedWrap: true } }).setOrigin(0.5);

        createRoundedButton(this, 640, 475, 350, 70, 'START', {
            bgColor: AH3_COLORS.success.num,
            bgHover: 0x40d97f,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 8,
            fontFamily: FONT_TITLE,
            fontSize: '48px',
            fontStyle: 'bold',
            onClick: () => {
                // Tracking GA4
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'start_game', {
                        'level_id': this.level,
                        'level_name': sceneTitle
                    });
                }
                
                // Tăng biến đếm public
                fetch('https://api.counterapi.dev/v1/archih3_studio/archi_hell_plays/up').catch(e=>{});

                if (onStartFn) onStartFn();
                this.scene.start(targetScene);
            }
        });

        // --- NHẢY NHANH CÁC MÀN (DEV MODE / QUICK PLAY) ---
        this.add.text(640, 535, '-- ĐI TẮT ĐẾN CÁC MÀN TIẾP THEO --', { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textMuted.hex }).setOrigin(0.5);

        let createJumpBtn = (x, text, lvl, setupStats) => {
            createRoundedButton(this, x, 575, 230, 34, text, {
                bgColor: AH3_COLORS.bgLightAlt.num,
                bgHover: 0x4a6480,
                borderColor: AH3_COLORS.textMuted.num,
                radius: 4,
                fontFamily: FONT_MAIN,
                fontSize: '16px',
                fontStyle: '800',
                fontColor: AH3_COLORS.textPrimary.hex,
                onClick: () => {
                    // Tracking GA4
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'quick_jump', {
                            'target_level': lvl,
                            'button_text': text
                        });
                    }

                    AH3_GAME_STATS.progress = 0;
                    AH3_GAME_STATS.stressLevel = 50;
                    AH3_GAME_STATS.hasEduWatermark = false;
                    AH3_GAME_STATS.usedPinterest = false;
                    if (setupStats) setupStats();
                    this.scene.start('SceneIntro', { level: lvl });
                }
            });
        };

        createJumpBtn(140, 'Màn 1 (Render)', 1, () => { });
        createJumpBtn(390, 'Màn 1.5 (Tẩy Xóa)', 1.5, () => { AH3_GAME_STATS.hasEduWatermark = true; });
        createJumpBtn(640, 'Màn 2 (Họp Khách)', 2, () => { });
        createJumpBtn(890, 'Màn 3 (Đòi Nợ)', 3, () => { });
        createJumpBtn(1140, 'Màn 4 (Rage Mode)', 4, () => { });

        // --- FOOTER CREDIT ARCHIH3 (style bo tròn như Qt Python dialog) ---
        // LAYOUT-OVERHAUL (2026-05-17 v6): Footer y=615-690, padding-bottom 30px (cũ v5 = 14px).
        // Style: rounded panel dùng Graphics.fillRoundedRect(radius=8) — giống base_dialog.py Qt theme.

        // Separator line trên footer (gạch ngang mờ tách biệt với jump buttons)
        let sep = this.add.graphics();
        sep.lineStyle(1, AH3_COLORS.strokeMid.num, 0.5);
        sep.lineBetween(440, 615, 840, 615);

        // Footer panel bo tròn (Qt-style dark card, opacity 0.6 để hiểu là secondary content)
        let footerGfx = this.add.graphics();
        footerGfx.fillStyle(AH3_COLORS.bgDark.num, 0.6);
        footerGfx.lineStyle(1, AH3_COLORS.strokeDark.num, 0.8);
        footerGfx.fillRoundedRect(440, 630, 400, 60, 8);
        footerGfx.strokeRoundedRect(440, 630, 400, 60, 8);

        // Logo ArchiH3 bên trái (40×40, fallback vẽ badge "H3" nếu PNG chưa load được)
        if (this.textures.exists('archih3_logo')) {
            scaleImageToFit(this.add.image(475, 660, 'archih3_logo'), 40).setOrigin(0.5, 0.5);
        } else {
            // Fallback Graphics badge nếu logo PNG chưa có trong assets.js (chưa chạy make_assets.py)
            let fb = this.add.graphics();
            fb.fillStyle(AH3_COLORS.danger.num, 1);
            fb.fillRoundedRect(457, 642, 36, 36, 6);
            this.add.text(475, 660, 'H3', { fontFamily: FONT_TITLE, fontSize: '18px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        }

        // Brand name + tagline bên phải logo (origin left, 3 dòng xếp dọc)
        this.add.text(510, 645, 'ArchiH3 Studio', { fontFamily: FONT_TITLE, fontSize: '16px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(510, 663, 'archih3.com  •  Arch. Ho Huu Hoang', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textMuted.hex }).setOrigin(0, 0.5);
        this.add.text(510, 679, '"Game cho KTS, mới chuẩn chứ"', { fontFamily: FONT_MAIN, fontSize: '12px', fill: AH3_COLORS.textMuted.hex, fontStyle: 'italic' }).setOrigin(0, 0.5);

        // --- PUBLIC PLAY COUNTER ---
        let counterTxt = this.add.text(30, 680, 'Số lượt trầm cảm: Đang tải...', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.textMuted.hex }).setOrigin(0, 0.5);
        fetch('https://api.counterapi.dev/v1/archih3_studio/archi_hell_plays')
            .then(res => res.json())
            .then(data => {
                if(data && typeof data.count !== 'undefined') {
                    counterTxt.setText('Số lượt trầm cảm (lượt chơi): ' + data.count);
                }
            })
            .catch(e => {
                counterTxt.setText('Lỗi đếm: ' + e.message);
                console.error("Counter API Error:", e);
            });

        // --- FOOTER INTERACTION ---
        let footerHitbox = this.add.rectangle(640, 660, 400, 60, 0x000000, 0).setInteractive({ useHandCursor: true });
        footerHitbox.on('pointerdown', () => {
            const POPUP_DEPTH = 200;
            let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.8).setInteractive().setDepth(POPUP_DEPTH);
            let box = this.add.rectangle(640, 360, 650, 200, AH3_COLORS.bgMedium.num, 0.95).setStrokeStyle(3, AH3_COLORS.warning.num).setDepth(POPUP_DEPTH);
            
            let q = this.add.text(640, 300, 'Bạn có muốn chuyển tới trang web\nchính của nhà phát triển không?', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(POPUP_DEPTH);
            
            let btnYes = createRoundedButton(this, 520, 400, 140, 50, 'YES', {
                bgColor: AH3_COLORS.success.num,
                bgHover: 0x40d97f,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                depth: POPUP_DEPTH,
                onClick: () => {
                    window.open('https://archih3.com', '_blank');
                    overlay.destroy();
                    box.destroy();
                    q.destroy();
                    if (btnYes && btnYes.destroy) btnYes.destroy();
                    if (btnNo && btnNo.destroy) btnNo.destroy();
                }
            });

            let btnNo = createRoundedButton(this, 760, 400, 140, 50, 'NO', {
                bgColor: AH3_COLORS.danger.num,
                bgHover: 0xec7063,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                depth: POPUP_DEPTH,
                onClick: () => {
                    overlay.destroy();
                    box.destroy();
                    q.destroy();
                    if (btnYes && btnYes.destroy) btnYes.destroy();
                    if (btnNo && btnNo.destroy) btnNo.destroy();
                }
            });
        });
    }
}

// ==========================================
// MÀN 1: GAMEPLAY
// ==========================================
class AH3_Scene1 extends Phaser.Scene {
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
        this.bgImage.setTint(AH3_COLORS.strokeMid.num); // Grayscale/dark tint = unrendered

        // --- RENDER GRID (bucket rendering visualization) ---
        this.createRenderGrid();

        // Lớp phủ tối nhẹ phía trên grid để UI đọc được
        this.uiOverlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.2);

        this.createHUD();
        this.createMaxWindow();

        // --- CỐC CAFE UI ---
        // LAYOUT-FIX (2026-05-17): Refactor từ 200x80 text-only → 90x90 vuông icon + text dưới.
        // Cũ: (1150, 620) 200x80 → đè 15px lên Progress Bar (y=645) + cách bottom maxWindow chỉ 20px.
        // Mới: (1220, 605) 90x90 → tránh hoàn toàn maxWindow (bottom y=600) và Progress Bar (top y=645).
        // Icon ui_coffee.png ở giữa-trên, text "UỐNG CAFE" ở giữa-dưới.
        this.coffeeBtn = this.add.rectangle(1220, 605, 90, 90, AH3_COLORS.bgLight.num, 0.9).setInteractive();
        this.coffeeBtn.setStrokeStyle(2, AH3_COLORS.purple.num);
        this.coffeeIcon = scaleImageToFit(this.add.image(1220, 590, 'ui_coffee'), 50);
        this.coffeeTxt = this.add.text(1220, 635, 'UỐNG CAFE', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
        this.coffeeCooldown = false;

        this.coffeeBtn.on('pointerdown', () => {
            if (!this.coffeeCooldown && !this.eventActive) {
                AH3_GAME_STATS.coffeeLevel += 40;
                if (AH3_GAME_STATS.coffeeLevel > 100) AH3_GAME_STATS.coffeeLevel = 100;

                this.coffeeCooldown = true;
                this.coffeeBtn.setFillStyle(AH3_COLORS.textMuted.num);
                this.coffeeIcon.setAlpha(0.4); // Dim icon khi đang pha
                this.coffeeTxt.setText('ĐANG PHA...');

                this.time.delayedCall(5000, () => {
                    this.coffeeCooldown = false;
                    this.coffeeBtn.setFillStyle(AH3_COLORS.bgLight.num);
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

        // BUG-FIX (2026-05-18): Scene instance properties persist across scene.restart()/start('Scene1').
        // startAuditionMode() dùng `if (!this.auditionTitle)` để gate creation → sau retry, refs vẫn trỏ
        // GameObject cũ (đã destroy) nên if=false → bỏ qua tạo mới → audition UI biến mất, người chơi
        // bấm Phase 1 xong vào Phase 2 thấy maxWindow trống không có ô mũi tên để bấm.
        // Fix: null các refs ở create() để startAuditionMode lần sau tạo lại sạch.
        this.auditionTitle = null;
        this.auditionDesc = null;
        this.arrowContainer = null;
        this.btnBigRender = null;
        this.txtBigRender = null;
        this.toolTween = null;

        this.startToolMode();

        // Timers
        this.time.addEvent({ delay: 1000, callback: this.onTick, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 12000, callback: this.triggerLicenseAudit, callbackScope: this, loop: true });
    }

    createHUD() {
        // Khung UI tổng (Top Left)
        // Bỏ hudBox1 (Khung bao quanh Deadline) để layout thoáng hơn
        this.add.text(45, 35, 'DEADLINE:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' });
        // Nới rộng chiều ngang (300 -> 360) và chiều cao (60 -> 80) để chứa đủ font pixel to
        this.add.rectangle(200, 95, 360, 80, AH3_COLORS.bgDark.num, 0.7).setStrokeStyle(2, AH3_COLORS.danger.num);
        this.txtDeadline = this.add.text(200, 95, '04:59:59', { fontFamily: FONT_TITLE, fontSize: '64px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 2 }).setOrigin(0.5);

        // Khung UI tổng (Top Right)
        let rightX = 1080;
        // Bỏ hudBox2 (Khung bao quanh Stats) để layout thoáng hơn

        let startY = 45;
        this.add.text(rightX - 150, startY, 'STRESS:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightX + 50, startY, 180, 16, AH3_COLORS.bgDark.num).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.barStress = this.add.rectangle(rightX - 40, startY, 0, 16, AH3_COLORS.danger.num).setOrigin(0, 0.5);
        this.txtStress = this.add.text(rightX + 150, startY, '50%', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        startY += 35;
        this.add.text(rightX - 150, startY, 'TÀI KHOẢN:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.txtMoney = this.add.text(rightX + 150, startY, `-150.000 VNĐ`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        startY += 35;
        this.add.text(rightX - 150, startY, 'CÀ PHÊ:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightX + 50, startY, 180, 16, AH3_COLORS.bgDark.num).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.barCoffee = this.add.rectangle(rightX - 40, startY, 180, 16, AH3_COLORS.purple.num).setOrigin(0, 0.5);
        this.txtCoffee = this.add.text(rightX + 150, startY, '100%', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        // Progress Bar (Bottom Center)
        // Bỏ progBox (Khung bao quanh Tiến độ Render) để layout thoáng hơn
        this.add.text(210, 660, 'TIẾN ĐỘ RENDER:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(640, 690, 860, 24, AH3_COLORS.bgDark.num).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.barProgress = this.add.rectangle(210, 690, 0, 24, AH3_COLORS.success.num).setOrigin(0, 0.5);
    }

    createMaxWindow() {
        // Cửa sổ 3ds Max giả lập
        this.maxWindow = this.add.container(640, 380);

        let winWidth = 720;
        let winHeight = 440;

        // Main window bg (semi-transparent)
        let bg = this.add.rectangle(0, 0, winWidth, winHeight, AH3_COLORS.strokeDark.num, 0.8).setStrokeStyle(2, AH3_COLORS.bgMedium.num);

        // Title bar
        let titleBar = this.add.rectangle(0, -winHeight / 2 + 15, winWidth, 30, AH3_COLORS.bgMedium.num);
        let titleTxt = this.add.text(-winWidth / 2 + 10, -winHeight / 2 + 15, 'Ao-Tu-Đét 3D Mắc 2026 - Render_Cuoi_Cung_Chot_V9.max', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.strokeLight.hex }).setOrigin(0, 0.5);

        // Window buttons (fake)
        let btnMin = this.add.text(winWidth / 2 - 80, -winHeight / 2 + 15, '—', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.strokeLight.hex, fontStyle: 'bold' }).setOrigin(0.5);
        let btnMax = this.add.text(winWidth / 2 - 45, -winHeight / 2 + 15, '☐', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.strokeLight.hex, fontStyle: 'bold' }).setOrigin(0.5);
        
        // Nút Close nền đỏ Windows
        let closeBg = this.add.rectangle(winWidth / 2 - 15, -winHeight / 2 + 15, 30, 30, AH3_COLORS.danger.num);
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
            let btnBg = this.add.rectangle(bx, by, 150, 80, AH3_COLORS.strokeDark.num, 0.8).setInteractive();
            btnBg.setStrokeStyle(1, AH3_COLORS.strokeMid.num);

            let txt = this.add.text(bx, by, toolNames[i], { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.strokeLight.hex, fontStyle: 'bold', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5);

            this.toolBtns.push({ bg: btnBg, txt: txt, index: i });
            this.maxWindow.add([btnBg, txt]);

            btnBg.on('pointerover', () => { if (this.activeToolIndex !== i) btnBg.setFillStyle(AH3_COLORS.strokeMid.num); });
            btnBg.on('pointerout', () => { if (this.activeToolIndex !== i) btnBg.setFillStyle(AH3_COLORS.strokeDark.num); });
            btnBg.on('pointerdown', () => this.handleToolClick(i));
        }

        // Tạo thanh thời gian cho Minigame (Time Bar)
        this.maxWindow.add(this.add.text(0, 160, 'TIME LIMIT', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.strokeLight.hex }).setOrigin(0.5));
        this.miniTimerBg = this.add.rectangle(0, 180, 500, 15, AH3_COLORS.bgDark.num).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.miniTimerBar = this.add.rectangle(-250, 180, 500, 15, AH3_COLORS.info.num).setOrigin(0, 0.5);
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
                let tile = this.add.rectangle(x, y, tileW - 1, tileH - 1, AH3_COLORS.bgDark.num, 0.85);
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
            btn.bg.setFillStyle(AH3_COLORS.strokeDark.num);
            btn.bg.setStrokeStyle(1, AH3_COLORS.strokeMid.num);
            btn.txt.setColor(AH3_COLORS.strokeLight.hex);
            btn.txt.setScale(1);
        });

        let newIndex;
        do { newIndex = Phaser.Math.Between(0, 11); } while (newIndex === this.activeToolIndex);
        this.activeToolIndex = newIndex;

        let activeBtn = this.toolBtns[this.activeToolIndex];
        activeBtn.bg.setFillStyle(AH3_COLORS.warning.num); // Màu cam vàng kiểu select trong Max
        activeBtn.bg.setStrokeStyle(2, AH3_COLORS.textPrimary.num);
        activeBtn.txt.setColor(AH3_COLORS.textPrimary.hex);

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
            AH3_GAME_STATS.progress += 3.0;
            this.consecutiveClicks++;
            this.showMiniFeedback(realX, realY - 40, '+3%', AH3_COLORS.success.hex);
            this.revealTiles(3); // Reveal 3 render buckets
            this.updateUI();

            if (AH3_GAME_STATS.progress >= 95 && !this.crashTriggered) {
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
            AH3_GAME_STATS.stressLevel += 1;
            this.cameras.main.shake(100, 0.005);
            this.showMiniFeedback(realX, realY - 40, 'SAI LỆNH!\n+1% Stress', AH3_COLORS.danger.hex);
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
            this.auditionTitle = this.add.text(0, -100, '🔥 RAM ĐÃ BỐC KHÓI (99%) 🔥', { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);
            this.auditionDesc = this.add.text(0, -50, 'Tràn RAM! Gõ phím liên tục để tắt bớt 50 tab Cốc Cốc & cứu file:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.strokeLight.hex }).setOrigin(0.5);
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
            let box = this.add.rectangle(startX + i * 65, 0, 50, 50, AH3_COLORS.bgMedium.num).setStrokeStyle(2, AH3_COLORS.strokeMid.num);
            let txt = this.add.text(startX + i * 65, 0, chars[dir], { fontSize: '32px' }).setOrigin(0.5);
            this.arrowSprites.push({ box: box, txt: txt });
            this.arrowContainer.add([box, txt]);
        }

        this.arrowSequence.push('SPACE');
        let spaceBox = this.add.rectangle(startX + this.arrowLevel * 65 + 60, 0, 100, 50, AH3_COLORS.bgMedium.num).setStrokeStyle(2, AH3_COLORS.strokeMid.num);
        let spaceTxt = this.add.text(startX + this.arrowLevel * 65 + 60, 0, 'SPACE', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
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
            currentSprite.box.setFillStyle(AH3_COLORS.success.num);
            currentSprite.box.setStrokeStyle(2, AH3_COLORS.textPrimary.num);

            this.currentArrowIndex++;

            if (this.currentArrowIndex >= this.arrowSequence.length) {
                this.showMiniFeedback(640, 480, 'PERFECT! +8%', AH3_COLORS.warning.hex, 40);
                AH3_GAME_STATS.progress += 8;
                this.revealTiles(8); // Reveal 8 render buckets

                if (AH3_GAME_STATS.progress >= 95 && !this.crashTriggered) {
                    this.crashTriggered = true;
                    this.miniTimerActive = false; // STOP TIMER
                    this.triggerCrashEvent();
                }
                this.updateUI();

                if (AH3_GAME_STATS.progress < 95) {
                    if (this.arrowLevel < 5) this.arrowLevel++;
                    this.startToolMode(); // Trở lại Tool mode
                }
            }
        } else {
            playSound(this, 'sfx_error');
            this.showMiniFeedback(640, 480, 'SEQUENCE FAILED!\n+3% Stress', AH3_COLORS.danger.hex, 30);
            AH3_GAME_STATS.stressLevel += 3;
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

        this.btnBigRender = this.add.rectangle(0, 0, 350, 100, AH3_COLORS.success.num).setInteractive();
        this.btnBigRender.setStrokeStyle(4, AH3_COLORS.textPrimary.num);
        this.txtBigRender = this.add.text(0, 0, '⚡ RENDER FINAL ⚡', { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
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

        let msg = this.add.text(0, -30, 'Vi-Rách: Rendering image...', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.success.hex, fontStyle: 'bold' }).setOrigin(0.5);
        let renderBg = this.add.rectangle(0, 20, 500, 30, AH3_COLORS.bgDark.num).setStrokeStyle(2, AH3_COLORS.strokeMid.num);
        let renderBar = this.add.rectangle(-250, 20, 0, 30, AH3_COLORS.success.num).setOrigin(0, 0.5);
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
                AH3_GAME_STATS.progress = 95 + pct * 5;
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

                this.showFeedback("🎉 HOÀN THÀNH DỰ ÁN! BOOM! 🎉", AH3_COLORS.warning.hex);
                this.time.delayedCall(3000, () => {
                    if (AH3_GAME_STATS.hasEduWatermark) {
                        this.scene.start('SceneIntro', { level: 1.5 });
                    } else {
                        this.scene.start('SceneIntro', { level: 2 });
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

        if (pct > 0.5) this.miniTimerBar.setFillStyle(AH3_COLORS.info.num);
        else if (pct > 0.25) this.miniTimerBar.setFillStyle(AH3_COLORS.warning.num);
        else this.miniTimerBar.setFillStyle(AH3_COLORS.danger.num);

        if (this.miniTimeLeft <= 0) {
            this.miniTimeLeft = 0;
            this.miniTimerActive = false;

            AH3_GAME_STATS.stressLevel += 4;
            this.cameras.main.shake(100, 0.01);
            this.showMiniFeedback(640, 560, 'TIME OUT!\n+4% Stress', AH3_COLORS.danger.hex, 28);
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

        AH3_GAME_STATS.coffeeLevel -= 1;
        if (AH3_GAME_STATS.coffeeLevel <= 0) {
            AH3_GAME_STATS.coffeeLevel = 0;
            AH3_GAME_STATS.stressLevel += 5;
        } else {
            AH3_GAME_STATS.stressLevel += 1;
        }

        if (AH3_GAME_STATS.deadlineTime > 0) AH3_GAME_STATS.deadlineTime -= 400;

        this.updateUI();
        this.checkGameover();
    }

    updateUI() {
        this.barProgress.width = Math.max(0, Math.min(860, (AH3_GAME_STATS.progress / 100) * 860));
        let pStress = Math.max(0, Math.min(100, AH3_GAME_STATS.stressLevel));
        this.barStress.width = (pStress / 100) * 180;
        this.txtStress.setText(`${Math.floor(pStress)}%`);

        let pCoffee = Math.max(0, Math.min(100, AH3_GAME_STATS.coffeeLevel));
        this.barCoffee.width = (pCoffee / 100) * 180;
        this.txtCoffee.setText(`${Math.floor(pCoffee)}%`);

        let t = Math.max(0, AH3_GAME_STATS.deadlineTime);
        let h = Math.floor(t / 3600);
        let m = Math.floor((t % 3600) / 60);
        let s = t % 60;
        this.txtDeadline.setText(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    checkGameover() {
        if ((AH3_GAME_STATS.stressLevel >= 100 || AH3_GAME_STATS.deadlineTime <= 0) && !this.isGameOver) {
            this.isGameOver = true;
            this.eventActive = true;
            this.miniTimerActive = false;

            let reason = AH3_GAME_STATS.stressLevel >= 100 ? "TRẦM CẢM QUÁ MỨC!" : "CHÁY DEADLINE!";

            // Popup Overlay
            let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.85).setInteractive();
            // Tăng chiều cao box từ 350 lên 420 và dịch xuống y=370 để chứa đủ 3 nút bấm
            let box = this.add.rectangle(640, 370, 850, 420, AH3_COLORS.bgLight.num).setStrokeStyle(4, AH3_COLORS.danger.num);

            this.add.text(640, 220, '💀 THẤT BẠI 💀', { fontFamily: FONT_TITLE, fontSize: '64px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
            this.add.text(640, 280, reason, { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold', align: 'center', wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5);

            // Option 1: Retry
            // BUG-FIX (2026-05-17 v4): Đổi wording "CÀY LẠI TỪ ĐẦU" → "THỬ LẠI MÀN 1" — consistent với
            // các màn khác (Màn 2 "THỬ LẠI MÀN 2", Màn 3 "THỬ LẠI MÀN 3"). Logic không đổi (reset GLOBAL_STATS
            // + scene.start) vì đây thực chất là retry Màn 1 đầu chuỗi, không phải retry toàn game.
            // MIGRATION (2026-05-17 v7): 3 nút đổi sang createRoundedButton (bo góc Qt-style, hover lighter).
            createRoundedButton(this, 640, 340, 450, 50, '🔄 THỬ LẠI MÀN 1', {
                bgColor: AH3_COLORS.info.num,
                bgHover: 0x5dade2,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    AH3_GAME_STATS.progress = 0;
                    AH3_GAME_STATS.stressLevel = 50;
                    AH3_GAME_STATS.coffeeLevel = 100;
                    AH3_GAME_STATS.deadlineTime = 5 * 3600 - 1;
                    AH3_GAME_STATS.hasEduWatermark = false;
                    AH3_GAME_STATS.usedPinterest = false;
                    this.scene.start('Scene1');
                }
            });

            // Option 2: Pinterest
            createRoundedButton(this, 640, 410, 450, 50, '🤫 LẤY ẢNH PINTEREST NỘP ĐẠI', {
                bgColor: AH3_COLORS.success.num,
                bgHover: 0x40d97f,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    AH3_GAME_STATS.usedPinterest = true;
                    this.scene.start('SceneIntro', { level: 2 });
                }
            });

            // Option 3: Rage Quit
            createRoundedButton(this, 640, 480, 450, 50, '🔥 TỨC QUÁ! ĐẬP MÁY NGHỈ VIỆC!', {
                bgColor: AH3_COLORS.danger.num,
                bgHover: 0xec7063,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    this.scene.start('SceneIntro', { level: 4 });
                }
            });

        }
    }

    showMiniFeedback(x, y, text, color, size = 24) {
        // LAYOUT-FIX (2026-05-17): setDepth(100) để text feedback luôn render TRÊN maxWindow container.
        // Trước fix: TIME OUT/PERFECT/SAI LỆNH bị maxWindow (container, default depth 0) che mất.
        // Số 100 đủ lớn để vượt mọi UI khác (HUD default 0), không cần 1000 theo Phaser docs.
        let txt = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: `${size}px`, fill: color, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: txt, y: y - 50, alpha: 0, duration: 1000,
            onComplete: () => txt.destroy()
        });
    }

    triggerLicenseAudit() {
        if (this.eventActive || AH3_GAME_STATS.progress >= 95) return;
        if (Phaser.Math.Between(1, 100) > 40) return;

        this.eventActive = true;

        let popup = this.add.container(640, 360);
        // Tăng chiều rộng bảng từ 560 lên 780 để text không bị tràn ra ngoài
        let bg = this.add.rectangle(0, 0, 850, 320, AH3_COLORS.bgDark.num, 0.95).setStrokeStyle(2, AH3_COLORS.danger.num);

        let txtTitle = this.add.text(0, -100, '⚠️ CẢNH BÁO BẢN QUYỀN ⚠️', { fontFamily: FONT_TITLE, fontSize: '40px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let txtSub = this.add.text(0, -60, 'Hãng Ao-Tu-Đét phát hiện bạn xài bản Crack!\nXử lý ngay trong 5 giây nếu không muốn lên phường uống trà:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, align: 'center', lineSpacing: 8, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5, 0);

        // Nới rộng khoảng cách 2 nút
        let btnEdu = this.add.rectangle(-180, 60, 240, 60, AH3_COLORS.darkRed.num).setInteractive();
        btnEdu.setStrokeStyle(2, AH3_COLORS.textPrimary.num);
        let txtEdu = this.add.text(-180, 60, 'BẢN GIÁO DỤC\n(Dính Watermark)', { fontFamily: FONT_MAIN, fontSize: '22px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let btnTrial = this.add.rectangle(180, 60, 240, 60, AH3_COLORS.success.num).setInteractive();
        btnTrial.setStrokeStyle(2, AH3_COLORS.textPrimary.num);
        let txtTrial = this.add.text(180, 60, 'DÙNG THỬ\n(30 Days Trial)', { fontFamily: FONT_MAIN, fontSize: '22px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let timer = 5;
        let timerTxt = this.add.text(0, 130, `⏳ ${timer}s`, { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);

        popup.add([bg, txtTitle, txtSub, btnEdu, txtEdu, btnTrial, txtTrial, timerTxt]);

        let countdown = this.time.addEvent({
            delay: 1000, repeat: 4,
            callback: () => {
                timer--;
                timerTxt.setText(`⏳ ${timer}s`);
                if (timer <= 0) {
                    AH3_GAME_STATS.progress -= 30;
                    AH3_GAME_STATS.stressLevel += 20;
                    this.showFeedback("HẾT GIỜ! PHẦN MỀM BỊ KHÓA!\nTrừ 30% tiến độ!", AH3_COLORS.danger.hex);
                    this.cleanupEvent(popup, countdown);
                }
            }
        });

        btnEdu.on('pointerdown', () => {
            AH3_GAME_STATS.stressLevel += 30;
            AH3_GAME_STATS.progress -= 20;
            AH3_GAME_STATS.hasEduWatermark = true;
            this.showFeedback("NGU NGỐC!\nBản vẽ dính Watermark bản Giáo Dục!\nStress +30%", AH3_COLORS.danger.hex);
            this.cleanupEvent(popup, countdown);
        });

        btnTrial.on('pointerdown', () => {
            this.showFeedback("MAY QUÁ!\nGia hạn Trial thành công!", AH3_COLORS.success.hex);
            this.cleanupEvent(popup, countdown);
        });
    }

    triggerCrashEvent() {
        this.eventActive = true;

        let popup = this.add.container(640, 360);
        let bg = this.add.rectangle(0, 0, 850, 320, AH3_COLORS.bgDark.num, 0.95).setStrokeStyle(2, AH3_COLORS.info.num);

        let txtTitle = this.add.text(0, -100, '🔥 3D MẮC ĐÃ LĂN ĐÙNG RA CHẾT 🔥', { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5);
        let txtSub = this.add.text(0, -60, 'Máy treo cứng! Bấm điên cuồng để kích hoạt Auto-Backup trước khi màn hình xanh:', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, align: 'center', lineSpacing: 8, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5, 0);

        let btnSave = this.add.rectangle(0, 60, 350, 70, AH3_COLORS.warning.num).setInteractive();
        btnSave.setStrokeStyle(2, AH3_COLORS.textPrimary.num);
        let txtSave = this.add.text(0, 60, '⚡ CLICK ĐIÊN CUỒNG ⚡\n(Còn 15 click)', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

        let timer = 5;
        let timerTxt = this.add.text(0, 130, `⏳ ${timer}s`, { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0.5);

        popup.add([bg, txtTitle, txtSub, btnSave, txtSave, timerTxt]);

        let clicksNeeded = 15;
        let countdown = this.time.addEvent({
            delay: 1000, repeat: 4,
            callback: () => {
                timer--;
                timerTxt.setText(`⏳ ${timer}s`);
                if (timer <= 0) {
                    AH3_GAME_STATS.progress -= 50;
                    AH3_GAME_STATS.stressLevel += 40;
                    this.showFeedback("VĂNG RỒI!\nBay màu 50% công sức. Stress +40%", AH3_COLORS.darkRed.hex);
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
                AH3_GAME_STATS.stressLevel += 5;
                this.showFeedback("HÚ HỒN!\nCứu được file Auto-Backup!", AH3_COLORS.success.hex);
                this.cleanupEvent(popup, countdown);
            }
        });
    }

    showFeedback(text, color) {
        let fb = this.add.text(640, 180, text, { fontFamily: FONT_MAIN, fontSize: '32px', fill: color, fontStyle: 'bold', align: 'center', backgroundColor: '#111111dd', padding: { x: 20, y: 20 } }).setOrigin(0.5);
        fb.setStroke(AH3_COLORS.textPrimary.hex, 2);

        this.tweens.add({
            targets: fb, y: 100, alpha: 0, duration: 3000, ease: 'Power2',
            onComplete: () => { if (fb && fb.active) fb.destroy(); }
        });
    }

    cleanupEvent(popup, countdown) {
        if (countdown) countdown.remove();
        popup.destroy();

        if (this.crashTriggered && AH3_GAME_STATS.progress >= 95 && this.gamePhase !== 3 && this.gamePhase !== 4) {
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
class AH3_Scene2 extends Phaser.Scene {
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
        if (AH3_GAME_STATS.hasEduWatermark) bgKey = 'bg_edu_watermark';

        let bg = this.add.image(640, 360, bgKey);
        let scale = 1.5;
        if (bg.width > 32) scale = Math.max(1280 / bg.width, 720 / bg.height);
        bg.setScale(scale);
        this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.3);

        if (AH3_GAME_STATS.usedPinterest) {
            // OPACITY-SYNC (2026-05-17): 0.7 → 0.3 để cân với BG dimmer nhánh chính (0.3)
            // Tránh nhánh Pinterest tối hơn nhánh chính. Watermark text giữ nguyên để vẫn lộ "lý do" mood
            let pinBox = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDark.num, 0.3);
            // BUG-FIX (2026-05-18): `alpha: 0.2` trong style object là KHÔNG hợp lệ với Phaser Text
            // (alpha không nằm trong TextStyle parseable keys → silent ignored, render alpha=1).
            // Phải gọi .setAlpha(0.2) sau khi tạo để watermark mờ đúng intent ban đầu.
            this.add.text(640, 470, 'ẢNH "MƯỢN" TRÊN PINTEREST', { fontFamily: FONT_TITLE, fontSize: '32px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(0.5).setAlpha(0.2);
        }

        // --- TITLE ---
        // OPACITY-SYNC (2026-05-17): Thêm container ambient (0.5) để title không trần trên BG, đồng bộ với patience box dưới
        this.add.rectangle(640, 55, 720, 50, AH3_COLORS.bgDarkest.num, 0.5).setStrokeStyle(2, AH3_COLORS.warning.num);
        this.add.text(640, 55, 'THE ARCHI-HELL: CUỘC HỌP HÚT MÁU', { fontFamily: FONT_TITLE, fontSize: '32px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', align: 'center', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 6 }).setOrigin(0.5);

        // --- PATIENCE BAR (Top center, below title) ---
        let patienceBox = this.add.rectangle(640, 105, 500, 40, AH3_COLORS.bgDark.num, 0.8).setStrokeStyle(2, AH3_COLORS.danger.num);
        this.add.text(420, 105, 'SỨC CHỊU ĐỰNG:', { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(750, 105, 250, 20, AH3_COLORS.strokeDark.num).setStrokeStyle(2, AH3_COLORS.textPrimary.num);
        this.barPatience = this.add.rectangle(625, 105, 250, 20, AH3_COLORS.danger.num).setOrigin(0, 0.5);
        this.txtPatience = this.add.text(890, 105, '100%', { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);

        this.patience = 100;
        if (AH3_GAME_STATS.usedPinterest) this.patience = 40;
        if (AH3_GAME_STATS.hasEduWatermark) this.patience = 30;
        this.barPatience.width = (this.patience / 100) * 250;
        this.txtPatience.setText(Math.floor(this.patience) + '%');

        // --- SPEECH BUBBLE (Below patience, centered, semi-transparent) ---
        let bubbleGfx = this.add.graphics();
        bubbleGfx.fillStyle(AH3_COLORS.textPrimary.num, 0.82);
        bubbleGfx.lineStyle(2, 0x999999, 1);
        bubbleGfx.fillRoundedRect(640 - 425, 280 - 100, 850, 200, 16);
        bubbleGfx.strokeRoundedRect(640 - 425, 280 - 100, 850, 200, 16);
        this.bubbleText = this.add.text(640, 280, '', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.bgDark.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5);

        // --- BUTTONS (Lower area, safe from edge) ---
        this.btnA = this.createChoiceBtn(300, 560, '');
        this.btnB = this.createChoiceBtn(640, 560, '');
        this.btnC = this.createChoiceBtn(980, 560, '');

        this.currentTurn = 0;

        // BUG-FIX (2026-05-18): Flag chống race khi patience về 0.
        // updatePatience schedule deferred endScene 600ms; trong window đó nếu người chơi tap
        // tiếp 1 lựa chọn khác (+patience + endReason hoặc rage, hoặc nhiều click patience≤0),
        // sẽ trigger thêm endScene → 2-3 overlay chồng + sai narrative branch (vd. rage→DebtRunner
        // thay vì RageMode). Flag bật ở updatePatience khi schedule, check ở handleChoice + endScene.
        // Reset ở create() để scene.restart() chơi lại sạch — scene-instance prop persist qua restart.
        this.ending = false;
        this.endSceneFired = false;

        this.loadTurn(0);
    }

    createChoiceBtn(x, y, text) {
        let w = 320; let h = 120;
        let gfx = this.add.graphics();
        
        let drawBg = (color) => {
            gfx.clear();
            gfx.fillStyle(color, 0.82);
            gfx.lineStyle(2, AH3_COLORS.bgLightAlt.num, 1);
            gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        };
        drawBg(AH3_COLORS.bgLight.num);

        let txtObj = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 8, wordWrap: { width: 300 } }).setOrigin(0.5);

        let hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
        
        let btnObj = { txt: txtObj, onClick: null };

        hit.on('pointerover', () => drawBg(AH3_COLORS.bgLightAlt.num));
        hit.on('pointerout', () => drawBg(AH3_COLORS.bgLight.num));
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
            // Schedule chỉ 1 lần — flag chống click thêm trong window 600ms (xem this.ending ở create()).
            if (!this.ending) {
                this.ending = true;
                this.time.delayedCall(600, () => this.endScene("Khách hàng đã CẠN KIÊN NHẪN!\nHọ vác bản vẽ sang công ty đối thủ.\nCÔNG TY BẠN PHÁ SẢN NHƯNG VẪN PHẢI ĐI ĐÒI NỢ CŨ!", 'SceneDebtRunner'));
            }
            return false;
        }
        return true;
    }

    loadTurn(turn) {
        if (this.patience <= 0) return;

        let script = this.getScript(turn);
        if (!script) return;

        this.bubbleText.setText(script.boss);

        // BUG-FIX (2026-05-18 Pass 4): Shuffle 3 options để tránh người chơi học pattern
        // "A = End ngay, B = cãi tiếp, C = Rage Mode" sau 2-3 turn. Mỗi lần loadTurn, vị trí
        // 3 đáp án random. Logic handleChoice() dựa vào option.rage/endReason/nextTurn của object
        // (không phụ thuộc vị trí btnA/B/C) → chỉ cần đổi hiển thị, không đụng logic.
        //
        // Lưu ý: text trong getScript() có sẵn prefix "A. ", "B. ", "C. " cứng → phải strip trước
        // khi gán label mới theo vị trí shuffled, tránh hiển thị "B. A. ..." (thừa label).
        let options = [script.optA, script.optB, script.optC];
        Phaser.Utils.Array.Shuffle(options);
        let labels = ['A. ', 'B. ', 'C. '];
        let stripPrefix = (s) => s.replace(/^[ABC]\.\s*/, '');

        this.btnA.txt.setText(labels[0] + stripPrefix(options[0].text));
        this.btnA.onClick = () => this.handleChoice(options[0]);

        this.btnB.txt.setText(labels[1] + stripPrefix(options[1].text));
        this.btnB.onClick = () => this.handleChoice(options[1]);

        this.btnC.txt.setText(labels[2] + stripPrefix(options[2].text));
        this.btnC.onClick = () => this.handleChoice(options[2]);
    }

    handleChoice(option) {
        // Block input nếu đang trong endScene flow (patience đã về 0, deferred endScene pending,
        // hoặc endScene đã chạy nhưng overlay chưa kịp đè btnA/B/C). Tránh race double-popup.
        if (this.ending) return;

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
        if (AH3_GAME_STATS.usedPinterest) {
            if (turn === 0) return {
                boss: 'Góc này nhìn quen quen giống\ntrên mạng nhỉ? Thôi tôi trả 1 củ\ntiền công copy nhé?',
                optA: { text: 'A. "Dạ lấy 1 củ cũng được..."', patience: 10, endReason: 'Bạn chấp nhận làm thợ cóp nhặt.\nBạn sống sót qua ngày nhưng TỰ TRỌNG = 0!' },
                optB: { text: 'B. "Ý tưởng lớn gặp nhau thôi anh!\nTrên mạng nó học lỏm em đấy!"', patience: -30, nextTurn: 10 },
                optC: { text: 'C. Lật bàn, đấm khách vì bị bóc phốt', patience: 0, rage: true }
            };
            if (turn === 10) return {
                boss: 'Tự nghĩ cái quái gì cái logo mờ mờ\nở góc kìa! Anh lừa ai?\nCút ra khỏi phòng họp!',
                optA: { text: 'A. Quỳ gối xin lỗi', patience: 0, endReason: 'Bạn quỳ xin lỗi để giữ lại dự án.\nBẠN ĐÃ ĐÁNH MẤT LIÊM SỈ NGHỀ NGHIỆP!' },
                optB: { text: 'B. "Dạ đây là thủ pháp Thiết kế Mở\n(Open-source), giao thoa toàn cầu!"', patience: 20, nextTurn: 11 },
                optC: { text: 'C. Hất nước vào mặt khách', patience: 0, rage: true }
            };
            if (turn === 11) return {
                boss: 'Open source cái đầu mày! Lươn lẹo!\nPhạt trừ nửa tháng lương, không cãi!',
                optA: { text: 'A. Ngậm ngùi chịu phạt', patience: 0, endReason: 'Bị trừ lương vì tội ăn cắp ý tưởng.\nBài học đắt giá cho sự lười biếng!' },
                optB: { text: 'B. "Sếp cho em 1 cơ hội làm lại nhé!"', patience: 10, endReason: 'Sếp mủi lòng cho bạn cơ hội làm lại từ đầu.\n(Quay về Màn 1)' },
                optC: { text: 'C. Đấm sếp', patience: 0, rage: true }
            };
        }

        // ==========================================
        // NHÁNH WATERMARK EDU
        // ==========================================
        if (AH3_GAME_STATS.hasEduWatermark) {
            if (turn === 0) return {
                boss: 'Trời đất! Sao ảnh nát bét,\nlại còn chữ "Educational Product"?\nAnh đùa tôi à?',
                optA: { text: 'A. "Dạ máy tính em tự nhiên bị virus..."', patience: -40, nextTurn: 20 },
                optB: { text: 'B. "Đây là ý đồ! Tinh thần\nHọc tập suốt đời (Lifelong Learning)!"', patience: 10, nextTurn: 21 },
                optC: { text: 'C. "Đó là nghệ thuật trừu tượng!"', patience: 0, rage: true }
            };
            if (turn === 20) return {
                boss: 'Virus cái đầu anh! Làm ăn vô trách nhiệm.\nPhạt nửa tháng lương!',
                optA: { text: 'A. "Dạ em xin chịu phạt..."', patience: 10, endReason: 'Bạn làm mất mặt công ty nên bị trừ lương.\nTHÁNG NÀY ĂN MÌ TÔM!' },
                optB: { text: 'B. "Sếp phải trừ lương thằng IT chứ!"', patience: 20, nextTurn: 22 },
                optC: { text: 'C. Tức tưởi nộp đơn nghỉ việc', patience: -50, endReason: 'Bạn nộp đơn nghỉ việc trong cơn tức giận.\nVề nhà nằm nhìn trần nhà suy nghĩ đời.' }
            };
            if (turn === 21) return {
                boss: 'Tải nhầm? Công ty trả tiền phần mềm\nmà anh xài lậu để tôi lên phường à?',
                optA: { text: 'A. "Dạ do team IT quên cài..."', patience: -50, endReason: 'Đổ lỗi cho IT nhưng sếp không tin.\nBị đuổi việc vì thiếu trung thực!' },
                optB: { text: 'B. "Em xin đền bù bằng cách\nOT cả tháng!"', patience: 10, endReason: 'Sếp tha cho bạn 1 lần nhưng bắt OT nguyên tháng.\nGAN BẠN ĐÃ KIỆT QUỆ!' },
                optC: { text: 'C. "Dùng tạm cho kịp deadline\nthôi sếp ơi!"', patience: 10, nextTurn: 22 }
            };
            if (turn === 22) return {
                boss: 'Kịp deadline hay không thì mai\nanh cũng phải bỏ tiền túi mua\nbản quyền xịn cho tôi!',
                optA: { text: 'A. Tự bỏ nguyên tháng lương\nmua bản quyền...', patience: 20, endReason: 'Bạn tự mua bản quyền bằng tiền túi.\nTháng này nhịn đói uống nước lã!' },
                optB: { text: 'B. "Công ty cấp ngân sách\nthì em mới mua được!"', patience: -30, nextTurn: 23 },
                optC: { text: 'C. Đấm sếp', patience: 0, rage: true }
            };
            if (turn === 23) return {
                boss: 'Ngân sách công ty đang âm!\nTự bỏ tiền túi hoặc cút khỏi công ty!',
                optA: { text: 'A. Ngậm đắng nuốt cay tự móc ví...', patience: 10, endReason: 'Làm thuê nhưng phải mua dụng cụ cho Sếp.\nNỖI ĐAU DÂN KIẾN TRÚC!' },
                optB: { text: 'B. "Thế thì em CÚT khỏi công ty!"', patience: -10, endReason: 'Bạn bước ra khỏi công ty với cái đầu ngẩng cao.\nNhưng sáng mai ngủ dậy không có tiền ăn sáng.' },
                optC: { text: 'C. Đập nát máy tính', patience: 0, rage: true }
            };
        }

        // ==========================================
        // NHÁNH CHÍNH (ẢNH RENDER ĐẸP) - 5 LEVELS
        // ==========================================
        if (turn === 0) return {
            boss: 'Có mấy cái nét gạch gạch trên máy tính\nmà đắt thế em? Giảm 50% mở bát cho may!',
            optA: { text: 'A. Chấp nhận bớt 50% cho lẹ', patience: 20, endReason: 'Bạn gật đầu đồng ý bán rẻ chất xám.\nBẠN CHÍNH THỨC TRỞ THÀNH NÔ LỆ CỦA NGÀNH!' },
            optB: { text: 'B. "Giờ điện tăng, mì tôm tăng,\nchất xám cũng phải tăng chứ anh!"', patience: -20, nextTurn: 1 },
            optC: { text: 'C. "Chất xám thì giá phải cao!"', patience: -10, nextTurn: 101 }
        };

        if (turn === 1) return {
            boss: 'Thôi giảm 30% đi! Anh đang ôm mấy héc-ta\nđất nền, dự án sau giao chú vẽ mỏi tay!',
            optA: { text: 'A. "Vâng, anh nhớ dự án sau\nphải giao em nhé!"', patience: 20, endReason: 'Bạn tin lời hứa "dự án sau" của khách.\nVà tất nhiên... CHẲNG CÓ DỰ ÁN NÀO SAU ĐÓ CẢ!' },
            optB: { text: 'B. "Dự án nào tính tiền dự án đó anh ơi!"', patience: -30, nextTurn: 2 },
            optC: { text: 'C. "Thế anh ứng trước 50% tiền cọc đi?"', patience: 10, nextTurn: 102 }
        };

        if (turn === 101) return {
            boss: 'Chất xám gì? Công ty X kia\nbáo giá thiết kế rẻ bằng nửa bên em kìa!',
            optA: { text: 'A. "Thế anh sang bên đó mà làm!"', patience: -40, nextTurn: 2 },
            optB: { text: 'B. "Bên đó copy mạng,\ncòn bên em là độc bản!"', patience: 20, nextTurn: 3 },
            optC: { text: 'C. Đấm khách', patience: 0, rage: true }
        };

        if (turn === 102) return {
            boss: 'Thôi anh em tin nhau là chính.\nGiờ anh đang kẹt dòng tiền.\nGiảm 20% đi em.',
            optA: { text: 'A. Nhượng bộ giảm 20% tiền thiết kế', patience: 20, endReason: 'Bạn đánh mất 20% lợi nhuận.\nCông ty thâm hụt tài chính.' },
            optB: { text: 'B. "Không có tiền thì đừng xây nhà anh ạ!"', patience: -50, endReason: 'Khách hàng bỏ đi vì bị xúc phạm.\nBạn đúng nhưng mất khách!' },
            optC: { text: 'C. "Bớt 10% nhưng cam kết\nkhông được sửa file!"', patience: 10, nextTurn: 4 }
        };

        if (turn === 2) return {
            boss: 'Mày chảnh thế? Khách hàng là thượng đế!\nKhông bớt thì anh mang bản vẽ\nsang công ty khác xây!',
            optA: { text: 'A. "Thôi anh ở lại, em bớt cho..."', patience: 10, endReason: 'Bạn vất vả giữ được khách.\nNHƯNG LỢI NHUẬN = 0. LÀM DÂU TRĂM HỌ!' },
            optB: { text: 'B. "Anh đi đâu thì đi, em không sửa giá!"', patience: -50, endReason: 'Khách vác bản vẽ sang công ty đối thủ.\nBạn mất dự án nhưng giữ được tự trọng!' },
            optC: { text: 'C. "File em đặt Pass rồi,\nanh cầm file PDF về mà xây!"', patience: 30, nextTurn: 5 }
        };

        if (turn === 3) return {
            boss: 'Độc bản à... Ừ thì đẹp thật.\nThôi giữ nguyên giá nhưng KM phần\nnội thất nhé?',
            optA: { text: 'A. "Dạ vâng, để em thiết kế luôn"', patience: 20, endReason: 'Bạn phải cày cuốc thêm nguyên bộ nội thất Free.\nLàm kiệt sức đến nhập viện!' },
            optB: { text: 'B. "Nội thất là gói riêng, không Khuyến Mãi!"', patience: -20, nextTurn: 2 },
            optC: { text: 'C. "Giá này em chỉ KM anh\ncái thiết kế cổng rào thôi!"', patience: 10, nextTurn: 5 }
        };

        if (turn === 4) return {
            boss: 'Không được sửa bản vẽ? \nThế lỡ thi công thực tế bị lỗi\nthì bên em tính sao?',
            optA: { text: 'A. "Lỗi thi công bên em chịu hoàn toàn!"', patience: 20, endReason: 'Bạn tự tin thái quá.\nRa công trường lỗi be bét, đền bù sạt nghiệp!' },
            optB: { text: 'B. "Thợ xây làm sai thì anh\nđi mà chửi thợ chứ!"', patience: -20, nextTurn: 2 },
            optC: { text: 'C. "Bên em bám sát 100%, anh cứ yên tâm"', patience: 20, nextTurn: 5 }
        };

        if (turn === 5) return {
            boss: 'Thôi được rồi, cậu cứng quá.\nAnh chốt giá này, in hợp đồng đi!',
            optA: { text: 'A. "Đội ơn anh đã cứu đói\ncông ty em tháng này!"', patience: 10, endReason: '🎉 TRUE ENDING: BẠN BẢO VỆ ĐƯỢC CHẤT XÁM! 🎉\nBạn đã chứng minh được giá trị của Thiết kế!' },
            optB: { text: 'B. "Anh chuyển khoản cọc luôn 50%\ncho nóng nha!"', patience: -10, endReason: '💰 EPIC WIN: CỌC TIỀN TƯƠI THÓC THẬT! 💰\nBạn thao túng tâm lý Chủ đầu tư thành công!' },
            optC: { text: 'C. "Đùa thôi, em ĐẾCH thèm làm cho anh!"', patience: 0, rage: true }
        };
    }

    endScene(reason, nextScene) {
        // Idempotent guard — nếu endScene đã chạy 1 lần (vd deferred từ updatePatience đã fire,
        // hoặc handleChoice gọi sync), bỏ qua call thứ 2 để không stack overlay/buttons.
        if (this.endSceneFired) return;
        this.endSceneFired = true;
        this.ending = true;

        let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.95).setInteractive();

        // OPACITY-SYNC (2026-05-17): Thêm container box cho reason text — đồng bộ pattern popup (tier 0.85 + stroke)
        this.add.rectangle(640, 260, 850, 240, AH3_COLORS.bgMedium.num, 0.85).setStrokeStyle(3, AH3_COLORS.danger.num);
        this.add.text(640, 260, reason, { fontFamily: FONT_TITLE, fontSize: '36px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', align: 'center', lineSpacing: 10, stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5);

        if (nextScene === 'SceneRageMode') {
            // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton.
            createRoundedButton(this, 640, 480, 400, 60, '🔥 BƯỚC VÀO RAGE MODE', {
                bgColor: AH3_COLORS.danger.num,
                bgHover: 0xec7063,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '24px',
                fontStyle: 'bold',
                onClick: () => this.scene.start('SceneIntro', { level: 4 })
            });
        } else {
            // Cung cấp 3 nhánh lựa chọn để tránh soft-lock (bao gồm cả quay về Màn 1 như user yêu cầu)
            // Nút 1: Về Màn 1
            createRoundedButton(this, 300, 480, 280, 60, '⏪ VỀ MÀN 1', {
                bgColor: AH3_COLORS.warning.num,
                bgHover: 0xf4d03f,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => {
                    AH3_GAME_STATS.progress = 0;
                    AH3_GAME_STATS.stressLevel = 50;
                    AH3_GAME_STATS.coffeeLevel = 100;
                    AH3_GAME_STATS.deadlineTime = 5 * 3600 - 1;
                    AH3_GAME_STATS.hasEduWatermark = false;
                    AH3_GAME_STATS.usedPinterest = false;
                    this.scene.start('SceneIntro', { level: 1 });
                }
            });

            // Nút 2: Thử lại Màn 2
            createRoundedButton(this, 640, 480, 280, 60, '🔄 THỬ LẠI MÀN 2', {
                bgColor: AH3_COLORS.info.num,
                bgHover: 0x5dade2,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => this.scene.restart()
            });

            // Nút 3: Tiếp tục Màn 3 (Dù phá sản vẫn phải đi đòi nợ)
            createRoundedButton(this, 980, 480, 280, 60, '⏩ ĐI ĐÒI NỢ', {
                bgColor: AH3_COLORS.success.num,
                bgHover: 0x40d97f,
                borderColor: AH3_COLORS.textPrimary.num,
                radius: 6,
                fontSize: '20px',
                fontStyle: 'bold',
                onClick: () => this.scene.start('SceneIntro', { level: 3 })
            });
        }
    }
}

// ==========================================
// MÀN 4: RAGE MODE - TRẢ THÙ
// (Renamed from Scene3 → SceneRageMode on 2026-05-16 to fix naming legacy confusion.
//  See nhật ký 2026-05-16_ArchiHell_Scene3_Bug_Fix.md)
// ==========================================
class AH3_SceneRageMode extends Phaser.Scene {
    constructor() { super('SceneRageMode'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        if (!this.textures.exists('bg_scene3')) {
            this.load.image('bg_scene3', './assets/bg_scene3.png');
        }
    }

    create() {
        // REDESIGN v3 (2026-05-18): Full-canvas layout. 3 cột:
        //   - Left panel (x=20-150): Skills (búa hint + xăng + cẩu) — tap-friendly cho iPad
        //   - Center grid (x=170-1100): Grid 8×5, tile 115×112 (lớn hơn 100×80 cũ)
        //   - Right panel (x=1120-1260): Shark reaction + Stats real-time
        // Top bar (y=20-70): Progress bar + Combo + Counter
        // Combo logic: phá liên tục trong 2s → combo++. Stats track: hammer/fire/crane/bonus/quizFail.

        // --- BACKGROUND ---
        let bg = this.add.image(640, 360, 'bg_scene3');
        let scale = 1.5;
        if (bg.width > 32) scale = Math.max(1280 / bg.width, 720 / bg.height);
        bg.setScale(scale);

        // Red tint overlay for RAGE
        this.rageOverlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.danger.num, 0.2);
        this.tweens.add({ targets: this.rageOverlay, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });

        // ===== TOP BAR (y=20-70) =====
        // Title compact bên trái
        let title = this.add.text(110, 45, '🔥 RAGE MODE', {
            fontFamily: FONT_TITLE, fontSize: '24px', fill: AH3_COLORS.danger.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scaleX: 1.05, scaleY: 1.05, duration: 100, yoyo: true, repeat: -1 });

        // Progress bar (giữa top bar)
        this.add.rectangle(640, 45, 540, 32, AH3_COLORS.bgDark.num, 0.85).setStrokeStyle(2, AH3_COLORS.warning.num);
        this.add.rectangle(640, 45, 528, 22, AH3_COLORS.strokeDark.num, 0.5);
        this.barProgress = this.add.rectangle(376, 45, 0, 22, AH3_COLORS.danger.num).setOrigin(0, 0.5);
        this.txtProgress = this.add.text(640, 45, 'PHÁ HOẠI: 0 / 96 Ô', {
            fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.textPrimary.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5);

        // Combo display (dời xuống y=65 v1.1.5g — nhường slot y=30 cho timer countdown)
        // ẩn cho đến khi combo ≥ 3
        this.txtCombo = this.add.text(1170, 65, '', {
            fontFamily: FONT_TITLE, fontSize: '22px', fill: AH3_COLORS.warning.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5);

        // ===== TIMER COUNTDOWN (v1.1.5g — 2026-05-18) =====
        // Hoàng yêu cầu: giới hạn 60s phá 96 ô, pause khi quiz active.
        // Vị trí slot phải top bar (1170, 30) — replace combo cũ vì timer ưu tiên cao hơn.
        // Color logic giống energy bar Màn 3: ≥30s xanh, 15-29s vàng, <15s đỏ + pulse.
        this.timeLimit = 60;        // giây tổng
        this.timeLeft = 60;         // giây còn lại
        this.timerActive = false;   // true khi đếm; false khi quiz mở
        this.timerLastTick = 0;     // ms timestamp tick cuối để delta accurate
        this.txtTimer = this.add.text(1170, 30, '⏰ 60s', {
            fontFamily: FONT_TITLE, fontSize: '30px', fill: AH3_COLORS.info.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4
        }).setOrigin(0.5);

        // ===== GRID 12×8 = 96 Ô (CENTER) =====
        // v1.1.5e GRID-EXPAND (2026-05-18): 8×5 → 12×8 (40 → 96 ô) theo yêu cầu Hoàng "chưa đã".
        // Math:
        //   - Horizontal: 1280 - 150 (left panel) - 140 (right panel) - 100 (gap 50+50) = 890 px
        //     → 12 cols → tileW = 74px (vẫn trên ngưỡng tap-friendly iPad 44pt, tile width)
        //   - Vertical: 720 - 70 (top bar) - 65 (bottom) = 585 px
        //     → 8 rows → tileH = 73px
        //   - gridX = 200 (giữ gap 50px với left panel x=20-150)
        //   - gridY = 80
        //   - Grid ends: x = 200 + 12×74 = 1088 (gap 32px với right panel x=1120). y = 80 + 8×73 = 664.
        // Trade-off: tile nhỏ hơn 33% so cũ (110×115 → 74×73), nhưng "đã" hơn vì gấp 2.4× số ô.
        this.gridCols = 12;
        this.gridRows = 8;
        this.tileW = 74;
        this.tileH = 73;
        this.gridX = 200; // left edge của grid → gap 50px với left panel (x=20-150)
        this.gridY = 80;  // top edge của grid → gap 10px với top bar (y=20-70)
        this.tiles = [];
        this.tilesLeft = this.gridCols * this.gridRows; // 96
        this.createGrid();

        // ===== LEFT SKILL PANEL (x=20-150, y=80-660) =====
        this.add.rectangle(85, 370, 130, 580, AH3_COLORS.bgDark.num, 0.45).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.add.text(85, 100, 'SKILLS', {
            fontFamily: FONT_TITLE, fontSize: '18px', fill: AH3_COLORS.warning.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5);

        // Búa info card (không phải button — luôn active)
        this.add.rectangle(85, 180, 110, 120, AH3_COLORS.strokeDark.num, 0.7).setStrokeStyle(2, AH3_COLORS.success.num);
        this.add.text(85, 145, '🔨', { fontSize: '36px' }).setOrigin(0.5);
        this.add.text(85, 185, 'BÚA', { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(85, 204, '1 ô / click', { fontFamily: FONT_MAIN, fontSize: '11px', fill: AH3_COLORS.textSecondary.hex }).setOrigin(0.5);
        this.add.text(85, 222, '∞ DÙNG', { fontFamily: FONT_MAIN, fontSize: '10px', fill: AH3_COLORS.success.hex, fontStyle: 'bold' }).setOrigin(0.5);

        // Xăng button
        this.btnFire = this.createSkillBtnV3(85, 320, '🛢️', 'XĂNG', '2×2 = 4 ô', 'CẦN ĐỐ', AH3_COLORS.danger.num);

        // Cần Cẩu button
        this.btnCrane = this.createSkillBtnV3(85, 460, '🏗️', 'CẨU', '3×3 = 9 ô', 'CẦN ĐỐ', AH3_COLORS.warning.num);

        // Hint dưới panel
        this.add.text(85, 600, 'Click skill\nđể kích hoạt', {
            fontFamily: FONT_MAIN, fontSize: '11px', fill: AH3_COLORS.textMuted.hex, align: 'center', lineSpacing: 4
        }).setOrigin(0.5);

        // ===== RIGHT PANEL: SHARK REACTION + STATS (x=1120-1260) =====
        this.add.rectangle(1195, 370, 140, 580, AH3_COLORS.bgDark.num, 0.45).setStrokeStyle(1, AH3_COLORS.strokeMid.num);

        // Shark label
        this.add.text(1195, 100, 'SHARK LƯƠN', {
            fontFamily: FONT_TITLE, fontSize: '16px', fill: AH3_COLORS.danger.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5);

        // Avatar (emoji to thay cho image)
        this.add.circle(1195, 160, 40, AH3_COLORS.bgLight.num, 0.7).setStrokeStyle(2, AH3_COLORS.danger.num);
        this.sharkEmoji = this.add.text(1195, 160, '😏', { fontSize: '50px' }).setOrigin(0.5);

        // Speech bubble — v3.1: dời từ y=260 → y=280 để gap với avatar (y=200) tăng từ 5px → 25px
        this.add.rectangle(1195, 280, 120, 110, AH3_COLORS.textPrimary.num, 0.92).setStrokeStyle(2, AH3_COLORS.strokeMid.num);
        this.sharkQuote = this.add.text(1195, 280, 'Phá đi!\nKhông sợ đâu!', {
            fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.bgDarkest.hex,
            fontStyle: 'bold', align: 'center', wordWrap: { width: 110 }, lineSpacing: 4
        }).setOrigin(0.5);

        // Stats panel — v3.1: dời từ y=470 → y=475 (compensate cho bubble đã dời 20px)
        this.add.rectangle(1195, 475, 120, 270, AH3_COLORS.bgMedium.num, 0.7).setStrokeStyle(1, AH3_COLORS.strokeMid.num);
        this.add.text(1195, 360, 'THỐNG KÊ', {
            fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats rows — tạo template tự update qua updateStats()
        let statY = 390;
        let statRowHeight = 28;
        this.txtStatHammer = this.add.text(1145, statY, '🔨 Đập:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatHammerVal = this.add.text(1245, statY, '0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.success.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        statY += statRowHeight;
        this.txtStatFire = this.add.text(1145, statY, '🛢️ Xăng:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatFireVal = this.add.text(1245, statY, '0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        statY += statRowHeight;
        this.txtStatCrane = this.add.text(1145, statY, '🏗️ Cẩu:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatCraneVal = this.add.text(1245, statY, '0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        statY += statRowHeight;
        this.txtStatBonus = this.add.text(1145, statY, '😈 Bonus:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatBonusVal = this.add.text(1245, statY, '0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.success.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        statY += statRowHeight;
        this.txtStatCombo = this.add.text(1145, statY, '🔥 Combo:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatComboVal = this.add.text(1245, statY, '×0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        statY += statRowHeight;
        this.txtStatFail = this.add.text(1145, statY, '❌ Sai đố:', { fontFamily: FONT_MAIN, fontSize: '13px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);
        this.txtStatFailVal = this.add.text(1245, statY, '0', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.textMuted.hex, fontStyle: 'bold' }).setOrigin(1, 0.5);

        // ===== CUSTOM CURSOR =====
        this.input.setDefaultCursor('none'); // Ẩn chuột mặc định trên PC
        this.customCursor = this.add.text(this.input.x, this.input.y, '🔨', { fontSize: '40px' }).setOrigin(0, 0).setDepth(9999);
        this.input.on('pointermove', (pointer) => {
            this.customCursor.setPosition(pointer.x, pointer.y);
        });

        // ===== STATE INIT =====
        this.setPendingSkill(null);
        this.setQuizActive(false);
        this.pendingBonusTiles = 0;

        // Combo + Stats state
        // FIX Bug 7 v3.2: lastBreakTime = -9999 (không phải 0) để đảm bảo ô đầu tiên luôn là combo 1,
        // tránh trường hợp scene mới bắt đầu (this.time.now < 2000) thì comboCount = 2 sai.
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastBreakTime = -9999;
        this.stats = { hammer: 0, fire: 0, crane: 0, bonus: 0, quizFail: 0 };

        // Skill button events
        this.btnFire.on('pointerdown', () => {
            if (!this.gameStarted || this.quizActive || this.pendingSkill) return;
            this.triggerSkillQuiz('fire');
        });

        this.btnCrane.on('pointerdown', () => {
            if (!this.gameStarted || this.quizActive || this.pendingSkill) return;
            this.triggerSkillQuiz('crane');
        });

        this.gameStarted = true;

        // v1.1.5g: Khởi động timer countdown ngay khi game start
        this.startTimer();
    }

    // ==========================================
    // TIMER COUNTDOWN (v1.1.5g — 2026-05-18)
    // ==========================================
    // 60s tổng, pause khi quiz active (Hoàng: "chỉ ngừng khi đọc câu hỏi và trả lời").
    // Tick mỗi 100ms cho smooth display (số nguyên giây nhưng UI cập nhật khi đổi).
    // Color: ≥30s info xanh, 15-29s warning vàng, <15s danger đỏ + pulse scale.
    // Hết giờ chưa phá đủ 96 ô → triggerTimeOut() → popup "Vợ gọi về ăn cơm".

    startTimer() {
        this.timerActive = true;
        // BUG-FIX (2026-05-18): Trong create(), Phaser chưa fire preUpdate cho scene mới
        // → this.time.now còn là giá trị stale (0 ở first entry, hoặc thời điểm shutdown cũ ở retry).
        // Nếu seed timerLastTick bằng giá trị stale này, updateTimer fire lần đầu sẽ tính deltaMs
        // = (loop time hiện tại) - (giá trị stale) = vài chục nghìn ms → timeLeft drain 60s ngay lập tức
        // → trigger triggerTimeOut() trước khi người chơi click ô nào.
        // Sentinel -1 để updateTimer tick đầu seed lại timerLastTick rồi return không decrement.
        // Cùng pattern với fix lastBreakTime = -9999 ở line 1891.
        this.timerLastTick = -1;
        // Tick mỗi 100ms (10 lần/giây) cho smooth — chỉ update text khi đổi sang giây mới
        this.timerEvent = this.time.addEvent({
            delay: 100,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    pauseTimer() {
        // Pause khi quiz mở — KHÔNG remove event, chỉ set flag
        // updateTimer() sẽ skip tick nếu timerActive=false
        this.timerActive = false;
    }

    resumeTimer() {
        // Resume khi quiz đóng — reset lastTick để tránh nhảy giật (nếu quiz mở 5s)
        this.timerActive = true;
        this.timerLastTick = this.time.now;
    }

    updateTimer() {
        if (!this.gameStarted) return;
        if (!this.timerActive) {
            // Quiz đang mở — chỉ update lastTick để khi resume không tính ngược về 5s đã pause
            this.timerLastTick = this.time.now;
            return;
        }

        let now = this.time.now;
        // Sentinel: tick đầu sau startTimer — seed timerLastTick rồi bỏ qua, không decrement.
        // Tránh deltaMs khổng lồ do this.time.now stale trong create() (xem comment ở startTimer).
        if (this.timerLastTick === -1) {
            this.timerLastTick = now;
            return;
        }
        let deltaMs = now - this.timerLastTick;
        this.timerLastTick = now;

        let prevSec = Math.ceil(this.timeLeft);
        this.timeLeft -= deltaMs / 1000;
        if (this.timeLeft < 0) this.timeLeft = 0;
        let curSec = Math.ceil(this.timeLeft);

        // Chỉ update text + color khi đổi giây (tránh redraw mỗi 100ms)
        if (curSec !== prevSec) {
            this.txtTimer.setText(`⏰ ${curSec}s`);

            // Color logic theo ngưỡng
            let color;
            if (curSec >= 30) color = AH3_COLORS.info.hex;       // xanh
            else if (curSec >= 15) color = AH3_COLORS.warning.hex; // vàng
            else color = AH3_COLORS.danger.hex;                    // đỏ

            this.txtTimer.setColor(color);

            // Pulse mạnh khi <15s — báo nguy
            if (curSec === 14) {
                this.tweens.add({
                    targets: this.txtTimer,
                    scaleX: 1.2, scaleY: 1.2,
                    duration: 300, yoyo: true, repeat: -1
                });
            }

            // SFX tick mỗi giây khi <10s (có thể bỏ nếu noise quá — comment lại nếu khó chịu)
            if (curSec <= 10 && curSec >= 1) {
                playSound(this, 'sfx_click', 0.3);
            }
        }

        // Hết giờ — game over
        if (this.timeLeft <= 0) {
            this.timerEvent.remove();
            this.timerActive = false;
            this.triggerTimeOut();
        }
    }

    triggerTimeOut() {
        if (!this.gameStarted) return; // tránh double trigger nếu win cùng frame
        this.gameStarted = false;
        this.endGameCursor();

        // Kill tween pulse timer
        this.tweens.killTweensOf(this.txtTimer);

        // Camera shake mạnh + SFX error
        this.cameras.main.shake(400, 0.025);
        playSound(this, 'sfx_error', 0.6);

        // Show fail popup sau 500ms
        this.time.delayedCall(500, () => this.showTimeOutPopup());
    }

    showTimeOutPopup() {
        const POPUP_DEPTH = 200;
        // Dim overlay
        this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.7).setDepth(POPUP_DEPTH);
        // Box popup
        let box = this.add.rectangle(640, 360, 850, 380, AH3_COLORS.bgDarkest.num, 0.95)
            .setStrokeStyle(4, AH3_COLORS.warning.num).setDepth(POPUP_DEPTH + 1);

        // Tính tiles broken để hiển thị thành tích dở dang
        let total = this.gridCols * this.gridRows;
        let broken = total - this.tilesLeft;

        // Title
        this.add.text(640, 220, '📞 VỢ GỌI VỀ ĂN CƠM!', {
            fontFamily: FONT_TITLE, fontSize: '46px', fill: AH3_COLORS.warning.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 5
        }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);

        // Narrative
        this.add.text(640, 290,
            'Vợ: "Anh ơi! Bỏ đập đó đi! Cơm nguội hết rồi!"\n' +
            `KTS: đập được ${broken}/${total} ô thì hết giờ rồi.\n` +
            'Mai dậy đi làm tiếp, kiếp KTS chưa thoát được...',
        {
            fontFamily: FONT_MAIN, fontSize: '22px', fill: AH3_COLORS.textPrimary.hex,
            align: 'center', fontStyle: 'bold', lineSpacing: 10,
            wordWrap: { width: 770, useAdvancedWrap: true }
        }).setOrigin(0.5, 0).setDepth(POPUP_DEPTH + 1);

        // 2 nút: Thử lại / Đi ăn cơm (về Màn 1)
        createRoundedButton(this, 440, 470, 320, 56, '🔄 ĐẬP TIẾP CHO ĐÃ', {
            bgColor: AH3_COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.restart()
        });

        createRoundedButton(this, 840, 470, 320, 56, '🍚 ĐI ĂN CƠM (VỀ MÀN 1)', {
            bgColor: AH3_COLORS.success.num,
            bgHover: 0x40d97f,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => {
                AH3_GAME_STATS.progress = 0;
                AH3_GAME_STATS.stressLevel = 50;
                AH3_GAME_STATS.coffeeLevel = 100;
                AH3_GAME_STATS.deadlineTime = 5 * 3600 - 1;
                AH3_GAME_STATS.hasEduWatermark = false;
                AH3_GAME_STATS.usedPinterest = false;
                this.scene.start('SceneIntro', { level: 1 });
            }
        });
    }

    // ==========================================
    // GRID HELPERS (Màn 4 v2)
    // ==========================================
    createGrid() {
        for (let r = 0; r < this.gridRows; r++) {
            this.tiles[r] = [];
            for (let c = 0; c < this.gridCols; c++) {
                let cx = this.gridX + c * this.tileW + this.tileW / 2;
                let cy = this.gridY + r * this.tileH + this.tileH / 2;

                // Mỗi ô: rectangle với border. Alpha 0.90 (v3.3 — REVEAL MECHANIC) để CHE bg_scene3,
                // khi phá lộ ra dần như "lau sạch lớp giận dữ", thấy bức tranh chiến tích cuối cùng.
                // Cũ alpha 0.45 (v3): nhìn rõ bg sẵn → không có moment reveal "đã con mắt".
                let rect = this.add.rectangle(cx, cy, this.tileW - 4, this.tileH - 4, AH3_COLORS.bgLight.num, 0.90)
                    .setStrokeStyle(2, AH3_COLORS.warning.num, 0.7)
                    .setInteractive({ useHandCursor: false });

                rect.row = r;
                rect.col = c;
                rect.broken = false;

                rect.on('pointerdown', (pointer, localX, localY, event) => {
                    if (!this.gameStarted || this.quizActive) return;
                    if (rect.broken) return;
                    event.stopPropagation();

                    // Nếu đang chờ skill target → áp dụng skill tại ô này
                    if (this.pendingSkill === 'fire') {
                        this.stopSkillGlow();
                        this.applyAreaSkill(rect, 2, 2, 'fire');
                        this.setPendingSkill(null);
                    } else if (this.pendingSkill === 'crane') {
                        this.stopSkillGlow();
                        this.applyAreaSkill(rect, 3, 3, 'crane');
                        this.setPendingSkill(null);
                    } else {
                        // Default: búa, phá 1 ô
                        this.breakTile(rect, 'hammer');
                    }
                });

                rect.on('pointerover', () => {
                    if (rect.broken) return;
                    // Highlight ô theo skill đang chọn (v3.3 — alpha sync với reveal mechanic 0.90 base)
                    if (this.pendingSkill === 'fire') {
                        this.previewArea(rect, 2, 2, 0xff6347); // orange-red preview
                    } else if (this.pendingSkill === 'crane') {
                        this.previewArea(rect, 3, 3, 0xf1c40f); // yellow preview
                    } else {
                        rect.setFillStyle(AH3_COLORS.bgLightAlt.num, 0.95);
                    }
                });

                rect.on('pointerout', () => {
                    if (rect.broken) return;
                    this.clearPreview();
                    rect.setFillStyle(AH3_COLORS.bgLight.num, 0.90);
                });

                this.tiles[r][c] = rect;
            }
        }
    }

    // Preview tô màu các ô sẽ bị phá khi hover (cho skill area).
    // Lưu các ô đang preview vào this.previewTiles để clearPreview dọn lại.
    previewArea(centerTile, w, h, color) {
        this.clearPreview();
        this.previewTiles = [];
        // Pattern 2×2 = ô center là góc top-left (rộng sang phải + xuống dưới)
        // Pattern 3×3 = ô center là tâm (rộng đều quanh)
        let startR, startC;
        if (w === 2 && h === 2) {
            startR = centerTile.row;
            startC = centerTile.col;
        } else {
            // 3×3: tâm tại centerTile
            startR = centerTile.row - 1;
            startC = centerTile.col - 1;
        }
        for (let dr = 0; dr < h; dr++) {
            for (let dc = 0; dc < w; dc++) {
                let r = startR + dr;
                let c = startC + dc;
                if (r >= 0 && r < this.gridRows && c >= 0 && c < this.gridCols) {
                    let t = this.tiles[r][c];
                    if (!t.broken) {
                        t.setFillStyle(color, 0.6);
                        this.previewTiles.push(t);
                    }
                }
            }
        }
    }

    clearPreview() {
        if (this.previewTiles) {
            this.previewTiles.forEach(t => {
                // v3.3: Reset về alpha 0.90 (reveal mechanic base) thay vì 0.45 cũ
                if (!t.broken) t.setFillStyle(AH3_COLORS.bgLight.num, 0.90);
            });
            this.previewTiles = [];
        }
    }

    // Áp dụng skill area (Xăng 2×2 hoặc Cần Cẩu 3×3) tại ô center.
    // Pattern giống previewArea. Bonus tile cộng thêm nếu user chọn C (điên).
    // v3 (2026-05-18): Tách main tiles (fire/crane) và bonus tiles (type='bonus') thành 2 array.
    // Bonus tiles phá sau, có type riêng để stats counter chính xác + màu tím để dễ phân biệt visual.
    applyAreaSkill(centerTile, w, h, type) {
        this.clearPreview();
        let startR, startC;
        if (w === 2 && h === 2) {
            startR = centerTile.row;
            startC = centerTile.col;
        } else {
            startR = centerTile.row - 1;
            startC = centerTile.col - 1;
        }

        // Main tiles: ô trong pattern 2×2 hoặc 3×3 — phá với type='fire' hoặc 'crane'
        let mainTiles = [];
        for (let dr = 0; dr < h; dr++) {
            for (let dc = 0; dc < w; dc++) {
                let r = startR + dr;
                let c = startC + dc;
                if (r >= 0 && r < this.gridRows && c >= 0 && c < this.gridCols) {
                    let t = this.tiles[r][c];
                    if (!t.broken) mainTiles.push(t);
                }
            }
        }

        // Bonus tiles: nếu pendingBonusTiles > 0 (từ đáp án C "đen hài"), random ô khắp grid
        let bonusTiles = [];
        if (this.pendingBonusTiles && this.pendingBonusTiles > 0) {
            let allRemaining = [];
            for (let r = 0; r < this.gridRows; r++) {
                for (let c = 0; c < this.gridCols; c++) {
                    if (!this.tiles[r][c].broken && !mainTiles.includes(this.tiles[r][c])) {
                        allRemaining.push(this.tiles[r][c]);
                    }
                }
            }
            Phaser.Utils.Array.Shuffle(allRemaining);
            for (let i = 0; i < this.pendingBonusTiles && i < allRemaining.length; i++) {
                bonusTiles.push(allRemaining[i]);
            }
            this.pendingBonusTiles = 0;
        }

        // Hit effect ở tâm
        let centerX = centerTile.x;
        let centerY = centerTile.y;
        if (type === 'fire') {
            this.showHitEffect(centerX, centerY, '🔥 BÙM!', 80);
            this.cameras.main.flash(400, 255, 80, 0); // Flash cam đỏ
            playSound(this, 'sfx_hit');
        } else {
            this.showHitEffect(centerX, centerY, '🏗️ SẬP!', 100);
            this.cameras.main.shake(600, 0.04);
            playSound(this, 'sfx_hit');
        }

        // Phá main tiles trước (cascade 60ms/ô)
        mainTiles.forEach((t, idx) => {
            this.time.delayedCall(idx * 60, () => this.breakTile(t, type));
        });

        // Phá bonus tiles sau khi main xong (delay = main count × 60 + 200ms buffer)
        let bonusStartDelay = mainTiles.length * 60 + 200;
        bonusTiles.forEach((t, idx) => {
            this.time.delayedCall(bonusStartDelay + idx * 80, () => this.breakTile(t, 'bonus'));
        });
    }

    // v1.1.5e FIRE EXPLOSION HELPER (2026-05-18):
    // Tạo hiệu ứng nổ lửa đỏ cam + tia khói đen tại (x, y).
    // intensity: multiplier cho số particle + size (1.0 cho búa, 1.4 cho skill area).
    //
    // Lớp 1 — Fire burst (4-6 hình tròn cam/đỏ scale 0→peak rồi fade)
    //   Màu: 0xff4500 (orange red), 0xff6347 (tomato), 0xffa500 (orange).
    //   Origin tile center, expand ra ngoài với scale tween + alpha fade.
    //   Duration 400ms — fast burst feel.
    // Lớp 2 — Smoke wisps (3-4 hình tròn xám đen bay lên cao)
    //   Màu: 0x2c2c2c, 0x4a4a4a, 0x1a1a1a.
    //   Drift lên y -= 60..100px, alpha fade 0.8→0.
    //   Duration 800ms — slower for "lingering smoke" feel.
    // Lớp 3 — Center flash (1 hình tròn vàng to flash nhanh, peak frame 0, fade 200ms)
    //   Màu 0xffeb3b để cảm giác "tia chớp" trung tâm.
    createExplosion(x, y, intensity = 1.0) {
        const fireColors = [0xff4500, 0xff6347, 0xffa500];
        const smokeColors = [0x2c2c2c, 0x4a4a4a, 0x1a1a1a];

        // Lớp 3 — Center flash (vàng): render TRƯỚC để fire/smoke đè lên
        let flash = this.add.circle(x, y, 25 * intensity, 0xffeb3b, 0.9).setDepth(30);
        this.tweens.add({
            targets: flash,
            scaleX: 1.8, scaleY: 1.8, alpha: 0,
            duration: 200, ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });

        // Lớp 1 — Fire burst (4-6 quả cầu lửa cam/đỏ tỏa ra)
        let fireCount = Math.floor(4 + 2 * intensity);
        for (let i = 0; i < fireCount; i++) {
            let color = Phaser.Utils.Array.GetRandom(fireColors);
            let startSize = Phaser.Math.Between(8, 14) * intensity;
            let fire = this.add.circle(x, y, startSize, color, 0.85).setDepth(31);
            let angle = (i / fireCount) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
            let dist = Phaser.Math.Between(35, 60) * intensity;
            this.tweens.add({
                targets: fire,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                scaleX: { from: 0.3, to: 1.5 },
                scaleY: { from: 0.3, to: 1.5 },
                alpha: { from: 0.85, to: 0 },
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => fire.destroy()
            });
        }

        // Lớp 2 — Smoke wisps (3-4 cuộn khói đen bay lên)
        let smokeCount = Math.floor(3 + intensity);
        for (let i = 0; i < smokeCount; i++) {
            let color = Phaser.Utils.Array.GetRandom(smokeColors);
            let startSize = Phaser.Math.Between(10, 16) * intensity;
            let smoke = this.add.circle(
                x + Phaser.Math.Between(-15, 15),
                y + Phaser.Math.Between(-10, 10),
                startSize, color, 0.7
            ).setDepth(29); // dưới fire nhưng trên tile

            let driftX = Phaser.Math.Between(-25, 25);
            let driftY = -Phaser.Math.Between(60, 100) * intensity;
            this.tweens.add({
                targets: smoke,
                x: smoke.x + driftX,
                y: smoke.y + driftY,
                scaleX: { from: 0.5, to: 1.8 },
                scaleY: { from: 0.5, to: 1.8 },
                alpha: { from: 0.7, to: 0 },
                duration: 800,
                ease: 'Sine.easeOut',
                onComplete: () => smoke.destroy()
            });
        }
    }

    // Phá 1 ô — animation gạch vụn + update counter + check win + combo + stats tracking
    breakTile(tile, type) {
        if (tile.broken) return;
        // FIX race condition v3 (2026-05-18): Nếu game đã win (gameStarted=false từ winGame() trigger),
        // bonus tiles pending trong delayedCall vẫn fire → tilesLeft âm + stats sai. Early return.
        if (!this.gameStarted && this.tilesLeft <= 0) return;
        // FIX Bug 6 v3.2: Nếu quiz đang mở (user click skill button khi cascade chưa xong),
        // re-schedule tile này sau 100ms để chờ quiz đóng. Tránh combo+stats+shark update phía sau overlay.
        if (this.quizActive) {
            this.time.delayedCall(100, () => this.breakTile(tile, type));
            return;
        }

        tile.broken = true;
        this.tilesLeft--;

        // ===== COMBO TRACKING (v3) =====
        // Phá ô trong 2s sau ô trước → combo++. Quá 2s → reset về 1 (ô hiện tại = combo 1).
        let now = this.time.now;
        if (now - this.lastBreakTime < 2000) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastBreakTime = now;
        if (this.comboCount > this.maxCombo) this.maxCombo = this.comboCount;
        this.updateComboDisplay();

        // ===== STATS TRACKING (v3) =====
        // type có thể là 'hammer', 'fire', 'crane' (skill chính) hoặc 'bonus' (ô bonus từ C)
        if (type === 'hammer') this.stats.hammer++;
        else if (type === 'fire') this.stats.fire++;
        else if (type === 'crane') this.stats.crane++;
        else if (type === 'bonus') this.stats.bonus++;
        this.updateStatsDisplay();

        // ===== PROGRESS BAR + SHARK REACTION (v3) =====
        this.updateProgressBar();
        this.updateSharkReaction();

        // Color theo loại phá
        let color = AH3_COLORS.bgDarkest.num;
        if (type === 'fire') color = 0xff4500;
        else if (type === 'crane') color = 0xc0392b;
        else if (type === 'bonus') color = 0x8e44ad; // tím cho bonus

        // Tween: nháy màu rồi fade ra
        tile.setStrokeStyle(0);
        this.tweens.add({
            targets: tile,
            fillAlpha: { from: 0.9, to: 0 },
            scaleX: 1.15, scaleY: 1.15,
            duration: 350,
            ease: 'Power2',
            onStart: () => tile.setFillStyle(color, 0.9),
            onComplete: () => { tile.setVisible(false); tile.disableInteractive(); }
        });

        // Particle gạch vụn: 5-8 chấm nhỏ bay ra (v1.1.5e: tăng từ 3-5)
        let particleCount = type === 'hammer' ? 5 : 8;
        for (let i = 0; i < particleCount; i++) {
            let p = this.add.rectangle(tile.x, tile.y, 6, 6, AH3_COLORS.strokeMid.num);
            let angle = Phaser.Math.Between(0, 360);
            let dist = Phaser.Math.Between(30, 70);
            this.tweens.add({
                targets: p,
                x: tile.x + Math.cos(angle) * dist,
                y: tile.y + Math.sin(angle) * dist + 30,
                alpha: 0,
                duration: 600,
                onComplete: () => p.destroy()
            });
        }

        // v1.1.5e FIRE EXPLOSION (2026-05-18): Lửa đỏ cam + tia khói đen mỗi tile bị phá.
        // Theo yêu cầu Hoàng "bùm bùm có lửa cho rage" — đúng tinh thần Màn 4.
        this.createExplosion(tile.x, tile.y, type === 'hammer' ? 1.0 : 1.4);

        // Camera shake + SFX (v1.1.5e: sfx_hit thay sfx_click cho búa, mạnh hơn, retro 8-bit noise)
        if (type === 'hammer') {
            this.cameras.main.shake(120, 0.012);
            playSound(this, 'sfx_hit', 0.5);
        }

        // Check win
        if (this.tilesLeft <= 0) {
            this.gameStarted = false;
            this.endGameCursor();
            // v1.1.5g: Dừng timer event khi win để tránh leak + trigger triggerTimeOut nhầm
            if (this.timerEvent) {
                this.timerEvent.remove();
                this.timerActive = false;
            }
            this.time.delayedCall(800, () => this.winGame());
        }
    }

    // ==========================================
    // UI UPDATE HELPERS (v3)
    // ==========================================

    // Update progress bar + text dựa trên this.tilesLeft
    updateProgressBar() {
        let total = this.gridCols * this.gridRows;
        let broken = total - this.tilesLeft;
        let pct = broken / total;
        // Bar width: max = 528px (theo create() đặt rectangle)
        this.tweens.add({
            targets: this.barProgress,
            width: pct * 528,
            duration: 200,
            ease: 'Power2'
        });
        this.txtProgress.setText(`PHÁ HOẠI: ${broken} / ${total} Ô`);
    }

    // Update Shark emoji + quote dựa trên % phá
    updateSharkReaction() {
        let total = this.gridCols * this.gridRows;
        let broken = total - this.tilesLeft;
        let pct = broken / total;

        let emoji, quote;
        if (pct >= 1.0) {
            emoji = '💀';
            quote = '...em hứa kiếp sau làm KTS thay anh';
        } else if (pct >= 0.75) {
            emoji = '😭';
            quote = 'Em cho anh thêm 20% nữa!\nCòn nguyên cả cọc!';
        } else if (pct >= 0.5) {
            emoji = '😱';
            quote = 'Anh ơi em xin lỗi!\nEm trả tiền ngay!';
        } else if (pct >= 0.25) {
            emoji = '😬';
            quote = 'Anh ơi bình tĩnh\nmình thương lượng đã...';
        } else {
            emoji = '😏';
            quote = 'Phá đi!\nKhông sợ đâu!';
        }

        // Chỉ update nếu thay đổi (tránh tween liên tục)
        if (this.sharkEmoji.text !== emoji) {
            // FIX Bug 12 v3.2: Kill tween cũ + reset scale trước khi animate mới
            // (edge case: cascade bonus tiles có thể đụng 2 ngưỡng % trong vòng 200ms).
            this.tweens.killTweensOf(this.sharkEmoji);
            this.sharkEmoji.setScale(1);
            // Animation đổi mặt: scale down → up
            this.tweens.add({
                targets: this.sharkEmoji,
                scaleX: 0.5, scaleY: 0.5,
                duration: 100, yoyo: true,
                onYoyo: () => this.sharkEmoji.setText(emoji)
            });
            this.sharkQuote.setText(quote);
        }
    }

    // Update combo display trên top bar + hiệu ứng
    // FIX Bug 11 v3.2: Pulse tween trên txtCombo stack lên nhau khi phá nhanh ở combo ≥ 5
    // (Phaser không tự cancel tween cũ trên cùng target). Solution: killTweensOf trước khi add mới.
    // FIX Bug 10 v3.2: Cache last text để tránh setText khi không đổi.
    updateComboDisplay() {
        let newText = this.comboCount >= 3 ? `🔥 COMBO ×${this.comboCount}` : '';
        if (this._lastComboText !== newText) {
            this.txtCombo.setText(newText);
            this._lastComboText = newText;
        }

        if (this.comboCount >= 3) {
            // Combo ≥ 5: pulse text — kill tween cũ trước khi add mới để tránh stack
            if (this.comboCount >= 5) {
                this.tweens.killTweensOf(this.txtCombo);
                this.txtCombo.setScale(1); // Reset trước khi pulse
                this.tweens.add({
                    targets: this.txtCombo,
                    scaleX: 1.3, scaleY: 1.3,
                    duration: 120, yoyo: true
                });
            }

            // Combo ≥ 10: flash camera + showHitEffect to
            if (this.comboCount >= 10 && this.comboCount % 5 === 0) {
                this.cameras.main.flash(300, 255, 200, 0);
                this.showHitEffect(640, 360, `🔥 RAGE STREAK ×${this.comboCount}!`, 56);
            }
        }
    }

    // Update stats panel bên phải
    // FIX Bug 9 v3.2: Chỉ setText khi giá trị THỰC SỰ thay đổi. Phaser setText() expensive
    // (re-make canvas + GPU upload). Mỗi click chỉ 1 stat đổi → optimize 6 setText → 1 setText.
    updateStatsDisplay() {
        if (!this._statCache) this._statCache = {};
        const c = this._statCache;
        if (c.hammer !== this.stats.hammer) { this.txtStatHammerVal.setText(`${this.stats.hammer}`); c.hammer = this.stats.hammer; }
        if (c.fire !== this.stats.fire) { this.txtStatFireVal.setText(`${this.stats.fire}`); c.fire = this.stats.fire; }
        if (c.crane !== this.stats.crane) { this.txtStatCraneVal.setText(`${this.stats.crane}`); c.crane = this.stats.crane; }
        if (c.bonus !== this.stats.bonus) { this.txtStatBonusVal.setText(`${this.stats.bonus}`); c.bonus = this.stats.bonus; }
        if (c.maxCombo !== this.maxCombo) { this.txtStatComboVal.setText(`×${this.maxCombo}`); c.maxCombo = this.maxCombo; }
        if (c.quizFail !== this.stats.quizFail) { this.txtStatFailVal.setText(`${this.stats.quizFail}`); c.quizFail = this.stats.quizFail; }
    }

    // v3.1 (2026-05-18): Visual indicator khi skill đang pendingTarget (đợi user click ô).
    // Glow tween yoyo infinite trên alpha của skill button → user biết rõ skill nào đang active.
    startSkillGlow(skillType) {
        this.stopSkillGlow(); // Kill tween cũ nếu có
        let btn = skillType === 'fire' ? this.btnFire : this.btnCrane;
        this.skillGlowTween = this.tweens.add({
            targets: btn,
            alpha: { from: 1.0, to: 0.5 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    stopSkillGlow() {
        if (this.skillGlowTween) {
            this.skillGlowTween.stop();
            this.skillGlowTween = null;
        }
        // Reset alpha về 1
        if (this.btnFire) this.btnFire.setAlpha(1);
        if (this.btnCrane) this.btnCrane.setAlpha(1);
    }

    // ==========================================
    // QUIZ SYSTEM (Màn 4 v2)
    // ==========================================
    triggerSkillQuiz(skillType) {
        this.setQuizActive(true);
        // v1.1.5g: Pause timer khi mở quiz (Hoàng: "chỉ ngừng khi đọc câu hỏi và trả lời")
        this.pauseTimer();
        let quiz = this.getRandomQuiz(skillType);

        // Overlay tối
        const QUIZ_DEPTH = 200;
        let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.85).setInteractive().setDepth(QUIZ_DEPTH);

        // Box câu hỏi (height linh hoạt cho text dài)
        let box = this.add.rectangle(640, 280, 850, 200, AH3_COLORS.bgMedium.num, 0.95)
            .setStrokeStyle(3, skillType === 'fire' ? AH3_COLORS.danger.num : AH3_COLORS.warning.num)
            .setDepth(QUIZ_DEPTH);

        // Tiêu đề: emoji skill + tên skill
        let icon = skillType === 'fire' ? '🛢️ XĂNG' : '🏗️ CẦN CẨU';
        let titleColor = skillType === 'fire' ? AH3_COLORS.danger.hex : AH3_COLORS.warning.hex;
        let titleTxt = this.add.text(640, 210, icon + ' — TỈNH TÁO TRẢ LỜI ĐỂ DÙNG ĐƯỢC', {
            fontFamily: FONT_TITLE, fontSize: '26px', fill: titleColor,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4
        }).setOrigin(0.5).setDepth(QUIZ_DEPTH + 1);

        // Câu hỏi
        let questionTxt = this.add.text(640, 240, quiz.question, {
            fontFamily: FONT_MAIN, fontSize: '22px', fill: AH3_COLORS.textPrimary.hex,
            fontStyle: 'bold', align: 'center', wordWrap: { width: 770, useAdvancedWrap: true }, lineSpacing: 8
        }).setOrigin(0.5, 0).setDepth(QUIZ_DEPTH + 1);

        // 3 nút lựa chọn (A/B/C) — layout dọc cho dễ đọc
        // BUG-FIX (2026-05-18 Pass 4): Shuffle 3 options để tránh người chơi học pattern "C luôn = bonus".
        // Mỗi lần quiz hiển thị, vị trí correct/wrong/crazy random. Label A./B./C. chỉ là số thứ tự hiển thị,
        // không phản ánh role. Logic xử lý dựa vào opt.result, không phụ thuộc vị trí → đổi hiển thị là đủ.
        let choices = [quiz.optA, quiz.optB, quiz.optC];
        Phaser.Utils.Array.Shuffle(choices);
        let labels = ['A.', 'B.', 'C.'];
        let btnObjs = [];

        choices.forEach((opt, i) => {
            let y = 440 + i * 75;
            let btnColor = AH3_COLORS.bgLight.num;
            let hoverColor = AH3_COLORS.bgLightAlt.num;
            let btn = createRoundedButton(this, 640, y, 770, 62,
                `${labels[i]} ${opt.text}`,
                {
                    bgColor: btnColor,
                    bgHover: hoverColor,
                    borderColor: AH3_COLORS.strokeLight.num,
                    radius: 6,
                    fontSize: '18px',
                    fontStyle: 'bold',
                    depth: QUIZ_DEPTH + 1,
                    onClick: () => {
                        // Cleanup quiz UI
                        overlay.destroy();
                        box.destroy();
                        titleTxt.destroy();
                        questionTxt.destroy();
                        btnObjs.forEach(b => b.destroy());
                        this.setQuizActive(false);
                        // v1.1.5g: Resume timer ngay khi user chọn xong (quiz đóng)
                        this.resumeTimer();

                        // Xử lý kết quả
                        if (opt.result === 'correct') {
                            // Đúng → set pendingSkill, người chơi click ô để target
                            playSound(this, 'sfx_success');
                            this.setPendingSkill(skillType);
                            this.pendingBonusTiles = 0;
                            this.startSkillGlow(skillType);
                            this.showHitEffect(640, 360, '✅ ĐÚNG! CHỌN Ô MUỐN PHÁ', 36);
                        } else if (opt.result === 'crazy') {
                            // Cực đoan → unlock skill + bonus tile
                            playSound(this, 'sfx_success');
                            this.setPendingSkill(skillType);
                            this.pendingBonusTiles = opt.bonus || 2;
                            this.startSkillGlow(skillType);
                            this.showHitEffect(640, 360, `😈 ĐEN HÀI! +${opt.bonus || 2} Ô BONUS`, 36);
                        } else {
                            // Sai → mất lượt + track stats
                            this.stats.quizFail++;
                            this.updateStatsDisplay();
                            playSound(this, 'sfx_error');
                            this.cameras.main.shake(200, 0.015);
                            this.showHitEffect(640, 360, '❌ SAI! THỬ LẠI!', 40);
                        }
                    }
                }
            );
            btnObjs.push(btn);
        });
    }

    // Pool câu đố — random mỗi lần. Mỗi skill có 7 câu để random ít trùng.
    // result: 'correct' = đúng, đạt skill. 'crazy' = đáp án C cực đoan, đạt skill + bonus. 'wrong' = sai.
    //
    // REDESIGN PASS 3 (2026-05-18): Đổi theme sang NGHỀ KTS, không phải "cách phá nhà".
    // Lý do: câu đố how-to (mua xăng, né camera, cách đốt) tiềm ẩn rủi ro pháp lý kích động/hướng dẫn phạm tội
    // dù trong game. Game phá grid = ẩn dụ trừu tượng OK, nhưng văn bản cụ thể có thể bị Luật An ninh mạng 2018
    // + Bộ Luật Hình Sự VN soi. Pass 3 chỉ hỏi về chuyên môn/triết lý nghề KTS — zero risk pháp lý.
    //
    // Narrative bridge: KTS đang rage cần "tỉnh táo trả lời câu KTS" để chứng minh còn minh mẫn dùng dụng cụ.
    // Đáp án A = nghiêm túc/chuyên nghiệp. B = ngu/lý tưởng hoá. C = đen hài/tự trào → bonus tile.
    getRandomQuiz(skillType) {
        // BỘ XĂNG (7 câu) — Theme: Chuyên môn + Triết lý nghề
        const fireQuizzes = [
            {
                question: 'Render bằng Vi-Rách, thiếu Ambient Occlusion thì ảnh nhìn ra sao?',
                optA: { text: 'Phẳng lì, các vật thể như dán giấy lên nền', result: 'correct' },
                optB: { text: 'Đẹp hơn, vì AO chỉ làm bẩn ảnh', result: 'wrong' },
                optC: { text: 'Đẹp tới mức Shark Lươn quên quỵt tiền', result: 'crazy', bonus: 2 }
            },
            {
                question: 'Lý do nào khiến KTS phải vẽ lại bản thiết kế 47 lần?',
                optA: { text: 'Vì CĐT bảo "anh cứ vẽ đi rồi tính"', result: 'correct' },
                optB: { text: 'Vì KTS quá đam mê, vẽ vì nghệ thuật', result: 'wrong' },
                optC: { text: 'Vì lần 48 mới đúng ý vợ CĐT', result: 'crazy', bonus: 2 }
            },
            {
                question: 'Ao-Tu-Đét 3D Mắc bị crash khi nào?',
                optA: { text: 'Khi save dự án quan trọng chưa kịp Ctrl+S', result: 'correct' },
                optB: { text: 'Khi máy đang rảnh, chỉ mở Word', result: 'wrong' },
                optC: { text: 'Crash đồng nghĩa máy nhắc "đi ngủ đi, 3 giờ sáng rồi"', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Ly cà phê thứ 7 trong ngày nói gì với KTS?',
                optA: { text: '"Tôi hết tác dụng rồi, sang ly thứ 8 đi"', result: 'correct' },
                optB: { text: '"Cẩn thận nhồi máu cơ tim đó anh"', result: 'wrong' },
                optC: { text: '"Anh là cà phê, tôi mới là KTS"', result: 'crazy', bonus: 2 }
            },
            {
                question: 'Deadline đối với KTS là gì?',
                optA: { text: 'Một con dao treo trên đầu bằng sợi tóc', result: 'correct' },
                optB: { text: 'Một lời nhắc nhở nhẹ nhàng để hoàn thành công việc', result: 'wrong' },
                optC: { text: 'Một khái niệm trừu tượng, vì luôn bị dời', result: 'crazy', bonus: 3 }
            },
            {
                question: 'KTS sống được tới năm thứ 5 trong nghề là nhờ điều gì?',
                optA: { text: 'Cà phê đậm và Panadol Extra', result: 'correct' },
                optB: { text: 'Tình yêu nghệ thuật và đam mê cao quý', result: 'wrong' },
                optC: { text: 'Không hiểu sao vẫn chưa chết, có lẽ Trời thương', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Câu nào của CĐT khiến KTS đau lòng nhất?',
                optA: { text: '"Em vẽ lại cho anh theo ý anh nhé, thay đổi tí thôi"', result: 'correct' },
                optB: { text: '"Em xứng đáng được trả nhiều tiền hơn"', result: 'wrong' },
                optC: { text: '"Tặng anh bản vẽ này đi, anh hứa giới thiệu khách to"', result: 'crazy', bonus: 3 }
            }
        ];

        // BỘ CẦN CẨU (7 câu) — Theme: Hoá thân nghề + Phản chiếu
        const craneQuizzes = [
            {
                question: 'Tại sao chọn nghề KTS?',
                optA: { text: 'Vì lúc đó 18 tuổi chưa biết nghề KTS sẽ như thế này', result: 'correct' },
                optB: { text: 'Vì đam mê thiết kế nên giàu chất nghệ sĩ', result: 'wrong' },
                optC: { text: 'Vì bố mẹ bảo "vẽ giỏi thì học kiến trúc" — thế là sa lầy', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Tại sao Shark Lươn lại quỵt tiền thiết kế?',
                optA: { text: 'Vì lão thuộc tuýp CĐT "làm thì ít, lươn thì nhiều"', result: 'correct' },
                optB: { text: 'Vì bản vẽ của em quá xấu, đáng bị quỵt', result: 'wrong' },
                optC: { text: 'Vì đó là luân hồi nghiệp báo ngành KTS', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Một ngày làm việc của KTS bắt đầu lúc mấy giờ?',
                optA: { text: '9 giờ sáng, kết thúc 3 giờ sáng hôm sau', result: 'correct' },
                optB: { text: '8 giờ sáng, kết thúc 5 giờ chiều như nhân loại', result: 'wrong' },
                optC: { text: 'KTS không có khái niệm "bắt đầu" hay "kết thúc"', result: 'crazy', bonus: 2 }
            },
            {
                question: 'KTS là gì?',
                optA: { text: 'Người vẽ ra ước mơ của CĐT bằng máu của mình', result: 'correct' },
                optB: { text: 'Một nhà thiết kế tài năng được xã hội trọng vọng', result: 'wrong' },
                optC: { text: 'Phụ hồ có bằng đại học và bị stress', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Phối cảnh nội thất luôn phải có gì để CĐT thích?',
                optA: { text: 'Cây xanh — càng nhiều cây càng dễ chốt deal', result: 'correct' },
                optB: { text: 'Phong cách tối giản Nhật Bản đậm chất thiền', result: 'wrong' },
                optC: { text: 'Thêm cái xe Lờ-Bóng Mui Trần để CĐT thấy mình giàu', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Vợ gọi hỏi: "Anh đang ở đâu?"',
                optA: { text: '"Anh đang OT tại văn phòng, deadline gấp em ạ"', result: 'correct' },
                optB: { text: '"Anh đang đứng giữa công trình của mình, lãng mạn lắm"', result: 'wrong' },
                optC: { text: '"Em xem TV đi, lát anh lên thời sự cho mà coi"', result: 'crazy', bonus: 3 }
            },
            {
                question: 'Nếu được chọn lại, anh sẽ chọn nghề gì?',
                optA: { text: 'Vẫn là KTS — vì biết nghề khác thì làm gì 😭', result: 'correct' },
                optB: { text: 'Vẫn KTS — vì đam mê chảy trong huyết quản', result: 'wrong' },
                optC: { text: 'Phụ hồ — lương cao hơn, không lo deadline, ngủ ngon', result: 'crazy', bonus: 3 }
            }
        ];

        const pool = skillType === 'fire' ? fireQuizzes : craneQuizzes;
        // FIX Bug 8 v3.2: Tránh trùng câu liên tiếp cùng skillType. lastQuizQ là object cache
        // {fire: question_string, crane: question_string}. Random tối đa 5 lần để tìm câu khác câu trước.
        if (!this.lastQuizQ) this.lastQuizQ = {};
        let picked;
        for (let attempt = 0; attempt < 5; attempt++) {
            picked = Phaser.Utils.Array.GetRandom(pool);
            if (picked.question !== this.lastQuizQ[skillType]) break;
        }
        this.lastQuizQ[skillType] = picked.question;
        return picked;
    }

    setPendingSkill(skill) {
        this.pendingSkill = skill;
        if (!this.customCursor) return;
        if (skill === 'fire') {
            this.customCursor.setText('🛢️');
        } else if (skill === 'crane') {
            this.customCursor.setText('🏗️');
        } else {
            this.customCursor.setText('🔨');
        }
    }

    setQuizActive(isActive) {
        this.quizActive = isActive;
        if (isActive) {
            this.input.setDefaultCursor('default');
            if (this.customCursor) this.customCursor.setVisible(false);
        } else {
            this.input.setDefaultCursor('none');
            if (this.customCursor) this.customCursor.setVisible(true);
        }
    }

    endGameCursor() {
        this.input.setDefaultCursor('default');
        if (this.customCursor) this.customCursor.setVisible(false);
    }

    // v3 (2026-05-18): Skill button dọc với 4 thành phần — dùng cho left panel v3.
    // Button 110×120 (lớn hơn cũ 120×120 nhưng dọc hơn, tap-friendly iPad).
    // icon: emoji to (40px). label: tên skill. desc: mô tả pattern. badge: "CẦN ĐỐ" highlight.
    createSkillBtnV3(x, y, icon, label, desc, badge, color) {
        let btn = this.add.rectangle(x, y, 110, 120, AH3_COLORS.bgDark.num, 0.75).setInteractive({ useHandCursor: false });
        btn.setStrokeStyle(3, color);

        // Icon to ở trên
        let iconTxt = this.add.text(x, y - 35, icon, { fontSize: '36px' }).setOrigin(0.5);
        // Label tên skill
        let labelTxt = this.add.text(x, y + 5, label, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0.5);
        // Mô tả pattern
        let descTxt = this.add.text(x, y + 24, desc, { fontFamily: FONT_MAIN, fontSize: '11px', fill: AH3_COLORS.textSecondary.hex }).setOrigin(0.5);
        // Badge "CẦN ĐỐ"
        let badgeTxt = this.add.text(x, y + 42, badge, { fontFamily: FONT_MAIN, fontSize: '10px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0.5);

        btn.on('pointerover', () => {
            btn.setFillStyle(AH3_COLORS.bgLight.num, 0.85);
            iconTxt.setScale(1.1);
        });
        btn.on('pointerout', () => {
            btn.setFillStyle(AH3_COLORS.bgDark.num, 0.75);
            iconTxt.setScale(1.0);
        });

        return btn;
    }

    showHitEffect(x, y, text, size = 60) {
        let hitTxt = this.add.text(x, y, text, { fontFamily: FONT_MAIN, fontSize: `${size}px`, fill: AH3_COLORS.warning.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 8 }).setOrigin(0.5);
        this.tweens.add({
            targets: hitTxt, y: y - 120, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 800,
            onComplete: () => hitTxt.destroy()
        });
    }

    winGame() {
        let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.95).setInteractive();
        this.add.text(640, 130, '🏢 VĂN PHÒNG ĐÃ THÀNH ĐỐNG TRO TÀN!', { fontFamily: FONT_MAIN, fontSize: '40px', fill: AH3_COLORS.danger.hex, align: 'center', fontStyle: 'bold', lineSpacing: 20 }).setOrigin(0.5);
        this.add.text(640, 180, 'Bạn đã được giải thoát khỏi kiếp làm thuê.', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, align: 'center' }).setOrigin(0.5);

        // ===== STATS SUMMARY BOX (v3) =====
        // Hiển thị thành tích người chơi: số ô đập, combo cao nhất, sai đố — tạo cảm giác achievement.
        this.add.rectangle(640, 290, 850, 160, AH3_COLORS.bgMedium.num, 0.85).setStrokeStyle(2, AH3_COLORS.warning.num);
        this.add.text(640, 235, '📊 THÀNH TÍCH ĐẬP PHÁ', {
            fontFamily: FONT_TITLE, fontSize: '22px', fill: AH3_COLORS.warning.hex,
            fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5);

        // Stats hiển thị 2 cột — cột trái: phá / cột phải: combo & sai
        let stats = this.stats || { hammer: 0, fire: 0, crane: 0, bonus: 0, quizFail: 0 };
        let maxCombo = this.maxCombo || 0;

        // Cột trái: counts
        this.add.text(440, 275, `🔨 Búa: ${stats.hammer} ô`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(440, 300, `🛢️ Xăng: ${stats.fire} ô`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(440, 325, `🏗️ Cẩu: ${stats.crane} ô`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);

        // Cột phải: combo, bonus, fail
        this.add.text(720, 275, `🔥 Combo cao: ×${maxCombo}`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(720, 300, `😈 Bonus: ${stats.bonus} ô`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.success.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(720, 325, `❌ Sai đố: ${stats.quizFail} lần`, { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textMuted.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);

        // Achievement badge nếu combo ≥ 10
        if (maxCombo >= 10) {
            this.add.text(640, 360, '🏆 ACHIEVEMENT: RAGE STREAK MASTER!', {
                fontFamily: FONT_TITLE, fontSize: '18px', fill: AH3_COLORS.warning.hex,
                fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
            }).setOrigin(0.5);
        } else if (stats.quizFail === 0 && (stats.fire + stats.crane) > 0) {
            this.add.text(640, 360, '🎓 ACHIEVEMENT: KTS TỈNH TÁO 100%!', {
                fontFamily: FONT_TITLE, fontSize: '18px', fill: AH3_COLORS.success.hex,
                fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
            }).setOrigin(0.5);
        }

        // Option 1: Mở công ty riêng
        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton (bo góc Qt-style).
        createRoundedButton(this, 640, 440, 500, 55, '🤵 MỞ CÔNG TY RIÊNG LÀM SẾP', {
            bgColor: AH3_COLORS.info.num,
            bgHover: 0x5dade2,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '22px',
            fontStyle: 'bold',
            onClick: () => this.showEpilogue("Bạn vay nợ mở công ty riêng làm Sếp.\nVà giờ đến lượt bạn đi quỳ lạy Chủ Đầu Tư...\nVòng luân hồi Kiến Trúc không bao giờ kết thúc!")
        });

        // Option 2: Đi phụ hồ
        createRoundedButton(this, 640, 520, 500, 55, '🧱 BỎ NGHỀ, ĐI LÀM PHỤ HỒ CHO LÀNH', {
            bgColor: AH3_COLORS.warning.num,
            bgHover: 0xf4d03f,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '22px',
            fontStyle: 'bold',
            onClick: () => this.showEpilogue("Đi phụ hồ lương cao hơn Kiến Trúc Sư.\nNgủ ngon, không lo deadline!")
        });
    }

    showEpilogue(text) {
        let overlay = this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 1).setInteractive().setDepth(100);
        this.add.text(640, 360, text, { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.success.hex, align: 'center', fontStyle: 'bold', lineSpacing: 20 }).setOrigin(0.5).setDepth(101);

        this.time.delayedCall(5000, () => {
            AH3_GAME_STATS.progress = 0;
            AH3_GAME_STATS.stressLevel = 50;
            AH3_GAME_STATS.coffeeLevel = 100;
            AH3_GAME_STATS.deadlineTime = 5 * 3600 - 1;
            AH3_GAME_STATS.hasEduWatermark = false;
            AH3_GAME_STATS.usedPinterest = false;
            this.scene.start('SceneIntro');
        });
    }
}

// ==========================================
// MÀN 1.5: SỬA LỖI WATERMARK (CLONE STAMP)
// ==========================================
class AH3_SceneCloneStamp extends Phaser.Scene {
    constructor() { super('SceneCloneStamp'); }

    preload() {
        // Base64 textures pre-loaded by SceneBoot via textures.addBase64()
        if (!this.textures.exists('bg_edu_watermark')) {
            this.load.image('bg_edu_watermark', './assets/bg_edu_watermark.png');
        }
    }

    create() {
        // Nền chung của game (để Window nổi lên)
        this.cameras.main.setBackgroundColor(AH3_COLORS.bgMedium.hex);

        // --- KHUNG CỬA SỔ OS (Giống Màn 1) ---
        let winWidth = 1100; let winHeight = 660;
        let winX = 640; let winY = 360;

        // Nền cửa sổ Pờ-Sốp
        this.add.rectangle(winX, winY, winWidth, winHeight, 0x282828).setStrokeStyle(2, AH3_COLORS.strokeDark.num);

        // Thanh Tiêu đề (OS Title Bar)
        let titleBarY = winY - winHeight / 2 + 20;
        this.add.rectangle(winX, titleBarY, winWidth, 40, AH3_COLORS.bgDark.num);
        this.add.text(winX - winWidth / 2 + 15, titleBarY, 'Pờ-Sốp 2026 (Hết Hạn Trial Lần 47) - Render_Cuoi_Cung_Chot_V9_FINAL_real.jpg', { fontFamily: FONT_MAIN, fontSize: '16px', fill: AH3_COLORS.textSecondary.hex }).setOrigin(0, 0.5);

        // OS Buttons (Min, Max, Close)
        let rightEdge = winX + winWidth / 2;
        this.add.text(rightEdge - 110, titleBarY, '—', { fontSize: '16px', fill: AH3_COLORS.textSecondary.hex }).setOrigin(0.5);
        this.add.text(rightEdge - 70, titleBarY, '☐', { fontSize: '18px', fill: AH3_COLORS.textSecondary.hex }).setOrigin(0.5);
        this.add.rectangle(rightEdge - 20, titleBarY, 40, 40, AH3_COLORS.danger.num);
        this.add.text(rightEdge - 20, titleBarY, 'X', { fontFamily: FONT_MAIN, fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // --- GIAO DIỆN PỜ-SỐP GIẢ ---
        let menuBarY = titleBarY + 30; // Thanh Menu (File, Edit...)
        this.add.rectangle(winX, menuBarY, winWidth, 20, 0x383838);
        this.add.text(winX - winWidth / 2 + 15, menuBarY, 'File    Edit    Image    Layer    Type    Select    Filter    3D    View    Window    Help', { fontFamily: FONT_MAIN, fontSize: '12px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);

        // Vùng làm việc (Workspace)
        let workspaceTop = menuBarY + 10;
        let workspaceBottom = winY + winHeight / 2;
        let workspaceHeight = workspaceBottom - workspaceTop;

        // Tools Bar (Trái) & Layers Bar (Phải)
        this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + workspaceHeight / 2, 60, workspaceHeight, AH3_COLORS.strokeDark.num, 1);
        this.add.rectangle(rightEdge - 125, workspaceTop + workspaceHeight / 2, 250, workspaceHeight, AH3_COLORS.strokeDark.num, 1);

        // Nút Clone Stamp (Dùng hình chữ nhật vô hình làm hitbox cho an toàn)
        this.btnCloneHitbox = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 40, 50, 50, 0x000000, 0).setInteractive({ useHandCursor: true });
        this.btnCloneActive = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 40, 40, 40, AH3_COLORS.bgDarkest.num, 0.3).setStrokeStyle(2, AH3_COLORS.info.num);
        this.add.text(winX - winWidth / 2 + 30, workspaceTop + 40, '🖌️', { fontSize: '24px' }).setOrigin(0.5);

        // Nút Eraser
        this.btnEraserHitbox = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 90, 50, 50, 0x000000, 0).setInteractive({ useHandCursor: true });
        this.btnEraserActive = this.add.rectangle(winX - winWidth / 2 + 30, workspaceTop + 90, 40, 40, AH3_COLORS.bgDarkest.num, 0.3).setStrokeStyle(2, AH3_COLORS.info.num).setVisible(false);
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
        this.add.text(rightEdge - 240, workspaceTop + 20, 'LAYERS', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(rightEdge - 125, workspaceTop + 50, 230, 40, 0x444444).setStrokeStyle(1, 0x555555);
        this.add.text(rightEdge - 230, workspaceTop + 50, '👁️ Background', { fontFamily: FONT_MAIN, fontSize: '14px', fill: AH3_COLORS.textPrimary.hex }).setOrigin(0, 0.5);

        // --- ẢNH NỀN ---
        // Tính toán lại tâm Workspace: Left = 60, Right = 250 -> Còn lại 790 cho ảnh. Tâm X = 150 + 790/2 = 545.
        let wsWidth = winWidth - 60 - 250;
        let wsCenterX = (winX - winWidth / 2 + 60) + wsWidth / 2;
        let wsCenterY = workspaceTop + workspaceHeight / 2;

        let bg = this.add.image(wsCenterX, wsCenterY, 'bg_edu_watermark').setInteractive();
        let scale = Math.min(wsWidth / bg.width, workspaceHeight / bg.height);
        bg.setScale(scale);

        // --- CHỮ CẢNH BÁO ---
        let header = this.add.text(wsCenterX, workspaceTop + 60, 'SẾP ĐANG GỌI!\nCÒN ĐÚNG 15s ĐỂ XÓA WATERMARK!', { fontFamily: FONT_TITLE, fontSize: '32px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', align: 'center', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5);
        this.tweens.add({ targets: header, scaleX: 1.05, scaleY: 1.05, duration: 300, yoyo: true, repeat: -1 });

        this.timeLeftMs = 15000;
        this.minigameFinished = false;
        
        // Chữ DEADLINE
        this.txtDeadlineTitle = this.add.text(rightEdge - 30, workspaceBottom - 145, 'DEADLINE', { fontFamily: FONT_MAIN, fontSize: '32px', fill: AH3_COLORS.textSecondary.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(1, 1).setDepth(50);

        // Timer đẩy lên trên một chút
        this.txtTimer = this.add.text(rightEdge - 30, workspaceBottom - 60, '15.00s', { fontFamily: FONT_MAIN, fontSize: '80px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 6 }).setOrigin(1, 1).setDepth(50);

        // Các câu thoại hối thúc của Sếp (Kiểu thông báo Zalo/Dá Lô)
        let bossQuotes = [
            'Sếp: "Gửi file nhanh lên em!"',
            'Sếp: "Khách đang đợi kìa!"',
            'Sếp: "Xong chưa em? Gấp lắm!"',
            'Sếp: "Có cái logo xóa mãi không xong!"',
            'Sếp: "Deadline sờ gáy rồi kìa!"'
        ];
        
        // Header "Dá Lô thông báo:"
        this.txtZaloHeader = this.add.text(rightEdge - 30, workspaceBottom - 30, '💬 Dá Lô thông báo:', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.info.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3 }).setOrigin(1, 1).setDepth(50);
        
        // Nội dung tin nhắn
        this.txtBossPressure = this.add.text(rightEdge - 30, workspaceBottom + 0, Phaser.Utils.Array.GetRandom(bossQuotes), { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.warning.hex, fontStyle: 'italic', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4 }).setOrigin(1, 1).setDepth(50);
        
        // Đổi câu thoại liên tục để tạo áp lực (Hiệu ứng BUZZ Yahoo)
        this.time.addEvent({
            delay: 2500, repeat: -1,
            callback: () => {
                if (!this.minigameFinished) {
                    this.txtBossPressure.setText(Phaser.Utils.Array.GetRandom(bossQuotes));
                    this.tweens.add({ targets: [this.txtZaloHeader, this.txtBossPressure], scaleX: 1.05, scaleY: 1.05, duration: 150, yoyo: true });
                    
                    // Hiệu ứng RUNG MÀN HÌNH y hệt tin nhắn BUZZ! của Yahoo ngày xưa
                    this.cameras.main.shake(150, 0.005);
                    
                    // Rung thiết bị thực tế (Phản hồi xúc giác - Haptic Feedback cho đTDĐ)
                    if (typeof navigator.vibrate === 'function') navigator.vibrate([100, 50, 100]);
                    
                } else {
                    this.txtZaloHeader.setVisible(false);
                    this.txtBossPressure.setVisible(false);
                }
            }
        });

        // Bắt đầu game ngay (vì đã qua SceneIntro)
        bg.on('pointermove', (pointer) => {
            if (pointer.isDown && !this.minigameFinished) {
                this.applyTool(pointer);
            }
        });

        bg.on('pointerdown', (pointer) => {
            if (this.minigameFinished) return;
            this.applyTool(pointer);
            if (this.currentTool === 'clone') this.cameras.main.shake(50, 0.005);
        });
    }

    update(time, delta) {
        if (this.minigameFinished) return;

        this.timeLeftMs -= delta;
        if (this.timeLeftMs <= 0) {
            this.timeLeftMs = 0;
            this.txtTimer.setText(`0.00s`);
            this.minigameFinished = true;
            this.finishMinigame();
        } else {
            let secs = (this.timeLeftMs / 1000).toFixed(2);
            this.txtTimer.setText(`${secs}s`);
            
            // Kịch tính: Dưới 5 giây nhấp nháy
            if (this.timeLeftMs < 5000) {
                this.txtTimer.setAlpha(Math.floor(this.time.now / 150) % 2 === 0 ? 1 : 0.6);
            }
        }
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
        let c2 = this.add.rectangle(x + size / 2, y - size / 2, size, size, AH3_COLORS.bgDarkest.num);
        let c3 = this.add.rectangle(x - size / 2, y + size / 2, size, size, AH3_COLORS.bgDarkest.num);
        let c4 = this.add.rectangle(x + size / 2, y + size / 2, size, size, 0xff00ff);

        let block = { x, y, objects: [c1, c2, c3, c4] };

        // Kèm chữ lỗi
        if (Phaser.Math.Between(0, 5) === 0) {
            let txt = this.add.text(x, y, 'MISSING', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.textPrimary.hex, backgroundColor: AH3_COLORS.bgDarkest.hex }).setOrigin(0.5);
            block.objects.push(txt);
        }

        this.paintedObjects.push(block);
    }

    finishMinigame() {
        AH3_GAME_STATS.stressLevel += 10;
        
        let failMsg = '';
        if (this.paintedObjects.length > 0) {
            failMsg = 'CÀNG CHỮA CÀNG NÁT!\nTRẦM CẢM +10%';
        } else {
            failMsg = 'ẢNH VẪN CÒN LOGO "EDU" KÌA!\nSẾP GỌI CHỬI SẤP MẶT!\nTRẦM CẢM +10%';
        }

        let failTxt = this.add.text(640, 360, failMsg, { fontFamily: FONT_TITLE, fontSize: '48px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 6, align: 'center' }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: failTxt, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true, repeat: -1
        });

        // Đợi 3 giây để người chơi "thưởng thức" chữ nhấp nháy liên tục
        this.time.delayedCall(3000, () => this.showEndMenu());
    }

    showEndMenu() {
        // Xóa nền mờ overlay (opacity = 0) để người chơi thấy rõ hậu quả bản vẽ nát bét
        let overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0).setInteractive().setDepth(200);

        createRoundedButton(this, 440, 500, 300, 60, '🔄 THỬ LẠI (15s)', {
            bgColor: AH3_COLORS.warning.num,
            bgHover: 0xf4d03f,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 8,
            fontSize: '24px',
            fontStyle: 'bold',
            depth: 210,
            onClick: () => {
                AH3_GAME_STATS.stressLevel -= 10; // Hoàn lại stress penalty
                this.scene.restart();
            }
        });

        createRoundedButton(this, 840, 500, 300, 60, '⏩ ĐI HỌP SẾP', {
            bgColor: AH3_COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 8,
            fontSize: '24px',
            fontStyle: 'bold',
            depth: 210,
            onClick: () => this.scene.start('SceneIntro', { level: 2 })
        });
    }
}
// ==========================================
// MÀN 3: CUỘC CHIẾN ĐÒI NỢ (RUNNER)
// ==========================================
class AH3_SceneDebtRunner extends Phaser.Scene {
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
            let b = this.add.rectangle(i * 100, 640, 90, h, AH3_COLORS.strokeMid.num).setOrigin(0.5, 1);
            b.setDepth(2);
            this.buildings.push(b);
        }

        // Mặt đất công trường (BUG-FIX 2026-05-16: depth 3 to render ON TOP of buildings)
        this.ground = this.add.rectangle(640, 640, 1280, 160, AH3_COLORS.purple.num).setOrigin(0.5, 0).setDepth(3);
        // BUG-FIX (2026-05-17 v3): Xóa "CÔNG TRƯỜNG THI CÔNG" footer text.
        // Lý do: Text ở y=680 bị obstacle (depth 10) trôi qua che ngắt quãng → trông như glitch.
        // Hơn nữa context "công trường" đã rõ qua ground tím + parallax buildings + obstacles → text thừa.
        this.add.text(640, 50, 'MÀN 3: CUỘC CHIẾN ĐÒI NỢ', { fontFamily: FONT_TITLE, fontSize: '32px', fill: AH3_COLORS.darkRed.hex, fontStyle: 'bold', stroke: AH3_COLORS.textPrimary.hex, strokeThickness: 4 }).setOrigin(0.5).setDepth(20);

        let instruct = this.add.text(640, 120, 'Bấm SPACE hoặc CLICK CHUỘT để nhảy né bẫy!\nNhấp đúp trên không để NHẢY KÉP!\nUống HEO HÚC để ép nhịp tim đập nhanh hơn Deadline!', { fontFamily: FONT_MAIN, fontSize: '20px', fill: AH3_COLORS.bgDarkest.hex, align: 'center', fontStyle: 'bold' }).setOrigin(0.5).setDepth(20);
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
        let groundBody = this.add.rectangle(640, 660, 2000, 40, AH3_COLORS.bgDarkest.num, 0);
        this.physics.add.existing(groundBody, true); // static

        // BUG-FIX (2026-05-16): Pure image for Thanh Tra — replaces rect + text container.
        // PNG icon (police) recognizable on its own, no label needed.
        // BUG-FIX (2026-05-16): Use scaleImageToFit to preserve aspect ratio (avoid stretch/squash).
        // SIZE-REFACTOR (2026-05-17): Scale 1.8x để nhân vật có presence rõ hơn.
        // Cũ: inspector 130, player 100, boss 110 → player nhỏ nhất, thiếu hero feel.
        // Mới: inspector 230 (uy quyền), player 180 (= boss), boss 200, obstacle 140, power-up 130.
        // SIZE-REFACTOR (2026-05-18 v1.1.4b): inspector 230→320 (uy quyền tối đa, gấp 1.67x player).
        // Source CHAR_MAX bump 256→320 trong make_assets.py → render 320 = downscale 1.0x = pixel-perfect.
        // Clearance Warning HUD (y=42-187): inspector top=640-320=320 → gap 133px theo trục Y, không che HUD.
        this.inspector = scaleImageToFit(this.add.image(50, 640, 'char_thanh_tra'), 320).setOrigin(0.5, 1).setDepth(5);
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
        // SIZE-REFACTOR (2026-05-18 v1.1.4b): 180→192. Visual 192 → half=96 → cần y=640-96=544.
        // SIZE-REFACTOR (2026-05-18 v1.1.5c): 192→256 (KTS hero presence to hơn 33%, theo yêu cầu Hoàng).
        //   Visual 256 → half=128 → cần y=640-128=512 để feet vẫn chạm ground.
        //   Source CHAR_MAX=320 hỗ trợ tới 320, render 256 = downscale 1.25x = Retina sharp.
        //   Hierarchy: Thanh Tra 320 (125% so KTS) > KTS 256 = Shark 256 (đối đầu cân bằng) > Obs 96 > Heo Húc 72.
        //   Body 120×170 giữ nguyên — tỉ lệ body/visual giảm còn 47%/66% (forgiving hơn, đúng triết lý dễ chơi).
        this.player = scaleImageToFit(this.add.image(150, 512, 'char_kts'), 256).setOrigin(0.5, 0.5).setDepth(6);
        this.physics.add.existing(this.player);
        // POSITION-FIX v2 (2026-05-17): Body align voi visual origin (0.5, 0.5).
        // Visual 180x180, origin day -> body offset y = displayHeight-bodyHeight ngay phia tren day anh.
        // Body 120x170: hep hon visual de hitbox fair, cao gan = visual.
        // SIZE-REFACTOR (2026-05-18 v1.1.4b): Visual 192 nhưng body giữ 120×170 — hitbox không scale theo visual.
        // Tỉ lệ hitbox/visual giảm 67%→63% (chiều rộng), 94%→89% (chiều cao) → forgiving hơn nhẹ.
        this.player.body.setSize(120, 170);
        this.player.body.setOffset((this.player.displayWidth - 120) / 2, this.player.displayHeight - 170);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, groundBody);

        // BUG-FIX (2026-05-16): Pure image for Shark Lươn boss — replaces rect + text container.
        // PNG icon (investor in suit) is recognizable as the runaway client.
        // SIZE-REFACTOR (2026-05-17): 110 → 200 (1.82x) - ngang player để đối đầu cân bằng.
        // SIZE-REFACTOR (2026-05-18 v1.1.4b): 200→192 — đồng nhất với player KTS 192 (đối đầu cân bằng 1:1).
        // SIZE-REFACTOR (2026-05-18 v1.1.5c): 192→256 — đồng bộ với KTS 256 (giữ đối đầu cân bằng 1:1).
        //   Origin (0.5, 1) → foot ở y=640, không cần dịch y center.
        this.boss = scaleImageToFit(this.add.image(1150, 640, 'char_shark_luon'), 256).setOrigin(0.5, 1).setDepth(5);

        // BUG-017: Distance text as HUD (fixed top-right, not following boss)
        // PACING-REBALANCE (2026-05-18 v1.1.4c): 12000→6000 đồng bộ với gameSpeed giảm 50%.
        // PACING-REBALANCE (2026-05-18 v1.1.4d): 6000→8000 đồng bộ với speed bump 175→245.
        // PACING-REBALANCE (2026-05-18 v1.1.4e): 8000→7000 đồng bộ với speed 245→208.
        // TENSION-RELEASE (2026-05-18 v1.1.5 Plan B): 7000→7500 cân với speed avg sqrt curve.
        // PACING-REBALANCE (2026-05-18 v1.1.5c): 7500→8200 đồng bộ speed +10%.
        // PACING-REBALANCE (2026-05-18 v1.1.5d rev6 LINEAR): 8200→9500 cân với speed avg linear curve.
        // PACING-REBALANCE (2026-05-18 v1.1.5d rev7 REACTION-BASED): 9500→13700 cân với speed avg cao.
        //   Math: linear 380→633 → speed avg = (380+633)/2 ≈ 506. Distance reduction = 506×0.6 = 304 px/s.
        //   Game duration = 13700/304 ≈ 45.1s ✅ (giữ ~45s gần với rev6 45.7s).
        //   Inspector tóm @ 45.83s không vấp → sát game end, tension cuối cao do speed kịch.
        this.distance = 13700;
        this.txtDistance = this.add.text(1200, 100, 'Còn: ' + this.distance, { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.textPrimary.hex, strokeThickness: 3 }).setOrigin(0.5).setDepth(20);

        // BUG-FIX (2026-05-16): Warning queue HUD — shows 3 upcoming obstacles by name so player can read
        // ahead of time. Solves UX issue where fast obstacles + multi-line text are hard to parse in real-time.
        // UX-REFACTOR (2026-05-18 v1.1.5d): Warning HUD chuyển từ panel góc trên trái xuống strip ngang
        // dưới đáy màn hình (trên vùng ground tím). Theo yêu cầu Hoàng "đưa bẫy sắp tới xuống dưới cho dễ đọc".
        //
        // CRITICAL FIX (2026-05-18 v1.1.5d rev2): Viewport game = 1280×720, KHÔNG phải 800.
        //   Lần đầu set y=745 → STRIP NẰM NGOÀI viewport → không nhìn thấy.
        //   Sửa: y=680 (giữa vùng tím hiển thị y=640-720), height=70 (fit trong 80px vùng tím).
        //
        // UX-FIX (2026-05-18 v1.1.5d rev3): Bỏ background rectangle + stroke (Hoàng: "chính màu tím là nền chữ rồi").
        //   Text/icon nằm trực tiếp trên ground tím → giảm visual noise, eye flow sạch hơn.
        //   warningPanelBg vẫn tạo nhưng alpha 0 + no stroke (giữ reference để cutscene fade chạy bình thường,
        //   tránh phá break code cutscene đang reference this.warningPanelBg).
        //
        // Layout:
        //   - 3 slot ngang: x slot center 380 / 700 / 1020, y=680 (giữa vùng tím hiển thị)
        //   - Icon 32px bên trái + text 18px bên phải mỗi slot
        //   - Alpha gradient: 1.0 / 0.75 / 0.55 (giữ priority cue)
        //   - Bỏ title "⚠ BẪY SẮP TỚI"
        //   - Depth 21 cao hơn obstacle (depth 10) → text không bị obstacle bay qua che
        //   - Text màu textPrimary trên nền tím — contrast tốt
        this.warningQueue = [];
        // Placeholder bg (alpha 0, no stroke) — giữ reference để cutscene fade group không break.
        this.warningPanelBg = this.add.rectangle(640, 680, 1280, 70, AH3_COLORS.bgDarkest.num, 0).setDepth(20);
        // Text slots: align trái (icon ở cột trái mỗi slot, text bên phải)
        // x slot center: 380 / 700 / 1020. Icon x = center - 60, text x = center - 30 (align left).
        this.warningSlots = [
            this.add.text(350, 680, '', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold', align: 'left' }).setOrigin(0, 0.5).setDepth(21),
            this.add.text(670, 680, '', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold', align: 'left' }).setOrigin(0, 0.5).setDepth(21),
            this.add.text(990, 680, '', { fontFamily: FONT_MAIN, fontSize: '18px', fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold', align: 'left' }).setOrigin(0, 0.5).setDepth(21)
        ];
        // Icon slots: image 32px.
        this.warningIcons = [
            this.add.image(320, 680, '__DEFAULT').setVisible(false).setDepth(21),
            this.add.image(640, 680, '__DEFAULT').setVisible(false).setDepth(21),
            this.add.image(960, 680, '__DEFAULT').setVisible(false).setDepth(21)
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
        // PACING-REBALANCE (2026-05-18 v1.1.4): 400→350 khởi đầu, gia tốc +2→+1.5, cap 750→500.
        // PACING-REBALANCE (2026-05-18 v1.1.4c): 350→175 (giảm thêm 50%) — Hoàng feedback "vẫn nhanh".
        // PACING-REBALANCE (2026-05-18 v1.1.4d): 175→245 (sweet spot giữa căng và thư giãn).
        // PACING-REBALANCE (2026-05-18 v1.1.4e): 245→208 (giảm thêm 15%) — Hoàng tune fine-grained.
        //
        // TENSION-RELEASE ARCHITECTURE (2026-05-18 v1.1.5 — Plan B):
        // Sau v1.1.4e Hoàng feedback "chậm rồi nhưng không hấp dẫn nữa".
        // Research từ GameDeveloper.com (Raimbault 2016) + industry analysis (Temple Run, Subway Surfers):
        // hấp dẫn = tension-release waves, không phải tốc độ thuần.
        //
        // Plan B implementation:
        //   1. baseSpeed 220 (giữa 208 chậm và 245 hấp dẫn)
        //   2. Acceleration sqrt curve: speed = baseSpeed + sqrt(spawnCount × 4) × 5
        //      → đầu game tăng nhanh, cuối ổn định (square-root từ abagames.github.io)
        //   3. Forced REST block mỗi 8 spawn: delay 2500-3000ms, gameSpeed lerp về baseSpeed (giảm tension)
        //   4. Sau rest 4s, gameSpeed lerp về targetSpeed (cur sqrt curve) trở lại
        //   5. FAST cluster intensified: 3-4 obs liên tiếp thay vì 2 (high-risk section trước rest)
        // PACING-REBALANCE (2026-05-18 v1.1.5c): Tốc độ +10% theo yêu cầu Hoàng.
        //   baseSpeed 220→242, coefficient sqrt × 5→5.5, cap 350→385.
        //   Math curve mới:
        //     - spawn 0: 242 (vs 220 cũ)
        //     - spawn 10: 242 + sqrt(40)×5.5 = 277 (vs 252)
        //     - spawn 30: 242 + sqrt(120)×5.5 = 302 (vs 275)
        //     - spawn 50: 242 + sqrt(200)×5.5 = 320 (vs 291)
        //   Phản ứng cuối game: 950/320 = 2.97s (vẫn fair, dưới ngưỡng casual 3s 1 chút).
        // PACING-REBALANCE (2026-05-18 v1.1.5d rev6 LINEAR): sqrt → linear curve (xem updateTargetSpeed).
        //   baseSpeed 242 (giữ — đầu game chậm như cũ).
        //   coefficient 4.5 px/s mỗi spawn, cap 450 (cuối game +41% so cũ 320).
        //   "Nhanh dần đều" suốt game thay vì "ramp then plateau" như sqrt.
        // PACING-REBALANCE (2026-05-18 v1.1.5d rev7 REACTION-BASED): baseSpeed 242 → 380.
        //   Yêu cầu Hoàng "cho phép đầu game nhanh hơn, khởi đầu 2.5s reaction" → speed 950/2.5 = 380.
        //   Đầu game KHÔNG còn warm-up chậm, kịch tính ngay từ obstacle đầu tiên.
        this.baseSpeed = 380;
        this.gameSpeed = 380;
        this.targetSpeed = 380;   // lerp target (cập nhật theo linear curve trong updateTargetSpeed)
        this.spawnCount = 0;      // đếm số obstacle đã spawn (cho linear acceleration + rest trigger)
        this.restMode = false;    // true khi đang trong rest block (gameSpeed lerp về baseSpeed)
        this.restEndTime = 0;     // thời điểm rest block kết thúc (để update() biết khi nào về normal)
        this.fastClusterCount = 0; // đếm số fast liên tiếp (cho intensified cluster 3-4)
        this.lastWasRest = false; // tránh 2 rest block liên tiếp (rest → rest → unfair player)
        // BUG-FIX (2026-05-18 v1.1.5 rev2): Init lastWasFast/lastTierHigh explicit (tránh undefined lần đầu).
        this.lastWasFast = false;
        this.lastTierHigh = false;
        // BUG-FIX (2026-05-18 v1.1.5 rev2): Rest interval logic dùng cumulative target (nextRestAt)
        // thay vì spawnCount % restInterval (logic cũ random restInterval mỗi lần → trigger không đều).
        // Rest đầu tiên sau 6 spawn (warm-up), sau đó +6/+7/+8 spawn random cho mỗi rest tiếp theo.
        this.nextRestAt = 6;

        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E):
        // Thay charge counter (Variant C) bằng energy bar 0-100%.
        //
        // Rules:
        //   - Energy = 100% khi bắt đầu game (đủ 2 lần double jump)
        //   - Single jump: KHÔNG tốn energy (free, vô hạn)
        //   - Double jump: cần ≥ 50% energy → tiêu thụ 50% + stomp được tự động
        //   - Heo Húc: +50% energy (cap 100%) + relief inspector cũ (-50 xOffset)
        //   - Energy < 50% → KHÔNG double jump được → phải uống Heo Húc
        //
        // Balance:
        //   - Start 100% + nhặt ~5-7 lon × 50% = "credits" cho 6-8 double jump
        //   - Game spawn ~8 high-tier obs cần double jump → cận biên fair, đòi nhặt Heo Húc
        //
        // Stomp auto: mọi double jump (đủ energy) = stomp được khi rơi xuống trúng obstacle.
        //   → KHÔNG cần flag isStompReady riêng vì double jump tự kéo theo quyền stomp.
        //   → check trong hitObstacle: nếu player đang double jump descent (velocity Y > 50 AND đã double) → stomp.
        this.energy = 100;
        this.MAX_ENERGY = 100;
        this.DOUBLE_JUMP_COST = 50;
        this.HEO_HUC_GAIN = 50;
        this.didDoubleJump = false; // flag track double jump trong air time hiện tại (reset khi land)
        // FIX-G1 (2026-05-18 v1.1.5d rev4): Cooldown cho energy hint — tránh case spam jump khi hết energy
        // mà chỉ hiện hint 1 lần (vì canDoubleJump=false sau lần spam đầu).
        this.lastEnergyHintTime = 0;
        // LANDING-RECOVERY (2026-05-18 v1.1.5d rev5): Track frame transition air → ground để snap angle.
        // Khi player land với angle xấu (>±45° vs upright), tự cân lại random ±45° cho cảm giác
        // "vấp ngã đứng dậy lảo đảo" thay vì stuck xoay ngang (rotation tween bị interrupt).
        this.wasInAir = false;

        // Energy bar UI ở góc trên trái — sử dụng vùng vừa giải phóng khỏi warning HUD cũ.
        // Layout: Label "NĂNG LƯỢNG" + thanh ngang 200×24, fill xanh→vàng→đỏ tùy %.
        //   x=30 (lề trái 30px), y=55 (cách title y=50 một chút)
        //   Bar background (border): rectangle 200×24, stroke 2px warning.
        //   Bar fill (dynamic): rectangle 196×20, color đổi theo % energy.
        this.energyBarLabel = this.add.text(30, 55, '⚡ NĂNG LƯỢNG', {
            fontFamily: FONT_MAIN, fontSize: '14px',
            fill: AH3_COLORS.warning.hex, fontStyle: 'bold',
            stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(21);
        // Background border (luôn hiện, marker max range)
        this.energyBarBg = this.add.rectangle(30, 80, 200, 24, AH3_COLORS.bgDarkest.num, 0.7)
            .setOrigin(0, 0.5).setStrokeStyle(2, AH3_COLORS.warning.num).setDepth(21);
        // Fill bar (width dynamic theo % energy). Origin (0, 0.5) để fill từ trái sang phải.
        this.energyBarFill = this.add.rectangle(32, 80, 196, 20, AH3_COLORS.info.num)
            .setOrigin(0, 0.5).setDepth(22);
        // Text % energy ở giữa bar (visual feedback rõ ràng)
        this.energyBarText = this.add.text(130, 80, '100%', {
            fontFamily: FONT_MAIN, fontSize: '14px',
            fill: AH3_COLORS.textPrimary.hex, fontStyle: 'bold',
            stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
        }).setOrigin(0.5).setDepth(23);

        this.isGameOver = false;
        // PACING-REBALANCE (2026-05-18 v1.1.4): Thay spawnTimer fixed 1200ms bằng
        // scheduleNextObstacle() — random delay 900/1400/2100ms với weight 20/60/20.
        // Tạo nhịp dồn dập / bình thường / khoảng thở thay vì metronome đều đặn.
        this.lastWasFast = false;
        this.lastTierHigh = false;
        this.scheduleNextObstacle();
        this.coinTimer = this.time.addEvent({ delay: 3500, callback: this.spawnCollectible, callbackScope: this, loop: true });
    }

    jump() {
        if (this.isGameOver) return;
        if (this.player.body.touching.down) {
            // SINGLE JUMP — free, không tốn energy. Vô hạn (giống cũ).
            // JUMP-BUFF (2026-05-18 v1.1.5d Option B+): -900 → -1000 (+11%).
            //   Peak height: 1000²/(2×2000) = 250px (cũ 202.5px → +47px cao hơn).
            //   Peak body bottom: 394.5 → 347.5 → high-easy clearance +25 → +72.5px (thoải mái).
            //   Air time: 0.9s → 1.0s → jump xa @ speed 242 = 242px (đủ qua TENSE gap 245-280px).
            playSound(this, 'sfx_jump');
            this.player.body.setVelocityY(-1000);
            this.canDoubleJump = true;
            this.didDoubleJump = false; // reset khi land+single jump mới
            // BUG-FIX (2026-05-16): Use relative '+=360' so angle doesn't accumulate reverse rotation across jumps
            this.tweens.add({ targets: this.player, angle: '+=360', duration: 400 });
        } else if (this.canDoubleJump) {
            // DOUBLE JUMP — yêu cầu ≥ 50% energy.
            // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E):
            //   - Đủ energy → tiêu thụ 50%, rotation gấp đôi (powered visual), set didDoubleJump
            //     → tự động stomp được khi rơi xuống trúng obs (xem hitObstacle).
            //   - Không đủ → chặn double jump (canDoubleJump = false vẫn set để tránh spam),
            //     hiện hint "❌ HẾT NĂNG LƯỢNG" để player biết cần uống Heo Húc.
            //
            // JUMP-BUFF (2026-05-18 v1.1.5d Option B+): -700 → -800 (+14%).
            // FIX-B1 (2026-05-18 v1.1.5d rev4): -800 → -700 (revert) vì double peak gây CẮT VISUAL.
            //   Math cũ: double peak center y=102 → visual top y = 102-128 = -26 (CẮT 26px ngoài viewport).
            //   Math mới: double peak total 250+122.5 = 372.5 → center y = 139.5 → visual top y = 11.5 ✅
            //   Single jump vẫn buff -1000 (cao hơn cũ 47px). Double jump dùng -700 = giữ cũ.
            //   Hệ quả tốt: double jump không "god mode" (peak 372 thay 410) → high-hard vẫn có ý nghĩa.
            //   Clearance double peak với high-hard: 380 - (512-372.5+85) = +155px (cũ +193, vẫn dư).
            if (this.energy >= this.DOUBLE_JUMP_COST) {
                playSound(this, 'sfx_jump');
                this.player.body.setVelocityY(-700);
                this.canDoubleJump = false;
                this.didDoubleJump = true;
                this.energy = Math.max(0, this.energy - this.DOUBLE_JUMP_COST);
                this.updateEnergyBar();
                // Rotation gấp đôi (720°) để feel "powered" — visual cue stomp ready
                this.tweens.add({ targets: this.player, angle: '+=720', duration: 400, ease: 'Cubic.easeOut' });
                // Floating hint "⚡ POWERED!" lên đầu player
                let hint = this.add.text(this.player.x, this.player.y - 120, '⚡ STOMP!', {
                    fontFamily: FONT_MAIN, fontSize: '20px',
                    fill: AH3_COLORS.warning.hex, fontStyle: 'bold',
                    stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3
                }).setOrigin(0.5).setDepth(15);
                this.tweens.add({
                    targets: hint, y: hint.y - 40, alpha: 0,
                    duration: 600, onComplete: () => hint.destroy()
                });
            } else {
                // Hết energy — chặn double jump.
                // FIX-G1 (2026-05-18 v1.1.5d rev4): KHÔNG set canDoubleJump=false ở đây
                // (giữ true để spam jump tiếp theo vẫn vào else branch → hint hiện lại được).
                // Thay vào đó dùng cooldown 500ms để tránh hint flash liên tục.
                if (this.time.now - this.lastEnergyHintTime >= 500) {
                    this.lastEnergyHintTime = this.time.now;
                    let warn = this.add.text(this.player.x, this.player.y - 100, '❌ HẾT NĂNG LƯỢNG\nUỐNG HEO HÚC!', {
                        fontFamily: FONT_MAIN, fontSize: '18px',
                        fill: AH3_COLORS.danger.hex, fontStyle: 'bold',
                        stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 3,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(15);
                    this.tweens.add({
                        targets: warn, y: warn.y - 50, alpha: 0,
                        duration: 800, onComplete: () => warn.destroy()
                    });
                }
            }
        }
    }

    // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E): Update energy bar fill width + color + text.
    // Color logic: ≥ 50% xanh info, 25-49% vàng warning, < 25% đỏ danger.
    // Width: 196px max (full), scale theo % energy.
    updateEnergyBar() {
        if (!this.energyBarFill || !this.energyBarText) return;
        let pct = this.energy / this.MAX_ENERGY;
        let width = Math.max(0, 196 * pct);
        this.energyBarFill.width = width;
        // Color đổi theo ngưỡng
        let color;
        if (this.energy >= 50) {
            color = AH3_COLORS.info.num; // xanh — đủ double jump
        } else if (this.energy >= 25) {
            color = AH3_COLORS.warning.num; // vàng — sắp hết
        } else {
            color = AH3_COLORS.danger.num; // đỏ — không double jump được
        }
        this.energyBarFill.fillColor = color;
        this.energyBarText.setText(Math.floor(this.energy) + '%');
    }

    // TENSION-RELEASE ARCHITECTURE (2026-05-18 v1.1.5 — Plan B):
    // Thay distribution random 20/60/20 bằng wave-based pacing theo research GameDeveloper.com.
    //
    // Pattern: Challenge cluster (6-8 obs) → Rest block (1 rest spawn) → Challenge → Rest → ...
    //
    // Trong CHALLENGE cluster:
    //   - 30% FAST (1000-1200ms): cluster 2-4 obs sát nhau (anti-cluster guard)
    //   - 60% NORMAL (1300-1700ms): main feel
    //   - 10% TENSE (800-1000ms): rare moment căng (chỉ khi context an toàn)
    //
    // Trong REST block (sau mỗi 6-8 spawn):
    //   - 1 spawn với delay LONG (2500-3000ms)
    //   - gameSpeed lerp về baseSpeed trong update() — tạo "thở" rõ rệt
    //   - Trigger Heo Húc spawn ngay đầu rest (reward feel)
    //   - Rest end → spawnCount tăng tiếp, target speed lại sqrt curve
    //
    // Acceleration: sqrt curve via updateTargetSpeed()
    scheduleNextObstacle() {
        if (this.isGameOver) return;

        let delay;

        // BUG-FIX (2026-05-18 v1.1.5 rev2): Dùng cumulative nextRestAt thay vì spawnCount % restInterval.
        // Logic cũ random restInterval mỗi lần → trigger không đều.
        // Logic mới: trigger khi spawnCount === nextRestAt, sau đó set nextRestAt += 6-8 cho lần tiếp theo.
        if (this.spawnCount >= this.nextRestAt && !this.lastWasRest) {
            // REST block — long delay, slow down speed, spawn Heo Húc reward
            delay = Phaser.Math.Between(2500, 3000);
            this.restMode = true;
            // BUG-FIX (2026-05-18 v1.1.5 rev2): restEndTime tính đúng — rest obs spawn lúc T+delay,
            // sau đó còn ~1.5s để rest obs bay qua màn ở speed 220 (1350-400=950px / 220 ≈ 4.3s nhưng
            // cảm xúc rest cần kết thúc trước khi obs tiếp theo đến). Set rest end = T+delay+1500.
            this.restEndTime = this.time.now + delay + 1500;
            this.lastWasRest = true;
            this.fastClusterCount = 0;
            // BUG-FIX (2026-05-18 v1.1.5 rev2): Explicit reset lastWasFast=false trong rest.
            // Intent: sau rest, obs đầu tiên LUÔN là NORMAL (ease back into action, không bị TENSE/FAST shock).
            // Nếu không reset, lastWasFast giữ giá trị từ trước rest → có thể block hoặc allow FAST tuỳ context.
            this.lastWasFast = false;
            // Set target cho rest sau (current + 6-8)
            this.nextRestAt = this.spawnCount + Phaser.Math.Between(6, 8);

            // BUG-FIX (2026-05-18 v1.1.5 rev2): Reset coinTimer để tránh duplicate Heo Húc trong rest.
            // Coin timer 3500ms loop + rest spawn 500ms có thể trigger 2-3 lon cùng lúc → visual confusing.
            // Reset timer = lon rest là Heo Húc duy nhất trong window 3.5s tiếp theo.
            if (this.coinTimer) {
                this.coinTimer.remove();
                this.coinTimer = this.time.addEvent({
                    delay: 3500, callback: this.spawnCollectible, callbackScope: this, loop: true
                });
            }
            // Spawn 1 Heo Húc ngay đầu rest (reward feel)
            // FIX-H1 (2026-05-18 v1.1.5d rev4): Heo Húc trước đây spawn 500ms (đầu rest delay 2500-3000ms)
            // → tới player TRƯỚC rest obs ~2s → player vẫn vật lộn với cluster cuối, chưa "thở".
            // Fix: spawn ngay sau rest obs (delay + 300ms) → Heo Húc xuất hiện CÙNG khoảng thở
            // → reward feel gắn với rest đúng intent ("uống lon thưởng sau khi sống sót cluster").
            this.time.delayedCall(delay + 300, () => {
                if (!this.isGameOver) this.spawnCollectible();
            });
        } else {
            // CHALLENGE cluster
            this.lastWasRest = false;
            let roll = Phaser.Math.Between(1, 100);

            // Intensified FAST cluster: nếu đang trong cluster (fastClusterCount > 0), 60% tiếp tục fast
            // → tạo 2-4 obs liên tiếp dồn dập như recommended by Plan B research
            let continueFast = (this.fastClusterCount > 0 && this.fastClusterCount < 4 &&
                                !this.lastTierHigh && roll <= 60);

            if (roll <= 10 && !this.lastWasFast && !this.lastTierHigh && this.fastClusterCount === 0) {
                // TENSE — rất nhanh, chỉ start cluster mới khi context an toàn
                delay = Phaser.Math.Between(800, 1000);
                this.lastWasFast = true;
                this.fastClusterCount = 1;
            } else if (continueFast || (roll <= 40 && !this.lastWasFast && !this.lastTierHigh)) {
                // FAST cluster — start hoặc continue cluster 2-4 obs
                delay = Phaser.Math.Between(1000, 1200);
                this.lastWasFast = true;
                this.fastClusterCount++;
            } else {
                // NORMAL — main distribution
                delay = Phaser.Math.Between(1300, 1700);
                this.lastWasFast = false;
                this.fastClusterCount = 0;
            }
        }

        this.spawnTimer = this.time.delayedCall(delay, () => {
            this.spawnObstacle();
            this.scheduleNextObstacle(); // Self-reschedule
        });
    }

    // PACING-REBALANCE (2026-05-18 v1.1.5 Plan B): Sqrt acceleration curve.
    // Formula: targetSpeed = baseSpeed + sqrt(spawnCount × 4) × coefficient
    // PACING-REBALANCE (2026-05-18 v1.1.5c): coefficient 5→5.5, cap 350→385 (+10% đồng bộ baseSpeed).
    // PACING-REBALANCE (2026-05-18 v1.1.5d rev6 LINEAR): sqrt curve → linear curve.
    // PACING-REBALANCE (2026-05-18 v1.1.5d rev7 REACTION-BASED): Tăng tốc theo reaction time.
    //   Yêu cầu Hoàng: "khởi đầu 2.5s, cuối game 1.5s" → tính ngược từ reaction = 950/speed:
    //     - Reaction 2.5s đầu → speed 950/2.5 = 380
    //     - Reaction 1.5s cuối → speed 950/1.5 = 633
    //   So với rev6: đầu 242→380 (+57%), cuối 450→633 (+41%) → kịch tính ngay từ đầu.
    //   Coefficient: (633-380)/47 spawn ≈ +5.4/spawn (linear, "nhanh dần đều").
    //
    //   Speed curve mới (linear, baseSpeed 380, coefficient 5.4, cap 633):
    //     - spawn 0:  380 (reaction 2.50s)
    //     - spawn 10: 434 (reaction 2.19s)
    //     - spawn 20: 488 (reaction 1.95s)
    //     - spawn 30: 542 (reaction 1.75s)
    //     - spawn 40: 596 (reaction 1.59s)
    //     - spawn 47+: 633 (reaction 1.50s) → CAP
    //
    //   Industry context: 1.5s cuối game gần Geometry Dash (1.0-1.5s precise platformer).
    //   Safety net cho player: Energy/Stomp + Warning HUD strip lookahead 3 obs.
    updateTargetSpeed() {
        this.targetSpeed = Math.min(633, this.baseSpeed + this.spawnCount * 5.4);
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

        // PACING-REBALANCE (2026-05-18 v1.1.4): Track tier để scheduleNextObstacle() biết
        // có safe để fast-cluster lần sau không. Tier 6,7 = high (cần jump cao/double) → block fast.
        this.lastTierHigh = (tier >= 6);

        // BUG-FIX (2026-05-16): Pure image obstacle — replaces rect + companion icon.
        // PNG icon IS the obstacle (has physics body).
        // BUG-FIX (2026-05-16): Use scaleImageToFit to preserve aspect ratio (avoid stretch/squash).
        // SIZE (2026-05-17): Giữ obstacle 80px (chỉ scale nhân vật, không scale obstacle để giữ dễ né).
        // SIZE (2026-05-18 v1.1.4): 80→120 (1.5x). Phản hồi: "icon bé quá nhìn không rõ".
        // SIZE (2026-05-18 v1.1.4b): 120→160 (đồng bộ size hierarchy mới).
        // SIZE (2026-05-18 v1.1.4c): 160→144 — tinh chỉnh xuống cảm giác "vật cản đường nhỏ".
        // SIZE (2026-05-18 v1.1.4e): 144→128 — đồng bộ all obstacle 128px theo yêu cầu Hoàng.
        // SIZE (2026-05-18 v1.1.5c): 128→96 — đồng bộ size mới theo yêu cầu Hoàng (KTS to 256 → obs càng nhỏ rõ rệt).
        //   Tỉ lệ với KTS 256: 96/256 = 38% (vật cản rất nhỏ vs hero, narratively đúng).
        //   Source ICON_MAX 256 → render 96 = downscale 2.67x (hơi over nhưng vẫn sắc nét, LANCZOS handles tốt).
        //   Hitbox 60×60 → tỉ lệ 60/96 = 63% (vẫn fair, không quá nhỏ vs visual).
        //   Heo Húc 72 → tỉ lệ 72/96 = 75% (item nhỏ hơn obstacle rõ ràng, phân biệt OK).
        let obs = scaleImageToFit(this.add.image(1350, yPos, type.iconKey), 96).setOrigin(0.5, 1).setDepth(10);

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
        // PACING-REBALANCE (2026-05-18 v1.1.4): +2→+1.5, cap 750→500.
        // PACING-REBALANCE (2026-05-18 v1.1.4c): +1.5→+0.75, cap 500→250 (đồng bộ giảm 50%).
        // PACING-REBALANCE (2026-05-18 v1.1.4d): +0.75→+1.05, cap 250→350 (đồng bộ với khởi đầu 245).
        // PACING-REBALANCE (2026-05-18 v1.1.4e): +1.05→+0.9, cap 350→298 (đồng bộ giảm 15%).
        //
        // TENSION-RELEASE (2026-05-18 v1.1.5 Plan B): Bỏ acceleration linear, dùng sqrt curve.
        // Logic mới: tăng spawnCount, gọi updateTargetSpeed() để set targetSpeed theo sqrt.
        // update() sẽ lerp gameSpeed về targetSpeed (hoặc baseSpeed nếu đang restMode).
        // Cap đã chuyển vào updateTargetSpeed (Math.min 350).
        this.spawnCount++;
        if (!this.restMode) {
            this.updateTargetSpeed();
        }
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
                // UX-REFACTOR (2026-05-18 v1.1.5d): Icon scale 28→36→32 (rev2: giảm cho strip mỏng 70px).
                // Scale icon về 32px (giữ tỉ lệ aspect).
                let img = this.warningIcons[i];
                if (img.width > 0 && img.height > 0) {
                    img.setScale(32 / Math.max(img.width, img.height));
                }
            } else {
                this.warningIcons[i].setVisible(false);
            }
        }
    }

    hitObstacle(player, obs) {
        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E): Stomp dùng didDoubleJump flag.
        // Logic đơn giản hóa từ Variant C:
        //   - Player vừa double jump (didDoubleJump = true) → đã tiêu thụ 50% energy ở jump()
        //   - AND đang rơi xuống (velocity Y > 50) → confirmed descent state
        //   → STOMP: destroy obs, bounce, reset didDoubleJump để tránh chain free.
        //   → KHÔNG tốn thêm energy (energy đã trả ở thời điểm jump).
        //
        // Velocity Y > 50: tránh false trigger lúc peak (velocity ≈ 0) hoặc lúc rising.
        if (this.didDoubleJump && player.body.velocity.y > 50) {
            // === STOMP ===
            playSound(this, 'sfx_win');
            obs.destroy();
            player.body.setVelocityY(-500); // Bounce nhẹ — không chain stomp vì didDoubleJump = false
            this.didDoubleJump = false; // 1 stomp / 1 double jump (không chain free)
            // Inspector lùi nhẹ — thưởng skill stomp
            this.inspector.xOffset = Math.max(-400, this.inspector.xOffset - 20);
            this.cameras.main.shake(80, 0.01);
            let f = this.add.text(this.player.x, this.player.y - 100, '💥 STOMP!', {
                fontFamily: FONT_MAIN, fontSize: '28px',
                fill: AH3_COLORS.warning.hex, fontStyle: 'bold',
                stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 4
            }).setOrigin(0.5).setDepth(15);
            this.tweens.add({
                targets: f, y: f.y - 100, alpha: 0,
                duration: 1000, onComplete: () => f.destroy()
            });
            return;
        }

        // === SIDE HIT — penalty cũ ===
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
        let f = this.add.text(this.player.x, this.player.y - 100, '- TỐC ĐỘ!', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.textPrimary.hex, strokeThickness: 4 }).setOrigin(0.5);
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
        // SIZE (2026-05-18 v1.1.4): 70→105 (1.5x) đồng bộ với obstacle 80→120.
        // SIZE (2026-05-18 v1.1.4b): 105→112 — tinh chỉnh nhẹ cho asset bump ICON_MAX 256.
        // SIZE (2026-05-18 v1.1.4e): 112→96 — đồng bộ với obstacle 128 theo yêu cầu Hoàng.
        // SIZE (2026-05-18 v1.1.5c): 96→72 — đồng bộ size mới (obs 96 → Heo Húc 72 giữ tỉ lệ 75%).
        //   Tỉ lệ với obstacle 96: 72/96 = 75% (item nhỏ hơn obstacle rõ rệt, UX đúng).
        //   Tỉ lệ với KTS 256: 72/256 = 28% (item rất nhỏ vs hero, "lon nước nhỏ trong tay người to").
        //   Source ICON_MAX 256 → render 72 = downscale 3.56x (over-downscale, vẫn sắc nét nhờ LANCZOS).
        //   Hitbox 40×60 giữ nguyên → tỉ lệ chiều rộng 40/72 = 56%, chiều cao 60/72 = 83% (forgiving).
        //   Heo Húc cao y=355: visual top = 355-72 = 283, hitbox span 295-355. Player body peak (KTS 256, body 170)
        //   = peak y ~256.5 → bottom y 426.5 → overlap với hitbox 295-355 OK ✅
        let can = scaleImageToFit(this.add.image(1350, yPos, 'pu_heo_huc'), 72).setOrigin(0.5, 1).setDepth(10);

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

        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E):
        // Heo Húc dual-use: vừa relief inspector (cũ) vừa +50% energy (mới, thay charge).
        // Cap 100% — uống đầy bình rồi không tích thêm được (tránh exploit).
        this.energy = Math.min(this.MAX_ENERGY, this.energy + this.HEO_HUC_GAIN);
        this.updateEnergyBar();

        // Floating text feedback — gộp 2 dòng: "+ HEO HÚC!" + "⚡ +50% NĂNG LƯỢNG"
        let f = this.add.text(this.player.x, this.player.y - 100, '+ HEO HÚC!\n⚡ +50% NĂNG LƯỢNG', {
            fontFamily: FONT_MAIN, fontSize: '20px',
            fill: AH3_COLORS.info.hex, fontStyle: 'bold',
            stroke: AH3_COLORS.textPrimary.hex, strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        this.tweens.add({ targets: f, y: f.y - 100, alpha: 0, duration: 1200, onComplete: () => f.destroy() });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // TENSION-RELEASE (2026-05-18 v1.1.5 Plan B): Lerp gameSpeed mượt mà.
        // - Bình thường: lerp về targetSpeed (sqrt curve theo spawnCount)
        // - Rest mode: lerp về baseSpeed (chậm hẳn, tạo cảm giác "thở")
        // - Rest end (sau restEndTime): tắt restMode, update lại targetSpeed cho cycle tiếp theo
        if (this.restMode && time > this.restEndTime) {
            this.restMode = false;
            this.updateTargetSpeed(); // recalc target cho cycle tiếp theo
        }
        let lerpTarget = this.restMode ? this.baseSpeed : this.targetSpeed;
        // Lerp factor 0.02 ở 60fps ≈ chuyển đổi smooth trong ~0.8s (vừa đủ cảm nhận, không giật)
        this.gameSpeed += (lerpTarget - this.gameSpeed) * 0.02;

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

        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E): Reset didDoubleJump khi player chạm ground.
        // Lý do: double jump powered nhưng bay qua obstacle (không trúng) → didDoubleJump vẫn true.
        // Khi land → reset flag để lần single jump kế tiếp KHÔNG ăn theo stomp (edge case: vừa land vừa chạm obs).
        // Energy KHÔNG hoàn lại — energy đã được tiêu thụ ngay từ thời điểm jump (kiểu pay-upfront).
        //
        // LANDING-RECOVERY (2026-05-18 v1.1.5d rev5): Snap angle về random ±45° khi vừa land với angle xấu.
        // Yêu cầu Hoàng: "khi xuống đất nên tự cân lại random lệch từ -45 đến 45 độ thôi
        // tránh kiến trúc sư bị xoay ngang khi xuống".
        //
        // Lý do bug: rotation tween +=360°/+=720° có thể bị interrupt giữa chừng (stomp bounce,
        // side hit shake) → player.angle stuck ở giá trị xấu (90°, 180°...) → KTS đứng ngang/ngược.
        //
        // Logic:
        //   1. Track wasInAir frame trước → detect transition air → ground (vừa land trong frame này)
        //   2. Normalize player.angle về -180..180 (vì +=360 tích lũy có thể là 720, 1080...)
        //   3. Nếu |angle| > 45 → snap về random ±45° (kill tween cũ tránh conflict)
        //   4. Nếu |angle| ≤ 45 → giữ nguyên (không cần snap, đã trong range OK)
        //   → Cảm giác "vấp ngã đứng dậy hơi lảo đảo" thay vì "robot snap thẳng đứng"
        let justLanded = this.wasInAir && this.player.body.touching.down;
        if (this.didDoubleJump && this.player.body.touching.down) {
            this.didDoubleJump = false;
        }
        if (justLanded) {
            // Normalize angle về -180..180 (xử lý case +=360 tích lũy thành 720, 1080)
            let currentAngle = this.player.angle;
            let normalizedAngle = ((currentAngle % 360) + 540) % 360 - 180;
            if (Math.abs(normalizedAngle) > 45) {
                // Angle xấu → snap về random ±45°
                let targetAngle = Phaser.Math.Between(-45, 45);
                this.tweens.killTweensOf(this.player); // Kill rotation tween đang chạy
                this.tweens.add({
                    targets: this.player,
                    angle: targetAngle,
                    duration: 200, ease: 'Cubic.easeOut'
                });
            }
        }
        // Update wasInAir cho frame tiếp theo (sau khi đã dùng cho justLanded check)
        this.wasInAir = !this.player.body.touching.down;

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
        // UX-REFACTOR (2026-05-18 v1.1.5d): Bỏ warningTitle khỏi group (đã xóa khi chuyển sang strip dưới).
        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E): Thay stompChargeIcon/Text bằng energy bar UI.
        let warningGroup = [
            this.warningPanelBg,
            ...this.warningSlots, ...this.warningIcons,
            this.txtDistance,
            this.energyBarLabel, this.energyBarBg, this.energyBarFill, this.energyBarText
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
                    fontFamily: FONT_TITLE, fontSize: '56px', fill: AH3_COLORS.danger.hex,
                    fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 8
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
        this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.6).setDepth(POPUP_DEPTH);
        let box = this.add.rectangle(640, 360, 850, 360, AH3_COLORS.bgDarkest.num, 0.95).setStrokeStyle(4, AH3_COLORS.danger.num).setDepth(POPUP_DEPTH + 1);

        let parts = msg.split('\n');
        let title = parts[0] || 'THẤT BẠI';
        let reason = parts[1] || '';

        this.add.text(640, 240, title, { fontFamily: FONT_TITLE, fontSize: '48px', fill: AH3_COLORS.danger.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);
        if (reason) {
            this.add.text(640, 280, reason, { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5, 0).setDepth(POPUP_DEPTH + 1);
        }

        // Nút THỬ LẠI (Retry màn này)
        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton (bo góc Qt-style).
        createRoundedButton(this, 640, 400, 350, 56, '🔄 THỬ LẠI MÀN 3', {
            bgColor: AH3_COLORS.info.num,
            bgHover: 0x5dade2,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '22px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.restart()
        });

        // Nút ĐẬP MÁY (sang Rage Mode) — Player giving up → surrenders to Màn 4 per GDD narrative.
        createRoundedButton(this, 640, 475, 350, 56, '🔥 ĐẬP MÁY TỰ TỬ (RAGE)', {
            bgColor: AH3_COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.start('SceneIntro', { level: 4 })
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
        // UX-REFACTOR (2026-05-18 v1.1.5d): Bỏ warningTitle khỏi group (đã xóa khi chuyển sang strip dưới).
        // ENERGY SYSTEM (2026-05-18 v1.1.5d Variant E): Thay stompChargeIcon/Text bằng energy bar UI.
        let warningGroup = [
            this.warningPanelBg,
            ...this.warningSlots, ...this.warningIcons,
            this.txtDistance,
            this.energyBarLabel, this.energyBarBg, this.energyBarFill, this.energyBarText
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
                    fontFamily: FONT_TITLE, fontSize: '56px', fill: AH3_COLORS.warning.hex,
                    fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 8
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
        this.add.rectangle(640, 360, 1280, 720, AH3_COLORS.bgDarkest.num, 0.6).setDepth(POPUP_DEPTH);
        let box = this.add.rectangle(640, 360, 850, 300, AH3_COLORS.bgDarkest.num, 0.95).setStrokeStyle(4, AH3_COLORS.warning.num).setDepth(POPUP_DEPTH + 1);

        this.add.text(640, 240, 'BẠN ĐÃ ĐUỔI KỊP SHARK LƯƠN!', { fontFamily: FONT_TITLE, fontSize: '48px', fill: AH3_COLORS.warning.hex, fontStyle: 'bold', stroke: AH3_COLORS.bgDarkest.hex, strokeThickness: 5 }).setOrigin(0.5).setDepth(POPUP_DEPTH + 1);
        this.add.text(640, 290, 'Nhưng hắn vừa leo lên chiếc May-Bách Mui Trần rồ ga chạy mất.\nTiền tài khoản của bạn: -500.000 VNĐ', { fontFamily: FONT_MAIN, fontSize: '24px', fill: AH3_COLORS.textPrimary.hex, align: 'center', fontStyle: 'bold', lineSpacing: 10, wordWrap: { width: 770, useAdvancedWrap: true } }).setOrigin(0.5, 0).setDepth(POPUP_DEPTH + 1);

        // MIGRATION (2026-05-17 v7): Migrate sang createRoundedButton.
        createRoundedButton(this, 640, 420, 350, 60, '🔥 NỔI ĐIÊN (SANG MÀN 4) 🔥', {
            bgColor: AH3_COLORS.danger.num,
            bgHover: 0xec7063,
            borderColor: AH3_COLORS.textPrimary.num,
            radius: 6,
            fontSize: '20px',
            fontStyle: 'bold',
            depth: POPUP_DEPTH + 1,
            onClick: () => this.scene.start('SceneIntro', { level: 4 })
        });
    }
}

const AH3_gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    parent: 'game-container',
    backgroundColor: AH3_COLORS.bgDarkest.hex,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [AH3_SceneBoot, AH3_SceneIntro, AH3_Scene1, AH3_SceneCloneStamp, AH3_Scene2, AH3_SceneDebtRunner, AH3_SceneRageMode]
};

const AH3_gameInstance = new Phaser.Game(AH3_gameConfig);


// ============================================================
// IPAD / TOUCH DEVICE SUPPORT (2026-05-17, v1.1.0)
// ============================================================
// Mục tiêu: Cho phép chơi game trên iPad/iPhone qua web.
// Hub WebView2 (desktop Windows) KHÔNG bị ảnh hưởng vì isTouchDevice = false.
//
// 3 tính năng:
// 1. Virtual D-Pad cho Audition Mode (Màn 1 Phase 2) — chỉ touch device
// 2. Auto-hook vào Scene1 để hiện/ẩn D-Pad đúng lúc
// 3. Detect rotate event để re-evaluate landscape warning (đã có CSS handle)
//
// KHÔNG sửa logic game gốc — chỉ wrap method và dispatch fake KeyboardEvent.
// ============================================================

(function () {
    'use strict';

    // ---------- 1. Touch device detection ----------
    const isTouchDevice = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );

    // Phát hiện thêm Mobile/Tablet OS thực sự (iOS, Android) 
    // để tránh các dòng PC Windows có màn hình cảm ứng vẫn bị hiện D-Pad.
    const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Hub WebView2 trên Windows desktop → isMobileOrTablet = false → skip toàn bộ
    // iPad / iPhone / Android → tiếp tục init
    if (!isTouchDevice || !isMobileOrTablet) {
        console.log('[IPAD_SUPPORT] Desktop / non-touch device — D-Pad disabled.');
        return;
    }

    console.log('[IPAD_SUPPORT] Touch device detected — enabling virtual D-Pad.');

    // ---------- 2. Virtual D-Pad: tap → fake keyboard event ----------
    const vdpad = document.getElementById('vdpad');
    if (!vdpad) {
        console.warn('[IPAD_SUPPORT] #vdpad element not found in DOM.');
        return;
    }

    // Map UI key → KeyboardEvent.keyCode (legacy) và .key/.code (modern)
    // Phaser 3.60 listen 'keydown-SPACE', 'keydown-UP', etc. → cần event.code chuẩn
    const KEY_MAP = {
        LEFT:  { key: 'ArrowLeft',  code: 'ArrowLeft',  keyCode: 37 },
        UP:    { key: 'ArrowUp',    code: 'ArrowUp',    keyCode: 38 },
        RIGHT: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        DOWN:  { key: 'ArrowDown',  code: 'ArrowDown',  keyCode: 40 },
        SPACE: { key: ' ',          code: 'Space',      keyCode: 32 }
    };

    function dispatchFakeKey(eventType, keyName) {
        const info = KEY_MAP[keyName];
        if (!info) return;

        // Tạo KeyboardEvent với đầy đủ properties Phaser cần
        const evt = new KeyboardEvent(eventType, {
            key: info.key,
            code: info.code,
            keyCode: info.keyCode,
            which: info.keyCode,
            bubbles: true,
            cancelable: true
        });

        // BUG-FIX: keyCode/which read-only trong constructor mới → ép Override qua defineProperty
        Object.defineProperty(evt, 'keyCode', { get: () => info.keyCode });
        Object.defineProperty(evt, 'which',   { get: () => info.keyCode });

        // Dispatch lên document để Phaser keyboard plugin nhận
        document.dispatchEvent(evt);
    }

    // Attach pointer event cho từng nút D-Pad
    // Dùng pointerdown/pointerup thay vì click → response nhanh hơn ~100ms (no 300ms tap delay)
    // BUG-FIX (2026-05-17 v1.1.2): Bỏ pointerleave — gây false keyup khi user vuốt ngón sang canvas Phaser.
    // BUG-FIX (2026-05-17 v1.1.2): stopPropagation để event không bubble lên document touchend listener.
    vdpad.querySelectorAll('.vdpad-btn[data-key]').forEach(btn => {
        const keyName = btn.dataset.key;

        const onDown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.add('pressed');
            dispatchFakeKey('keydown', keyName);
        };
        const onUp = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.remove('pressed');
            dispatchFakeKey('keyup', keyName);
        };

        btn.addEventListener('pointerdown', onDown);
        btn.addEventListener('pointerup',   onUp);
        btn.addEventListener('pointercancel', onUp);
        // REMOVED v1.1.2: pointerleave — fire keyup khi vuốt ngón ra ngoài → bổ sai Phaser keyboard state.
        // pointercancel đã đủ để handle case user vuốt ra ngoài trên iOS.
    });

    // ---------- 3. Hook vào Scene1 — show/hide D-Pad theo gamePhase ----------
    // Logic: Phase 2 = Audition Mode → show D-Pad. Khi rời Scene1 hoặc Phase != 2 → hide.
    //
    // Approach: monkey-patch Scene1.prototype.startAuditionMode để show D-Pad,
    //           monkey-patch Scene1.prototype.startToolMode + crashTrigger + scene change → hide.
    //
    // Tại sao monkey-patch thay vì sửa game.js gốc? Để giữ code support iPad TÁCH BIỆT,
    // dễ remove/disable nếu cần (chỉ cần xóa block này, game.js vẫn chạy bình thường).

    function showVDPad() {
        vdpad.classList.add('active');
        console.log('[IPAD_SUPPORT] D-Pad shown (Audition Mode).');
    }

    function hideVDPad() {
        vdpad.classList.remove('active');
    }

    // Wait for Phaser scenes to be registered (game đã new Phaser.Game(AH3_gameConfig) ở trên)
    // Scene1 reference qua game.scene.keys (Phaser scene manager)
    function patchScene1() {
        if (typeof AH3_Scene1 === 'undefined') {
            // Scene1 chưa load — retry sau 100ms
            setTimeout(patchScene1, 100);
            return;
        }

        // Patch startAuditionMode → show D-Pad
        const originalStartAudition = AH3_Scene1.prototype.startAuditionMode;
        AH3_Scene1.prototype.startAuditionMode = function () {
            const result = originalStartAudition.apply(this, arguments);
            showVDPad();
            return result;
        };

        // Patch startToolMode → hide D-Pad (chuyển sang Phase 1, không cần phím)
        const originalStartTool = AH3_Scene1.prototype.startToolMode;
        AH3_Scene1.prototype.startToolMode = function () {
            hideVDPad();
            return originalStartTool.apply(this, arguments);
        };

        // Patch triggerCrashEvent → hide D-Pad (Phase 1 → Crash event → Clone Stamp scene)
        if (AH3_Scene1.prototype.triggerCrashEvent) {
            const originalCrash = AH3_Scene1.prototype.triggerCrashEvent;
            AH3_Scene1.prototype.triggerCrashEvent = function () {
                hideVDPad();
                return originalCrash.apply(this, arguments);
            };
        }

        console.log('[IPAD_SUPPORT] Scene1 patched — D-Pad will toggle on Audition Mode.');
    }

    // Listen for scene transitions — đảm bảo D-Pad hide khi rời Scene1
    // (Phòng trường hợp player chuyển scene giữa Audition mà không qua method được patch)
    if (typeof AH3_gameInstance !== 'undefined' && AH3_gameInstance.events) {
        AH3_gameInstance.events.on('ready', () => {
            AH3_gameInstance.scene.scenes.forEach(scene => {
                scene.events.on('shutdown', () => hideVDPad());
                scene.events.on('sleep',    () => hideVDPad());
            });
        });
    }

    // Kick off patching
    patchScene1();

    // ---------- 4. Disable iOS double-tap zoom ----------
    // BUG-FIX (2026-05-17 v1.1.2): Bỏ document.addEventListener('touchend', preventDefault, ...).
    // Cách cũ block toàn document → chặn cascade mousedown/click sang Phaser canvas
    // (theo Apple docs: preventDefault on touchend prevents subsequent mouse events on iOS).
    // → Nút trong game Phaser không response sau khi tap D-Pad.
    //
    // Cách mới: CSS 'touch-action: manipulation' trên body — native browser disable
    // double-tap zoom + 300ms click delay mà KHÔNG block cascade event.
    // Phaser pointerdown/pointerup trên canvas vẫn fire bình thường.
    if (document.body && !document.body.style.touchAction) {
        document.body.style.touchAction = 'manipulation';
    }

})();


// ============================================================
// AH3 BUILD INFO + COPYRIGHT WARNING (2026-05-17)
// ============================================================
// Mục đích:
//   1. Lưu Build ID unique để Google-search phát hiện ai copy code
//   2. Hiển thị banner copyright trong DevTools Console
//   3. Cảnh báo pháp lý — pháp lý hóa việc copy code
//
// Chạy ngay khi script load, KHÔNG ảnh hưởng game logic.
// Hub WebView2 + Web browser đều log identical banner.
// ============================================================

const AH3_BUILD_INFO = Object.freeze({
    id      : 'AH3-ARCHI-HELL-7f3c92e8a4d1',
    name    : 'The Archi-Hell',
    version : 'v1.1.3',
    date    : '2026-05-17',
    author  : 'Hoàng - ArchiH3 Studio',
    website : 'https://archih3.com',
    contact : 'hohuuhoang@archih3.com',
    license : 'PROPRIETARY — All rights reserved'
});

(function () {
    'use strict';

    // Styled console banner — visible khi user mở F12 DevTools
    const titleStyle = 'color:#4db6ac; font-size:16px; font-weight:bold; ' +
                       'text-shadow:1px 1px 2px #000; padding:4px 0;';
    const labelStyle = 'color:#a0a0a0; font-size:11px; font-family:monospace;';
    const valueStyle = 'color:#e0e0e0; font-size:11px; font-family:monospace;';
    const warnStyle  = 'color:#ff6b6b; font-size:12px; font-weight:bold; ' +
                       'background:#2a0000; padding:6px 10px; border:1px solid #ff6b6b;';

    console.log('%c═══ THE ARCHI-HELL © 2026 ArchiH3 Studio ═══', titleStyle);
    console.log('%cBuild ID    : %c' + AH3_BUILD_INFO.id, labelStyle, valueStyle);
    console.log('%cVersion     : %c' + AH3_BUILD_INFO.version + ' (' + AH3_BUILD_INFO.date + ')', labelStyle, valueStyle);
    console.log('%cAuthor      : %c' + AH3_BUILD_INFO.author, labelStyle, valueStyle);
    console.log('%cWebsite     : %c' + AH3_BUILD_INFO.website, labelStyle, valueStyle);
    console.log('%cContact     : %c' + AH3_BUILD_INFO.contact, labelStyle, valueStyle);
    console.log('%cLicense     : %c' + AH3_BUILD_INFO.license, labelStyle, valueStyle);
    console.log(
        '%c⚠️  COPYRIGHT NOTICE\n\n' +
        'This source code is PROPRIETARY intellectual property of ArchiH3 Studio.\n' +
        'Unauthorized copying, modification, distribution, or commercial use\n' +
        'is STRICTLY PROHIBITED. For licensing: hohuuhoang@archih3.com',
        warnStyle
    );
})();



// ============================================================
// IPAD / IOS AUDIO UNLOCK (2026-05-17, v1.1.3)
// ============================================================
// Vấn đề: iOS Safari Autoplay Policy chặn AudioContext khi page load.
// Phaser auto-unlock không phải lúc nào cũng work, đặc biệt iOS 17.5.1.
//
// Triệu chứng:
//   - Trên iPad/iPhone Safari: game không có tiếng (cả sfx + nhạc nền)
//   - Trên iOS 17.5.1: mất tiếng sau khi switch tab (Phaser issue #6829)
//
// Cách fix:
//   1. Force AudioContext.resume() khi user tap/click đầu tiên
//   2. Re-unlock khi tab visible lại (fix iOS 17.5.1 bug)
//
// KHÔNG sửa logic game, chỉ wrap AudioContext lifecycle.
// Hub WebView2 (desktop Windows): AudioContext không bị suspend → block này
// chạy nhưng không ảnh hưởng gì (idempotent).
//
// Reference:
//   - Phaser issue #5696: iOS Safari mất tiếng sau v3.53
//   - Phaser issue #6829: iOS 17.5.1 mất tiếng sau switch tab
//   - Apple Autoplay Policy docs
// ============================================================

(function () {
    'use strict';

    // Helper: Resume AudioContext nếu đang suspended
    function unlockGameAudio(reason) {
        // 1. Phaser native unlock — gọi defensive (Phaser tự gọi nhưng đôi khi miss)
        if (typeof AH3_gameInstance !== 'undefined' && AH3_gameInstance.sound &&
            typeof AH3_gameInstance.sound.unlock === 'function') {
            try {
                AH3_gameInstance.sound.unlock();
            } catch (e) {
                // Silent — không phải critical
            }
        }

        // 2. Manual AudioContext resume — fix iOS Safari case Phaser miss
        if (typeof AH3_gameInstance !== 'undefined' && AH3_gameInstance.sound &&
            AH3_gameInstance.sound.context &&
            AH3_gameInstance.sound.context.state === 'suspended') {
            AH3_gameInstance.sound.context.resume().then(() => {
                console.log('[IPAD_AUDIO] AudioContext resumed (' + reason + ').');
            }).catch(err => {
                console.warn('[IPAD_AUDIO] Failed to resume AudioContext:', err);
            });
        }
    }

    // ---------- 1. First-gesture unlock ----------
    // Listen MỘT LẦN cho user gesture đầu tiên → unlock audio.
    // Sau khi unlock, remove listener để không waste CPU.
    function onFirstGesture() {
        unlockGameAudio('first user gesture');
        // Cleanup — chỉ cần unlock 1 lần
        document.removeEventListener('touchstart', onFirstGesture);
        document.removeEventListener('touchend',   onFirstGesture);
        document.removeEventListener('click',      onFirstGesture);
        document.removeEventListener('pointerdown', onFirstGesture);
    }

    // Wait for game instance to be ready (Phaser khởi tạo async)
    function waitAndAttach() {
        if (typeof AH3_gameInstance === 'undefined') {
            setTimeout(waitAndAttach, 100);
            return;
        }

        // Attach listeners cho nhiều loại event để bắt user gesture sớm nhất
        // { once: true } đảm bảo listener auto-remove sau lần đầu
        // { passive: true } cho performance (không block scroll)
        document.addEventListener('touchstart', onFirstGesture, { passive: true });
        document.addEventListener('touchend',   onFirstGesture, { passive: true });
        document.addEventListener('click',      onFirstGesture, { passive: true });
        document.addEventListener('pointerdown', onFirstGesture, { passive: true });

        console.log('[IPAD_AUDIO] Listening for first user gesture to unlock audio.');
    }
    waitAndAttach();

    // ---------- 2. Re-unlock on tab visibility change ----------
    // iOS 17.5.1 bug: switch tab → audio die vĩnh viễn (Phaser issue #6829)
    // Fix: khi tab visible lại, force resume AudioContext lần nữa.
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            // Tab vừa quay lại visible
            unlockGameAudio('tab visibility restored');
        }
    });

    // ---------- 3. Re-unlock on focus (Safari iOS đặc thù) ----------
    // Backup cho visibilitychange — đôi khi iOS Safari fire focus thay vì visibility.
    window.addEventListener('focus', function () {
        unlockGameAudio('window focus');
    });

})();


// ============================================================
// COPYRIGHT PROTECTION: BLOCK RIGHT-CLICK + DRAG (2026-05-18, v1.1.5d)
// ============================================================
// Mục đích: ngăn casual user copy assets/source qua menu chuột phải hoặc kéo image.
//
// Block scope:
//   1. contextmenu — chặn menu chuột phải toàn document (không hiện Save Image As, View Source...)
//   2. dragstart — chặn kéo image/text ra desktop hoặc tab khác
//
// KHÔNG block:
//   - F12, Ctrl+Shift+I, Ctrl+U — giữ devtools shortcut hoạt động (vì Hub WebView2 có thể
//     dùng để debug, và block những phím này gây false alarm trên Hub).
//   - Anti-copy protection mạnh hơn là layer phụ — assets đã Base64 trong assets.js,
//     copyright header + AH3_ branding + build ID đã có defense in depth.
//
// 2 môi trường:
//   - Hub WebView2 (desktop Windows trong AH3 Hub): KTS đã trả license, block để UX game clean
//     (không thấy menu trình duyệt mặc định Reload/Print giữa lúc chơi).
//   - Web archih3.com: public, layer protection chống casual scrape.
//
// Bypass note: người biết devtools (F12) vẫn xem được hết — anti-right-click chỉ chặn
// casual user, không phải solution chính. Đây là 1 layer trong defense in depth.
// ============================================================

(function () {
    'use strict';

    // 1. Block right-click menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    }, { capture: true });

    // 2. Block drag image/text ra ngoài
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    }, { capture: true });

    // 3. Block image selection bằng CSS (defense in depth)
    // Phòng trường hợp browser/extension cho phép right-click qua được — vẫn không select được image
    if (document.body && !document.body.style.userSelect) {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        // Webkit-specific: chặn drag callout trên iOS Safari long-press image
        document.body.style.webkitTouchCallout = 'none';
    }

    console.log('[COPYRIGHT_PROTECTION] Right-click + drag disabled. © ArchiH3 Studio.');

})();
