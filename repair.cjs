const fs = require('fs');
let lines = fs.readFileSync('src/pages/hub.astro', 'utf8').split('\n');

lines[513] = '                    <p data-vi="ℹ️ <strong class=\'mt-4 text-muted\' style=\'padding:12px 14px; background:rgba(77,182,172,0.08); border-left:2px solid var(--primary); border-radius:4px; font-size:12px; line-height:1.6;\'>Đang nâng cấp hệ thống:</strong> Bản Free hiện tạm dừng đăng ký để chuẩn bị cho siêu nâng cấp v2.0 vào tháng 9 với động cơ AI thế hệ mới đột phá và tốc độ xử lý vượt trội. Hãy cùng chờ đợi!" data-en="ℹ️ <strong>System Upgrading:</strong> Free registration is paused to prepare for the massive v2.0 upgrade this September. Featuring a next-gen breakthrough AI engine and ultra-fast speed. Stay tuned!"></p>';

lines[533] = '                    <p data-vi="ℹ️ <strong class=\'mt-4 text-muted\' style=\'padding:12px 14px; background:rgba(77,182,172,0.08); border-left:2px solid var(--primary); border-radius:4px; font-size:12px; line-height:1.6;\'>Phí Pro</strong> chi trả AI-Assist và cloud features. Tính năng AI cục bộ giữ giới hạn phi thương mại — Free và Pro đều như nhau.<br>↩ Hoàn tiền 100% trong 7 ngày nếu chưa sử dụng tính năng Pro." data-en="ℹ️ <strong>Pro fee</strong> covers AI-Assist and cloud features. Local AI keeps non-commercial limits — same for Free and Pro.<br>↩ 100% refund within 7 days if no Pro feature used."></p>';

lines[592] = '                    <p class="text-center mt-8 text-muted" style="font-size:14px;" data-vi="Còn thắc mắc khác? Email <a href=\'mailto:hohuuhoang@archih3.com\' style=\'color:var(--primary); text-decoration:none;\'>hohuuhoang@archih3.com</a>" data-en="Other questions? Email <a href=\'mailto:hohuuhoang@archih3.com\' style=\'color:var(--primary); text-decoration:none;\'>hohuuhoang@archih3.com</a>"></p>';

fs.writeFileSync('src/pages/hub.astro', lines.join('\n'));
console.log('Fixed hub.astro');
