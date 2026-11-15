'use strict';
/* Trạng thái, điều hướng (auth guard + returnUrl), hộp thoại, các luồng ghi âm / tải lên / phân tích / thanh toán và xử lý sự kiện. */

const S = {
  me:null, data:null, route:'', params:{}, lastRoute:null,
  modal:null, menu:false, devOpen:false, devConfirm:false,
  draft:null, goalPick:false, rec:null, job:null, upload:null, qa:{},
  sim:{pay:'ok', ai:'ok', net:'ok', mic:'real'},
  auth:{err:'', info:''}, ob:{goal:'presentation', lang:'vi'},
  scriptText:'', scriptErr:'', fileErr:'', openLib:null, openUrl:null, confirmDel:null, compare:[],
  pendingAfterPay:null, pwErr:'', pwOk:'', offline:!navigator.onLine,
};
const plan = () => CONFIG.plans[S.data && S.data.plan === 'premium' ? 'premium' : 'free'];
const isPro = () => !!(S.data && S.data.plan === 'premium');
const left = () => S.data ? Math.max(0, plan().limit - S.data.used) : 0;
const planName = () => isPro() ? 'Premium' : L('Miễn phí','Free');
const save = () => { if(S.me && S.data) UserStore.save(S.me, S.data); };

/* ================= Điều hướng ================= */
const ROUTES = {
  '':                  {v:vLanding, a:'guest'},
  'bat-dau':           {v:vGsLang, a:'guest'},
  'bat-dau-muc-tieu':  {v:vGsGoal, a:'guest'},
  'bat-dau-ngon-ngu':  {v:vGsSpeech, a:'guest'},
  'bat-dau-xem-truoc': {v:vGsPreview, a:'guest'},
  'dang-nhap':         {v:vLogin, a:'guest'},
  'dang-ky':           {v:vRegister, a:'guest'},
  'xac-thuc-email':    {v:vVerify, a:'guest', need:() => Auth.pending(), back:'dang-ky'},
  'quen-mat-khau':     {v:vForgot, a:'guest'},
  'dat-lai-mat-khau':  {v:vReset, a:'auth'},
  'bang-gia':          {v:() => vPricing(false), a:'guest', alt:'goi-dich-vu'},
  'bao-cao-mau':       {v:() => vReport(true), a:'guest'},
  'thiet-lap-muc-tieu':{v:vObGoal, a:'onboard'},
  'thiet-lap-ngon-ngu':{v:vObSpeech, a:'onboard'},
  'thiet-lap-xem-truoc':{v:vObPreview, a:'onboard'},
  'bai-test':          {v:vTest, a:'auth'},
  'tong-quan':         {v:vDashboard, a:'app', nav:'tong-quan'},
  'luyen-tap':         {v:vPractice, a:'app', nav:'luyen-tap'},
  'ghi-am':            {v:vRecord, a:'app', nav:'luyen-tap', need:() => S.rec, back:'luyen-tap'},
  'tai-len':           {v:vUpload, a:'app', nav:'luyen-tap', need:() => S.upload, back:'luyen-tap'},
  'kich-ban':          {v:vScript, a:'app', nav:'luyen-tap', need:() => S.draft, back:'luyen-tap'},
  'dang-phan-tich':    {v:vAnalyzing, a:'app', nav:'thu-vien'},
  'bao-cao':           {v:() => vReport(false), a:'app', nav:'tien-bo'},
  'thu-vien':          {v:vLibrary, a:'app', nav:'thu-vien'},
  'tien-bo':           {v:vProgress, a:'app', nav:'tien-bo'},
  'khoa-hoc':          {v:vCourses, a:'app', nav:'khoa-hoc'},
  'khoa-hoc-chi-tiet': {v:vCourse, a:'app', nav:'khoa-hoc'},
  'bai-hoc':           {v:vLesson, a:'app', nav:'khoa-hoc'},
  'goi-dich-vu':       {v:() => vPricing(true), a:'app', nav:'goi-dich-vu'},
  'tai-khoan':         {v:vAccount, a:'app', nav:'tai-khoan'},
};
function parseHash(){
  const dec = x => { try { return decodeURIComponent(x); } catch(e){ return x; } };
  const h = location.hash.replace(/^#/, ''), q = h.indexOf('?'), params = {};
  const route = dec(q < 0 ? h : h.slice(0, q)), qs = q < 0 ? '' : h.slice(q + 1);
  qs.split('&').filter(Boolean).forEach(kv => { const i = kv.indexOf('='); params[dec(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : dec(kv.slice(i + 1)); });
  return {route, params};
}
const toParams = p => typeof p === 'string' ? Object.fromEntries(p.split('&').filter(Boolean).map(kv => { const i = kv.indexOf('='); return [kv.slice(0,i), decodeURIComponent(kv.slice(i+1))]; })) : (p || {});
function hashOf(route, params={}){ const qs = Object.entries(params).filter(([,v]) => v != null && v !== '').map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&'); return route + (qs ? '?' + qs : ''); }
function go(route, params={}, replace=false){
  S.menu = false;
  const h = hashOf(route, toParams(params));
  if(location.hash.replace(/^#/, '') === h) return render();
  if(replace) location.replace('#' + h); else location.hash = h;
}
const inPlacement = r => S.draft && S.draft.placement && ['ghi-am','dang-phan-tich'].includes(r);
function render(){
  const {route, params} = parseHash();
  let r = route in ROUTES ? route : '', R = ROUTES[r];
  S.route = r; S.params = params;
  if(R.a === 'guest' && S.data) return go(R.alt || (S.data.onboarded ? 'tong-quan' : 'thiet-lap-muc-tieu'), {}, true);
  if(R.a !== 'guest' && !S.data) return go('dang-nhap', {returnUrl:location.hash.replace(/^#/, '')}, true);
  if(R.a === 'onboard' && S.data.onboarded) return go('tong-quan', {}, true);
  if(R.a === 'app' && !S.data.onboarded && !inPlacement(r)) return go('thiet-lap-muc-tieu', {}, true);
  if(R.need && !R.need()) return go(R.back, {}, true);
  if(r === 'bao-cao' && S.qaFor !== params.id){ S.qa = {}; S.qaFor = params.id; }
  if(r !== 'ghi-am' && S.rec) cleanupRec();
  if(r !== 'tai-len' && S.upload){ clearInterval(S.upTimer); S.upload = null; }
  $('#app').innerHTML = R.v() + modalHtml() + devHtml() + (S.offline ? `<div class="offline" role="alert">${ic('wifi',14)} ${L('Mất kết nối mạng. Một số thao tác sẽ không thực hiện được cho tới khi có mạng lại.','You’re offline. Some actions won’t work until you reconnect.')}</div>` : '');
  if(r === '') sphereInit();
  if(S.lastRoute !== r){ window.scrollTo(0,0); S.lastRoute = r; }
  if(r === 'ghi-am') attachRec();
}
window.addEventListener('hashchange', render);
window.addEventListener('online', () => { S.offline = false; render(); toast(L('Đã có mạng trở lại.','You’re back online.')); });
window.addEventListener('offline', () => { S.offline = true; render(); });
window.addEventListener('beforeunload', e => { if((S.rec && S.rec.state === 'live') || (S.upload && S.upload.status === 'uploading')){ e.preventDefault(); e.returnValue = ''; } });

/* ================= Phiên đăng nhập ================= */
function startSession(me){
  S.me = me.email; S.data = UserStore.fromMe(me);
  I18N.set(S.data.profile.ui);
  S.auth = {err:'', info:''}; S.draft = null;
}
function afterLogin(){ const ret = S.params.returnUrl; if(!S.data.onboarded) return go('thiet-lap-muc-tieu', {}, true); if(ret){ const {route, params} = (() => { const [r, q=''] = ret.split('?'); return {route:r, params:toParams(q)}; })(); return go(route in ROUTES ? route : 'tong-quan', params, true); } go('tong-quan', {}, true); }
function logout(){
  if(S.rec) cleanupRec(); clearInterval(S.jobTimer); clearInterval(S.upTimer);
  Auth.logout(); Object.assign(S, {me:null, data:null, draft:null, job:null, upload:null, modal:null, devOpen:false, qa:{}, compare:[], pendingAfterPay:null});
  toast(L('Đã đăng xuất','Logged out')); go('');
}
function setPlan(p){
  const D = S.data; if((p === 'premium') === isPro()) return;
  if(p === 'premium'){ const d = new Date(); d.setMonth(d.getMonth()+1); Object.assign(D, {plan:'premium', cycle:'m', autoRenew:true, expiry:d.toISOString().slice(0,10)}); if(!D.invoices.length) D.invoices.push(invoice(CONFIG.price.m)); }
  else Object.assign(D, {plan:'free', expiry:null, autoRenew:true});
  save();
}
const invoice = amount => ({id:'HD-' + todayISO().slice(2,7).replace('-','') + '-' + String(S.data.invoices.length+1).padStart(4,'0'), date:todayISO(), amount, method:S.data.payMethod});
const PW_OK = p => p.length >= 8 && /[a-zA-Z]/.test(p) && /\d/.test(p);
const EMAIL_OK = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/* ================= Ghi âm ================= */
function startRec(){
  S.rec = {state:'asking', t:0, paused:false, tips:[], fill:0, pause:0, qi:0, sim:false, stream:null, ctx:null, analyser:null, mr:null, chunks:[], timer:null, raf:null, err:null};
  go('ghi-am'); requestMedia();
}
function requestMedia(){
  const r = S.rec, d = S.draft; if(!r) return;
  r.state = 'asking';
  if(S.sim.mic === 'sim') return beginRec(r, null, true);
  if(S.sim.mic === 'deny'){ r.state = 'denied'; r.err = 'denied'; return render(); }
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ r.state = 'denied'; r.err = 'unsupported'; return render(); }
  render();
  navigator.mediaDevices.getUserMedia(d.kind === 'video' ? {audio:true, video:true} : {audio:true}).then(stream => {
    if(S.rec !== r){ stream.getTracks().forEach(t => t.stop()); return; }
    beginRec(r, stream, false);
  }).catch(e => {
    if(S.rec !== r) return;
    r.state = 'denied'; r.err = {NotAllowedError:'denied', SecurityError:'denied', NotFoundError:'nodevice', OverconstrainedError:'nodevice', NotReadableError:'busy', AbortError:'busy'}[e && e.name] || 'denied';
    render();
  });
}
function beginRec(r, stream, sim){
  r.state = 'live'; r.sim = sim; r.stream = stream;
  if(stream){
    try { r.ctx = new (window.AudioContext || window.webkitAudioContext)(); const src = r.ctx.createMediaStreamSource(stream); r.analyser = r.ctx.createAnalyser(); r.analyser.fftSize = 256; src.connect(r.analyser); } catch(e){}
    if(window.MediaRecorder){ try { r.mr = new MediaRecorder(stream); r.mr.ondataavailable = e => { if(e.data && e.data.size) r.chunks.push(e.data); }; r.mr.start(1000); } catch(e){ r.mr = null; } }
  }
  clearInterval(r.timer); r.timer = setInterval(() => tick(r), 1000);
  render();
}
function attachRec(){
  const r = S.rec; if(!r || r.state !== 'live') return;
  const v = $('#camv'); if(v && r.stream && r.stream.getVideoTracks().length){ if(v.srcObject !== r.stream) v.srcObject = r.stream; const ph = $('#camph'); if(ph) ph.hidden = true; }
  cancelAnimationFrame(r.raf); drawWave(r);
}
function tick(r){
  if(S.rec !== r || r.paused || r.state !== 'live') return;
  r.t++; updateRecUI(r);
  if(r.t > 3 && Math.random() < .12){ r.fill++; const f = $('#k-fill'); if(f) f.textContent = r.fill; }
  if(r.t % 17 === 0){ r.pause++; const f = $('#k-pause'); if(f) f.textContent = r.pause; }
  if(plan().live){
    const hit = LIVE_TIPS.find(x => x[0] === r.t % 60);
    if(hit){ const g = GOALS[S.draft.goal], tip = hit[1] === 'Q' ? {q:true, at:fmtT(r.t), text:`${g.persona}: “${tx(g.questions[r.qi++ % g.questions.length])}”`} : {at:fmtT(r.t), text:tx(hit[1])}; r.tips.unshift(tip); const live = $('#live'); if(live){ if(r.tips.length === 1) live.innerHTML = ''; live.insertAdjacentHTML('afterbegin', tipHtml(tip)); } }
  }
  const max = S.draft.placement ? 60 : CONFIG.maxRecordSec;
  if(r.t >= max){ toast(S.draft.placement ? L('Hết 60 giây, đang nộp bài test.','60 seconds up, submitting your test.') : L('Đã đạt thời lượng tối đa 30 phút.','Reached the 30-minute maximum.')); stopRec(); }
}
function updateRecUI(r){
  const el = $('#timer'); if(el) el.textContent = fmtT(r.t);
  if(r.t > 3){ const w = $('#k-wpm'); if(w) w.textContent = Math.round(132 + Math.sin(r.t/6)*22 + Math.random()*8); }
  const n = $('#over-note'); if(n) n.innerHTML = overNote(r);
}
function drawWave(r){
  const cv = $('#wv'); if(!cv || S.rec !== r) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if(!W){ r.raf = requestAnimationFrame(() => drawWave(r)); return; }
  if(cv.width !== Math.round(W*dpr)){ cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); }
  const c = cv.getContext('2d'); if(!c) return;
  c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H);
  const bars = Math.floor(W/7); let data = null;
  if(r.analyser){ data = new Uint8Array(r.analyser.frequencyBinCount); r.analyser.getByteFrequencyData(data); }
  const now = performance.now()/1000;
  for(let i = 0; i < bars; i++){
    const v = r.paused ? .04 : data ? (data[Math.floor(i/bars*data.length*.7)] || 0)/255 : .15 + .55*Math.abs(Math.sin(i*.35+now*3)*Math.sin(i*.13-now*1.7)) + Math.random()*.08;
    const h = Math.max(3, v*H*.85); c.fillStyle = i % 4 === 0 ? '#3B56B8' : '#6CC7FF';
    c.beginPath(); if(c.roundRect) c.roundRect(i*7 + 2, (H-h)/2, 4, h, 2); else c.rect(i*7 + 2, (H-h)/2, 4, h); c.fill();
  }
  r.raf = requestAnimationFrame(() => drawWave(r));
}
function releaseRec(r){ clearInterval(r.timer); cancelAnimationFrame(r.raf); if(r.stream) r.stream.getTracks().forEach(t => t.stop()); try { if(r.ctx) r.ctx.close(); } catch(e){} }
function cleanupRec(){ const r = S.rec; if(!r) return; if(r.mr && r.mr.state !== 'inactive'){ r.mr.onstop = null; try { r.mr.stop(); } catch(e){} } releaseRec(r); S.rec = null; }
function stopRec(){
  const r = S.rec; if(!r || r.state !== 'live') return;
  const d = S.draft, dur = Math.max(r.t, 5);
  clearInterval(r.timer); cancelAnimationFrame(r.raf);
  const done = blob => {
    releaseRec(r); S.rec = null;
    const item = newItem({kind:d.kind === 'video' ? 'video' : 'audio', dur, mime:blob ? blob.type : null});
    if(blob && blob.size){ item.hasMedia = true; item.size = blob.size; Media.save(item.id, blob); }
    submit(item);
  };
  if(r.mr && r.mr.state !== 'inactive'){ r.mr.onstop = () => done(new Blob(r.chunks, {type:r.mr.mimeType || (d.kind === 'video' ? 'video/webm' : 'audio/webm')})); r.mr.stop(); }
  else done(null);
}
function newItem(o){
  const d = S.draft;
  return {id:'l' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), title:draftTitle(d), goal:d.goal, lang:d.lang, lessonId:d.lessonId || null, placement:!!d.placement,
    date:todayISO(), created:Date.now(), status:'new', sessionId:null, hasMedia:false, size:0, text:null, ...o};
}

/* ================= Tải file lên ================= */
function validateFile(f){
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  if(!CONFIG.uploadExt.includes(ext) && !CONFIG.uploadTypes.includes(f.type)) return L(`Định dạng “.${esc(ext)}” chưa được hỗ trợ. Hãy dùng MP3, WAV, M4A, MP4, WEBM hoặc MOV.`, `“.${esc(ext)}” files aren’t supported. Use MP3, WAV, M4A, MP4, WEBM or MOV.`);
  if(!f.size) return L('File rỗng. Hãy chọn một file khác.','This file is empty. Choose another one.');
  if(f.size > CONFIG.maxUploadMB*1048576) return L(`File nặng ${(f.size/1048576).toFixed(0)} MB, vượt giới hạn ${CONFIG.maxUploadMB} MB. Hãy nén hoặc cắt ngắn file.`, `This file is ${(f.size/1048576).toFixed(0)} MB, over the ${CONFIG.maxUploadMB} MB limit. Compress or trim it.`);
  return '';
}
function startUpload(){
  if(!navigator.onLine){ toast(L('Bạn đang ngoại tuyến. Kết nối mạng rồi thử lại.','You’re offline. Reconnect and try again.'), 'err'); return; }
  S.upload = {file:S.draft.file, pct:0, status:'uploading'}; go('tai-len'); runUpload();
}
function runUpload(){
  const u = S.upload; clearInterval(S.upTimer); u.status = 'uploading';
  S.upTimer = setInterval(() => {
    if(S.upload !== u){ clearInterval(S.upTimer); return; }
    if((S.sim.net === 'offline' && u.pct >= 42) || !navigator.onLine){ clearInterval(S.upTimer); u.status = 'error'; render(); return; }
    u.pct = Math.min(100, u.pct + 7 + Math.random()*6);
    const b = $('#up-bar'), t = $('#up-pct'); if(b) b.style.width = u.pct + '%'; if(t) t.textContent = Math.round(u.pct) + '%';
    if(u.pct >= 100){ clearInterval(S.upTimer); const f = u.file; S.upload = null;
      const item = newItem({kind:/^video/.test(f.type) ? 'video' : 'audio', dur:f.dur || Math.max(30, Math.round(f.size/16000)), mime:f.type, size:f.size, hasMedia:true, fileName:f.name});
      Media.save(item.id, f.obj); submit(item); }
  }, 150);
}

/* ================= Nộp bài và phân tích ================= */
function submit(item){
  const D = S.data; D.library.push(item);
  if(item.kind !== 'script' && !item.placement && item.dur > plan().maxAnalyzeSec){ item.status = 'pending_premium'; save(); S.modal = {type:'over-limit', id:item.id}; return go('thu-vien'); }
  if(!item.placement && left() <= 0){ item.status = 'pending_quota'; save(); S.modal = {type:'quota', id:item.id}; return go('thu-vien'); }
  save(); startJob(item.id);
}
function startJob(id){
  const item = libItem(id); if(!item) return;
  if(S.job && S.job.status === 'running' && S.job.libId !== id){ toast(L('Đang phân tích một bài khác. Vui lòng đợi.','Another talk is being analysed. Please wait.')); return; }
  if(item.kind !== 'script' && !item.placement && item.dur > plan().maxAnalyzeSec){ S.modal = {type:'over-limit', id}; return render(); }
  if(!item.placement && left() <= 0){ S.modal = {type:'quota', id}; return render(); }
  if(!navigator.onLine){ toast(L('Bạn đang ngoại tuyến. Bài nói đã được lưu, hãy phân tích khi có mạng.','You’re offline. Your talk is saved; analyse it once you’re back online.'), 'err'); return; }
  const n = item.kind === 'script' ? AN_STEPS.script.length : AN_STEPS.speech.length - (item.kind === 'video' ? 0 : 1);
  item.status = 'analyzing'; item.reason = null; save();
  clearInterval(S.jobTimer);
  const j = S.job = {libId:id, i:0, n, status:'running', t0:Date.now(), mode:S.sim.ai};
  const fail = reason => { clearInterval(S.jobTimer); j.status = 'failed'; item.status = 'error'; item.reason = reason; item.failStep = j.i; save(); if(S.route === 'dang-phan-tich') render(); else toast(L('Phân tích lỗi. Mở Thư viện để thử lại.','Analysis failed. Open your Library to retry.'), 'err'); };
  S.jobTimer = setInterval(() => {
    if(j.mode === 'timeout' && j.i >= 2){ if(Date.now() - j.t0 > CONFIG.aiTimeoutMs) fail('timeout'); return; }
    j.i++;
    if(j.mode === 'error' && j.i === 3) return fail('error');
    if(j.i >= j.n){ clearInterval(S.jobTimer); j.status = 'done'; return finishJob(id); }
    if(S.route === 'dang-phan-tich') render();
  }, 700);
  go('dang-phan-tich', {id});
}
function finishJob(id){
  const item = libItem(id), D = S.data, sid = 's' + Date.now().toString(36);
  const base = {id:sid, libId:id, title:item.title, goal:item.goal, lang:item.lang, kind:item.kind, date:todayISO(), dur:item.dur, placement:item.placement, lessonId:item.lessonId};
  let s;
  if(item.kind === 'script'){
    const r = analyzeScript(item.text, item.title, item.goal, item.lang);
    s = {...base, c:r.c, score:scoreOf(r.c), fillers:r.weakTotal, script:r, dur:r.estSec};
  } else {
    const prev = D.sessions.filter(x => x.kind !== 'script').pop(), video = item.kind === 'video', c = speechScores(prev, video);
    if(item.lessonId){ const crit = SKILL[LESSON_BY_ID[item.lessonId].skill].crit; Object.keys(c).forEach(k => { if(c[k] != null) c[k] = clampScore(c[k] + (k === crit ? 8 : 2)); }); }
    const fillers = prev ? Math.max(3, prev.fillers - 1) : 14;
    s = {...base, c, score:scoreOf(c), fillers, report:buildSpeechReport({goal:item.goal, lang:item.lang, placement:item.placement, video, dur:item.dur, fillers})};
  }
  D.sessions.push(s); item.status = 'analyzed'; item.sessionId = sid;
  if(!item.placement) D.used++;
  if(item.placement){ D.placement = {id:sid, score:s.score, seen:false}; D.onboarded = true; S.draft = null; }
  if(item.lessonId){ const st = D.lessons[item.lessonId] || {}; st.attempts = (st.attempts || 0) + 1; st.best = Math.max(st.best || 0, s.score); st.status = st.best >= CONFIG.passScore ? 'done' : 'doing'; D.lessons[item.lessonId] = st; }
  save(); S.qa = {};
  const here = S.route === 'dang-phan-tich' && S.params.id === id;
  toast(item.placement ? L('Đã có kết quả bài test đầu vào','Your placement result is ready') : L('Báo cáo đã sẵn sàng','Your report is ready'));
  if(here) item.placement ? go('tong-quan') : go('bao-cao', {id:sid}); else render();
}

/* ================= Thanh toán ================= */
function openPay(forId=null, cycle='m'){ S.pendingAfterPay = forId; S.modal = {type:'pay', cycle, method:S.data.payMethod, step:'choose', forId}; render(); }
function finishPay(){
  const M = S.modal; if(!M || M.type !== 'pay' || M.step !== 'processing') return;
  if(S.sim.pay === 'fail'){ M.step = 'failed'; return render(); }
  if(S.sim.pay === 'cancel'){ M.step = 'cancelled'; return render(); }
  const D = S.data, was = isPro(), d = new Date(); d.setMonth(d.getMonth() + (M.cycle === 'm' ? 1 : 12));
  D.payMethod = M.method; Object.assign(D, {plan:'premium', cycle:M.cycle, autoRenew:true, expiry:d.toISOString().slice(0,10)});
  D.invoices.push(invoice(M.cycle === 'm' ? CONFIG.price.m : CONFIG.price.y)); save();
  const pend = S.pendingAfterPay; S.pendingAfterPay = null; S.modal = null;
  if(pend && libItem(pend)){ toast(L('Thanh toán thành công. Đang phân tích bài vừa ghi.','Payment successful. Analysing your talk now.')); return startJob(pend); }
  if(was){ toast(L('Đã chuyển sang gói năm','Switched to yearly billing')); return render(); }
  S.modal = {type:'welcome'}; render();
}

/* ================= Hộp thoại ================= */
function modalHtml(){
  const M = S.modal; if(!M) return '';
  const wrap = inner => `<div class="modal-bg" data-act="modal-close"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" data-act="noop">${inner}</div></div>`;
  const it = M.id && libItem(M.id);
  switch(M.type){
    case 'need-account': return wrap(`<h2 id="mt">${L('Cần tài khoản để bắt đầu luyện','You need an account to practise')}</h2><p class="muted" style="margin-top:8px;font-size:14px">${L(`Tài khoản lưu bài nói, báo cáo và tiến độ khóa học của bạn. Lựa chọn ${tx(GOALS[S.ob.goal].name).toLowerCase()}, ${langName(S.ob.lang).toLowerCase()} sẽ được giữ lại.`, `An account saves your talks, reports and course progress. Your choice of ${tx(GOALS[S.ob.goal].name).toLowerCase()} in ${langName(S.ob.lang)} will be kept.`)}</p><div class="acts"><button class="btn btn-primary" data-act="modal-go" data-to="dang-ky">${L('Đăng ký miễn phí','Sign up free')}</button><button class="btn btn-ghost" data-act="modal-go" data-to="dang-nhap">${L('Tôi đã có tài khoản','I have an account')}</button></div>`);
    case 'google': return wrap(`<h2 id="mt">${L('Đăng nhập bằng Google','Sign in with Google')}</h2><p class="hint" style="margin-top:6px">${L('Bản thử nghiệm mô phỏng cửa sổ Google. Nhập tài khoản Gmail để tiếp tục.','This beta simulates the Google window. Enter a Gmail account to continue.')}</p>
      <form class="form" id="googleForm" novalidate style="margin-top:16px">${alertBox('err', M.err)}<div class="field"><label for="g-name">${L('Tên hiển thị','Display name')}</label><input class="input" id="g-name" autocomplete="name" value="${esc(M.name || '')}"></div><div class="field"><label for="g-email">Gmail</label><input class="input" id="g-email" type="email" autocomplete="email" value="${esc(M.email || '')}" placeholder="ten@gmail.com"></div><div class="acts" style="margin-top:4px"><button class="btn btn-primary" type="submit">${L('Tiếp tục','Continue')}</button><button class="btn btn-ghost" type="button" data-act="google-cancel">${L('Đóng cửa sổ','Close window')}</button></div></form>`);
    case 'over-limit': return wrap(`<div class="center"><div class="m-ic c-orange">${ic('clock',28)}</div><h2 id="mt">${L(`Bài nói dài ${fmtT(it.dur)}, vượt 5 phút của gói Miễn phí`, `Your talk is ${fmtT(it.dur)}, over the 5-minute Free limit`)}</h2><p class="muted" style="font-size:14px">${L('Bài đã được lưu vào Thư viện và chưa bị trừ lượt. Nâng cấp Premium để phân tích ngay: bài sẽ tự chạy phân tích sau khi thanh toán thành công.','It’s saved to your Library and no credit was used. Upgrade to Premium to analyse it now; analysis starts automatically after payment.')}</p></div><div class="acts" style="justify-content:center"><button class="btn btn-primary" data-act="pay-for" data-id="${it.id}">${L('Nâng cấp và phân tích','Upgrade and analyse')}</button><button class="btn btn-ghost" data-act="modal-close">${L('Để sau','Later')}</button></div>`);
    case 'quota': return wrap(`<div class="center"><div class="m-ic c-orange">${ic('alert',28)}</div><h2 id="mt">${L(`Bạn đã dùng hết ${plan().limit} lượt phân tích tháng này`, `You’ve used all ${plan().limit} analyses this month`)}</h2><p class="muted" style="font-size:14px">${it ? L('Bài vừa nộp đã được lưu vào Thư viện. ','Your talk has been saved to your Library. ') : ''}${isPro() ? L('Lượt sẽ làm mới vào ngày 1 tháng sau.','Credits reset on the 1st of next month.') : L('Nâng cấp Premium để có 50 lượt mỗi tháng. Bài sẽ được phân tích ngay sau khi thanh toán.','Upgrade to Premium for 50 a month. Your talk is analysed right after payment.')}</p></div><div class="acts" style="justify-content:center">${isPro() ? '' : `<button class="btn btn-primary" data-act="pay-for" data-id="${it ? it.id : ''}">${L('Nâng cấp và phân tích','Upgrade and analyse')}</button>`}<button class="btn btn-ghost" data-act="modal-close">${L('Để sau','Later')}</button></div>`);
    case 'welcome': return wrap(`${proChip()}<h2 id="mt" style="margin-top:12px">${L('Chào mừng đến với Premium','Welcome to Premium')}</h2><p class="muted" style="margin-top:6px;font-size:14px">${L('Thanh toán thành công. Các tính năng sau đã được mở:','Payment successful. You’ve unlocked:')}</p><ul class="unlock">${[L('Quay video và phân tích ngôn ngữ cơ thể','Video and body language analysis'),L('Nhắc nhở thời gian thực khi đang nói','Live coaching while you speak'),L('Trả lời phản biện của khán giả AI','Answering AI audience questions'),L('Dòng thời gian lỗi trong báo cáo','Issue timeline in reports'),L('50 lượt mỗi tháng, bài tối đa 30 phút','50 analyses a month, up to 30 minutes each')].map(x => `<li>${ic('check',16)}<span>${x}</span></li>`).join('')}</ul><div class="acts"><button class="btn btn-primary" data-act="modal-close">${L('Tiếp tục','Continue')}</button></div>`);
    case 'pay': {
      const forItem = M.forId && libItem(M.forId), total = fmtVND(M.cycle === 'm' ? CONFIG.price.m : CONFIG.price.y);
      if(M.step === 'processing') return wrap(`<div class="center" style="padding:12px 0"><span class="spinner" style="width:40px;height:40px;border-width:4px"></span><h2 id="mt">${L(`Đang kết nối ${M.method}…`, `Connecting to ${M.method}…`)}</h2><p class="muted" style="font-size:14px">${L('Hoàn tất thanh toán trên cổng thanh toán. Vui lòng không đóng trang.','Complete payment on the gateway. Please keep this page open.')}</p><button class="btn btn-ghost" data-act="pay-cancel">${L('Hủy giao dịch','Cancel payment')}</button></div>`);
      if(M.step === 'failed') return wrap(`<div class="center"><div class="m-ic c-pink">${ic('x',28)}</div><h2 id="mt">${L('Thanh toán không thành công','Payment failed')}</h2><p class="muted" style="font-size:14px">${L(`${M.method} từ chối giao dịch (số dư không đủ hoặc thẻ bị khóa). Bạn chưa bị trừ tiền.`, `${M.method} declined the payment (insufficient funds or card blocked). You were not charged.`)}${forItem ? ' ' + L('Bài nói vẫn được giữ trong Thư viện.','Your talk is still in your Library.') : ''}</p></div><div class="acts" style="justify-content:center"><button class="btn btn-primary" data-act="pay-submit">${L('Thử lại','Try again')}</button><button class="btn btn-outline" data-act="pay-back">${L('Đổi phương thức','Change method')}</button><button class="btn btn-ghost" data-act="modal-close">${L('Đóng','Close')}</button></div>`);
      if(M.step === 'cancelled') return wrap(`<div class="center"><div class="m-ic c-yellow">${ic('info',28)}</div><h2 id="mt">${L('Bạn đã hủy thanh toán','Payment cancelled')}</h2><p class="muted" style="font-size:14px">${L('Chưa có khoản nào bị trừ.','No money was taken.')}${forItem ? ' ' + L('Bài nói vẫn được giữ trong Thư viện, bạn có thể nâng cấp lúc khác.','Your talk stays in your Library; you can upgrade later.') : ''}</p></div><div class="acts" style="justify-content:center"><button class="btn btn-primary" data-act="pay-back">${L('Thanh toán lại','Pay again')}</button><button class="btn btn-ghost" data-act="modal-close">${L('Đóng','Close')}</button></div>`);
      return wrap(`<h2 id="mt">${M.cycle === 'y' && isPro() ? L('Chuyển sang gói năm','Switch to yearly') : L('Nâng cấp Premium','Upgrade to Premium')}</h2>
        ${forItem ? `<div style="margin-top:12px">${alertBox('info', L(`Sau khi thanh toán, bài “${esc(forItem.title)}” sẽ được phân tích ngay.`, `After payment, “${esc(forItem.title)}” will be analysed right away.`))}</div>` : ''}
        <div class="form" style="margin-top:18px">
          <div><div class="sec-t">${L('Chu kỳ','Billing')}</div><div class="pills"><button class="pill ${M.cycle === 'm' ? 'on' : ''}" data-act="pay-cycle" data-v="m">${L('Tháng','Monthly')} · ${fmtVND(CONFIG.price.m)}</button><button class="pill ${M.cycle === 'y' ? 'on' : ''}" data-act="pay-cycle" data-v="y">${L('Năm','Yearly')} · ${fmtVND(CONFIG.price.y)}</button></div></div>
          <div><div class="sec-t">${L('Phương thức','Payment method')}</div><div class="pay">${['MoMo','VNPay',L('Thẻ quốc tế','Card')].map(x => `<button class="opt ${M.method === x ? 'on' : ''}" data-act="pay-method" data-v="${x}" aria-pressed="${M.method === x}">${x}</button>`).join('')}</div></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--line);padding-top:14px"><span>${L('Tổng','Total')}</span><span class="num">${total}</span></div>
          <button class="btn btn-primary btn-lg" data-act="pay-submit">${L('Thanh toán','Pay')} ${total}</button>
          <p class="demo-note">${L('Bản thử nghiệm: không có giao dịch thật. Chọn kết quả mô phỏng trong bảng “Bản thử nghiệm”.','Beta: no real transaction. Pick the simulated outcome in the “Beta tools” panel.')}</p>
        </div>`);
    }
  }
  return '';
}

/* ================= Bảng điều khiển bản thử nghiệm ================= */
function devHtml(){
  if(!S.data) return '';
  const seg = (k, opts) => `<div class="seg">${opts.map(([v,l]) => `<button class="${S.sim[k] === v ? 'on' : ''}" data-act="sim" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  return `<button class="dev-btn" data-act="dev-toggle" aria-expanded="${S.devOpen}">${ic('sliders',14)} ${L('Bản thử nghiệm','Beta tools')}</button>${S.devOpen ? `<div class="dev" role="dialog" aria-label="${L('Bảng mô phỏng','Simulation panel')}">
    <h4>${L('Mô phỏng để kiểm thử luồng','Simulate flows for testing')}</h4>
    <div><div class="label">${L('Gói','Plan')}</div><div class="seg"><button class="${isPro() ? '' : 'on'}" data-act="dev-plan" data-v="free">${L('Miễn phí','Free')}</button><button class="${isPro() ? 'on' : ''}" data-act="dev-plan" data-v="premium">Premium</button></div></div>
    <div><div class="label">${L('Kết quả thanh toán','Payment result')}</div>${seg('pay', [['ok',L('Thành công','Success')],['fail',L('Thất bại','Fail')],['cancel',L('Bị hủy','Cancel')]])}</div>
    <div><div class="label">${L('AI phân tích','AI analysis')}</div>${seg('ai', [['ok',L('Bình thường','Normal')],['error',L('Lỗi','Error')],['timeout',L('Quá hạn','Timeout')]])}</div>
    <div><div class="label">${L('Mạng khi tải lên','Network on upload')}</div>${seg('net', [['ok',L('Ổn định','Stable')],['offline',L('Mất mạng','Drop')]])}</div>
    <div><div class="label">${L('Micro / camera','Mic / camera')}</div>${seg('mic', [['real',L('Thật','Real')],['sim',L('Giả lập','Simulated')],['deny',L('Từ chối','Denied')]])}</div>
    <div>${S.devConfirm ? `<div class="confirm" style="grid-column:auto">${L('Xóa toàn bộ dữ liệu luyện tập của tài khoản này?','Delete all practice data for this account?')}<span style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" data-act="dev-reset-no">${L('Hủy','Cancel')}</button><button class="btn btn-danger btn-sm" data-act="dev-reset-yes">${L('Xóa','Delete')}</button></span></div>` : `<button class="btn btn-ghost btn-sm" data-act="dev-reset">${L('Xóa dữ liệu luyện tập','Reset practice data')}</button>`}</div>
  </div>` : ''}`;
}

/* ================= Hành động ================= */
const flash = id => { const el = document.getElementById(id); if(!el) return; el.classList.add('flash'); el.scrollIntoView({behavior:'smooth', block:'center'}); setTimeout(() => el.classList.remove('flash'), 1800); };
function scriptErrFor(t){ const n = wordsOf(t); return n < CONFIG.minScriptWords ? L(`Kịch bản mới có ${n} từ. Cần ít nhất ${CONFIG.minScriptWords} từ để AI chấm.`, `Your script has ${n} words. AI needs at least ${CONFIG.minScriptWords}.`) : ''; }
const ACTIONS = {
  noop(){},
  menu(){ S.menu = !S.menu; render(); },
  scroll(el){ const to = el.dataset.to; const run = () => { const t = document.getElementById(to); if(t) t.scrollIntoView({behavior:'smooth'}); }; if(S.route !== ''){ go(''); setTimeout(run, 60); } else run(); },
  copy(el){ const v = el.dataset.v; const ok = () => toast(L('Đã sao chép','Copied')); try { navigator.clipboard.writeText(v).then(ok, () => toast(v)); } catch(e){ toast(v); } },
  'ui-lang'(el){ I18N.set(el.dataset.v); if(S.data){ S.data.profile.ui = I18N.ui; save(); } render(); },
  'modal-close'(){ const M = S.modal; if(M && M.type === 'pay' && M.step === 'processing') return; if(M && M.type === 'pay') S.pendingAfterPay = null; S.modal = null; render(); },
  'modal-go'(el){ S.modal = null; go(el.dataset.to); },
  'start-goal'(el){ S.ob.goal = el.dataset.goal; go('bat-dau'); },
  'ob-goal'(el){ S.ob.goal = el.dataset.goal; render(); },
  'ob-lang'(el){ S.ob.lang = el.dataset.v; render(); },
  'need-account'(){ S.modal = {type:'need-account'}; render(); },
  google(){ Auth.google(); },
  'google-cancel'(){ S.modal = null; S.auth.err = L('Bạn đã đóng cửa sổ Google trước khi đăng nhập xong. Hãy thử lại.','You closed the Google window before finishing. Please try again.'); render(); },
  async resend(){
    try { await Auth.resend(Auth.pending()); S.auth.err = ''; S.auth.info = L('Đã gửi lại email xác thực. Kiểm tra cả thư mục spam.','Verification email sent again. Check your spam folder too.'); }
    catch(e){ S.auth.info = ''; S.auth.err = e.code === 'wait' ? L('Bạn vừa yêu cầu gửi email. Vui lòng đợi một chút rồi thử lại.','You just requested an email. Please wait a moment and try again.') : L('Chưa gửi được email. Vui lòng thử lại.','Couldn’t send the email. Please try again.'); }
    render();
  },
  'reset-restart'(){ S.auth = {err:'', info:''}; render(); },
  'change-email'(){ Auth.setPending(null); S.auth = {err:'', info:''}; go('dang-ky'); },
  'set-goal'(el){ S.data.profile.goal = el.dataset.goal; S.draft = null; save(); render(); },
  'set-speech'(el){ S.data.profile.speechLang = el.dataset.v; S.draft = null; save(); render(); },
  'ob-finish'(){ S.data.onboarded = true; save(); go('tong-quan'); },
  'ob-test'(){ go('bai-test'); },
  'test-start'(){ const p = S.data.profile; S.draft = {goal:p.goal, lang:p.speechLang, promptIdx:0, custom:'', kind:'audio', file:null, lessonId:null, placement:true}; startRec(); },
  'placement-seen'(){ S.data.placement.seen = true; save(); render(); },
  logout(){ logout(); },
  buy(){ openPay(null); },
  'pay-for'(el){ openPay(el.dataset.id || null); },
  'to-yearly'(){ openPay(null, 'y'); },
  'pay-cycle'(el){ S.modal.cycle = el.dataset.v; render(); },
  'pay-method'(el){ S.modal.method = el.dataset.v; render(); },
  'pay-submit'(){ if(!navigator.onLine){ toast(L('Bạn đang ngoại tuyến. Kết nối mạng để thanh toán.','You’re offline. Reconnect to pay.'), 'err'); return; } S.modal.step = 'processing'; render(); clearTimeout(S.payTimer); S.payTimer = setTimeout(finishPay, 1600); },
  'pay-cancel'(){ clearTimeout(S.payTimer); S.modal.step = 'cancelled'; render(); },
  'pay-back'(){ S.modal.step = 'choose'; render(); },
  autorenew(){ S.data.autoRenew = !S.data.autoRenew; save(); toast(S.data.autoRenew ? L('Đã bật tự động gia hạn','Auto-renew on') : L('Đã tắt tự động gia hạn','Auto-renew off')); render(); },
  'new-practice'(){ S.draft = null; S.goalPick = false; go('luyen-tap'); },
  'toggle-goals'(){ S.goalPick = !S.goalPick; render(); },
  'd-goal'(el){ S.draft.goal = el.dataset.goal; S.draft.promptIdx = 0; render(); },
  'make-default'(){ S.data.profile.goal = S.draft.goal; save(); toast(L('Đã đặt làm mục tiêu mặc định','Set as your default goal')); render(); },
  'd-lang'(el){ S.draft.lang = el.dataset.v; render(); },
  'd-prompt'(el){ S.draft.promptIdx = +el.dataset.i; S.draft.custom = ''; render(); },
  'd-kind'(el){ if(el.dataset.locked){ toast(L('Quay video có trong gói Premium','Video is a Premium feature')); return openPay(null); } S.draft.kind = el.dataset.v; S.fileErr = ''; render(); },
  'leave-lesson'(){ S.draft.lessonId = null; render(); },
  begin(){
    const d = S.draft;
    if(d.kind === 'script'){ S.scriptErr = ''; return go('kich-ban'); }
    if(d.kind === 'upload'){ if(!d.file || S.fileErr) return; if(d.file.dur && d.file.dur > CONFIG.maxRecordSec){ S.fileErr = L('File dài hơn 30 phút, vượt thời lượng tối đa.','The file is over the 30-minute maximum.'); return render(); } return startUpload(); }
    startRec();
  },
  'switch-kind'(el){ const v = el.dataset.v; cleanupRec(); S.draft.kind = v; go(v === 'script' ? 'kich-ban' : 'luyen-tap'); },
  'rec-retry'(){ requestMedia(); },
  'rec-audio-only'(){ S.draft.kind = 'audio'; requestMedia(); },
  'rec-sim'(){ beginRec(S.rec, null, true); },
  'rec-pause'(){ const r = S.rec; if(!r) return; r.paused = !r.paused; if(r.mr){ try { r.paused ? r.mr.pause() : r.mr.resume(); } catch(e){} } $('#pausebtn').textContent = r.paused ? L('Tiếp tục','Resume') : L('Tạm dừng','Pause'); $('#recst').textContent = r.paused ? L('Tạm dừng','Paused') : L('Đang ghi','Recording'); $('#recdot').classList.toggle('paused', r.paused); },
  'rec-stop'(){ stopRec(); },
  'rec-ff'(){ const r = S.rec; if(!r) return; r.t = Math.min(CONFIG.maxRecordSec - 1, r.t + 60); updateRecUI(r); },
  'rec-cancel'(){ const pl = S.draft && S.draft.placement, lesson = S.draft && S.draft.lessonId; cleanupRec(); toast(L('Đã hủy bản ghi','Recording discarded')); if(pl){ S.draft = null; go('bai-test'); } else if(lesson) go('bai-hoc', {id:lesson}); else go('luyen-tap'); },
  'upload-retry'(){ if(!navigator.onLine){ toast(L('Vẫn chưa có mạng. Kết nối lại rồi thử.','Still offline. Reconnect and retry.'), 'err'); return; } runUpload(); render(); },
  'upload-cancel'(){ clearInterval(S.upTimer); S.upload = null; toast(L('Đã hủy tải lên','Upload cancelled')); go('luyen-tap'); },
  'use-sample'(){ S.scriptText = SAMPLE_SCRIPT[S.draft.lang] || SAMPLE_SCRIPT.vi; S.scriptErr = ''; render(); },
  'script-back'(){ S.draft.lessonId ? go('bai-hoc', {id:S.draft.lessonId}) : go('luyen-tap'); },
  'script-go'(){
    const t = ($('#sc-text') || {}).value ?? S.scriptText; S.scriptText = t;
    const err = scriptErrFor(t); if(err){ S.scriptErr = err; return render(); }
    S.scriptErr = ''; const item = newItem({kind:'script', text:t, dur:Math.round(wordsOf(t)/130*60)}); S.scriptText = ''; submit(item);
  },
  analyze(el){ startJob(el.dataset.id); },
  retry(el){
    const s = S.data.sessions.find(x => x.id === el.dataset.id); if(!s) return;
    let kind = el.dataset.kind || s.kind; if(kind === 'video' && !plan().video){ toast(L('Quay video có trong gói Premium','Video is a Premium feature')); return openPay(null); }
    S.draft = {goal:s.goal, lang:s.lang, promptIdx:0, custom:s.placement || s.lessonId ? '' : s.title, kind, file:null, lessonId:s.lessonId || null, placement:false};
    if(kind === 'script'){ const it = libItem(s.libId); S.scriptText = it ? it.text : ''; return go('kich-ban'); }
    go('luyen-tap');
  },
  jump(el){ flash(el.dataset.to); },
  'qa-open'(el){ if(!S.data || !isPro()){ toast(L('Trả lời phản biện có trong gói Premium','Answering questions is a Premium feature')); return S.data ? openPay(null) : go('bang-gia'); } const i = el.dataset.i; S.qa[i] = {...(S.qa[i] || {}), open:!(S.qa[i] || {}).open}; render(); },
  'qa-grade'(el){ const i = el.dataset.i, q = S.qa[i] || {}; if(!(q.text || '').trim()){ toast(L('Nhập câu trả lời trước khi chấm','Type an answer first')); return; } S.qa[i] = {...q, state:'loading'}; render(); setTimeout(() => { if(!S.qa[i]) return; S.qa[i] = {...S.qa[i], state:'done', fb:gradeAnswer(S.qa[i].text, el.dataset.goal)}; if(S.route === 'bao-cao') render(); }, 1100); },
  'lib-play'(el){
    const l = libItem(el.dataset.id); if(!l) return;
    if(S.openLib === l.id){ S.openLib = null; return render(); }
    if(l.kind === 'script'){ S.openLib = l.id; return render(); }
    Media.url(l.id).then(url => { if(!url){ toast(L('Tệp không còn trên thiết bị này.','The file is no longer on this device.'), 'err'); return; } S.openLib = l.id; S.openUrl = url; render(); });
  },
  'lib-dl'(el){
    const l = libItem(el.dataset.id); if(!l) return;
    const fire = (url, ext) => { const a = document.createElement('a'); a.href = url; a.download = slug(l.title) + ext; document.body.appendChild(a); a.click(); a.remove(); };
    if(l.kind === 'script') return fire(URL.createObjectURL(new Blob([l.text], {type:'text/plain;charset=utf-8'})), '.txt');
    Media.url(l.id).then(url => url ? fire(url, l.fileName ? '.' + l.fileName.split('.').pop() : /mp4/.test(l.mime || '') ? '.mp4' : '.webm') : toast(L('Tệp không còn trên thiết bị này.','The file is no longer on this device.'), 'err'));
  },
  'lib-del'(el){ S.confirmDel = el.dataset.id; render(); },
  'lib-del-no'(){ S.confirmDel = null; render(); },
  'lib-del-yes'(el){ const id = el.dataset.id, D = S.data, it = libItem(id); D.library = D.library.filter(l => l.id !== id); if(it && it.sessionId){ D.sessions = D.sessions.filter(s => s.id !== it.sessionId); if(D.placement && D.placement.id === it.sessionId) D.placement = null; } Media.remove(id); if(S.openLib === id) S.openLib = null; S.confirmDel = null; save(); toast(L('Đã xóa','Deleted')); render(); },
  cmp(el){ const id = el.dataset.id, max = plan().compareMax, min = CONFIG.compareMin; if(S.compare.includes(id)){ if(S.compare.length <= min){ toast(L(`Cần giữ ít nhất ${min} lần để so sánh`, `Keep at least ${min} sessions selected`)); return; } S.compare = S.compare.filter(x => x !== id); } else { if(S.compare.length >= max){ toast(isPro() ? L(`So sánh tối đa ${max} lần`, `Compare up to ${max}`) : L(`Gói Miễn phí so sánh tối đa ${max} lần. Premium được ${CONFIG.plans.premium.compareMax}.`, `Free compares up to ${max}. Premium allows ${CONFIG.plans.premium.compareMax}.`)); return; } S.compare.push(id); } render(); },
  'lesson-read'(el){ const st = S.data.lessons[el.dataset.id] || {}; st.read = true; if(!st.status) st.status = 'doing'; S.data.lessons[el.dataset.id] = st; save(); render(); },
  'lesson-practice'(el){
    const l = LESSON_BY_ID[el.dataset.id], kind = el.dataset.kind;
    if(el.dataset.locked || (kind === 'video' && !plan().video)){ toast(L('Quay video có trong gói Premium','Video is a Premium feature')); return openPay(null); }
    const st = S.data.lessons[l.id] || {}; if(!st.status){ st.status = 'doing'; S.data.lessons[l.id] = st; save(); }
    S.draft = {goal:l.goal, lang:S.data.profile.speechLang, promptIdx:0, custom:'', kind, file:null, lessonId:l.id, placement:false};
    if(kind === 'script'){ S.scriptText = ''; S.scriptErr = ''; return go('kich-ban'); }
    startRec();
  },
  'dev-toggle'(){ S.devOpen = !S.devOpen; S.devConfirm = false; render(); },
  sim(el){ S.sim[el.dataset.k] = el.dataset.v; render(); },
  'dev-plan'(el){ setPlan(el.dataset.v); toast(isPro() ? L('Đang xem bản Premium','Viewing Premium') : L('Đã về gói Miễn phí','Back on Free')); render(); },
  'dev-reset'(){ S.devConfirm = true; render(); },
  'dev-reset-no'(){ S.devConfirm = false; render(); },
  'dev-reset-yes'(){ const D = S.data; D.library.forEach(l => Media.remove(l.id)); Object.assign(D, {sessions:[], library:[], lessons:{}, placement:null, used:0}); S.devConfirm = false; S.compare = []; save(); toast(L('Đã xóa dữ liệu luyện tập','Practice data cleared')); render(); },
};

/* ================= Sự kiện ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-act]'); if(!t || t.disabled) return;
  if(t.tagName === 'A' && !t.dataset.act) return;
  if(t.dataset.go !== undefined && !t.dataset.act){ e.preventDefault(); return go(t.dataset.go, t.dataset.p || {}); }
  const fn = ACTIONS[t.dataset.act]; if(!fn) return;
  if(t.tagName === 'BUTTON' && t.type !== 'submit') e.preventDefault();
  if(!['menu','noop'].includes(t.dataset.act)) S.menu = false;
  fn(t);
});
document.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, v = id => (document.getElementById(id) || {}).value || '';
  if(f.id === 'loginForm'){
    const email = v('f-email').trim(), pw = v('f-pass'); S.auth.email = email; S.auth.info = '';
    if(!EMAIL_OK(email)){ S.auth.err = L('Email chưa đúng định dạng, ví dụ: ban@email.com.','Enter a valid email, e.g. you@email.com.'); return render(); }
    if(!pw){ S.auth.err = L('Nhập mật khẩu.','Enter your password.'); return render(); }
    S.auth.busy = true; render();
    try { const me = await Auth.login(email, pw); S.auth.busy = false; startSession(me); toast(L('Đã đăng nhập','Logged in')); afterLogin(); }
    catch(err){ S.auth.busy = false;
      if(err.code === 'unverified'){ Auth.setPending(email.toLowerCase()); try { await Auth.resend(email); } catch(e){} S.auth.err = ''; S.auth.info = L('Email chưa được xác thực. Chúng tôi vừa gửi lại email xác thực.','Your email isn’t verified yet. We just sent the verification email again.'); return go('xac-thuc-email'); }
      S.auth.err = {badcred:L('Email hoặc mật khẩu không đúng. Thử lại hoặc chọn “Quên mật khẩu”.','Wrong email or password. Try again or use “Forgot password”.'), wait:L('Bạn thử quá nhiều lần. Vui lòng đợi một chút rồi thử lại.','Too many attempts. Please wait a moment and try again.'), network:L('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.','Couldn’t reach the server. Check your connection and try again.')}[err.code] || L('Không đăng nhập được. Vui lòng thử lại.','Couldn’t log in. Please try again.');
      render(); }
  }
  if(f.id === 'registerForm'){
    const name = v('f-name').trim(), email = v('f-email').trim(), pw = v('f-pass'); Object.assign(S.auth, {name, email, info:''});
    if(!name){ S.auth.err = L('Nhập họ và tên.','Enter your full name.'); return render(); }
    if(!EMAIL_OK(email)){ S.auth.err = L('Email chưa đúng định dạng, ví dụ: ban@email.com.','Enter a valid email, e.g. you@email.com.'); return render(); }
    if(!PW_OK(pw)){ S.auth.err = L('Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.','Use at least 8 characters with letters and numbers.'); return render(); }
    S.auth.busy = true; render();
    try { await Auth.register({name, email, password:pw, ui:I18N.ui, goal:S.ob.goal, lang:S.ob.lang}); S.auth.busy = false; S.auth.err = ''; go('xac-thuc-email'); }
    catch(err){ S.auth.busy = false; S.auth.err = {exists:L('Email này đã được đăng ký. Hãy đăng nhập hoặc chọn “Quên mật khẩu”.','This email is already registered. Log in or reset your password.'), weak:L('Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.','Use at least 8 characters with letters and numbers.'), wait:L('Bạn thử quá nhiều lần. Vui lòng đợi một chút rồi thử lại.','Too many attempts. Please wait a moment and try again.'), network:L('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.','Couldn’t reach the server. Check your connection and try again.')}[err.code] || L('Không tạo được tài khoản. Vui lòng thử lại.','Couldn’t create the account. Please try again.'); render(); }
  }
  if(f.id === 'forgotForm'){
    const email = v('f-email').trim(); S.auth.email = email;
    if(!EMAIL_OK(email)){ S.auth.err = L('Email chưa đúng định dạng.','Enter a valid email.'); return render(); }
    try { await Auth.forgot(email); S.auth.err = ''; S.auth.resetSent = true; }
    catch(err){ S.auth.err = err.code === 'wait' ? L('Bạn vừa yêu cầu gửi email. Vui lòng đợi một chút rồi thử lại.','You just requested an email. Please wait a moment and try again.') : L('Chưa gửi được email. Vui lòng thử lại.','Couldn’t send the email. Please try again.'); }
    render();
  }
  if(f.id === 'resetForm'){
    const pw = v('f-pass');
    if(!PW_OK(pw)){ S.auth.err = L('Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.','Use at least 8 characters with letters and numbers.'); return render(); }
    try { await Auth.reset(pw); S.auth = {err:'', info:''}; toast(L('Đã đặt lại mật khẩu','Password reset')); go('tong-quan', {}, true); }
    catch(err){ S.auth.err = {expired:L('Link đặt lại mật khẩu đã hết hạn. Hãy yêu cầu link mới.','This reset link has expired. Please request a new one.'), same:L('Mật khẩu mới phải khác mật khẩu cũ.','Your new password must differ from the old one.'), weak:L('Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.','Use at least 8 characters with letters and numbers.')}[err.code] || L('Không đặt lại được mật khẩu. Vui lòng thử lại.','Couldn’t reset the password. Please try again.'); render(); }
  }
  if(f.id === 'profileForm'){ const p = S.data.profile; p.name = v('p-name').trim() || p.name; p.org = v('p-org').trim(); save(); toast(L('Đã lưu thông tin','Profile saved')); render(); }
  if(f.id === 'pwForm'){
    const cur = v('pw-cur'), nw = v('pw-new'); S.pwOk = '';
    if(!PW_OK(nw)){ S.pwErr = L('Mật khẩu mới cần ít nhất 8 ký tự, có cả chữ và số.','Your new password needs 8+ characters with letters and numbers.'); return render(); }
    try { await Auth.changePassword(cur, nw); S.pwErr = ''; S.pwOk = L('Đã lưu mật khẩu mới.','New password saved.'); } catch(err){ S.pwErr = err.code === 'badcred' ? L('Mật khẩu hiện tại không đúng.','Your current password is wrong.') : err.code === 'same' ? L('Mật khẩu mới phải khác mật khẩu hiện tại.','Your new password must differ from the current one.') : L('Chưa đổi được mật khẩu. Vui lòng thử lại.','Couldn’t change the password. Please try again.'); }
    render();
  }
});
let qTimer = null;
document.addEventListener('input', e => {
  const el = e.target;
  if(el.dataset.draft && S.draft) S.draft[el.dataset.draft] = el.value;
  if(el.dataset.qa != null) S.qa[el.dataset.qa] = {...(S.qa[el.dataset.qa] || {}), text:el.value};
  if(el.id === 'sc-text'){ S.scriptText = el.value; const c = $('#sc-count'); if(c) c.textContent = countText(wordsOf(el.value)); }
  if(el.id === 'lib-q'){ clearTimeout(qTimer); qTimer = setTimeout(() => { go('thu-vien', {f:S.params.f, q:el.value}, true); setTimeout(() => { const i = $('#lib-q'); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0); }, 350); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if(el.id === 'p-goal'){ S.data.profile.goal = el.value; S.draft = null; save(); toast(L('Đã đổi mục tiêu mặc định','Default goal updated')); render(); }
  if(el.id === 'd-file'){
    const f = el.files[0]; if(!f) return;
    S.fileErr = validateFile(f);
    S.draft.file = {name:f.name, size:f.size, type:f.type, dur:0, obj:f};
    render(); if(S.fileErr) return;
    const probe = document.createElement(/^video/.test(f.type) ? 'video' : 'audio'), url = URL.createObjectURL(f); probe.preload = 'metadata';
    const to = setTimeout(() => URL.revokeObjectURL(url), 5000);
    probe.onloadedmetadata = () => { clearTimeout(to); URL.revokeObjectURL(url); if(S.draft && S.draft.file && S.draft.file.obj === f && isFinite(probe.duration)){ S.draft.file.dur = Math.round(probe.duration); if(probe.duration > CONFIG.maxRecordSec) S.fileErr = L(`File dài ${fmtT(probe.duration)}, vượt thời lượng tối đa 30 phút.`, `This file is ${fmtT(probe.duration)}, over the 30-minute maximum.`); if(S.route === 'luyen-tap') render(); } };
    probe.onerror = () => { clearTimeout(to); URL.revokeObjectURL(url); if(S.draft && S.draft.file && S.draft.file.obj === f){ S.fileErr = L('Không đọc được file. File có thể bị hỏng hoặc không phải âm thanh/video.','Couldn’t read this file. It may be damaged or not audio/video.'); if(S.route === 'luyen-tap') render(); } };
    probe.src = url;
  }
  if(el.id === 'sc-file'){
    const f = el.files[0]; if(!f) return;
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if(!CONFIG.scriptExt.includes(ext)){ S.scriptErr = L(`Chỉ hỗ trợ file .txt hoặc .md. Với file Word, hãy sao chép nội dung và dán vào ô bên trên.`, `Only .txt or .md files are supported. For Word files, copy the text and paste it above.`); return render(); }
    if(f.size > 1048576){ S.scriptErr = L('File lớn hơn 1 MB. Hãy dán nội dung trực tiếp.','The file is over 1 MB. Paste the text instead.'); return render(); }
    const rd = new FileReader();
    rd.onload = () => { const t = String(rd.result || ''); if(!t.trim()){ S.scriptErr = L('File không có nội dung.','The file is empty.'); return render(); } S.scriptText = t; S.scriptErr = ''; render(); };
    rd.onerror = () => { S.scriptErr = L('Không đọc được file. Hãy thử lại hoặc dán nội dung.','Couldn’t read the file. Try again or paste the text.'); render(); };
    rd.readAsText(f);
  }
});
document.addEventListener('keydown', e => { if(e.key === 'Escape'){ if(S.modal && !(S.modal.type === 'pay' && S.modal.step === 'processing')){ if(S.modal.type === 'pay') S.pendingAfterPay = null; S.modal = null; render(); } else if(S.menu || S.devOpen){ S.menu = false; S.devOpen = false; render(); } } });

/* ================= Khởi động ================= */
(async function init(){
  I18N.load();
  try { const me = await Auth.me(); if(me){ S.me = me.email; S.data = UserStore.fromMe(me); I18N.set(S.data.profile.ui); } }
  catch(e){ S.offline = true; }
  render();
})();
