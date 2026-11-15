'use strict';
/* luyenthuyettrinh.com: ứng dụng một trang, điều hướng bằng #đường-dẫn.
   Luồng theo sơ đồ: 1. Công khai (khách) → 2. Đăng ký / đăng nhập → 3. Ứng dụng (đã có tài khoản). */

/* ================= Tiện ích ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a=40, b=95) => Math.round(Math.max(a, Math.min(b, v)));
const today = () => new Date().toISOString().slice(0,10);
const fmtT = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const fmtD = d => { const x = new Date(d+'T00:00:00'); return `${x.getDate()}/${x.getMonth()+1}`; };
const fmtDL = d => { const x = new Date(d+'T00:00:00'); return `${x.getDate()} tháng ${x.getMonth()+1}, ${x.getFullYear()}`; };
const fmtVND = n => n.toLocaleString('vi-VN') + 'đ';
const fmtMin = s => s < 60 ? `${s} giây` : `${Math.floor(s/60)} phút${s%60 ? ' ' + (s%60) + ' giây' : ''}`;
const sCls = v => v >= 75 ? 's-hi' : v >= 60 ? 's-mid' : 's-lo';
const bCls = v => v >= 75 ? 'hi' : v >= 60 ? 'mid' : 'lo';
const level = v => v >= 80 ? 'Nâng cao' : v >= 65 ? 'Khá' : v >= 55 ? 'Trung bình' : 'Mới bắt đầu';
const words = t => t.split(/\s+/).filter(Boolean).length;
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'bai-noi';
function toast(msg){ const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

const ICON = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  chart:'<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
  doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lib:'<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.6-1 2.4 15.6-3.6 1z"/>',
  check:'<path d="M5 12.5 10 17 19 7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  wave:'<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  dollar:'<path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.8 0-4.5 1.4-4.5 3.2 0 4.3 9.5 2.3 9.5 6.6 0 1.9-1.9 3.2-4.9 3.2-2.3 0-4.1-.9-5-2.3"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.9M12 17.2v.1"/>',
  play:'<path d="M7 5v14l11-7z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  down:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const ic = (n, s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const proChip = '<span class="chip pro">PREMIUM</span>';

/* ================= Trạng thái ================= */
const freshDraft = (mode='presentation', lang='vi') => ({mode, purpose:'Thuyết trình trên lớp', lang, title:'', content:'', input:'audio', file:null, placement:false});
const S = {
  user:null, plan:'free', expiry:null, cycle:'m', payMethod:'MoMo', autoRenew:true, invoices:[], used:0,
  sessions:[], library:[], currentId:null, compare:[], planDone:{},
  ob:{mode:'presentation', lang:'vi'},
  authErr:'', draft:freshDraft(), step:0, scriptText:'', scriptErr:'',
  rec:null, an:null, modal:null, menu:false, qa:{}, openLib:null, confirmDel:null, placementResult:null, lastRoute:null,
};
const plan = () => PLANS[S.plan];
const isPro = () => S.plan === 'premium';
const left = () => Math.max(0, plan().limit - S.used);
const current = () => S.sessions.find(s => s.id === S.currentId);

function signIn(kind, profile){
  const base = {plan:'free', expiry:null, cycle:'m', payMethod:'MoMo', autoRenew:true, invoices:[], qa:{}, placementResult:null, compare:[]};
  Object.assign(S, base);
  if(kind === 'demo'){
    S.user = {name:'Nguyễn Lan Anh', email:'lananh.demo@luyenthuyettrinh.com', org:'Đại học Kinh tế TP.HCM', goal:'pitching', lang:'vi', isNew:false, ...profile};
    S.sessions = demoSessions(); S.used = 2; S.planDone = {w1a:true, w1b:true, w2a:true};
    S.library = ['s6','s7','s8'].map(id => libItemFrom(S.sessions.find(s => s.id === id), true));
  } else {
    S.user = {org:'', goal:S.ob.mode, lang:S.ob.lang, isNew:true, ...profile};
    S.sessions = []; S.used = 0; S.planDone = {}; S.library = [];
  }
  S.draft = freshDraft(S.user.goal, S.user.lang);
}
function signOut(){
  if(S.rec) cleanupRec();
  clearInterval(anTimer);
  Object.assign(S, {user:null, plan:'free', sessions:[], library:[], used:0, an:null, modal:null, placementResult:null, qa:{}, ob:{mode:'presentation', lang:'vi'}});
}
function setPlan(p){
  if(p === S.plan) return;
  if(p === 'premium'){
    const d = new Date(); d.setMonth(d.getMonth()+1);
    Object.assign(S, {plan:'premium', cycle:'m', autoRenew:true, expiry:d.toISOString().slice(0,10)});
    if(!S.invoices.length) S.invoices.push(invoice(PRICE.m));
    toast('Đang xem bản Premium');
  } else { Object.assign(S, {plan:'free', expiry:null, autoRenew:true}); toast('Đã về gói Miễn phí'); }
}
const invoice = amount => ({id:'HD-' + today().slice(2,7).replace('-','') + '-' + String(S.invoices.length+1).padStart(4,'0'), date:today(), amount, method:S.payMethod});

