'use strict';
/* Thành phần giao diện dùng chung: biểu tượng, biểu đồ, bố cục PublicLayout / AppLayout, khóa Premium. */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sCls = v => v >= 75 ? 's-hi' : v >= 60 ? 's-mid' : 's-lo';
const bCls = v => v >= 75 ? 'hi' : v >= 60 ? 'mid' : 'lo';
const slug = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'bai-noi';
function toast(msg, kind=''){ const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', kind === 'err' ? 'alert' : 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }

const ICON = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  micoff:'<path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8M12 18v3"/>',
  chart:'<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
  doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lib:'<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.6-1 2.4 15.6-3.6 1z"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h5"/>',
  check:'<path d="M5 12.5 10 17 19 7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  wave:'<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  down:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  dollar:'<path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.8 0-4.5 1.4-4.5 3.2 0 4.3 9.5 2.3 9.5 6.6 0 1.9-1.9 3.2-4.9 3.2-2.3 0-4.1-.9-5-2.3"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.9M12 17.2v.1"/>',
  play:'<path d="M7 5v14l11-7z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.1"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19v.1"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z"/>',
  yt:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  tt:'<path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5"/>',
};
const ic = (n, s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;
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
function ring(v, size=150){
  const sw = Math.max(5, Math.round(size/12)), r = size/2 - sw/2 - 1, c = 2*Math.PI*r, small = size < 100;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--soft-2)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--blue)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c*v/100} ${c}"/></svg><div class="rv" aria-label="${v}/100"><div><b class="num" style="font-size:${Math.round(size*(small ? .3 : .28))}px">${v}</b>${small ? '' : '<br><span>/ 100</span>'}</div></div></div>`;
}
const barRow = (k, v) => `<div class="bar-row"><span>${k}</span><div class="track"><b class="${bCls(v)}" style="width:${v}%"></b></div><b class="num">${v}</b></div>`;

/* ---------- Bố cục ---------- */
const logo = to => `<button class="logo" data-go="${to}" aria-label="${CONFIG.brand}"><span class="logo-mark"><span><i style="height:6px"></i><i style="height:14px"></i><i style="height:9px"></i><i style="height:12px"></i></span></span><span class="lname">${CONFIG.brand}</span></button>`;
const langSwitch = () => `<div class="lang-sw" role="group" aria-label="${L('Ngôn ngữ giao diện','Interface language')}"><button class="${I18N.ui==='vi'?'on':''}" data-act="ui-lang" data-v="vi" aria-pressed="${I18N.ui==='vi'}">VI</button><button class="${I18N.ui==='en'?'on':''}" data-act="ui-lang" data-v="en" aria-pressed="${I18N.ui==='en'}">EN</button></div>`;

function PublicLayout(inner, {footer=true}={}){
  const r = S.route;
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
