'use strict';
/* Đa ngôn ngữ giao diện (vi / en).
   L('chuỗi tiếng Việt', 'English string') chọn theo ngôn ngữ giao diện hiện tại.
   tx({vi, en}) dùng cho dữ liệu nội dung. Ngôn ngữ BÀI NÓI là cài đặt riêng (draft.lang). */
const I18N = {
  ui: 'vi',
  load(){ try { const v = localStorage.getItem('ltt.ui'); if(v === 'vi' || v === 'en') this.ui = v; } catch(e){} this.apply(); },
  set(v){ this.ui = v === 'en' ? 'en' : 'vi'; try { localStorage.setItem('ltt.ui', this.ui); } catch(e){} this.apply(); },
  apply(){ document.documentElement.lang = this.ui; },
};
const L = (vi, en) => I18N.ui === 'en' ? en : vi;
const tx = o => o == null ? '' : typeof o === 'string' ? o : (o[I18N.ui] ?? o.vi);
const LANG_NAME = {vi:{vi:'Tiếng Việt', en:'Vietnamese'}, en:{vi:'Tiếng Anh', en:'English'}};
const langName = k => tx(LANG_NAME[k]);
const locale = () => I18N.ui === 'en' ? 'en-US' : 'vi-VN';
const fmtNum = n => Number(n).toLocaleString(locale());
const fmtVND = n => Number(n).toLocaleString('vi-VN') + 'đ';
const fmtT = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const fmtD = d => { const x = new Date(d + 'T00:00:00'); return I18N.ui === 'en' ? `${x.getMonth()+1}/${x.getDate()}` : `${x.getDate()}/${x.getMonth()+1}`; };
const fmtDL = d => { const x = new Date(d + 'T00:00:00'); return I18N.ui === 'en' ? x.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : `${x.getDate()} tháng ${x.getMonth()+1}, ${x.getFullYear()}`; };
const fmtDur = s => { s = Math.round(s); if(s < 60) return L(`${s} giây`, `${s} sec`); const m = Math.floor(s/60), r = s%60; return L(`${m} phút${r ? ' ' + r + ' giây' : ''}`, `${m} min${r ? ' ' + r + ' sec' : ''}`); };
const levelName = v => v >= 80 ? L('Nâng cao','Advanced') : v >= 65 ? L('Khá','Good') : v >= 55 ? L('Trung bình','Fair') : L('Mới bắt đầu','Beginner');