/* ================= Điều hướng ================= */
/* a: guest = chỉ khách (đã đăng nhập thì chuyển về alt), setup = vừa đăng ký, app = cần đăng nhập. */
const ROUTES = {
  '':              {v:() => vLanding(), a:'guest'},
  'gioi-thieu':    {v:() => vIntro(), a:'guest'},
  'chon-che-do':   {v:() => vObMode(), a:'guest'},
  'chon-ngon-ngu': {v:() => vObLang(), a:'guest'},
  'xem-truoc':     {v:() => vObPreview(), a:'guest'},
  'dang-nhap':     {v:() => vAuth('login'), a:'guest'},
  'dang-ky':       {v:() => vAuth('signup'), a:'guest'},
  'bang-gia':      {v:() => vPricing(false), a:'guest', alt:'goi-dich-vu'},
  'bao-cao-mau':   {v:() => vReport(true), a:'guest'},
  'chon-muc-tieu': {v:() => vGoal(), a:'setup'},
  'ngon-ngu':      {v:() => vLang(), a:'setup'},
  'buoi-dau':      {v:() => vFirst(), a:'setup'},
  'bai-test':      {v:() => vTest(), a:'setup'},
  'tong-quan':     {v:() => vDashboard(), a:'app', nav:'tong-quan'},
  'luyen-tap':     {v:() => vSetup(), a:'app', nav:'luyen-tap'},
  'ghi-am':        {v:() => vRecord(), a:'app', nav:'luyen-tap', need:() => S.rec, back:'luyen-tap'},
  'kich-ban':      {v:() => vScript(), a:'app', nav:'luyen-tap'},
  'dang-phan-tich':{v:() => vAnalyzing(), a:'app', nav:'luyen-tap', need:() => S.an, back:'luyen-tap'},
  'bao-cao':       {v:() => vReport(false), a:'app', nav:'tien-bo', need:() => current(), back:'tien-bo'},
  'thu-vien':      {v:() => vLibrary(), a:'app', nav:'thu-vien'},
  'tien-bo':       {v:() => vProgress(), a:'app', nav:'tien-bo'},
  'goi-dich-vu':   {v:() => vPricing(true), a:'app', nav:'goi-dich-vu'},
  'tai-khoan':     {v:() => vAccount(), a:'app', nav:'tai-khoan'},
};
const route = () => { try { return decodeURIComponent(location.hash.replace(/^#/,'')); } catch(e){ return ''; } };
function go(r){ S.menu = false; if(route() === r) render(); else location.hash = r; }

function render(){
  let r = route(); let R = ROUTES[r];
  if(!R){ r = ''; R = ROUTES['']; }
  if(R.a === 'guest' && S.user) return go(R.alt || 'tong-quan');
  if(R.a !== 'guest' && !S.user) return go('dang-nhap');
  if(R.need && !R.need()) return go(R.back);
  if(r !== 'ghi-am' && S.rec) cleanupRec();
  const app = $('#app');
  app.innerHTML = R.v() + modalHtml() + (S.user ? demoSwitch() : '');
  if(S.lastRoute !== r){ window.scrollTo(0,0); S.lastRoute = r; }
  if(r === 'ghi-am') attachRecMedia();
}
window.addEventListener('hashchange', render);

/* ================= Khung trang ================= */
const logo = () => `<button class="logo" data-go="${S.user ? 'tong-quan' : ''}" aria-label="luyenthuyettrinh.com, ${S.user ? 'về Tổng quan' : 'về trang chủ'}"><span class="logo-mark"><span><i style="height:6px"></i><i style="height:14px"></i><i style="height:9px"></i><i style="height:12px"></i></span></span><span class="lname">luyenthuyettrinh.com</span></button>`;

function pubBar(){
  const r = route();
  return `<header class="l-nav"><div class="wrap">${logo()}
    <div class="right">
      <button class="nav-link hide-md ${r==='bang-gia'?'on':''}" data-go="bang-gia">Bảng giá</button>
      <button class="nav-link hide-md ${r==='bao-cao-mau'?'on':''}" data-go="bao-cao-mau">Báo cáo mẫu</button>
      <button class="nav-link ${r==='dang-nhap'?'on':''}" data-go="dang-nhap">Đăng nhập</button>
      <button class="btn btn-ghost btn-sm" data-go="dang-ky">Đăng ký</button>
      <button class="btn btn-primary btn-sm" data-go="gioi-thieu">Bắt đầu ngay</button>
      <button class="icon-btn menu-btn" data-act="menu" aria-label="Mở menu" aria-expanded="${S.menu}">${ic('menu',22)}</button>
    </div>
    ${S.menu ? `<div class="menu"><button data-go="bang-gia">Bảng giá</button><button data-go="bao-cao-mau">Báo cáo mẫu</button><button data-go="dang-nhap">Đăng nhập</button><button data-go="dang-ky">Đăng ký</button><button data-go="gioi-thieu">Bắt đầu ngay</button></div>` : ''}
  </div></header>`;
}
const NAV = [['tong-quan','Tổng quan','home'],['luyen-tap','Luyện tập','mic'],['thu-vien','Thư viện bài nói','lib'],['tien-bo','Tiến bộ','chart'],['goi-dich-vu','Gói dịch vụ','card'],['tai-khoan','Tài khoản','user']];
function shell(inner){
  const p = plan(), active = (ROUTES[route()] || {}).nav;
  return `<div class="shell"><aside class="side">${logo()}<nav aria-label="Điều hướng ứng dụng">${NAV.map(([k,l,i]) => `<button class="${active===k?'on':''}" data-go="${k}" ${active===k?'aria-current="page"':''}>${ic(i,18)}<span>${l}</span></button>`).join('')}</nav>
    <div class="plan-box"><b>Gói ${p.name}</b><span class="muted">Còn ${left()} / ${p.limit} lượt tháng này</span><div class="meter"><b style="width:${Math.min(100, S.used/p.limit*100)}%"></b></div>${isPro() ? '' : `<button class="btn btn-primary btn-sm" style="margin-top:12px" data-go="goi-dich-vu">Nâng cấp Premium</button>`}</div>
  </aside><main class="main"><div class="main-inner">${inner}</div></main></div>`;
}
const demoSwitch = () => `<div class="demo-sw" role="group" aria-label="Chuyển gói trong bản thử nghiệm"><span>Bản thử</span><button class="${isPro()?'':'on'}" data-act="demo-plan" data-plan="free" aria-pressed="${!isPro()}">Miễn phí</button><button class="${isPro()?'on':''}" data-act="demo-plan" data-plan="premium" aria-pressed="${isPro()}">Premium</button></div>`;
function gate(html, title, desc){
  if(isPro()) return html;
  const btn = S.user ? `<button class="btn btn-primary btn-sm" data-go="goi-dich-vu">Xem gói Premium</button>` : `<button class="btn btn-primary btn-sm" data-go="bang-gia">Xem bảng giá</button>`;
  return `<div class="lock-card">${html}<div class="lock-over">${proChip}<b>${title}</b><p class="muted" style="font-size:13px;max-width:42ch">${desc}</p>${btn}</div></div>`;
}
const dots = (n, total) => `<div class="progress-dots" aria-label="Bước ${n} trên ${total}">${Array.from({length:total}, (_,i) => `<i class="${i<n?'on':''}"></i>`).join('')}</div>`;

/* ================= Biểu đồ ================= */
function lineChart(data, {h=200, min=40, max=100, ticks=[40,60,80,100], series2=null}={}){
  const W=640, H=h, pl=34, pr=18, pt=16, pb=28, n=data.length;
  const x = i => pl + (n===1 ? (W-pl-pr)/2 : i*(W-pl-pr)/(n-1)), y = v => pt + (max-v)*(H-pt-pb)/(max-min);
  const pts = data.map((d,i) => [x(i), y(d.v)]);
  const path = pts.map((p,i) => (i?'L':'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ điểm qua các lần luyện">`;
  ticks.forEach(t => { s += `<line class="grid-l" x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl-8}" y="${y(t)+4}" text-anchor="end">${t}</text>`; });
  s += `<path class="ar" d="${path} L${pts[n-1][0]} ${y(min)} L${pts[0][0]} ${y(min)} Z"/>`;
  if(series2){ const p2 = series2.map((v,i) => (i?'L':'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' '); s += `<path d="${p2}" fill="none" stroke="var(--sky)" stroke-width="2" stroke-dasharray="4 4"/>`; }
  s += `<path d="${path}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach((p,i) => { s += `<circle class="dt" cx="${p[0]}" cy="${p[1]}" r="${i===n-1?6:4}" stroke="var(--blue)" ${i===n-1?'style="fill:var(--blue)"':''}/><text x="${p[0]}" y="${H-8}" text-anchor="middle">${esc(data[i].label)}</text>`; });
  const lp = pts[n-1];
  return s + `<text class="lbl-v" x="${lp[0]}" y="${lp[1]-12}" text-anchor="middle">${data[n-1].v}</text></svg>`;
}
function paceChart(vals){
  const W=640, H=200, pl=34, pr=10, pt=14, pb=28, max=200, y = v => pt + (max-v)*(H-pt-pb)/max, bw = (W-pl-pr)/Math.max(vals.length,3);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tốc độ nói theo từng phút"><rect class="band-ok" x="${pl}" y="${y(150)}" width="${W-pl-pr}" height="${y(120)-y(150)}"/>`;
  [0,50,100,150,200].forEach(t => { s += `<line class="grid-l" x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl-8}" y="${y(t)+4}" text-anchor="end">${t}</text>`; });
  vals.forEach((v,i) => { const x = pl + i*bw + bw*.22, w = bw*.56; s += `<rect class="bar ${v>150?'over':''}" x="${x}" y="${y(v)}" width="${w}" height="${y(0)-y(v)}" rx="4"/><text class="lbl-v" x="${x+w/2}" y="${y(v)-6}" text-anchor="middle">${v}</text><text x="${x+w/2}" y="${H-8}" text-anchor="middle">Phút ${i+1}</text>`; });
  return s + '</svg>';
}
function ring(v, size=150){
  const sw = Math.max(5, Math.round(size/12)), r = size/2 - sw/2 - 1, c = 2*Math.PI*r, small = size < 100;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--soft-2)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--blue)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c*v/100} ${c}"/></svg><div class="rv" aria-label="${v} trên 100 điểm"><div><b class="num" style="font-size:${Math.round(size*(small?.32:.29))}px">${v}</b>${small ? '' : '<br><span>/ 100</span>'}</div></div></div>`;
}
const barRow = (k, v) => `<div class="bar-row"><span>${k}</span><div class="track"><b class="${bCls(v)}" style="width:${v}%"></b></div><b class="num">${v}</b></div>`;

/* ================= 1. Công khai: Landing ================= */
function vLanding(){
  return pubBar() + `
  <section class="l-hero"><div class="wrap">
    <div>
      <h1>Thuyết trình tốt hơn qua từng khoảnh khắc bạn luyện cùng chúng tôi.</h1>
      <p class="lead2">luyenthuyettrinh.com là huấn luyện viên AI lắng nghe bạn nói, chỉ ra từng lỗi nhỏ và giúp bạn tự tin hơn sau mỗi lần luyện.</p>
      <div class="ctas"><button class="btn btn-primary btn-lg" data-go="gioi-thieu">Bắt đầu ngay ${ic('arrow')}</button><button class="btn-text" data-go="bao-cao-mau">Xem báo cáo mẫu</button></div>
    </div>
    <div class="collage">
      <img class="ph-main" src="img/hero.jpg" alt="Diễn giả cầm micro nói trước một hội trường đông khán giả" width="1400" height="1100">
      <img class="ph-side" src="img/stage.jpg" alt="Diễn giả đứng giữa sân khấu hội nghị" width="800" height="600">
      <img class="ph-low" src="img/pitch.jpg" alt="Người thuyết trình chỉ vào màn hình trước nhóm khán giả" width="800" height="600">
      <div class="float-score">
        <div class="hv-score">${ring(81,56)}<div><b style="font-size:14px">Điểm tổng</b><div class="muted" style="font-size:12px">+6 so với lần trước</div></div></div>
        <div class="chips"><span class="chip good">138 từ/phút</span><span class="chip sky">Ánh mắt 71%</span></div>
      </div>
    </div>
  </div></section>

  <section class="section" id="van-de"><div class="wrap">
    <div class="section-head"><h2>Vấn đề phổ biến của các bạn là gì?</h2></div>
    <div class="pain-grid">
      ${[['mic','Quan trọng nhưng khó tiếp cận','Thuyết trình là một kỹ năng quan trọng nhưng chưa dễ tiếp cận. Từ bài tập nhóm, bảo vệ đồ án đến phỏng vấn và gọi vốn đều cần, nhưng hiếm nơi dạy bài bản.','Luyện mọi lúc ngay trên trình duyệt.'],
         ['user','Thiếu tự tin','Cần thiết trong học tập và công việc, nhưng nhiều người ngại đứng trước đám đông và né các cơ hội trình bày.','Tập riêng với AI, không ai nhìn, không sợ sai.'],
         ['dollar','Chi phí cao','Khóa học và người hướng dẫn chất lượng thường tốn kém, lịch học cố định và khó theo kịp.','Miễn phí 3 lượt mỗi tháng, luyện lúc nào cũng được.'],
         ['help','Thiếu phản hồi','Tự luyện ở nhà khó nhận ra mình nói nhanh, dùng từ đệm hay rời mắt khỏi khán giả.','Báo cáo chỉ ra đúng câu, đúng giây cần sửa.']]
        .map(([i,t,p,f]) => `<div class="pain-card"><div class="pain-ic">${ic(i,22)}</div><h3>${t}</h3><p>${p}</p><div class="pain-fix"><b>Với chúng tôi</b>${f}</div></div>`).join('')}
    </div>
  </div></section>

  <section class="section band" id="giai-phap"><div class="wrap">
    <div class="section-head"><h2>Giải pháp: AI nghe, xem và đọc bài nói của bạn.</h2><p>Rồi chỉ ra đúng câu, đúng giây cần sửa.</p></div>
    <div class="feat-grid">
      ${[['wave','Giọng nói','Chuyển giọng nói thành văn bản, đo tốc độ, ngắt nghỉ và đếm từ đệm như “ừm”, “à”, “ờ”.'],['doc','Nội dung và kịch bản','Chấm logic, cấu trúc, cảnh báo khi lạc đề. Chấm cả kịch bản viết trước khi bạn nói.'],['eye','Ngôn ngữ cơ thể','Theo dõi ánh mắt, biểu cảm, cử chỉ và tư thế qua video.'],['users','Khán giả AI','Đặt câu hỏi phản biện và nhắc bạn ngay khi đang nói.']]
        .map(([i,t,p]) => `<div class="feat"><div class="feat-ic">${ic(i)}</div><h3>${t}</h3><p>${p}</p></div>`).join('')}
    </div>
  </div></section>

  <section class="section" id="cach-dung"><div class="wrap">
    <div class="section-head"><h2>Ba bước, khoảng năm phút.</h2></div>
    <div class="steps">
      <div class="step"><div class="n">Bước 1</div><h3>Chọn mục tiêu</h3><p>Một trong bốn loại hình, tiếng Việt hoặc tiếng Anh, chủ đề và dàn ý nếu có.</p></div>
      <div class="step"><div class="n">Bước 2</div><h3>Nói hoặc gửi kịch bản</h3><p>Ghi âm, quay video ngay trên trình duyệt, tải file có sẵn hoặc dán kịch bản để AI chấm.</p></div>
      <div class="step"><div class="n">Bước 3</div><h3>Nhận báo cáo</h3><p>Điểm từng tiêu chí, 3–5 điểm yếu kèm trích dẫn và cách nói lại tốt hơn.</p></div>
    </div>
  </div></section>

  <section class="section band" id="che-do"><div class="wrap">
    <div class="section-head"><h2>Luyện cho đúng sân khấu bạn sắp bước lên.</h2><p class="lead-strong">AI riêng cho từng loại hình thuyết trình.</p><p>Mỗi chế độ có tiêu chí chấm riêng và một AI đóng vai người nghe.</p></div>
    <div class="mode-cards">${Object.values(MODES).map(m => `<div class="mode-card"><img src="img/${m.img}" alt="${m.alt}" loading="lazy" width="800" height="600"><h3>${m.name}</h3><p>${m.desc}</p><div class="who">Người nghe AI: ${m.persona}, ${m.role.toLowerCase()}</div></div>`).join('')}</div>
  </div></section>

  <section style="padding-block:72px 0"><div class="wrap">
    <div class="final"><h2>Bài thuyết trình tiếp theo sẽ khác.</h2><button class="btn btn-lg" data-go="gioi-thieu">Bắt đầu miễn phí</button></div>
    <footer class="footer"><span>© 2026 luyenthuyettrinh.com · Bản thử nghiệm, dữ liệu mẫu</span><span>Ảnh: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span></footer>
  </div></section>`;
}

/* ================= 1. Công khai: Giới thiệu → Chọn chế độ → Ngôn ngữ → Xem trước ================= */
function flowPage(inner, narrow=false){ return pubBar() + `<div class="wrap flow-body"><div class="flow-card ${narrow?'narrow':''}">${inner}</div></div>`; }
const modeChoices = (sel, act) => `<div class="choice-grid" style="margin-top:28px">${Object.entries(MODES).map(([k,m]) => `<button class="choice ${sel===k?'on':''}" data-act="${act}" data-mode="${k}" aria-pressed="${sel===k}"><h3>${m.name}</h3><p>${m.desc}</p><span class="who">Người nghe AI: ${m.persona}, ${m.role.toLowerCase()}</span></button>`).join('')}</div>`;
const langChoices = (sel, act) => `<div class="choice-grid" style="margin-top:28px">
  <button class="choice ${sel==='vi'?'on':''}" data-act="${act}" data-lang="vi" aria-pressed="${sel==='vi'}"><h3>Tiếng Việt</h3><p>Nhận diện từ đệm “ừm”, “à”, “ờ”, “kiểu như”, “thì là”.</p></button>
  <button class="choice ${sel==='en'?'on':''}" data-act="${act}" data-lang="en" aria-pressed="${sel==='en'}"><h3>Tiếng Anh</h3><p>Nhận diện “um”, “uh”, “like”, “you know”. Báo cáo vẫn viết bằng tiếng Việt.</p></button></div>`;

function vIntro(){
  return flowPage(`${dots(1,4)}<div class="eyebrow">Giới thiệu sản phẩm</div>
    <h1 style="margin-top:12px">Đây là cách luyenthuyettrinh.com giúp bạn.</h1>
    <p class="lead">Mỗi buổi luyện gồm bốn phần và mất khoảng 5 phút.</p>
    <div class="intro-list">
      <div><div class="feat-ic">${ic('mic')}</div><div><h3>Bạn nói hoặc gửi kịch bản</h3><p>Ghi âm, quay video ngay trên trình duyệt, tải file có sẵn hoặc dán kịch bản viết trước.</p></div></div>
      <div><div class="feat-ic">${ic('users')}</div><div><h3>AI lắng nghe như khán giả thật</h3><p>Nhắc ngay khi bạn nói quá nhanh, và đặt câu hỏi phản biện như người nghe thật.</p></div></div>
      <div><div class="feat-ic">${ic('doc')}</div><div><h3>Bạn nhận báo cáo chi tiết</h3><p>Điểm từng tiêu chí, lỗi kèm trích dẫn, và cách sửa cụ thể.</p></div></div>
      <div><div class="feat-ic">${ic('chart')}</div><div><h3>Bạn thấy mình tiến bộ</h3><p>Lưu bài nói vào thư viện, so sánh nhiều lần luyện, theo dõi lỗi giảm dần.</p></div></div>
    </div>
    <div class="flow-actions"><button class="btn-text" data-go="">Về trang chủ</button><button class="btn btn-primary" data-go="chon-che-do">Tiếp tục</button></div>`);
}
function vObMode(){
  return flowPage(`${dots(2,4)}<div class="eyebrow">Chọn chế độ luyện</div>
    <h1 style="margin-top:12px">Bạn muốn luyện cho dịp nào?</h1>
    <p class="lead">Mỗi chế độ có một AI riêng đóng vai người nghe. Bạn đổi được bất cứ lúc nào.</p>
    ${modeChoices(S.ob.mode,'ob-mode')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="gioi-thieu">Quay lại</button><button class="btn btn-primary" data-go="chon-ngon-ngu">Tiếp tục</button></div>`);
}
function vObLang(){
  return flowPage(`${dots(3,4)}<div class="eyebrow">Chọn ngôn ngữ</div>
    <h1 style="margin-top:12px">Bạn sẽ nói bằng ngôn ngữ nào?</h1>
    <p class="lead">AI chấm phát âm, từ đệm và cách diễn đạt theo ngôn ngữ bạn chọn.</p>
    ${langChoices(S.ob.lang,'ob-lang')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="chon-che-do">Quay lại</button><button class="btn btn-primary" data-go="xem-truoc">Tiếp tục</button></div>`);
}
function vObPreview(){
  const m = MODES[S.ob.mode];
  return flowPage(`${dots(4,4)}<div class="eyebrow">Xem trước</div>
    <h1 style="margin-top:12px">Một buổi luyện ${m.name.toLowerCase()} trông như thế này.</h1>
    <p class="lead">Đây là bản minh họa. Tạo tài khoản để luyện với bài nói của chính bạn.</p>
    <div class="preview-card">
      <div class="persona"><div class="avatar">${m.persona.split(' ').pop()[0]}</div><div><b>${m.persona}</b> sẽ nghe bạn nói<div class="muted" style="font-size:13px">${m.role} · ${m.name} · ${LANGS[S.ob.lang]}</div></div></div>
      <div class="quote"><small>Đề bài mẫu</small>${m.prompt}</div>
      <div class="hv-score">${ring(72,64)}<div style="flex:1;min-width:0"><div class="bars">${barRow('Cấu trúc',74)}${barRow('Tốc độ nói',66)}${barRow('Từ đệm',58)}</div></div></div>
      <div class="quote"><small>${m.persona} hỏi</small>“${m.questions[0]}”</div>
      <div class="chips"><span class="chip">3 lượt phân tích miễn phí mỗi tháng</span><span class="chip">Tối đa 5 phút mỗi bài</span></div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-go="chon-ngon-ngu">Quay lại</button><button class="btn btn-primary" data-act="need-account">Bắt đầu luyện</button></div>`);
}

/* ================= 2. Đăng ký / Đăng nhập ================= */
function vAuth(mode){
  const su = mode === 'signup';
  return flowPage(`
    <div class="tabs" role="tablist"><button role="tab" aria-selected="${su}" class="${su?'on':''}" data-go="dang-ky">Đăng ký</button><button role="tab" aria-selected="${!su}" class="${!su?'on':''}" data-go="dang-nhap">Đăng nhập</button></div>
    <h1 style="margin-top:24px;font-size:32px">${su ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1>
    <p class="lead" style="font-size:15px">${su ? 'Miễn phí 3 lượt phân tích mỗi tháng. Không cần thẻ ngân hàng.' : 'Tiếp tục buổi luyện của bạn.'}</p>
    <form class="form" id="authForm" data-mode="${mode}" novalidate style="margin-top:24px">
      <button type="button" class="btn google" data-act="google" data-mode="${mode}"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Tiếp tục với Google</button>
      <div class="divider">hoặc dùng email</div>
      ${su ? `<div class="field"><label for="f-name">Họ và tên</label><input class="input" id="f-name" placeholder="Nguyễn Lan Anh" autocomplete="name"></div>` : ''}
      <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" type="email" placeholder="ban@email.com" autocomplete="email"></div>
      <div class="field"><label for="f-pass">Mật khẩu</label><input class="input" id="f-pass" type="password" placeholder="Tối thiểu 6 ký tự" autocomplete="${su?'new-password':'current-password'}"></div>
      ${S.authErr ? `<p class="err" role="alert">${esc(S.authErr)}</p>` : ''}
      <button class="btn btn-primary btn-lg" type="submit">${su ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
      ${su ? '' : `<div class="demo-login"><span>Muốn xem nhanh? Dùng tài khoản có sẵn 8 lần luyện mẫu.</span><button type="button" class="btn btn-ghost btn-sm" data-act="demo-login">Dùng tài khoản dùng thử</button></div>`}
      <p class="demo-note">Bản thử nghiệm: tài khoản chỉ tồn tại trong phiên này, tải lại trang sẽ đăng xuất.</p>
    </form>`, true);
}

/* ================= 2b. Sau đăng ký: Mục tiêu → Ngôn ngữ → Xem trước buổi tập → Bài test ================= */
function vGoal(){
  return flowPage(`${dots(1,4)}<div class="eyebrow">Thiết lập tài khoản</div>
    <h1 style="margin-top:12px">Chọn 1 trong 4 mục tiêu luyện tập.</h1>
    <p class="lead">${S.user.isNew ? 'Mình đã chọn sẵn theo lựa chọn lúc bạn xem giới thiệu. Bạn có thể đổi.' : 'Mục tiêu giúp AI chọn đề bài và người nghe phù hợp.'}</p>
    ${modeChoices(S.user.goal,'goal-pick')}
    <div class="flow-actions"><span></span><button class="btn btn-primary" data-go="ngon-ngu">Tiếp tục</button></div>`);
}
function vLang(){
  return flowPage(`${dots(2,4)}<div class="eyebrow">Thiết lập tài khoản</div>
    <h1 style="margin-top:12px">Ngôn ngữ bạn thường thuyết trình?</h1>
    <p class="lead">Dùng làm mặc định cho các buổi luyện. Bạn đổi được trong từng buổi.</p>
    ${langChoices(S.user.lang,'lang-pick')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="chon-muc-tieu">Quay lại</button><button class="btn btn-primary" data-go="buoi-dau">Tiếp tục</button></div>`);
}
function vFirst(){
  const m = MODES[S.user.goal];
  return flowPage(`${dots(3,4)}<div class="eyebrow">Xem trước buổi tập</div>
    <h1 style="margin-top:12px">Buổi luyện ${m.name.toLowerCase()} đầu tiên của bạn.</h1>
    <p class="lead">Đề bài và người nghe AI được chọn theo đúng mục tiêu của bạn.</p>
    <div class="preview-card">
      <div class="quote"><small>Đề bài mẫu</small><b>${m.prompt}</b></div>
      <div class="persona"><div class="avatar">${m.persona.split(' ').pop()[0]}</div><div><b>${m.persona}</b>, ${m.role.toLowerCase()}<div class="muted" style="font-size:13px">Tập trung chấm ${m.focus} · ${LANGS[S.user.lang]}</div></div></div>
      <div class="quote"><small>Câu hỏi ${m.persona} có thể đặt ra</small>“${m.questions[0]}”</div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-go="ngon-ngu">Quay lại</button><button class="btn btn-primary" data-go="bai-test">Làm bài test đầu vào</button></div>
    <p class="demo-note" style="margin-top:12px;text-align:right"><button class="btn-link" data-act="skip-test">Để sau, vào Tổng quan</button></p>`);
}
function vTest(){
  return flowPage(`${dots(4,4)}<div class="eyebrow">Bài test đầu vào · 60 giây · không tính lượt</div>
    <h1 style="margin-top:12px">Giới thiệu bản thân trong 60 giây.</h1>
    <p class="lead">AI dùng bài nói này để xác định trình độ hiện tại và gợi ý lộ trình luyện.</p>
    <div class="intro-list">
      <div><div class="feat-ic">1</div><div><h3>Bạn là ai</h3><p>Tên, đang học hoặc làm gì.</p></div></div>
      <div><div class="feat-ic">2</div><div><h3>Một điều bạn tự hào</h3><p>Kể ngắn gọn một thành tích hoặc trải nghiệm.</p></div></div>
      <div><div class="feat-ic">3</div><div><h3>Mục tiêu khi luyện thuyết trình</h3><p>Bạn muốn nói tốt hơn ở đâu.</p></div></div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-act="skip-test">Để sau</button><button class="btn btn-primary" data-act="test-start">${ic('mic',18)} Bắt đầu ghi âm</button></div>`);
}

/* ================= 3. Ứng dụng: Tổng quan ================= */
function rowHtml(s){
  return `<button class="row" data-act="open" data-id="${s.id}"><div style="min-width:0"><div class="row-t">${esc(s.title)}</div><div class="row-m">${MODES[s.mode].name} · ${LANGS[s.lang]} · ${INPUTS[s.input] || 'Ghi âm'} · ${s.input==='script' ? 'ước tính ' : ''}${fmtT(s.dur)}</div></div><span class="row-m row-d num">${fmtD(s.date)}</span><span class="score-pill num ${sCls(s.score)}">${s.score}</span></button>`;
}
function vDashboard(){
  const ss = S.sessions, name = esc((S.user.name || 'bạn').trim().split(' ').pop());
  const pr = S.placementResult;
  let body = '';
  if(pr) body += `<div class="banner good"><div><h3>Kết quả bài test đầu vào: trình độ ${pr.level}, ${pr.score} điểm</h3><p>Lộ trình gợi ý tập trung vào mở bài và từ đệm.</p></div><div class="acts" style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" data-act="open" data-id="${pr.id}">Xem báo cáo</button><button class="btn btn-ghost btn-sm" data-act="dismiss-test">Đóng</button></div></div>`;
  if(!isPro() && left() <= 1) body += `<div class="banner"><div><h3>${left() ? 'Còn 1 lượt phân tích trong tháng' : 'Bạn đã dùng hết lượt phân tích tháng này'}</h3><p>Premium có 50 lượt mỗi tháng, phân tích video và khán giả AI.</p></div><button class="btn btn-primary btn-sm" data-go="goi-dich-vu">Xem gói Premium</button></div>`;
  if(!ss.length){
    body += `<div class="empty" style="padding:48px 24px"><b>Bạn chưa có buổi luyện nào</b><span>Làm bài test đầu vào 60 giây để AI biết trình độ của bạn, hoặc bắt đầu luyện ngay.</span><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px"><button class="btn btn-primary" data-go="bai-test">Làm bài test đầu vào</button><button class="btn btn-ghost" data-go="luyen-tap">Luyện tập</button></div></div>`;
    return shell(dashHead(name) + body);
  }
  const last = ss[ss.length-1], prev = ss[ss.length-2], first = ss[0];
  const avg = Math.round(ss.reduce((a,s) => a+s.score, 0)/ss.length), mins = Math.round(ss.reduce((a,s) => a+s.dur, 0)/60);
  const errs = [['Từ đệm “ừm”, “à”', first.fillers, last.fillers, 'lần/bài']];
  if(ss.length > 1) errs.push(['Tốc độ vượt 150 từ/phút', 4, 1, 'đoạn/bài'], ['Nhìn xuống ghi chú', '62%', '30%', 'thời gian']);
  body += `<div class="grid g-4">
      <div class="card stat"><div class="k">Điểm gần nhất</div><div class="v num">${last.score}</div><div class="d ${prev ? (last.score>=prev.score?'up':'down') : 'muted'}">${prev ? (last.score>=prev.score?'+':'') + (last.score-prev.score) + ' so với lần trước' : 'Lần luyện đầu tiên'}</div></div>
      <div class="card stat"><div class="k">Điểm trung bình</div><div class="v num">${avg}</div><div class="d muted">${ss.length} lần luyện</div></div>
      <div class="card stat"><div class="k">Thời gian đã luyện</div><div class="v num">${mins} <span style="font-size:16px">phút</span></div><div class="d muted">từ ${fmtD(first.date)}/${first.date.slice(0,4)}</div></div>
      <div class="card stat"><div class="k">Lượt phân tích còn lại</div><div class="v num">${left()}<span style="font-size:16px" class="muted"> / ${plan().limit}</span></div><div class="meter"><b style="width:${Math.min(100,S.used/plan().limit*100)}%"></b></div></div>
    </div>
    <div class="grid g-main mt">
      <div class="card"><h3>Điểm tổng qua các lần luyện</h3><div class="sub">Thang 100 · chấm theo 7 tiêu chí</div><div style="margin-top:12px">${ss.length > 1 ? lineChart(ss.map(s => ({label:fmtD(s.date), v:s.score}))) : `<div class="empty"><span>Luyện thêm 1 lần nữa để xem biểu đồ tiến bộ.</span></div>`}</div></div>
      <div class="card"><h3>Lỗi thường gặp</h3><div class="sub">${ss.length > 1 ? 'Lần đầu → lần gần nhất' : 'Từ lần luyện đầu tiên'}</div>
        <div class="list" style="margin-top:10px">${errs.map(e => `<div style="padding:12px 0;border-top:1px solid var(--line)"><div style="font-weight:600;font-size:14px">${e[0]}</div><div style="display:flex;align-items:center;gap:8px;margin-top:4px" class="num">${ss.length>1 ? `<span class="chip bad">${e[1]}</span>→` : ''}<span class="chip ${ss.length>1?'good':'bad'}">${e[2]}</span><span class="muted" style="font-size:12px">${e[3]}</span></div></div>`).join('')}</div>
      </div>
    </div>
    <div class="grid g-main mt">
      <div class="card"><div class="card-head"><h3>Lần luyện gần đây</h3><button class="btn-text" data-go="tien-bo">Xem tất cả</button></div><div class="list" style="margin-top:6px">${ss.slice(-4).reverse().map(rowHtml).join('')}</div></div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="card soft"><div class="eyebrow">Gợi ý buổi tiếp theo</div><h3 style="font-size:18px;margin-top:8px">Luyện mở bài trong 30 giây</h3><p class="muted" style="font-size:14px;margin-top:6px">Mở bài là phần bạn dùng nhiều từ đệm nhất. Thử 3 cách mở: câu hỏi, con số, câu chuyện.</p><button class="btn btn-primary btn-sm" style="margin-top:16px" data-act="suggest">Luyện ngay</button></div>
        <div class="card"><div class="card-head"><h3>Thư viện bài nói</h3><button class="btn-text" data-go="thu-vien">Mở</button></div><div class="sub">${S.library.length} bài đã lưu · nghe lại, tải về, xóa</div></div>
      </div>
    </div>`;
  return shell(dashHead(name) + body);
}
const dashHead = name => `<div class="page-head"><div><h1>Chào ${name}.${isPro() ? proChip : ''}</h1><p>${S.sessions.length > 1 ? `Điểm của bạn tăng ${S.sessions[S.sessions.length-1].score - S.sessions[0].score} điểm kể từ lần luyện đầu tiên.` : 'Mỗi buổi luyện chỉ mất khoảng 5 phút.'}</p></div><button class="btn btn-primary" data-go="luyen-tap">${ic('mic',18)} Bắt đầu luyện</button></div>`;

/* ================= 3. Ứng dụng: Thiết lập buổi luyện ================= */
const SETUP_STEPS = ['Mục tiêu','Ngôn ngữ','Hình thức nộp bài'];
function vSetup(){
  const d = S.draft, m = MODES[d.mode], p = plan(), st = S.step;
  const stepper = `<div class="stepper" role="list">${SETUP_STEPS.map((t,i) => `<button role="listitem" class="${i===st?'on':''} ${i<st?'done':''}" data-act="step" data-n="${i}" ${i===st?'aria-current="step"':''}><b>${i<st ? ic('check',12) : i+1}</b>${t}</button>`).join('')}</div>`;
  let body = '';
  if(st === 0) body = `<div class="sec-t">Chọn 1 trong 4 mục tiêu</div>${modeChoices(d.mode,'d-mode').replace('margin-top:28px','margin-top:0')}
    <div style="margin-top:22px"><div class="sec-t">Mục đích cụ thể</div><div class="pills">${PURPOSES.map(x => `<button class="pill ${d.purpose===x?'on':''}" data-act="d-purpose" data-v="${esc(x)}" aria-pressed="${d.purpose===x}">${x}</button>`).join('')}</div></div>`;
  if(st === 1) body = `<div class="sec-t">Ngôn ngữ của bài nói này</div>${langChoices(d.lang,'d-lang').replace('margin-top:28px','margin-top:0')}`;
  if(st === 2){
    const opts = [['audio','mic','Ghi âm','Nói trực tiếp qua micro',false],['video','video','Quay video','Phân tích cả ngôn ngữ cơ thể',!p.video],['upload','upload','Tải file lên','Âm thanh hoặc video có sẵn',false],['script','doc','Chấm kịch bản','Dán hoặc tải kịch bản, AI chấm bài viết',false]];
    body = `<div class="sec-t">Chọn hình thức nộp bài</div><div class="choice-grid">${opts.map(([k,i,l,s,lock]) => `<button class="choice ${d.input===k?'on':''} ${lock?'locked':''}" data-act="d-input" data-v="${k}" ${lock?'data-locked="1"':''} aria-pressed="${d.input===k}">${lock ? `<span class="tag">${proChip}</span>` : ''}<span style="color:var(--blue)">${ic(i)}</span><h3>${l}</h3><p>${s}</p></button>`).join('')}</div>
      ${d.input==='upload' ? `<label class="drop" for="d-file" style="margin-top:16px"><input type="file" id="d-file" accept="audio/*,video/*" class="sr-only"><b>${d.file ? esc(d.file.name) : 'Chọn file âm thanh hoặc video'}</b><div class="muted" style="font-size:13px;margin-top:4px">${d.file ? `${(d.file.size/1048576).toFixed(1)} MB${d.file.dur ? ' · ' + fmtT(d.file.dur) : ''}` : `MP3, M4A, WAV, MP4, WEBM · tối đa ${p.maxMin} phút với gói ${p.name}`}</div></label>` : ''}
      <div class="grid g-2" style="margin-top:20px">
        <div class="field"><label for="d-title">Chủ đề bài nói</label><input class="input" id="d-title" data-draft="title" value="${esc(d.title)}" placeholder="VD: Ứng dụng AI trong giáo dục"></div>
        <div class="field"><label for="d-content">${d.input==='script' ? 'Ghi chú cho AI (không bắt buộc)' : 'Dàn ý (không bắt buộc)'}</label><input class="input" id="d-content" data-draft="content" value="${esc(d.content)}" placeholder="${d.input==='script' ? 'VD: Bài nói dành cho hội đồng giám khảo' : 'Các ý chính, để AI kiểm tra bạn có bám sát không'}"></div>
      </div>`;
  }
  const label = {audio:'Bắt đầu ghi âm', video:'Bắt đầu quay', upload:'Phân tích file', script:'Tiếp tục tới kịch bản'}[d.input];
  return shell(`
    <div class="page-head"><div><h1>Thiết lập buổi luyện</h1><p>Ba bước ngắn để AI chấm đúng mục tiêu của bạn.</p></div></div>
    <div class="setup">
      <div class="card">${stepper}${body}
        <div class="flow-actions" style="margin-top:26px">${st>0 ? `<button class="btn btn-ghost" data-act="step-back">Quay lại</button>` : '<span></span>'}${st<2 ? `<button class="btn btn-primary" data-act="step-next">Tiếp tục</button>` : `<button class="btn btn-primary btn-lg" data-act="begin" ${d.input==='upload'&&!d.file?'disabled':''}>${label}</button>`}</div>
      </div>
      <div class="setup-side">
        <div class="card"><div class="eyebrow">Người nghe của bạn</div><div class="persona" style="margin-top:12px"><div class="avatar">${m.persona.split(' ').pop()[0]}</div><div><b>${m.persona}</b><div class="muted" style="font-size:13px">${m.role}</div></div></div><p class="muted" style="font-size:14px;margin-top:12px">Tập trung chấm ${m.focus}.</p><div class="quote" style="margin-top:12px"><small>Có thể sẽ hỏi</small>“${m.questions[0]}”</div></div>
        <div class="card"><h3>Gói ${p.name}</h3><div class="sub">Còn ${left()} / ${p.limit} lượt · tối đa ${p.maxMin} phút mỗi bài</div>${isPro() ? '' : `<p class="muted" style="font-size:13px;margin-top:10px">Quay video và nhắc nhở thời gian thực có trong gói Premium.</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" data-go="goi-dich-vu">So sánh gói</button>`}</div>
      </div>
    </div>`);
}
function saveDraftFields(){ document.querySelectorAll('[data-draft]').forEach(el => { S.draft[el.dataset.draft] = el.value; }); }
function hasQuota(){
  if(S.draft.placement || left() > 0) return true;
  S.modal = {type:'quota'}; render(); return false;
}

/* ================= 3. Ứng dụng: Ghi âm / quay video ================= */
function vRecord(){
  const d = S.draft, m = MODES[d.mode], p = plan(), r = S.rec, max = d.placement ? 60 : p.maxMin*60;
  return shell(`
    <div class="page-head"><div><div class="eyebrow">${d.placement ? 'Bài test đầu vào' : m.name} · ${LANGS[d.lang]}</div><h1 style="margin-top:6px">${esc(d.placement ? 'Giới thiệu bản thân trong 60 giây' : (d.title || 'Bài nói chưa đặt tên'))}</h1></div><button class="btn btn-ghost btn-sm" data-act="rec-cancel">Hủy</button></div>
    <div class="rec">
      <div class="rec-stage">
        ${d.input==='video' ? `<div class="cam"><video id="camv" autoplay muted playsinline></video><div class="ph" id="camph">Đang mở camera…</div><span class="tag">Theo dõi ánh mắt và cử chỉ</span></div>` : ''}
        <div style="display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600"><span class="rec-dot ${r.paused?'paused':''}" id="recdot"></span><span id="recst">${r.paused?'Tạm dừng':'Đang ghi'}</span></div><div class="timer num" id="timer">${fmtT(r.t)}</div><div class="muted num" style="font-size:13px">Giới hạn ${fmtT(max)}</div></div>
          <div class="rec-actions"><button class="btn btn-ghost" data-act="rec-pause" id="pausebtn">${r.paused?'Tiếp tục':'Tạm dừng'}</button><button class="btn btn-primary" data-act="rec-stop">Kết thúc và phân tích</button></div>
        </div>
        <canvas class="wv" id="wv" aria-hidden="true"></canvas>
        <div class="demo-note" id="micnote" role="status">Đang mở micro…</div>
        <div class="kpis"><div class="kpi"><div class="k">Tốc độ</div><div class="v num" id="k-wpm">–</div><div class="k">từ/phút</div></div><div class="kpi"><div class="k">Từ đệm</div><div class="v num" id="k-fill">${r.fill}</div><div class="k">lần</div></div><div class="kpi"><div class="k">Ngắt nghỉ</div><div class="v num" id="k-pause">${r.pause}</div><div class="k">lần trên 2 giây</div></div></div>
      </div>
      ${gate(`<div class="card" style="height:100%"><div class="card-head"><div class="t"><h3>Nhắc nhở thời gian thực</h3>${proChip}</div></div><div class="sub">${m.persona}, ${m.role.toLowerCase()}, đang nghe</div>
        <div class="live" id="live" style="margin-top:14px">${r.tips.map(tipHtml).join('') || '<p class="muted" style="font-size:14px">Gợi ý và câu hỏi của khán giả AI sẽ hiện ở đây khi bạn nói.</p>'}</div></div>`,
        'Nhắc nhở thời gian thực', 'AI nhắc ngay khi bạn nói quá nhanh, dùng từ đệm, và đặt câu hỏi phản biện trong lúc bạn nói.')}
    </div>`);
}
const tipHtml = t => `<div class="tip ${t.q?'q':''}"><small>${t.at} · ${t.q?'CÂU HỎI TỪ KHÁN GIẢ':'GỢI Ý'}</small>${esc(t.text)}</div>`;

function startRec(){
  const d = S.draft;
  S.rec = {t:0, paused:false, tips:[], real:false, denied:false, stream:null, analyser:null, ctx:null, fill:0, pause:0, qi:0, timer:null, raf:null, mr:null, chunks:[]};
  const r = S.rec;
  go('ghi-am');
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia(d.input==='video' ? {audio:true, video:true} : {audio:true}).then(stream => {
      if(S.rec !== r){ stream.getTracks().forEach(t => t.stop()); return; }
      r.stream = stream; r.real = true;
      try { r.ctx = new (window.AudioContext || window.webkitAudioContext)(); const src = r.ctx.createMediaStreamSource(stream); r.analyser = r.ctx.createAnalyser(); r.analyser.fftSize = 256; src.connect(r.analyser); } catch(e){}
      if(window.MediaRecorder){ try { r.mr = new MediaRecorder(stream); r.mr.ondataavailable = e => { if(e.data && e.data.size) r.chunks.push(e.data); }; r.mr.start(1000); } catch(e){ r.mr = null; } }
      attachRecMedia();
    }).catch(() => { if(S.rec === r){ r.denied = true; attachRecMedia(); } });
  } else r.denied = true;
  r.timer = setInterval(() => tick(r), 1000);
}
function attachRecMedia(){
  const r = S.rec; if(!r) return;
  const v = $('#camv');
  if(v && r.stream && r.stream.getVideoTracks().length){ if(v.srcObject !== r.stream) v.srcObject = r.stream; const ph = $('#camph'); if(ph) ph.hidden = true; }
  const n = $('#micnote');
  if(n) n.textContent = r.real ? 'Đang ghi bằng micro của bạn. Bản ghi được lưu để bạn nghe lại trong thư viện.' : r.denied ? 'Không truy cập được micro. Đang chạy chế độ mô phỏng với dữ liệu mẫu.' : 'Đang mở micro…';
  if(r.denied){ const ph = $('#camph'); if(ph) ph.textContent = 'Không mở được camera. Phần ngôn ngữ cơ thể sẽ dùng dữ liệu mẫu.'; }
  cancelAnimationFrame(r.raf); drawWave(r);
}
function tick(r){
  if(S.rec !== r || r.paused) return;
  r.t++;
  const max = S.draft.placement ? 60 : plan().maxMin*60;
  const el = $('#timer'); if(el) el.textContent = fmtT(r.t);
  if(r.t > 3){ const w = $('#k-wpm'); if(w) w.textContent = Math.round(132 + Math.sin(r.t/6)*22 + Math.random()*8); }
  if(Math.random() < .12){ r.fill++; const f = $('#k-fill'); if(f) f.textContent = r.fill; }
  if(r.t % 17 === 0){ r.pause++; const f = $('#k-pause'); if(f) f.textContent = r.pause; }
  if(plan().live){
    const hit = LIVE_TIPS.find(x => x[0] === r.t % 64);
    if(hit){
      const m = MODES[S.draft.mode];
      const tip = hit[1] === 'Q' ? {q:true, at:fmtT(r.t), text:`${m.persona}: “${m.questions[r.qi++ % m.questions.length]}”`} : {at:fmtT(r.t), text:hit[1]};
      r.tips.unshift(tip);
      const live = $('#live'); if(live){ if(r.tips.length === 1) live.innerHTML = ''; live.insertAdjacentHTML('afterbegin', tipHtml(tip)); }
    }
  }
  if(r.t >= max){ toast('Đã đạt giới hạn thời gian'); stopRec(); }
}
function drawWave(r){
  const cv = $('#wv'); if(!cv || S.rec !== r) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if(!W){ r.raf = requestAnimationFrame(() => drawWave(r)); return; }
  if(cv.width !== Math.round(W*dpr)){ cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); }
  const c = cv.getContext('2d'); if(!c) return;
  c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H);
  const cs = getComputedStyle(document.documentElement), c1 = cs.getPropertyValue('--blue').trim(), c2 = cs.getPropertyValue('--sky').trim();
  const bars = Math.floor(W/7); let data = null;
  if(r.analyser){ data = new Uint8Array(r.analyser.frequencyBinCount); r.analyser.getByteFrequencyData(data); }
  const now = performance.now()/1000;
  for(let i=0; i<bars; i++){
    const v = r.paused ? .04 : data ? (data[Math.floor(i/bars*data.length*.7)] || 0)/255 : .15 + .55*Math.abs(Math.sin(i*.35+now*3)*Math.sin(i*.13-now*1.7)) + Math.random()*.08;
    const h = Math.max(3, v*H*.9); c.fillStyle = i%4===0 ? c2 : c1;
    c.beginPath(); if(c.roundRect) c.roundRect(i*7,(H-h)/2,4,h,2); else c.rect(i*7,(H-h)/2,4,h); c.fill();
  }
  r.raf = requestAnimationFrame(() => drawWave(r));
}
function releaseRec(r){ clearInterval(r.timer); cancelAnimationFrame(r.raf); if(r.stream) r.stream.getTracks().forEach(t => t.stop()); try { if(r.ctx) r.ctx.close(); } catch(e){} }
function cleanupRec(){ const r = S.rec; if(!r) return; if(r.mr && r.mr.state !== 'inactive'){ r.mr.onstop = null; try { r.mr.stop(); } catch(e){} } releaseRec(r); S.rec = null; }
function stopRec(){
  const r = S.rec; if(!r) return;
  const dur = Math.max(r.t, 8), video = S.draft.input === 'video';
  clearInterval(r.timer); cancelAnimationFrame(r.raf);
  const finish = media => { releaseRec(r); S.rec = null; startAnalysis({kind:'speech', dur, media, video}); };
  if(r.mr && r.mr.state !== 'inactive'){
    r.mr.onstop = () => { const type = r.mr.mimeType || (video ? 'video/webm' : 'audio/webm'); const blob = new Blob(r.chunks, {type}); finish(blob.size ? {url:URL.createObjectURL(blob), mime:type} : null); };
    r.mr.stop();
  } else finish(null);
}

/* ================= 3. Ứng dụng: Chấm kịch bản ================= */
function vScript(){
  const d = S.draft, m = MODES[d.mode], wc = words(S.scriptText), est = Math.round(wc/130*60);
  return shell(`
    <div class="page-head"><div><div class="eyebrow">${m.name} · ${LANGS[d.lang]} · Chấm kịch bản</div><h1 style="margin-top:6px">${esc(d.title || 'Kịch bản chưa đặt tên')}</h1><p>Dán hoặc tải kịch bản. AI chấm nội dung, cấu trúc, mở bài, kết bài và ước lượng thời lượng khi nói.</p></div><button class="btn btn-ghost btn-sm" data-go="luyen-tap">Quay lại</button></div>
    <div class="setup">
      <div class="card">
        <div class="field"><label for="sc-text">Kịch bản của bạn</label><textarea class="input" id="sc-text" style="min-height:340px" placeholder="Dán toàn bộ kịch bản vào đây. Mỗi đoạn cách nhau một dòng trống.">${esc(S.scriptText)}</textarea></div>
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px;align-items:center">
          <span class="hint num" id="sc-count">${wc} từ · khoảng ${fmtMin(est)} khi nói</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-ghost btn-sm" for="sc-file">${ic('upload',16)} Tải file .txt<input type="file" id="sc-file" accept=".txt,.md,text/plain" class="sr-only"></label><button class="btn btn-ghost btn-sm" data-act="use-sample">Dùng kịch bản mẫu</button></div>
        </div>
        ${S.scriptErr ? `<p class="err" role="alert" style="margin-top:10px">${esc(S.scriptErr)}</p>` : ''}
        <div class="flow-actions" style="margin-top:22px"><span class="hint">Cần ít nhất 40 từ.</span><button class="btn btn-primary btn-lg" data-act="script-go">Chấm kịch bản</button></div>
      </div>
      <div class="setup-side">
        <div class="card"><h3>AI sẽ kiểm tra</h3><ul class="unlock" style="margin-top:10px">${['Mở bài có thu hút không','Cấu trúc và từ nối giữa các phần','Câu quá dài, từ thừa','Số liệu và dẫn chứng','Kết bài có lời kêu gọi không',`Thời lượng phù hợp với ${m.name.toLowerCase()} (${m.target[0]}–${m.target[1]} phút)`].map(x => `<li>${ic('check',16)}<span>${x}</span></li>`).join('')}</ul></div>
      </div>
    </div>`);
}
const STOP = new Set(['của','và','cho','với','trong','các','những','một','này','được','không','về','tại','theo','trên','dưới','khi','thì','là','mà','có','để','từ','bài','nói']);
function analyzeScript(text, title, mode){
  const clean = text.replace(/\r/g,'').trim();
  const paras = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const sentences = [];
  paras.forEach((p,pi) => (p.match(/[^.!?…]+[.!?…]*/g) || []).map(x => x.trim()).filter(Boolean).forEach(x => sentences.push({t:x, p:pi, i:sentences.length})));
  const wc = words(clean), estSec = Math.round(wc/130*60), m = MODES[mode], [tmin, tmax] = m.target;
  const norm = ' ' + clean.toLowerCase().replace(/[,.!?…;:()"“”]/g,' ').replace(/\s+/g,' ') + ' ';
  const WEAK = ['thì','kiểu như','cái này','rất là','nói chung','đại loại'];
  const weakCount = {}; WEAK.forEach(w => { const n = norm.split(' '+w+' ').length - 1; if(n) weakCount[w] = n; });
  const weakTotal = Object.values(weakCount).reduce((a,b) => a+b, 0);
  const longS = sentences.filter(s => words(s.t) > 30);
  const numCount = (clean.match(/\d+([.,]\d+)?/g) || []).length;
  const first = sentences[0] ? sentences[0].t : '', last = sentences.length ? sentences[sentences.length-1].t : '';
  const hook = /\?|\d/.test(first) || /(bạn có|chúng ta|hãy tưởng tượng|bạn đã bao giờ)/i.test(first);
  const greet = /^(xin chào|chào|kính thưa|hôm nay)/i.test(first);
  const lastTwo = sentences.slice(-2).map(s => s.t).join(' ');
  const cta = /(cần|đề xuất|kêu gọi|hãy|mời|cùng nhau|đầu tư|hành động|bắt đầu)/i.test(lastTwo);
  const TRANS = ['thứ nhất','thứ hai','đầu tiên','tiếp theo','cuối cùng','ngoài ra','vì vậy','tóm lại','trước hết'];
  const transN = TRANS.filter(t => norm.includes(' '+t+' ')).length;
  const kw = (title || '').toLowerCase().split(/[\s:,.;!?]+/).filter(w => w.length >= 3 && !STOP.has(w));
  const kwHit = kw.length ? kw.filter(w => norm.includes(' '+w)).length/kw.length : .8;
  const lenDiff = estSec < tmin*60 ? (tmin*60-estSec)/60 : estSec > tmax*60 ? (estSec-tmax*60)/60 : 0;
  const scores = {
    content: clamp(58 + Math.min(18, numCount*4) + (paras.length >= 3 ? 6 : 0)),
    structure: clamp(55 + Math.min(20, paras.length*5) + transN*5),
    relevance: clamp(60 + kwHit*35),
    length: clamp(92 - lenDiff*16),
    opening: hook ? 88 : greet ? 55 : 68,
    closing: cta ? 86 : /cảm ơn/i.test(last) ? 58 : 66,
    wording: clamp(92 - longS.length*8 - weakTotal*3),
  };
  const weak = [];
  if(!hook) weak.push({title:'Mở bài chưa có câu thu hút', detail:greet ? 'Bài mở bằng lời chào, chưa cho người nghe lý do để chú ý.' : 'Câu đầu chưa có câu hỏi, con số hay câu chuyện để giữ người nghe.', s:0, fix:'Mở bằng một con số, một câu hỏi hoặc một tình huống ngắn liên quan trực tiếp tới người nghe.'});
  longS.slice(0,2).forEach(s => weak.push({title:`Câu quá dài (${words(s.t)} từ)`, detail:'Câu trên 30 từ khó nói trong một hơi và khó theo dõi khi nghe.', s:s.i, fix:'Tách thành 2 câu, mỗi câu một ý. Xem gợi ý viết lại bên dưới.'}));
  if(weakTotal >= 2){ const wsen = sentences.find(s => WEAK.some(w => (' '+s.t.toLowerCase()+' ').includes(' '+w+' '))); weak.push({title:'Có từ thừa', detail:Object.entries(weakCount).map(([w,n]) => `“${w}” × ${n}`).join(', ') + '.', s:wsen ? wsen.i : null, fix:'Bỏ các từ này khi viết. Khi nói, dừng một nhịp thay vì chêm từ.'}); }
  if(!cta) weak.push({title:'Kết bài chưa có lời kêu gọi', detail:'Người nghe chưa biết bạn muốn họ làm gì sau bài nói.', s:sentences.length-1, fix:mode==='pitching' ? 'Nêu rõ số vốn cần, dùng vào việc gì và mốc thời gian.' : 'Chốt lại 1 thông điệp chính và một việc cụ thể người nghe nên làm.'});
  if(lenDiff > 0) weak.push({title:estSec < tmin*60 ? 'Kịch bản ngắn hơn thời lượng phù hợp' : 'Kịch bản dài hơn thời lượng phù hợp', detail:`Khoảng ${fmtMin(estSec)} khi nói ở 130 từ/phút. Chế độ ${m.name.toLowerCase()} phù hợp ${tmin}–${tmax} phút.`, s:null, fix:estSec < tmin*60 ? 'Thêm 1 ví dụ hoặc số liệu cho mỗi ý chính.' : 'Bỏ bớt ý phụ, giữ tối đa 3 ý chính.'});
  if(transN === 0 && paras.length >= 3) weak.push({title:'Thiếu từ nối giữa các phần', detail:'Các đoạn đứng cạnh nhau nhưng người nghe khó biết khi nào chuyển ý.', s:null, fix:'Thêm “Đầu tiên”, “Tiếp theo”, “Cuối cùng” ở đầu mỗi phần.'});
  if(!numCount) weak.push({title:'Chưa có số liệu', detail:'Bài nói chưa có con số nào để tăng độ tin cậy.', s:null, fix:'Thêm ít nhất 1 số liệu có nguồn cho luận điểm quan trọng nhất.'});
  if(kw.length && kwHit < .5) weak.push({title:'Nội dung chưa bám sát chủ đề', detail:`Kịch bản ít nhắc tới các từ khóa của chủ đề “${title}”.`, s:null, fix:'Nhắc lại chủ đề ở mở bài và kết bài, và nối mỗi ý chính với chủ đề.'});
  const tighten = t => t.replace(/^thì\s+/i,'').replace(/\s+thì\s+/gi,' ').replace(/rất là/gi,'rất').replace(/kiểu như\s*/gi,'').replace(/cái này/gi,'điều này').replace(/\s{2,}/g,' ').trim();
  const splitLong = t => { const ws = t.split(' '); if(ws.length <= 30) return t; const mid = Math.floor(ws.length/2); let k = ws.findIndex((w,j) => j >= mid-6 && /^(và|nhưng|nên|vì)$/i.test(w)); if(k < 0) k = ws.findIndex((w,j) => j >= mid-6 && /,$/.test(w)) + 1; if(k <= 0) return t; const a = ws.slice(0,k).join(' ').replace(/,$/,''), b = ws.slice(k).join(' ').replace(/^(và|nhưng|nên|vì)\s+/i,''); return a + '. ' + b.charAt(0).toUpperCase() + b.slice(1); };
  const rewrites = [];
  sentences.forEach(s => { if(rewrites.length >= 3) return; const n = splitLong(tighten(s.t)); if(n !== s.t && (words(s.t) > 30 || WEAK.some(w => (' '+s.t.toLowerCase()+' ').includes(' '+w+' ')))) rewrites.push({old:s.t, neu:n.charAt(0).toUpperCase() + n.slice(1)}); });
  const issueAt = {}; weak.forEach((w,i) => { if(w.s != null && !(w.s in issueAt)) issueAt[w.s] = i+1; });
  return {scores, wc, estSec, paras, sentences, weak:weak.slice(0,5), rewrites, weakTotal, numCount, issueAt};
}

/* ================= 3. Ứng dụng: Đang phân tích ================= */
let anTimer = null;
function startAnalysis(o){
  const d = S.draft, video = o.video || (d.input === 'upload' && d.file && /^video/.test(d.file.type));
  S.an = {...o, video, i:0, steps:o.kind === 'script' ? AN_STEPS.script : AN_STEPS.speech.filter((s,i) => i !== 5 || video)};
  clearInterval(anTimer);
  anTimer = setInterval(() => {
    if(!S.an){ clearInterval(anTimer); return; }
    S.an.i++;
    if(S.an.i >= S.an.steps.length){ clearInterval(anTimer); finishAnalysis(); return; }
    if(route() === 'dang-phan-tich') render();
  }, 700);
  go('dang-phan-tich');
}
function vAnalyzing(){
  const a = S.an, pct = Math.round(a.i/a.steps.length*100);
  return shell(`<div class="an">
    <div class="eyebrow">Đang xử lý · ${a.kind === 'script' ? 'kịch bản ' + words(a.text) + ' từ' : fmtT(a.dur) + ' bài nói'}</div>
    <h1>AI đang ${a.kind === 'script' ? 'đọc kịch bản' : 'nghe lại bài nói'} của bạn.</h1>
    <p class="muted" style="margin-top:10px">Thường mất dưới 2 phút. Bạn có thể rời trang, báo cáo sẽ được lưu vào mục Tiến bộ.</p>
    <div class="big-meter" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><b style="width:${pct}%"></b></div><div class="muted num" style="font-size:13px;margin-top:6px">${pct}%</div>
    <ul class="an-steps">${a.steps.map((s,i) => `<li class="${i<a.i?'done':i===a.i?'act':''}"><span class="st">${i<a.i ? ic('check',14) : ''}</span>${s}</li>`).join('')}</ul>
  </div>`);
}
const DEFAULT_C = {content:62, structure:56, relevance:70, pace:60, fluency:58, filler:48, body:55};
function finishAnalysis(){
  const a = S.an, d = S.draft, id = 's' + Date.now(), date = today(), here = route() === 'dang-phan-tich';
  let s;
  if(a.kind === 'script'){
    const res = analyzeScript(a.text, d.title, d.mode);
    s = mkSession(id, d.title || `Kịch bản ${MODES[d.mode].name.toLowerCase()} ${fmtD(date)}`, d.mode, date, res.estSec, res.scores, res.weakTotal, 'script', d.lang);
    s.script = res; s.text = a.text;
  } else {
    const base = S.sessions.filter(x => x.input !== 'script').pop(), c = {};
    Object.keys(CRIT).forEach(k => { c[k] = k === 'body' && !a.video ? null : clamp(((base && base.c[k]) ?? DEFAULT_C[k]) + Math.round(Math.random()*6 - 2)); });
    const title = d.placement ? 'Giới thiệu bản thân (bài test đầu vào)' : (d.title || `${MODES[d.mode].name} ${fmtD(date)}`);
    s = mkSession(id, title, d.mode, date, a.dur, c, base ? Math.max(3, base.fillers-1) : 14, d.input === 'upload' ? (a.video ? 'video' : 'audio') : d.input, d.lang);
    s.media = a.media || (d.input === 'upload' && d.file ? {url:d.file.url, mime:d.file.type} : null);
  }
  s.placement = !!d.placement;
  S.sessions.push(s); S.currentId = id; S.qa = {}; S.an = null;
  if(s.placement){
    S.placementResult = {id, score:s.score, level:level(s.score)};
    S.draft = freshDraft(S.user.goal, S.user.lang);
    toast('Đã có kết quả bài test đầu vào');
    if(here || ['bai-test','buoi-dau'].includes(route())) go('tong-quan'); else render();
  } else {
    S.used++;
    toast('Báo cáo đã sẵn sàng');
    if(here) go('bao-cao'); else render();
  }
}

/* ================= Báo cáo ================= */
const PLACEMENT_REPORT = {
  dur:62,
  segments:[
    {t:'00:00',p:[['n','Dạ, '],['f','ừm'],['n',' em chào mọi người, em tên là Lan Anh, sinh viên năm hai ngành Quản trị kinh doanh.']],issue:1},
    {t:'00:12',p:[['n','Điều em tự hào nhất là '],['f','à'],['n',' dẫn dắt nhóm 5 người giành giải nhì cuộc thi khởi nghiệp của trường.']]},
    {t:'00:31',p:[['n','Thì '],['f','kiểu như'],['n',' em hay bị run khi đứng trước đông người, nên em muốn luyện để tự tin hơn.']],issue:2},
    {t:'00:50',p:[['n','Mục tiêu của em là thuyết trình tốt môn Khởi nghiệp vào cuối kỳ. '],['f','Ừm'],['n',', em hết rồi ạ.']],issue:3},
  ],
  weak:[
    {title:'Từ đệm ở câu mở đầu', detail:'“Dạ, ừm” khiến phần chào hỏi thiếu chắc chắn.', seg:0, fix:'Bắt đầu thẳng bằng tên: “Em là Lan Anh, sinh viên năm hai…”'},
    {title:'Nói về điểm yếu nhưng thiếu hành động', detail:'Câu về việc hay run chưa cho thấy bạn đang làm gì để cải thiện.', seg:2, fix:'Thêm một hành động cụ thể: “…nên mỗi tuần em luyện nói 2 lần.”'},
    {title:'Kết bài đột ngột', detail:'“Em hết rồi ạ” làm bài nói dừng lại thay vì kết thúc.', seg:3, fix:'Kết bằng mục tiêu: “Cuối kỳ này, em muốn tự tin trình bày trước cả lớp.”'},
  ],
  pace:[138],
  marks:[
    {t:'00:01',type:'filler',seg:0,label:'“Dạ, ừm” ở câu mở đầu'},
    {t:'00:12',type:'good',seg:1,label:'Nêu thành tích cụ thể'},
    {t:'00:31',type:'filler',seg:2,label:'“Thì kiểu như”'},
    {t:'00:55',type:'filler',seg:3,label:'Kết bằng “ừm, em hết rồi ạ”'},
  ],
  rewrites:[
    {old:'Dạ, ừm em chào mọi người, em tên là Lan Anh, sinh viên năm hai ngành Quản trị kinh doanh.', neu:'Em là Lan Anh, sinh viên năm hai ngành Quản trị kinh doanh.'},
    {old:'Ừm, em hết rồi ạ.', neu:'Cuối kỳ này, em muốn tự tin trình bày trước cả lớp. Em cảm ơn.'},
  ],
};
function vReport(isSample){
  const s = isSample ? demoSessions()[6] : current();
  const m = MODES[s.mode], idx = S.sessions.indexOf(s), prev = idx > 0 ? S.sessions[idx-1] : null;
  const isScript = s.input === 'script', R = s.placement ? PLACEMENT_REPORT : SAMPLE_REPORT;
  const crit = isScript ? SCRIPT_CRIT : CRIT;
  const critBars = Object.entries(crit).filter(([k]) => s.c[k] != null).map(([k,l]) => barRow(l, s.c[k])).join('');
  const ranked = Object.entries(crit).filter(([k]) => s.c[k] != null).sort((a,b) => s.c[b[0]] - s.c[a[0]]);
  const summary = isScript
    ? `<h3 style="font-size:19px">Điểm mạnh nhất: ${ranked[0][1].toLowerCase()}. Cần ưu tiên: ${ranked[ranked.length-1][1].toLowerCase()}.</h3><p class="muted" style="margin-top:6px;font-size:14px">Kịch bản ${s.script.wc} từ, ${s.script.paras.length} đoạn, khoảng ${fmtMin(s.script.estSec)} khi nói. ${s.script.weak.length ? `AI tìm thấy ${s.script.weak.length} điểm cần sửa.` : 'AI không tìm thấy lỗi lớn.'}</p>`
    : s.placement
      ? `<h3 style="font-size:19px">Giới thiệu rõ ràng, có thành tích cụ thể. Phần mở và kết còn yếu.</h3><p class="muted" style="margin-top:6px;font-size:14px">Đây là điểm xuất phát của bạn. Lộ trình gợi ý bắt đầu với mở bài và từ đệm.</p>`
      : `<h3 style="font-size:19px">Bố cục rõ, số liệu thuyết phục. Phần mở và kết còn yếu.</h3><p class="muted" style="margin-top:6px;font-size:14px">Bạn trình bày đủ ba phần và dùng dẫn chứng tốt. Ưu tiên luyện 40 giây đầu: đây là nơi tập trung nhiều từ đệm nhất và chưa có câu thu hút.</p>`;
  const saved = S.library.some(l => l.sid === s.id);
  const acts = isSample ? `<button class="btn btn-primary btn-sm" data-go="gioi-thieu">Luyện bài của bạn</button>`
    : `<button class="btn btn-ghost btn-sm" data-act="retry">Luyện lại</button><button class="btn ${saved?'btn-ghost':'btn-primary'} btn-sm" data-act="${saved?'go-lib':'save-lib'}">${saved ? ic('check',16) + ' Đã lưu, mở thư viện' : ic('lib',16) + ' Lưu vào thư viện'}</button>`;
  const userMade = !isSample && !s.id.match(/^s\d$/) && !isScript;
  let html = `
    <div class="page-head"><div><div class="eyebrow">${s.placement ? 'Bài test đầu vào · ' : ''}Báo cáo · ${fmtDL(s.date)}</div><h1 style="margin-top:6px">${esc(s.title)}</h1><p>${m.name} · ${LANGS[s.lang]} · ${INPUTS[s.input]} · ${isScript ? 'ước tính ' : ''}${fmtT(s.dur)}</p></div><div class="rep-actions">${acts}</div></div>
    ${isSample ? `<div class="banner"><div><h3>Đây là báo cáo mẫu</h3><p>Bài thuyết trình 4 phút của một sinh viên năm hai, phân tích từ video. Phần Premium được làm mờ.</p></div></div>` : ''}
    ${userMade ? `<div class="banner"><div><h3>Bản thử nghiệm chưa kết nối AI phân tích giọng nói</h3><p>Điểm, bản chép lời và gợi ý bên dưới là dữ liệu mẫu. Bản ghi của bạn vẫn được lưu để nghe lại.</p></div></div>` : ''}
    ${isScript ? `<div class="banner good"><div><h3>Phân tích tự động trên kịch bản bạn gửi</h3><p>Điểm và lỗi dưới đây được tính từ chính nội dung kịch bản.</p></div></div>` : ''}
    <div class="card"><div class="rep-top">${ring(s.score)}<div style="min-width:0">
      <div class="chips" style="margin-bottom:12px"><span class="chip sky">Trình độ: ${level(s.score)}</span>${prev ? `<span class="chip ${s.score>=prev.score?'good':'bad'}">${s.score>=prev.score?'+':''}${s.score-prev.score} so với lần trước</span>` : ''}<span class="chip line">${isScript ? s.script.weakTotal + ' từ thừa' : s.fillers + ' từ đệm'}</span></div>
      ${summary}<div class="crit">${critBars}</div>
    </div></div></div>`;
  html += isScript ? reportScriptBody(s, m) : reportSpeechBody(s, m, R);
  return isSample ? pubBar() + `<div class="wrap" style="padding-block:32px 96px">${html}</div>` : shell(html);
}
function weakList(items, quote){
  if(!items.length) return '<div class="empty" style="margin-top:12px"><b>Không có lỗi lớn</b><span>Kịch bản đã ổn. Thử ghi âm để luyện phần nói.</span></div>';
  return items.map((w,i) => `<div class="weak-item"><span class="ix">${i+1}</span><div style="min-width:0"><h4>${w.title}</h4><p class="muted" style="font-size:14px;margin-top:4px">${w.detail}</p>${quote(w)}<div class="fix"><b>Sửa:</b><span>${w.fix}</span></div></div></div>`).join('');
}
function reportSpeechBody(s, m, R){
  const hasBody = s.c.body != null;
  return `
    <div class="grid g-main mt">
      <div class="card"><h3>Điểm cần cải thiện</h3><div class="sub">${R.weak.length} vấn đề nổi bật nhất, xếp theo mức ảnh hưởng</div>
        <div style="margin-top:6px">${weakList(R.weak, w => `<div class="quote" style="margin-top:10px"><small>Bản chép lời · ${R.segments[w.seg].t} · <button class="btn-link" style="font-size:12px" data-act="seg" data-i="${w.seg}">Xem trong bản chép lời</button></small>“${esc(R.segments[w.seg].p.map(x => x[1]).join(''))}”</div>`)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="card"><h3>Tốc độ nói</h3><div class="sub">Từ/phút. Vùng xanh 120–150 là dễ nghe.</div><div style="margin-top:10px">${paceChart(R.pace)}</div></div>
        ${qaCard(m)}
      </div>
    </div>
    ${timelineCard(R)}
    <div class="card mt"><h3>Ngôn ngữ cơ thể</h3><div class="sub">${hasBody ? 'Phân tích từ video: ánh mắt, cử chỉ, biểu cảm, tư thế' : 'Bài này nộp bằng âm thanh. Quay video để nhận phân tích ngôn ngữ cơ thể.'}</div>
      ${hasBody ? `<div class="body-l">${SAMPLE_REPORT.body.map(b => `<div class="card"><div class="muted" style="font-size:13px">${b.k}</div><div style="font-size:22px;font-weight:700;margin-top:2px">${b.v}</div><div class="status" style="color:var(--${b.s})">${b.s==='good'?'Tốt':b.s==='bad'?'Cần sửa':'Cần chú ý'}</div><p class="muted" style="font-size:13px;margin-top:6px">${b.note}</p></div>`).join('')}</div>
      <div class="fix" style="margin-top:14px"><b>Gợi ý:</b><span>In dàn ý cỡ chữ lớn, mỗi ý một dòng, để chỉ cần liếc. Đứng hai chân rộng bằng vai và chọn 3 điểm nhìn trong phòng.</span></div>` : (S.user ? `<button class="btn btn-ghost btn-sm" style="margin-top:12px" data-act="retry-video">Luyện lại bằng video</button>` : '')}
    </div>
    <div class="grid g-2 mt">
      <div class="card"><h3>Bản chép lời</h3><div class="sub"><span style="color:var(--bad);font-weight:600">Chữ đỏ</span>: từ đệm · số: điểm yếu tương ứng</div>
        <div class="transcript" style="margin-top:12px">${R.segments.map((sg,i) => `<div class="seg-t" id="seg-${i}"><span class="ts num">${sg.t}</span><span>${sg.p.map(([t,x]) => t==='f' ? `<span class="f">${esc(x)}</span>` : esc(x)).join('')}${sg.issue ? `<span class="iss">#${sg.issue}</span>` : ''}</span></div>`).join('')}</div>
      </div>
      <div class="card"><h3>Diễn đạt tốt hơn</h3><div class="sub">Phiên bản đề xuất cho các câu chưa rõ</div>
        <div style="margin-top:10px">${R.rewrites.map(w => `<div class="rewrite"><div class="old"><small>Bạn đã nói</small>${esc(w.old)}</div><div class="new"><small>Thử nói</small>${esc(w.neu)}</div></div>`).join('')}</div>
      </div>
    </div>`;
}
function reportScriptBody(s, m){
  const r = s.script, [tmin, tmax] = m.target;
  const sentHtml = r.paras.map((_,pi) => `<p>${r.sentences.filter(x => x.p === pi).map(x => r.issueAt[x.i] ? `<mark id="sen-${x.i}">${esc(x.t)}</mark><span class="iss">#${r.issueAt[x.i]}</span>` : esc(x.t)).join(' ')}</p>`).join('');
  return `
    <div class="grid g-main mt">
      <div class="card"><h3>Điểm cần cải thiện</h3><div class="sub">Xếp theo mức ảnh hưởng tới người nghe</div>
        <div style="margin-top:6px">${weakList(r.weak, w => w.s != null && r.sentences[w.s] ? `<div class="quote" style="margin-top:10px"><small>Trong kịch bản · <button class="btn-link" style="font-size:12px" data-act="sen" data-i="${w.s}">Xem vị trí</button></small>“${esc(r.sentences[w.s].t)}”</div>` : '')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="card"><h3>Số liệu kịch bản</h3>
          <div class="kv"><span>Số từ</span><b class="num">${r.wc}</b><span>Số đoạn</span><b class="num">${r.paras.length}</b><span>Số câu</span><b class="num">${r.sentences.length}</b><span>Thời lượng khi nói (130 từ/phút)</span><b class="num">${fmtMin(r.estSec)}</b><span>Phù hợp với ${m.name.toLowerCase()}</span><b class="num">${tmin}–${tmax} phút</b><span>Số liệu, con số</span><b class="num">${r.numCount}</b></div>
        </div>
        ${qaCard(m)}
      </div>
    </div>
    <div class="grid g-2 mt">
      <div class="card"><h3>Kịch bản của bạn</h3><div class="sub">Câu được tô màu có số là điểm yếu tương ứng</div><div class="script-view" style="margin-top:12px">${sentHtml}</div></div>
      <div class="card"><h3>Viết lại tốt hơn</h3><div class="sub">Gợi ý gọn hơn, dễ nói hơn</div>
        <div style="margin-top:10px">${r.rewrites.length ? r.rewrites.map(w => `<div class="rewrite"><div class="old"><small>Bạn đã viết</small>${esc(w.old)}</div><div class="new"><small>Thử viết</small>${esc(w.neu)}</div></div>`).join('') : '<p class="muted" style="font-size:14px">Không có câu nào cần viết lại.</p>'}</div>
      </div>
    </div>`;
}
function timelineCard(R){
  const sec = t => { const [a,b] = t.split(':'); return +a*60 + +b; };
  const ticks = Array.from({length:5}, (_,i) => fmtT(Math.round(R.dur*i/4)));
  const html = `<div class="card mt"><div class="card-head"><div class="t"><h3>Dòng thời gian lỗi</h3>${proChip}</div></div><div class="sub">Mỗi chấm là một khoảnh khắc AI ghi nhận. Bấm để xem đoạn bản chép lời tương ứng.</div>
    <div class="tl"><div class="tl-track"></div>${R.marks.map(k => `<button class="tl-m" style="left:${sec(k.t)/R.dur*100}%" data-act="seg" data-i="${k.seg}" aria-label="${k.t}: ${esc(k.label)}" title="${k.t} · ${esc(k.label)}"><i style="background:var(--${MARK[k.type][1]})"></i></button>`).join('')}</div>
    <div class="tl-ticks num">${ticks.map(x => `<span>${x}</span>`).join('')}</div>
    <div class="legend">${Object.values(MARK).map(([l,c]) => `<span><i style="background:var(--${c});height:8px;width:8px;border-radius:50%"></i>${l}</span>`).join('')}</div>
    <div class="tl-list">${R.marks.map(k => `<button class="tl-item" data-act="seg" data-i="${k.seg}"><span class="num muted">${k.t}</span><span class="dot" style="background:var(--${MARK[k.type][1]})"></span><span>${esc(k.label)}</span></button>`).join('')}</div>
  </div>`;
  return gate(html, 'Dòng thời gian lỗi', 'Xem chính xác giây nào bạn nói nhanh, dùng từ đệm hay rời mắt khỏi khán giả.');
}
function qaCard(m){
  const ini = m.persona.split(' ').pop()[0];
  const items = m.questions.map((q,i) => {
    const a = S.qa[i] || {};
    let body = '';
    if(isPro() && a.open){
      body = `<div class="qa-ans"><label class="muted" for="qa-${i}" style="font-size:12px;font-weight:600">Câu trả lời của bạn</label><textarea class="input" id="qa-${i}" data-qa-text="${i}" placeholder="Gõ câu trả lời như khi đứng trước ${m.persona}…">${esc(a.text || '')}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-act="qa-grade" data-i="${i}" ${a.state==='loading'?'disabled':''}>${a.state==='loading' ? 'AI đang chấm…' : 'Chấm câu trả lời'}</button><button class="btn-text" style="font-size:13px" data-act="qa-open" data-i="${i}">Thu gọn</button></div>
        ${a.fb ? `<div class="fb" role="status"><div style="display:flex;gap:8px;align-items:center"><span class="score-pill num ${sCls(a.fb.score)}">${a.fb.score}</span><b>${a.fb.head}</b></div>${a.fb.points.map(x => `<div>${x}</div>`).join('')}<div class="muted" style="font-size:13px"><b>Khung trả lời gợi ý:</b> trả lời thẳng trong 1 câu, đưa 1 bằng chứng hoặc con số, rồi nối lại thông điệp chính.</div></div>` : ''}
      </div>`;
    }
    return `<div class="qa-item"><div class="avatar sm">${ini}</div><div style="min-width:0"><div class="quote">“${q}”</div>${!a.open ? `<button class="btn-text" style="font-size:13px;margin-top:4px" data-act="qa-open" data-i="${i}">${isPro() ? (a.fb ? 'Xem lại câu trả lời' : 'Trả lời phản biện') : 'Trả lời phản biện · Premium'}</button>` : ''}${body}</div></div>`;
  }).join('');
  return `<div class="card"><div class="card-head"><div class="t"><h3>Câu hỏi phản biện từ ${m.persona}</h3>${proChip}</div></div><div class="sub">${m.role}. Trả lời ngay để AI chấm phần hỏi đáp.</div><div class="qa">${items}</div></div>`;
}
function gradeAnswer(text, mode){
  const n = words(text), hasNum = /\d/.test(text), fill = (text.match(/(^|[\s,.])(ừm|ờ|à|kiểu như|um|uh)(?=[\s,.!?]|$)/giu) || []).length;
  const score = clamp(60 + Math.min(20, n/3) + (hasNum?10:0) - fill*4, 45, 92);
  const points = [n < 15 ? `• Câu trả lời còn ngắn (${n} từ). Người hỏi cần thêm lý do hoặc ví dụ.` : `• Độ dài phù hợp (${n} từ), đủ để trả lời trong khoảng 30–45 giây.`,
    hasNum ? '• Có số liệu cụ thể, tăng độ tin cậy.' : '• Chưa có con số nào. Thêm một số liệu sẽ thuyết phục hơn' + (mode==='pitching' ? ', nhất là với nhà đầu tư.' : '.')];
  if(fill) points.push(`• Có ${fill} từ đệm trong câu trả lời. Dừng 1 giây thay vì nói “ừm”.`);
  return {score, head:score >= 75 ? 'Trả lời thuyết phục' : score >= 60 ? 'Ổn, có thể gọn và chắc hơn' : 'Chưa thuyết phục', points};
}

/* ================= 3. Ứng dụng: Thư viện bài nói ================= */
function libItemFrom(s, sample=false){
  const item = {id:'l' + s.id, sid:s.id, title:s.title, date:s.date, dur:s.dur, kind:s.input, url:null, mime:null, sample};
  if(s.media && s.media.url){ item.url = s.media.url; item.mime = s.media.mime; }
  else if(s.input === 'script' && s.text){ item.url = URL.createObjectURL(new Blob([s.text], {type:'text/plain;charset=utf-8'})); item.mime = 'text/plain'; }
  return item;
}
const extOf = mime => !mime ? '' : /text/.test(mime) ? '.txt' : /mp4/.test(mime) ? '.mp4' : /ogg/.test(mime) ? '.ogg' : /mpeg|mp3/.test(mime) ? '.mp3' : /wav/.test(mime) ? '.wav' : '.webm';
function vLibrary(){
  const L = S.library.slice().reverse();
  const row = l => {
    const icn = l.kind === 'script' ? 'doc' : l.kind === 'video' ? 'video' : 'mic';
    const playLabel = l.kind === 'script' ? 'Xem kịch bản' : l.kind === 'video' ? 'Xem lại' : 'Nghe lại';
    const open = S.openLib === l.id;
    const player = open && l.url ? (l.kind === 'script' ? '' : /video/.test(l.mime || '') ? `<div class="lib-player"><video src="${l.url}" controls playsinline></video></div>` : `<div class="lib-player"><audio src="${l.url}" controls></audio></div>`) : '';
    return `<div class="lib-row"><div class="lib-ic">${ic(icn)}</div><div style="min-width:0"><div class="row-t">${esc(l.title)}</div><div class="row-m">${fmtDL(l.date)} · ${INPUTS[l.kind] || 'Ghi âm'} · ${fmtT(l.dur)}${l.sample ? ' · bản mẫu, không có tệp' : ''}</div></div>
      <div class="lib-acts">
        <button class="btn btn-ghost btn-sm" data-act="lib-play" data-id="${l.id}" aria-expanded="${open}">${ic(l.kind==='script'?'doc':'play',14)} ${open && l.kind !== 'script' ? 'Đóng' : playLabel}</button>
        ${l.url ? `<a class="btn btn-ghost btn-sm" href="${l.url}" download="${slug(l.title)}${extOf(l.mime)}">${ic('down',14)} Tải về</a>` : `<button class="btn btn-ghost btn-sm" disabled title="Bản mẫu không có tệp để tải">${ic('down',14)} Tải về</button>`}
        <button class="btn btn-ghost btn-sm" data-act="lib-del" data-id="${l.id}" aria-label="Xóa ${esc(l.title)}">${ic('trash',14)} Xóa</button>
      </div>${player}
      ${S.confirmDel === l.id ? `<div class="confirm" role="alertdialog" aria-label="Xác nhận xóa"><span>Xóa bài này khỏi thư viện? Báo cáo vẫn còn trong mục Tiến bộ.</span><span style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" data-act="lib-del-no">Hủy</button><button class="btn btn-danger btn-sm" data-act="lib-del-yes" data-id="${l.id}">Xóa</button></span></div>` : ''}
    </div>`;
  };
  return shell(`
    <div class="page-head"><div><h1>Thư viện bài nói</h1><p>Nghe lại, tải về hoặc xóa các bài nói và kịch bản bạn đã lưu.</p></div><button class="btn btn-primary" data-go="luyen-tap">Luyện bài mới</button></div>
    <div class="card">${L.length ? `<div class="list">${L.map(row).join('')}</div>` : `<div class="empty"><b>Chưa có bài nào được lưu</b><span>Mở một báo cáo và bấm “Lưu vào thư viện”.</span><button class="btn btn-ghost btn-sm" data-go="tien-bo">Xem các báo cáo</button></div>`}</div>`);
}

/* ================= 3. Ứng dụng: Tiến bộ ================= */
function planCard(){
  const all = PLAN4.flatMap(w => w.items), done = all.filter(([id]) => S.planDone[id]).length;
  const html = `<div class="card"><div class="card-head"><div><div class="t"><h3>Lộ trình luyện tập 4 tuần</h3>${proChip}</div><div class="sub">AI lập từ các báo cáo gần nhất: ưu tiên mở bài, nhịp nói và ánh mắt.</div></div><span class="num" style="font-weight:700">${done}/${all.length} việc</span></div>
    <div class="meter"><b style="width:${done/all.length*100}%;background:var(--good)"></b></div>
    <div class="weeks">${PLAN4.map((w,i) => `<div class="week ${i===1?'now':''}"><div class="wk">${w.w}${i===1 ? ' · tuần này' : ''}</div><h4>${w.t}</h4><div style="margin-top:6px">${w.items.map(([id,t]) => `<button class="check ${S.planDone[id]?'done':''}" data-act="plan-check" data-id="${id}" aria-pressed="${!!S.planDone[id]}"><span class="box">${S.planDone[id] ? ic('check',12) : ''}</span><span class="t">${t}</span></button>`).join('')}</div></div>`).join('')}</div>
  </div>`;
  return gate(html, 'Lộ trình luyện tập cá nhân', 'AI đọc toàn bộ lịch sử luyện tập và lập kế hoạch 4 tuần tập trung vào lỗi bạn hay mắc nhất.');
}
function vProgress(){
  const ss = S.sessions;
  if(!ss.length) return shell(`<div class="page-head"><div><h1>Tiến bộ</h1><p>Lịch sử, so sánh và lộ trình luyện tập.</p></div></div><div class="empty"><b>Chưa có lần luyện nào</b><span>Sau mỗi buổi luyện, báo cáo được lưu ở đây.</span><button class="btn btn-primary btn-sm" data-go="luyen-tap">Luyện tập</button></div><div class="mt">${planCard()}</div>`);
  const speech = ss.filter(s => s.input !== 'script');
  const pool = isPro() ? ss : ss.slice(-3), maxPick = isPro() ? 5 : 3;
  S.compare = S.compare.filter(id => pool.some(s => s.id === id));
  if(S.compare.length < Math.min(2, pool.length)) S.compare = pool.slice(-Math.min(3, pool.length)).map(s => s.id);
  const picks = S.compare.map(id => ss.find(s => s.id === id)).sort((a,b) => ss.indexOf(a) - ss.indexOf(b));
  const rowsDef = [['Điểm tổng', s => s.score, 'max'], ...Object.entries(CRIT).map(([k,l]) => [l, s => s.input === 'script' ? null : s.c[k], 'max']), ['Từ đệm / từ thừa', s => s.fillers, 'min']];
  const table = picks.length >= 2 ? `<div class="tbl-wrap" style="margin-top:16px"><table><thead><tr><th>Tiêu chí</th>${picks.map(s => `<th>${fmtD(s.date)} · ${MODES[s.mode].name}${s.input==='script' ? ' (kịch bản)' : ''}</th>`).join('')}</tr></thead><tbody>${rowsDef.map(([l,f,dir]) => { const vals = picks.map(f), nums = vals.filter(v => v != null); const best = nums.length >= 2 ? (dir === 'max' ? Math.max(...nums) : Math.min(...nums)) : null; return `<tr><td>${l}</td>${vals.map(v => `<td class="num ${v != null && v === best ? 'best' : ''}">${v ?? '–'}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>` : '<p class="muted" style="margin-top:12px;font-size:14px">Chọn ít nhất 2 lần luyện để so sánh.</p>';
  return shell(`
    <div class="page-head"><div><h1>Tiến bộ</h1><p>${ss.length} lần luyện · lưu toàn bộ báo cáo.</p></div><button class="btn btn-primary" data-go="luyen-tap">Luyện thêm</button></div>
    ${planCard()}
    <div class="grid g-main mt">
      <div class="card"><h3>Điểm tổng và độ trôi chảy</h3><div class="sub">Thang 100 · các bài nói (không gồm kịch bản)</div><div style="margin-top:10px">${speech.length > 1 ? lineChart(speech.map(s => ({label:fmtD(s.date), v:s.score})), {series2:speech.map(s => s.c.fluency)}) + `<div class="legend"><span><i style="background:var(--blue)"></i>Điểm tổng</span><span><i style="background:var(--sky)"></i>Độ trôi chảy</span></div>` : '<div class="empty"><span>Cần ít nhất 2 bài nói để vẽ biểu đồ.</span></div>'}</div></div>
      <div class="card"><h3>Từ đệm mỗi bài</h3><div class="sub">${speech.length > 1 ? `Giảm ${speech[0].fillers - speech[speech.length-1].fillers} lần so với bài đầu` : 'Theo từng bài nói'}</div>
        <div style="display:flex;align-items:flex-end;gap:6px;height:150px;margin-top:18px" role="img" aria-label="Số từ đệm mỗi bài">${speech.map(s => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;min-width:0"><span class="num" style="font-size:11px;font-weight:700">${s.fillers}</span><div style="width:100%;max-width:26px;border-radius:5px 5px 2px 2px;background:var(--${s.fillers>14?'bad':s.fillers>9?'warn':'good'});height:${Math.max(4, s.fillers/22*100)}%"></div><span class="muted num" style="font-size:10px">${fmtD(s.date)}</span></div>`).join('')}</div>
      </div>
    </div>
    <div class="card mt"><div class="card-head"><div><h3>So sánh nhiều lần luyện</h3><div class="sub">Chọn 2–${maxPick} lần. ${isPro() ? 'Premium chọn được bất kỳ lần nào.' : 'Gói Miễn phí so sánh trong 3 lần gần nhất.'} Ô xanh là kết quả tốt nhất.</div></div>${isPro() ? '' : '<button class="btn-link" style="font-size:13px" data-go="goi-dich-vu">Premium không giới hạn</button>'}</div>
      <div class="cmp-picks">${pool.slice().reverse().map(s => { const on = S.compare.includes(s.id); return `<button class="cmp-pick ${on?'on':''}" data-act="cmp" data-id="${s.id}" aria-pressed="${on}"><span class="box">${on ? ic('check',11) : ''}</span><span>${fmtD(s.date)} · ${esc(s.title)}</span></button>`; }).join('')}</div>
      ${table}
    </div>
    <div class="card mt"><h3>Tất cả báo cáo</h3><div class="list" style="margin-top:6px">${ss.slice().reverse().map(rowHtml).join('')}</div></div>`);
}

/* ================= Gói dịch vụ ================= */
function vPricing(inApp){
  const li = (t, ok=true) => `<li class="${ok?'':'no'}">${ic(ok?'check':'x',16)}<span>${t}</span></li>`;
  const pro = inApp && isPro();
  const rows = [['Lượt phân tích mỗi tháng','3','50'],['Thời lượng tối đa mỗi bài','5 phút','30 phút'],['Ghi âm, tải file âm thanh','✓','✓'],['Chấm kịch bản','✓','✓'],['Thư viện bài nói: nghe lại, tải về, xóa','✓','✓'],['Quay video, phân tích ngôn ngữ cơ thể','–','✓'],['Nhắc nhở thời gian thực khi đang nói','–','✓'],['Trả lời phản biện của khán giả AI','Xem câu hỏi','Trả lời và được chấm'],['Dòng thời gian lỗi trong báo cáo','–','✓'],['Lộ trình luyện tập 4 tuần','–','✓'],['So sánh nhiều lần luyện','3 lần gần nhất','Tối đa 5 lần bất kỳ']];
  const freeBtn = !inApp ? `<button class="btn btn-ghost" data-go="gioi-thieu">Bắt đầu miễn phí</button>` : `<button class="btn btn-ghost" disabled>${pro ? 'Gói cơ bản' : 'Gói hiện tại'}</button>`;
  const proBtn = !inApp ? `<button class="btn btn-primary" data-go="dang-ky">Đăng ký để nâng cấp</button>` : pro ? `<button class="btn btn-ghost" data-go="tai-khoan">Quản lý gói trong Tài khoản</button>` : `<button class="btn btn-primary" data-act="buy">Nâng cấp Premium</button>`;
  const html = `
    <div class="page-head"><div><h1>${inApp ? 'Gói dịch vụ' : 'Bảng giá'}</h1><p>${pro ? 'Bạn đang dùng Premium. Cảm ơn bạn đã luyện tập cùng chúng tôi.' : 'Bắt đầu miễn phí. Nâng cấp khi bạn cần luyện nhiều hơn.'}</p></div></div>
    <div class="price-grid">
      <div class="price"><div><div class="eyebrow">Miễn phí</div><div class="amt num" style="margin-top:6px">0đ</div><div class="muted">Không giới hạn thời gian</div></div>
        <ul>${li('3 lượt phân tích mỗi tháng, tối đa 5 phút mỗi bài')}${li('Ghi âm, tải file âm thanh, chấm kịch bản')}${li('Báo cáo điểm, bản chép lời, từ đệm')}${li('Thư viện bài nói')}${li('Phân tích video và ngôn ngữ cơ thể', false)}${li('Khán giả AI và nhắc nhở thời gian thực', false)}</ul>${freeBtn}</div>
      <div class="price pro-card"><div><div class="eyebrow">Premium</div><div class="amt num" style="margin-top:6px">${fmtVND(PRICE.m)}<span style="font-size:16px;font-weight:500" class="muted"> /tháng</span></div><div class="muted">hoặc ${fmtVND(PRICE.y)}/năm, tiết kiệm 28%</div></div>
        <ul>${li('50 lượt phân tích mỗi tháng, tối đa 30 phút mỗi bài')}${li('Phân tích video: ánh mắt, biểu cảm, cử chỉ, tư thế')}${li('Nhắc nhở thời gian thực khi đang nói')}${li('Trả lời phản biện của khán giả AI')}${li('Dòng thời gian lỗi và lộ trình 4 tuần')}${li('So sánh tối đa 5 lần luyện bất kỳ')}</ul>${proBtn}</div>
    </div>
    <div class="card" style="margin-top:24px;max-width:880px"><h3>So sánh chi tiết</h3>
      <div class="tbl-wrap" style="margin-top:10px"><table><thead><tr><th>Tính năng</th><th>Miễn phí</th><th>Premium</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="${r[1]==='–'?'muted':''}">${r[1]}</td><td style="font-weight:600">${r[2]}</td></tr>`).join('')}</tbody></table></div>
    </div>
    <div style="margin-top:32px;max-width:880px"><h3 style="font-size:18px;margin-bottom:8px">Câu hỏi thường gặp</h3>
      ${[['Tôi có thể hủy Premium bất cứ lúc nào không?','Có. Tắt tự động gia hạn trong mục Tài khoản. Bạn vẫn dùng Premium đến hết chu kỳ đã trả, sau đó tài khoản về gói Miễn phí và giữ nguyên lịch sử luyện tập.'],['Lượt phân tích chưa dùng có cộng dồn sang tháng sau không?','Không. Lượt phân tích làm mới vào ngày 1 hằng tháng. Bài test đầu vào không tính lượt.'],['Bản ghi của tôi có bị chia sẻ cho ai không?','Không. Bản ghi chỉ dùng để phân tích bài nói của bạn, và bạn có thể xóa bất cứ lúc nào trong Thư viện bài nói.'],['Thanh toán bằng cách nào?','MoMo, VNPay hoặc thẻ quốc tế. Bản thử nghiệm này không thực hiện giao dịch thật.']].map(([q,a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}
    </div>`;
  return inApp ? shell(html) : pubBar() + `<div class="wrap" style="padding-block:40px 96px">${html}</div>`;
}

/* ================= Tài khoản ================= */
function vAccount(){
  const u = S.user, ss = S.sessions, best = ss.length ? ss.reduce((a,s) => s.score > a.score ? s : a, ss[0]) : null;
  const modeCount = {}; ss.forEach(s => modeCount[s.mode] = (modeCount[s.mode] || 0) + 1);
  const topMode = Object.entries(modeCount).sort((a,b) => b[1]-a[1])[0];
  const manage = `<div class="card mt"><div class="card-head"><div class="t"><h3>Quản lý gói Premium</h3>${proChip}</div></div>
      <div class="grid g-2">
        <div><div class="kv"><span>Chu kỳ</span><b>${S.cycle==='m' ? 'Hằng tháng · ' + fmtVND(PRICE.m) : 'Hằng năm · ' + fmtVND(PRICE.y)}</b><span>${S.autoRenew ? 'Gia hạn tiếp theo' : 'Hết hạn vào'}</span><b class="num">${S.expiry ? fmtDL(S.expiry) : '–'}</b><span>Phương thức</span><b>${S.payMethod}</b><span>Tự động gia hạn</span><button class="switch ${S.autoRenew?'on':''}" data-act="autorenew" role="switch" aria-checked="${S.autoRenew}" aria-label="Tự động gia hạn"></button></div>
          ${S.autoRenew ? '' : `<p class="muted" style="font-size:13px;margin-top:12px">Bạn vẫn dùng Premium đến ${fmtDL(S.expiry)}, sau đó tài khoản về gói Miễn phí. Lịch sử luyện tập được giữ nguyên.</p>`}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">${S.cycle==='m' ? '<button class="btn btn-ghost btn-sm" data-act="to-yearly">Chuyển sang gói năm, tiết kiệm 28%</button>' : ''}<button class="btn-text" style="font-size:13px" data-act="demo-plan" data-plan="free">Quay lại gói Miễn phí (bản thử nghiệm)</button></div></div>
        <div><div class="sec-t" style="margin-top:14px">Lịch sử thanh toán</div><div class="tbl-wrap"><table><thead><tr><th>Mã hóa đơn</th><th>Ngày</th><th>Số tiền</th><th>Phương thức</th></tr></thead><tbody>${S.invoices.slice().reverse().map(v => `<tr><td class="num">${v.id}</td><td class="num">${fmtD(v.date)}/${v.date.slice(0,4)}</td><td class="num">${fmtVND(v.amount)}</td><td>${v.method}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Chưa có hóa đơn</td></tr>'}</tbody></table></div></div>
      </div></div>`;
  return shell(`
    <div class="page-head"><div><h1>Tài khoản</h1><p>Thông tin cá nhân, gói dịch vụ và tổng kết luyện tập.</p></div><button class="btn btn-ghost btn-sm" data-act="logout">Đăng xuất</button></div>
    <div class="grid g-main">
      <form class="card" id="profileForm"><h3>Thông tin cá nhân</h3>
        <div class="form" style="margin-top:16px">
          <div class="grid g-2"><div class="field"><label for="p-name">Họ và tên</label><input class="input" id="p-name" value="${esc(u.name)}" autocomplete="name"></div><div class="field"><label for="p-email">Email</label><input class="input" id="p-email" value="${esc(u.email)}" type="email" autocomplete="email"></div></div>
          <div class="grid g-2"><div class="field"><label for="p-org">Trường hoặc công ty</label><input class="input" id="p-org" value="${esc(u.org || '')}" placeholder="VD: Đại học Kinh tế TP.HCM"></div><div class="field"><label for="p-goal">Mục tiêu chính</label><select class="input" id="p-goal">${Object.entries(MODES).map(([k,m]) => `<option value="${k}" ${u.goal===k?'selected':''}>${m.name}</option>`).join('')}</select></div></div>
          <div><button class="btn btn-primary btn-sm" type="submit">Lưu thay đổi</button></div>
        </div>
      </form>
      <div class="card"><h3>Gói dịch vụ</h3>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px">${isPro() ? proChip : '<span class="chip">Miễn phí</span>'}<span class="muted" style="font-size:13px">${isPro() ? (S.autoRenew ? 'Gia hạn ' : 'Hết hạn ') + fmtDL(S.expiry) : 'Không giới hạn thời gian'}</span></div>
        <div style="margin-top:16px;font-size:14px">Đã dùng <b class="num">${S.used}</b> / ${plan().limit} lượt tháng này</div><div class="meter"><b style="width:${Math.min(100,S.used/plan().limit*100)}%"></b></div>
        <div class="muted" style="font-size:13px;margin-top:6px">Lượt làm mới vào ngày 1 hằng tháng</div>
        ${isPro() ? '' : '<button class="btn btn-primary btn-sm" style="margin-top:16px" data-go="goi-dich-vu">Nâng cấp Premium</button>'}
      </div>
    </div>
    ${gate(manage, 'Quản lý gói Premium', 'Đổi chu kỳ, bật tắt tự động gia hạn và xem hóa đơn khi bạn dùng Premium.')}
    <div class="card mt"><h3>Tổng kết luyện tập</h3>
      ${ss.length ? `<div class="grid g-4" style="margin-top:14px">
        <div class="stat"><div class="k">Bài đã làm</div><div class="v num">${ss.length}</div></div>
        <div class="stat"><div class="k">Tổng thời gian</div><div class="v num">${Math.round(ss.reduce((a,s) => a+s.dur, 0)/60)}<span style="font-size:15px"> phút</span></div></div>
        <div class="stat"><div class="k">Điểm cao nhất</div><div class="v num">${best.score}</div><div class="d muted">${esc(best.title)}</div></div>
        <div class="stat"><div class="k">Luyện nhiều nhất</div><div class="v" style="font-size:22px">${MODES[topMode[0]].name}</div></div>
      </div>` : '<p class="muted" style="margin-top:10px;font-size:14px">Chưa có dữ liệu. Tổng kết xuất hiện sau buổi luyện đầu tiên.</p>'}
    </div>`);
}

/* ================= Hộp thoại ================= */
function modalHtml(){
  const M = S.modal; if(!M) return '';
  const wrap = (inner, label) => `<div class="modal-bg" data-act="modal-close"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" data-act="noop">${inner}</div></div>`;
  if(M.type === 'need-account') return wrap(`<h2 id="mt">Cần tài khoản để bắt đầu luyện</h2><p class="muted" style="margin-top:8px;font-size:14px">Tài khoản giúp lưu bài nói, báo cáo và theo dõi tiến bộ của bạn. Lựa chọn ${MODES[S.ob.mode].name.toLowerCase()}, ${LANGS[S.ob.lang].toLowerCase()} sẽ được giữ lại.</p><div class="acts"><button class="btn btn-primary" data-act="modal-go" data-to="dang-ky">Đăng ký miễn phí</button><button class="btn btn-ghost" data-act="modal-go" data-to="dang-nhap">Tôi đã có tài khoản</button></div>`);
  if(M.type === 'quota') return wrap(`<span class="chip bad">Hết lượt</span><h2 id="mt" style="margin-top:12px">Bạn đã dùng hết ${PLANS.free.limit} lượt phân tích tháng này</h2><p class="muted" style="margin-top:8px;font-size:14px">Gói Miễn phí làm mới vào ngày 1 tháng sau. Nâng cấp Premium để có 50 lượt mỗi tháng và phân tích video.</p><div class="acts"><button class="btn btn-primary" data-act="modal-go" data-to="goi-dich-vu">Nâng cấp</button><button class="btn btn-ghost" data-act="modal-close">Để sau</button></div>`);
  if(M.type === 'welcome') return wrap(`${proChip}<h2 id="mt" style="margin-top:12px">Chào mừng đến với Premium</h2><p class="muted" style="margin-top:6px;font-size:14px">Thanh toán thành công. Các tính năng sau đã được mở:</p>
    <ul class="unlock">${['Quay video và phân tích ngôn ngữ cơ thể','Nhắc nhở thời gian thực khi đang nói','Trả lời phản biện của khán giả AI','Dòng thời gian lỗi trong mỗi báo cáo','Lộ trình luyện tập 4 tuần','50 lượt phân tích mỗi tháng, tối đa 30 phút mỗi bài'].map(x => `<li>${ic('check',16)}<span>${x}</span></li>`).join('')}</ul>
    <div class="acts"><button class="btn btn-primary" data-act="modal-go" data-to="tong-quan">Về Tổng quan</button><button class="btn btn-ghost" data-act="welcome-video">Luyện bằng video ngay</button></div>`);
  return wrap(`<h2 id="mt">${M.cycle === 'y' && isPro() ? 'Chuyển sang gói năm' : 'Nâng cấp Premium'}</h2><p class="muted" style="margin-top:6px;font-size:14px">Chọn chu kỳ và phương thức thanh toán.</p>
    <div class="form" style="margin-top:18px">
      <div class="pills"><button class="pill ${M.cycle==='m'?'on':''}" data-act="cycle" data-v="m">Tháng · ${fmtVND(PRICE.m)}</button><button class="pill ${M.cycle==='y'?'on':''}" data-act="cycle" data-v="y">Năm · ${fmtVND(PRICE.y)}</button></div>
      <div><div class="sec-t" style="margin-bottom:4px">Phương thức</div><div class="pay">${['MoMo','VNPay','Thẻ quốc tế'].map(x => `<button class="opt ${M.pay===x?'on':''}" data-act="pay-m" data-v="${x}" aria-pressed="${M.pay===x}">${x}</button>`).join('')}</div></div>
      <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--line);padding-top:14px"><span>Tổng</span><span class="num">${fmtVND(M.cycle==='m' ? PRICE.m : PRICE.y)}</span></div>
      <button class="btn btn-primary btn-lg" data-act="pay">Thanh toán</button>
      <p class="demo-note">Bản thử nghiệm: không có giao dịch thật nào được thực hiện.</p>
    </div>`);
}

/* ================= Sự kiện ================= */
const ACTIONS = {
  noop(){},
  menu(){ S.menu = !S.menu; render(); },
  'modal-close'(){ S.modal = null; render(); },
  'modal-go'(el){ S.modal = null; go(el.dataset.to); },
  'need-account'(){ S.modal = {type:'need-account'}; render(); },
  'ob-mode'(el){ S.ob.mode = el.dataset.mode; render(); },
  'ob-lang'(el){ S.ob.lang = el.dataset.lang; render(); },
  google(el){
    const signup = el.dataset.mode === 'signup';
    signIn(signup ? 'new' : 'demo', signup ? {name:'Nguyễn Lan Anh', email:'lananh.nguyen@gmail.com'} : {});
    toast(signup ? 'Đã tạo tài khoản bằng Google' : 'Đã đăng nhập bằng Google');
    go(signup ? 'chon-muc-tieu' : 'tong-quan');
  },
  'demo-login'(){ signIn('demo'); toast('Đã đăng nhập tài khoản dùng thử'); go('tong-quan'); },
  'goal-pick'(el){ S.user.goal = el.dataset.mode; S.draft.mode = el.dataset.mode; render(); },
  'lang-pick'(el){ S.user.lang = el.dataset.lang; S.draft.lang = el.dataset.lang; render(); },
  'skip-test'(){ S.draft = freshDraft(S.user.goal, S.user.lang); go('tong-quan'); },
  'test-start'(){ S.draft = {...freshDraft(S.user.goal, S.user.lang), placement:true, input:'audio'}; startRec(); },
  'dismiss-test'(){ S.placementResult = null; render(); },
  step(el){ saveDraftFields(); S.step = +el.dataset.n; render(); },
  'step-next'(){ saveDraftFields(); S.step = Math.min(2, S.step+1); render(); },
  'step-back'(){ saveDraftFields(); S.step = Math.max(0, S.step-1); render(); },
  'd-mode'(el){ S.draft.mode = el.dataset.mode; render(); },
  'd-purpose'(el){ S.draft.purpose = el.dataset.v; render(); },
  'd-lang'(el){ S.draft.lang = el.dataset.lang; render(); },
  'd-input'(el){ saveDraftFields(); if(el.dataset.locked){ toast('Quay video có trong gói Premium'); return; } S.draft.input = el.dataset.v; render(); },
  begin(){
    saveDraftFields(); S.draft.placement = false;
    if(!hasQuota()) return;
    const d = S.draft;
    if(d.input === 'script'){ S.scriptErr = ''; go('kich-ban'); return; }
    if(d.input === 'upload'){ if(d.file && d.file.dur && d.file.dur > plan().maxMin*60){ toast(`File dài hơn ${plan().maxMin} phút của gói ${plan().name}`); return; } startAnalysis({kind:'speech', dur:(d.file && d.file.dur) || 180}); return; }
    startRec();
  },
  suggest(){ S.draft = {...freshDraft(S.user.goal, S.user.lang), title:'Luyện mở bài trong 30 giây'}; S.step = 2; go('luyen-tap'); },
  'rec-pause'(){ const r = S.rec; if(!r) return; r.paused = !r.paused; if(r.mr){ try { r.paused ? r.mr.pause() : r.mr.resume(); } catch(e){} } $('#pausebtn').textContent = r.paused ? 'Tiếp tục' : 'Tạm dừng'; $('#recst').textContent = r.paused ? 'Tạm dừng' : 'Đang ghi'; $('#recdot').classList.toggle('paused', r.paused); },
  'rec-stop'(){ stopRec(); },
  'rec-cancel'(){ const placement = S.draft.placement; cleanupRec(); S.draft.placement = false; toast('Đã hủy bản ghi'); go(placement ? 'bai-test' : 'luyen-tap'); },
  'use-sample'(){ S.scriptText = SAMPLE_SCRIPT; S.scriptErr = ''; if(!S.draft.title) S.draft.title = 'Gọi vốn: ứng dụng SânNhanh'; render(); },
  'script-go'(){
    const t = ($('#sc-text') || {}).value || S.scriptText; S.scriptText = t;
    if(words(t) < 40){ S.scriptErr = `Kịch bản mới có ${words(t)} từ. Cần ít nhất 40 từ để AI chấm.`; render(); return; }
    if(!hasQuota()) return;
    S.scriptErr = ''; startAnalysis({kind:'script', text:t});
  },
  open(el){ S.currentId = el.dataset.id; S.qa = {}; go('bao-cao'); },
  seg(el){ highlight('seg-' + el.dataset.i); },
  sen(el){ highlight('sen-' + el.dataset.i); },
  retry(){ const s = current(); S.draft = {...freshDraft(s.mode, s.lang), title:s.placement ? '' : s.title.replace(/ \(.*\)$/, ''), input:s.input === 'video' && !isPro() ? 'audio' : s.input}; if(s.input === 'script') S.scriptText = s.text || ''; S.step = 2; go('luyen-tap'); },
  'retry-video'(){ if(!isPro()){ toast('Quay video có trong gói Premium'); go('goi-dich-vu'); return; } const s = current(); S.draft = {...freshDraft(s.mode, s.lang), title:s.title.replace(/ \(.*\)$/, ''), input:'video'}; S.step = 2; go('luyen-tap'); },
  'save-lib'(){ const s = current(); if(!S.library.some(l => l.sid === s.id)) S.library.push(libItemFrom(s)); toast('Đã lưu vào thư viện bài nói'); render(); },
  'go-lib'(){ go('thu-vien'); },
  'qa-open'(el){ if(!isPro()){ toast('Trả lời phản biện có trong gói Premium'); go(S.user ? 'goi-dich-vu' : 'bang-gia'); return; } const i = el.dataset.i; S.qa[i] = {...(S.qa[i] || {}), open:!(S.qa[i] || {}).open}; render(); },
  'qa-grade'(el){
    const i = el.dataset.i, q = S.qa[i] || {};
    if(!(q.text || '').trim()){ toast('Nhập câu trả lời trước khi chấm'); return; }
    const s = current(); S.qa[i] = {...q, state:'loading'}; render();
    setTimeout(() => { if(!S.qa[i]) return; S.qa[i] = {...S.qa[i], state:'done', fb:gradeAnswer(S.qa[i].text, s ? s.mode : 'presentation')}; if(route() === 'bao-cao') render(); }, 1100);
  },
  'lib-play'(el){
    const l = S.library.find(x => x.id === el.dataset.id); if(!l) return;
    if(l.kind === 'script'){ S.currentId = l.sid; go('bao-cao'); return; }
    if(!l.url){ toast('Bản mẫu không có tệp âm thanh. Hãy ghi âm một bài mới để nghe lại.'); return; }
    S.openLib = S.openLib === l.id ? null : l.id; render();
  },
  'lib-del'(el){ S.confirmDel = el.dataset.id; render(); },
  'lib-del-no'(){ S.confirmDel = null; render(); },
  'lib-del-yes'(el){ S.library = S.library.filter(l => l.id !== el.dataset.id); S.confirmDel = null; if(S.openLib === el.dataset.id) S.openLib = null; toast('Đã xóa khỏi thư viện'); render(); },
  cmp(el){
    const id = el.dataset.id, max = isPro() ? 5 : 3;
    if(S.compare.includes(id)){ if(S.compare.length <= 2){ toast('Cần giữ ít nhất 2 lần để so sánh'); return; } S.compare = S.compare.filter(x => x !== id); }
    else { if(S.compare.length >= max){ toast(`So sánh tối đa ${max} lần${isPro() ? '' : ' với gói Miễn phí'}`); return; } S.compare.push(id); }
    render();
  },
  'plan-check'(el){ S.planDone[el.dataset.id] = !S.planDone[el.dataset.id]; render(); },
  buy(){ S.modal = {type:'pay', cycle:'m', pay:S.payMethod}; render(); },
  'to-yearly'(){ S.modal = {type:'pay', cycle:'y', pay:S.payMethod}; render(); },
  cycle(el){ S.modal.cycle = el.dataset.v; render(); },
  'pay-m'(el){ S.modal.pay = el.dataset.v; render(); },
  pay(){
    const c = S.modal.cycle, was = isPro(), d = new Date(); d.setMonth(d.getMonth() + (c === 'm' ? 1 : 12));
    S.payMethod = S.modal.pay;
    Object.assign(S, {plan:'premium', cycle:c, autoRenew:true, expiry:d.toISOString().slice(0,10)});
    S.invoices.push(invoice(c === 'm' ? PRICE.m : PRICE.y));
    S.modal = was ? null : {type:'welcome'};
    if(was) toast('Đã chuyển sang gói năm');
    render();
  },
  'welcome-video'(){ S.modal = null; S.draft = {...freshDraft(S.user.goal, S.user.lang), input:'video'}; S.step = 2; go('luyen-tap'); },
  autorenew(){ S.autoRenew = !S.autoRenew; toast(S.autoRenew ? 'Đã bật tự động gia hạn' : 'Đã tắt tự động gia hạn'); render(); },
  'demo-plan'(el){ setPlan(el.dataset.plan); render(); },
  logout(){ signOut(); toast('Đã đăng xuất'); go(''); },
};
function highlight(id){
  const el = document.getElementById(id); if(!el) return;
  document.querySelectorAll('.seg-t.hl,.script-view mark.hl').forEach(x => x.classList.remove('hl'));
  el.classList.add('hl'); if(el.tagName === 'MARK') el.style.background = 'var(--bad-soft)';
  el.scrollIntoView({behavior:'smooth', block:'center'});
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-act]'); if(!t) return;
  if(t.tagName === 'A') return;
  if(t.disabled) return;
  if(t.dataset.go !== undefined && !t.dataset.act){ e.preventDefault(); return go(t.dataset.go); }
  const fn = ACTIONS[t.dataset.act]; if(!fn) return;
  if(t.tagName === 'BUTTON' && t.type !== 'submit') e.preventDefault();
  if(t.dataset.act !== 'menu' && t.dataset.act !== 'noop') S.menu = false;
  fn(t);
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if(f.id === 'authForm'){
    const su = f.dataset.mode === 'signup', email = $('#f-email').value.trim(), pass = $('#f-pass').value, name = su ? $('#f-name').value.trim() : '';
    if(su && !name){ S.authErr = 'Nhập họ và tên để tạo tài khoản.'; return render(); }
    if(!/^\S+@\S+\.\S+$/.test(email)){ S.authErr = 'Email chưa đúng định dạng, ví dụ: ban@email.com.'; return render(); }
    if(pass.length < 6){ S.authErr = 'Mật khẩu cần ít nhất 6 ký tự.'; return render(); }
    S.authErr = '';
    signIn(su ? 'new' : 'demo', su ? {name, email} : {email});
    toast(su ? 'Đã tạo tài khoản' : 'Đã đăng nhập');
    return go(su ? 'chon-muc-tieu' : 'tong-quan');
  }
  if(f.id === 'profileForm'){
    S.user = {...S.user, name:$('#p-name').value.trim() || S.user.name, email:$('#p-email').value.trim() || S.user.email, org:$('#p-org').value.trim(), goal:$('#p-goal').value};
    toast('Đã lưu thông tin'); render();
  }
});
document.addEventListener('input', e => {
  const el = e.target;
  if(el.dataset.qaText != null) S.qa[el.dataset.qaText] = {...(S.qa[el.dataset.qaText] || {}), text:el.value};
  if(el.dataset.draft) S.draft[el.dataset.draft] = el.value;
  if(el.id === 'sc-text'){ S.scriptText = el.value; const n = words(el.value), c = $('#sc-count'); if(c) c.textContent = `${n} từ · khoảng ${fmtMin(Math.round(n/130*60))} khi nói`; }
});
document.addEventListener('change', e => {
  const el = e.target;
  if(el.id === 'd-file'){
    const f = el.files[0]; if(!f) return; saveDraftFields();
    if(S.draft.file && S.draft.file.url) URL.revokeObjectURL(S.draft.file.url);
    S.draft.file = {name:f.name, size:f.size, type:f.type, url:URL.createObjectURL(f), dur:0}; render();
    const probe = document.createElement(/^video/.test(f.type) ? 'video' : 'audio'); probe.preload = 'metadata';
    probe.onloadedmetadata = () => { if(S.draft.file && isFinite(probe.duration)){ S.draft.file.dur = Math.round(probe.duration); if(route() === 'luyen-tap') render(); } };
    probe.src = S.draft.file.url;
  }
  if(el.id === 'sc-file'){
    const f = el.files[0]; if(!f) return;
    if(f.size > 1024*1024){ S.scriptErr = 'File lớn hơn 1 MB. Hãy dán nội dung trực tiếp.'; render(); return; }
    const rd = new FileReader(); rd.onload = () => { S.scriptText = String(rd.result || ''); S.scriptErr = ''; if(!S.draft.title) S.draft.title = f.name.replace(/\.[^.]+$/, ''); render(); }; rd.readAsText(f);
  }
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && (S.modal || S.menu)){ S.modal = null; S.menu = false; render(); } });

render();
