'use strict';
/* Thành phần giao diện dùng chung: biểu tượng, biểu đồ, bố cục PublicLayout / AppLayout, khóa Premium. */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sCls = v => v >= 75 ? 's-hi' : v >= 60 ? 's-mid' : 's-lo';
const bCls = v => v >= 75 ? 'hi' : v >= 60 ? 'mid' : 'lo';
const slug = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'bai-noi';
function toast(msg, kind=''){ const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', kind === 'err' ? 'alert' : 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }

/* Biểu tượng Lucide (lucide-static 1.74.0, giấy phép ISC, xem css/LUCIDE-LICENSE.txt). fb/yt/tt là biểu tượng thương hiệu tự vẽ. */
const ICON = {
  home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  mic:'<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  micoff:'<path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>',
  chart:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  doc:'<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  card:'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 14h2"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lib:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  book:'<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  wave:'<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  upload:'<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  down:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  dollar:'<path d="M12 3v18"/><path d="M17 5H9.5a1 1 0 000 7h5a1 1 0 010 7H6"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5"/><path d="M12 17h.01"/>',
  play:'<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
  trash:'<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  menu:'<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  mail:'<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  phone:'<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  sliders:'<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  sparkles:'<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  brain:'<path d="M12 13h4"/><path d="M12 18h6a2 2 0 012 2v1"/><path d="M12 8h8"/><path d="M12 9a4.17 4.17 0 01-3 4"/><path d="M16 8V5a2 2 0 012-2"/><path d="M6 18a4 4 0 01-2-7.465"/><path d="M6.004 5.125a4 4 0 00-2.526 5.77"/><path d="M6.294 6.294A3 3 0 1112 5v13a4 4 0 11-7.967-.518"/><circle cx="16" cy="13" r="0.5" fill="currentColor"/><circle cx="18" cy="3" r="0.5" fill="currentColor"/><circle cx="20" cy="21" r="0.5" fill="currentColor"/><circle cx="20" cy="8" r="0.5" fill="currentColor"/>',
  face:'<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  gauge:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  quote:'<path d="M14 14a2 2 0 0 0 2-2V8h-2"/><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M8 14a2 2 0 0 0 2-2V8H8"/>',
  listcheck:'<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  keyboard:'<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  pause:'<rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>',
  stop:'<rect width="18" height="18" x="3" y="3" rx="2"/>',
  ok:'<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z"/>',
  yt:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  tt:'<path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5"/>',
};
const ic = (n, s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;
const proChip = () => '<span class="chip pro">PREMIUM</span>';
const alertBox = (kind, msg) => msg ? `<div class="alert ${kind}" role="${kind === 'err' ? 'alert' : 'status'}">${ic(kind === 'err' ? 'alert' : kind === 'ok' ? 'check' : 'info', 18)}<div>${msg}</div></div>` : '';
const goalIcon = {presentation:'users', reporting:'chart', interview:'user', pitching:'dollar', debating:'mic'};

/* ---------- Biểu đồ ---------- */
function lineChart(data, {h=200, min=40, max=100, ticks=[40,60,80,100], series2=null}={}){
  const W=640, H=h, pl=34, pr=18, pt=16, pb=28, n=data.length;
  const x = i => pl + (n === 1 ? (W-pl-pr)/2 : i*(W-pl-pr)/(n-1)), y = v => pt + (max-v)*(H-pt-pb)/(max-min);
  const pts = data.map((d,i) => [x(i), y(d.v)]), path = pts.map((p,i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Biểu đồ điểm qua các lần luyện','Score chart across sessions')}">`;
  ticks.forEach(t => { s += `<line class="grid-l" x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl-8}" y="${y(t)+4}" text-anchor="end">${t}</text>`; });
  s += `<path class="ar" d="${path} L${pts[n-1][0]} ${y(min)} L${pts[0][0]} ${y(min)} Z"/>`;
  if(series2){ const p2 = series2.map((v,i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v ?? min).toFixed(1)).join(' '); s += `<path d="${p2}" fill="none" stroke="var(--orange)" stroke-width="2" stroke-dasharray="4 4"/>`; }
  s += `<path d="${path}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach((p,i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === n-1 ? 6 : 4}" fill="${i === n-1 ? 'var(--blue)' : '#fff'}" stroke="var(--blue)" stroke-width="2"/><text x="${p[0]}" y="${H-8}" text-anchor="middle">${esc(data[i].label)}</text>`; });
  return s + `<text class="lbl-v" x="${pts[n-1][0]}" y="${pts[n-1][1]-12}" text-anchor="middle">${data[n-1].v}</text></svg>`;
}
function paceChart(vals){
  const W=640, H=200, pl=34, pr=10, pt=14, pb=28, max=200, y = v => pt + (max-v)*(H-pt-pb)/max, bw = (W-pl-pr)/Math.max(vals.length, 3);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Tốc độ nói theo từng phút','Speaking pace per minute')}"><rect class="band-ok" x="${pl}" y="${y(150)}" width="${W-pl-pr}" height="${y(120)-y(150)}"/>`;
  [0,50,100,150,200].forEach(t => { s += `<line class="grid-l" x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl-8}" y="${y(t)+4}" text-anchor="end">${t}</text>`; });
  const every = Math.ceil(vals.length/10);
  vals.forEach((v,i) => { const x = pl + i*bw + bw*.22, w = bw*.56; s += `<rect class="bar ${v > 150 ? 'over' : ''}" x="${x}" y="${y(v)}" width="${w}" height="${y(0)-y(v)}" rx="4"/>`; if(vals.length <= 10) s += `<text class="lbl-v" x="${x+w/2}" y="${y(v)-6}" text-anchor="middle">${v}</text>`; if(i % every === 0) s += `<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${L('Phút','Min')} ${i+1}</text>`; });
  return s + '</svg>';
}
function ring(v, size=150, count=false){
  const sw = Math.max(5, Math.round(size/12)), r = size/2 - sw/2 - 1, c = 2*Math.PI*r, small = size < 100, gid = 'rg' + size;
  /* Vòng điểm dùng gradient cyan → xanh; count=true: số điểm đếm lên và vòng chạy khi mở báo cáo. */
  return `<div class="ring ${count ? 'count-up' : ''}" style="width:${size}px;height:${size}px;--c:${c};--v:${v}"><svg width="${size}" height="${size}" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A66"/><stop offset="1" stop-color="#4E93B6"/></linearGradient></defs><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--soft-2)" stroke-width="${sw}"/><circle class="arc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#${gid})" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c*v/100} ${c}"/></svg><div class="rv" aria-label="${v}/100"><div><b class="num" style="font-size:${Math.round(size*(small ? .3 : .28))}px">${count ? `<i class="cnt" style="--n:${v}"></i>` : v}</b>${small ? '' : '<br><span>/ 100</span>'}</div></div></div>`;
}
const barRow = (k, v) => `<div class="bar-row"><span>${k}</span><div class="track"><b class="${bCls(v)}" style="width:${v}%"></b></div><b class="num">${v}</b></div>`;

/* ---------- Bố cục ---------- */
const logo = to => `<button class="logo" data-go="${to}" aria-label="${CONFIG.brand}"><span class="logo-mark"><span><i style="height:6px"></i><i style="height:14px"></i><i style="height:9px"></i><i style="height:12px"></i></span></span><span class="lname">${CONFIG.brand}</span></button>`;
const langSwitch = () => `<div class="lang-sw" role="group" aria-label="${L('Ngôn ngữ giao diện','Interface language')}"><button class="${I18N.ui==='vi'?'on':''}" data-act="ui-lang" data-v="vi" aria-pressed="${I18N.ui==='vi'}">VI</button><button class="${I18N.ui==='en'?'on':''}" data-act="ui-lang" data-v="en" aria-pressed="${I18N.ui==='en'}">EN</button></div>`;

function PublicLayout(inner, {footer=true, minimal=false}={}){
  const r = S.route;
  /* Trang chủ: đầu trang tối giản theo phác thảo (menu bên trái, VI | EN bên phải), tên thương hiệu nằm trong hero. */
  if(minimal) return `<header class="p-nav min ${S.menu ? 'open' : ''}"><div class="wrap">
      <button class="icon-btn" data-act="menu" aria-label="${L('Mở menu','Open menu')}" aria-expanded="${S.menu}">${ic(S.menu ? 'x' : 'menu',24)}</button>
      <div class="right">${langSwitch()}</div>
      ${S.menu ? `<nav class="menu menu-left" aria-label="${L('Điều hướng','Navigation')}"><button data-act="scroll" data-to="khoa-hoc-gt">${ic('book',18)} ${L('Khóa học','Courses')}</button><button data-go="bang-gia">${ic('card',18)} ${L('Bảng giá','Pricing')}</button><button data-go="bao-cao-mau">${ic('chart',18)} ${L('Báo cáo mẫu','Sample report')}</button><hr><button data-go="dang-nhap">${ic('user',18)} ${L('Đăng nhập','Log in')}</button><button data-go="dang-ky">${ic('sparkles',18)} ${L('Đăng ký','Sign up')}</button></nav>` : ''}
    </div></header><main class="p-main">${inner}</main>${footer ? Footer() : ''}`;
  const links = [['', 'khoa-hoc-gt', L('Khóa học','Courses')], ['bang-gia', null, L('Bảng giá','Pricing')], ['bao-cao-mau', null, L('Báo cáo mẫu','Sample report')]];
  return `<header class="p-nav"><div class="wrap">${logo('')}
      <nav class="p-links" aria-label="${L('Điều hướng','Navigation')}">${links.map(([to, anchor, l]) => anchor ? `<button data-act="scroll" data-to="${anchor}">${l}</button>` : `<button class="${r===to?'on':''}" data-go="${to}">${l}</button>`).join('')}</nav>
      <div class="right">
        <span class="hide-sm">${langSwitch()}</span>
        <button class="btn btn-text hide-sm" data-go="dang-nhap">${L('Đăng nhập','Log in')}</button>
        <button class="btn btn-primary btn-sm" data-go="bat-dau">${L('Bắt đầu ngay','Get started')}</button>
        <button class="icon-btn menu-btn" data-act="menu" aria-label="${L('Mở menu','Open menu')}" aria-expanded="${S.menu}">${ic('menu',22)}</button>
      </div>
      ${S.menu ? `<div class="menu"><button data-go="bang-gia">${L('Bảng giá','Pricing')}</button><button data-go="bao-cao-mau">${L('Báo cáo mẫu','Sample report')}</button><button data-go="dang-nhap">${L('Đăng nhập','Log in')}</button><button data-go="dang-ky">${L('Đăng ký','Sign up')}</button><div style="padding:8px 14px">${langSwitch()}</div></div>` : ''}
    </div></header><main class="p-main">${inner}</main>${footer ? Footer() : ''}`;
}
function Footer(){
  const c = CONFIG.contact;
  return `<footer class="footer" id="lien-he"><div class="wrap">
    <div class="f-grid">
      <div>${logo('')}<p style="margin-top:14px;max-width:34ch">${L('Huấn luyện viên thuyết trình AI cho học sinh, sinh viên và người đi làm. Luyện nói, nhận phản hồi chi tiết và tiến bộ sau mỗi lần luyện.','An AI presentation coach for students and professionals. Practise, get detailed feedback, and improve every session.')}</p></div>
      <div><h4>${L('Sản phẩm','Product')}</h4><div class="f-links"><button data-act="scroll" data-to="khoa-hoc-gt">${L('Khóa học','Courses')}</button><button data-go="bang-gia">${L('Bảng giá','Pricing')}</button><button data-go="bao-cao-mau">${L('Báo cáo mẫu','Sample report')}</button><button data-go="bat-dau">${L('Bắt đầu miễn phí','Start for free')}</button></div></div>
      <div><h4>${L('Tài khoản','Account')}</h4><div class="f-links"><button data-go="dang-nhap">${L('Đăng nhập','Log in')}</button><button data-go="dang-ky">${L('Đăng ký','Sign up')}</button><button data-go="quen-mat-khau">${L('Quên mật khẩu','Forgot password')}</button></div></div>
      <div><h4>${L('Liên hệ','Contact')}</h4>
        <div class="contact-row">${ic('mail',16)}<span><span id="c-email">${c.email}</span><button class="copy" data-act="copy" data-v="${c.email}">${L('Sao chép','Copy')}</button></span></div>
        <div class="contact-row">${ic('phone',16)}<span>${L('Hotline','Hotline')}: <span id="c-phone">${c.hotline}</span><button class="copy" data-act="copy" data-v="${c.hotline}">${L('Sao chép','Copy')}</button></span></div>
        <div class="contact-row">${ic('pin',16)}<span>${tx(c.address)}</span></div>
        <div class="contact-row">${ic('clock',16)}<span>${tx(c.hours)}</span></div>
        <div class="socials"><a href="${c.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ic('fb',18)}</a><a href="${c.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ic('yt',18)}</a><a href="${c.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ic('tt',18)}</a></div>
      </div>
    </div>
    <div class="f-bottom"><span>© 2026 ${CONFIG.brand} · ${L('Bản thử nghiệm','Beta')}</span><span>${L('Ảnh','Photos')}: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>, <a href="https://openverse.org" target="_blank" rel="noopener">Openverse</a> (CC0)</span></div>
  </div></footer>`;
}
/* Bố cục tối giản cho các bước thiết lập sau đăng ký. */
function OnboardLayout(inner){
  return `<header class="p-nav"><div class="wrap">${logo('tong-quan')}<div class="right"><span class="muted hide-sm" style="font-size:14px">${esc(S.data.profile.email)}</span><button class="btn btn-ghost btn-sm" data-act="logout">${L('Đăng xuất','Log out')}</button></div></div></header><div class="wrap flow-body"><div class="flow-card">${inner}</div></div>`;
}
const NAV = () => [['tong-quan', L('Tổng quan','Dashboard'), 'home'], ['luyen-tap', L('Luyện tập','Practice'), 'mic'], ['khoa-hoc', L('Khóa học','Courses'), 'book'], ['thu-vien', L('Thư viện','Library'), 'lib'], ['tien-bo', L('Tiến bộ','Progress'), 'chart'], ['goi-dich-vu', L('Gói dịch vụ','Plans'), 'card'], ['tai-khoan', L('Tài khoản','Account'), 'user']];
function AppLayout(inner){
  const p = plan(), active = (ROUTES[S.route] || {}).nav, pending = S.data.library.filter(l => /^pending|error/.test(l.status)).length;
  const acts = NAV().filter(([k]) => k === 'goi-dich-vu' || k === 'tai-khoan').map(([k,l,i]) => `<button class="icon-btn ${active===k?'on':''}" data-go="${k}" aria-label="${l}" title="${l}">${ic(i,21)}</button>`).join('');
  return `<div class="shell"><aside class="side">${logo('tong-quan')}<div class="side-acts">${acts}</div><nav aria-label="${L('Điều hướng ứng dụng','App navigation')}">${NAV().map(([k,l,i]) => `<button class="${active===k?'on':''} ${k === 'goi-dich-vu' || k === 'tai-khoan' ? 'sec' : ''}" data-go="${k}" ${active===k?'aria-current="page"':''}>${ic(i,20)}<span>${l}</span>${k === 'thu-vien' && pending ? `<span class="badge-n" aria-label="${pending} ${L('bài chờ xử lý','pending')}">${pending}</span>` : ''}</button>`).join('')}</nav>
    <div class="plan-box"><b>${L('Gói','Plan')} ${planName()}</b><span class="muted">${L(`Còn ${left()} / ${p.limit} lượt tháng này`, `${left()} of ${p.limit} analyses left this month`)}</span><div class="meter"><b style="width:${Math.min(100, S.data.used/p.limit*100)}%"></b></div>${isPro() ? '' : `<button class="btn btn-primary btn-sm" style="margin-top:12px" data-act="buy">${L('Nâng cấp Premium','Upgrade to Premium')}</button>`}</div>
  </aside><main class="main"><div class="main-inner">${inner}</div></main></div>`;
}
function gate(html, title, desc){
  if(S.data && isPro()) return html;
  const btn = S.data ? `<button class="btn btn-primary btn-sm" data-act="buy">${L('Nâng cấp Premium','Upgrade to Premium')}</button>` : `<button class="btn btn-primary btn-sm" data-go="bang-gia">${L('Xem bảng giá','See pricing')}</button>`;
  return `<div class="lock-card">${html}<div class="lock-over">${proChip()}<b>${title}</b><p class="muted" style="font-size:13px;max-width:42ch">${desc}</p>${btn}</div></div>`;
}
const progressSteps = (labels, cur) => `<div class="progress-steps" aria-label="${L('Tiến trình','Progress')}">${labels.map((l,i) => `${i ? '<i></i>' : ''}<span class="${i===cur?'on':''} ${i<cur?'done':''}"><b>${i<cur ? ic('check',12) : i+1}</b>${l}</span>`).join('')}</div>`;
