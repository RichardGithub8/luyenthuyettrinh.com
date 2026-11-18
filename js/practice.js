'use strict';
/* Buổi luyện qua backend: thư viện, nộp bài, theo dõi phân tích, báo cáo.
   Máy chủ là nguồn dữ liệu duy nhất. S.data.library và S.data.sessions chỉ là bản sao trong bộ nhớ,
   dựng lại từ API sau mỗi lần đăng nhập hoặc tải trang (không lưu vào localStorage). */

const LIB_STATUS = {completed:'analyzed', queued:'analyzing', processing:'analyzing', pending_premium:'pending_premium', pending_quota:'pending_quota', failed:'error', cancelled:'error', uploading:'error', uploaded:'error'};
const dayOf = t => String(t || new Date().toISOString()).slice(0, 10);
const failReason = code => /TIMEOUT/i.test(code || '') ? 'timeout' : 'error';

/* Mục thư viện (server) → mục thư viện của giao diện. `s` là tóm tắt buổi luyện mới nhất của mục đó. */
function libFrom(it, s){
  return {id:it.id, kind:it.kind, title:it.title, goal:s ? s.goal : 'presentation', lang:s ? s.speakingLanguage : 'vi', lessonId:s ? (s.lessonSlug || null) : null,
    placement:!!(s && s.isPlacement), date:dayOf(it.createdAt), created:Date.parse(it.createdAt) || Date.now(), status:s ? (LIB_STATUS[s.status] || 'error') : 'error',
    sessionId:s ? s.id : null, hasMedia:it.kind !== 'script' && !!(it.media && it.media.available), size:it.sizeBytes || 0, words:it.wordCount || null, text:null,
    dur:it.durationSec || 0, reason:s && s.status === 'failed' ? failReason(s.errorCode) : s && LIB_STATUS[s.status] === 'error' ? 'error' : null};
}
/* Kết quả của POST /sessions, /sessions/script, /sessions/:id/analyze → mục thư viện. */
function libFromView(v, extra = {}){
  const it = v.libraryItem;
  return {id:it.id, kind:it.kind, title:v.title, goal:v.goal, lang:v.speakingLanguage, lessonId:extra.lessonId || null, placement:!!v.isPlacement, date:dayOf(v.createdAt),
    created:Date.parse(v.createdAt) || Date.now(), status:LIB_STATUS[v.status] || 'error', sessionId:v.id, hasMedia:it.kind !== 'script' && !it.mediaDeletedAt, size:it.sizeBytes || 0,
    words:it.wordCount || null, text:extra.text || null, dur:it.durationSec || 0, reason:v.error ? failReason(v.error.code) : null};
}
/* Tóm tắt buổi luyện đã chấm xong → buổi luyện của giao diện (chi tiết tải khi mở báo cáo). */
function sessFrom(x){
  return {id:x.id, libId:x.libraryItemId, title:x.title, goal:x.goal, lang:x.speakingLanguage, kind:x.kind, date:dayOf(x.completedAt || x.createdAt), dur:x.durationSec || 0,
    placement:!!x.isPlacement, lessonId:x.lessonSlug || null, c:x.criteria || {}, score:x.score, fillers:x.fillerCount || 0, full:false};
}

/* Tách kịch bản thành đoạn và câu, giống cách backend đếm (để tô màu câu có lỗi). */
function splitScript(text){
  const clean = String(text || '').replace(/\r/g, '').trim(), sentences = [];
  clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).forEach((p, pi) =>
    (p.match(/[^.!?…\n]+[.!?…]*/g) || []).map(x => x.trim()).filter(x => x.split(/\s+/).length > 1).forEach(x => sentences.push({t:x, p:pi, i:sentences.length})));
  return {sentences, paras:new Set(sentences.map(x => x.p)).size};
}
const squash = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
const sentenceFor = (sentences, quote) => { const q = squash(quote); if(!q) return null; const k = sentences.findIndex(x => q.includes(squash(x.t)) || squash(x.t).includes(q)); return k < 0 ? null : k; };
const segFor = (segs, sec) => { if(sec == null) return null; let k = 0; segs.forEach((g, i) => { if(g.t <= sec) k = i; }); return segs.length ? k : null; };

/* Báo cáo của backend (analysis_results) → dạng giao diện đang vẽ. */
function adaptResult(base, v, text){
  const r = v.result || {}, f = r.feedback || {}, c = r.criteria_scores || {}, mock = r.llm_model === 'mock-llm' || r.stt_model === 'mock-stt' || (r.stt_model == null && base.kind !== 'script');
  const s = {...base, c, score:r.overall_score, full:true, server:true, mock, summary:f.summary || '', strengths:f.strengths || [], notes:f.delivery_notes || [], questions:f.audience_questions || []};
  if(base.kind === 'script'){
    const sp = splitScript(text), st = f.script_stats || {};
    s.script = {wc:st.wordCount || 0, paras:st.paragraphs || sp.paras, estSec:st.estSec || 0, sentences:sp.sentences, numCount:st.numbers || 0, weakTotal:0,
      weak:(f.issues || []).map(i => ({title:i.title, detail:i.detail, fix:i.fix, s:sentenceFor(sp.sentences, i.quote)})),
      rewrites:(f.rewrites || []).map(w => ({old:w.original, neu:w.improved}))};
    s.dur = s.script.estSec || base.dur;
    return s;
  }
  const m = r.speech_metrics || {}, fillers = m.fillers || [];
  const segs = ((r.transcript && r.transcript.segments) || []).map(g => {
    let p = [['n', g.text]];
    fillers.filter(x => x.start >= g.start && x.start < g.end).slice(0, 4).forEach(x => {
      p = p.flatMap(([t, str]) => { if(t !== 'n') return [[t, str]]; const k = str.toLowerCase().indexOf(String(x.text).toLowerCase()); if(k < 0) return [[t, str]];
        return [['n', str.slice(0, k)], ['f', str.slice(k, k + x.text.length)], ['n', str.slice(k + x.text.length)]].filter(y => y[1]); });
    });
    return {t:Math.round(g.start), p};
  });
  const weak = (f.issues || []).map(i => ({title:i.title, detail:i.detail, fix:i.fix, s:segFor(segs, i.start_sec)}));
  const marks = [];
  fillers.slice(0, 6).forEach(x => marks.push({type:'filler', t:x.start, s:segFor(segs, x.start), label:L(`Từ đệm “${x.text}”`, `Filler “${x.text}”`)}));
  (m.longPauses || []).slice(0, 4).forEach(x => marks.push({type:'pace', t:x.start, s:segFor(segs, x.start), label:L(`Ngắt nghỉ ${x.durationSec} giây`, `${x.durationSec}s pause`)}));
  weak.forEach(w => { if(w.s != null) marks.push({type:'structure', t:segs[w.s].t, s:w.s, label:w.title}); });
  marks.sort((a, b) => a.t - b.t);
  const dur = Math.max(1, m.durationSec || base.dur);
  s.fillers = m.fillerCount || 0; s.dur = dur;
  s.report = {segs, weak, marks:marks.filter(x => x.s != null).slice(0, 14), pace:m.wpmPerMinute || [], dur, video:base.kind === 'video', body:(r.body_metrics && r.body_metrics.scores) || null,
    rewrites:(f.rewrites || []).map(w => ({old:w.original, neu:w.improved}))};
  return s;
}

/* Gửi tệp lên URL ký của Storage, có tiến độ. Trả về hàm hủy qua `ctl.abort`. */
function putSigned(url, file, onPct, ctl){
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest(); ctl.abort = () => x.abort();
    x.open('PUT', url); const fd = new FormData(); fd.append('cacheControl', '3600'); fd.append('', file);
    x.upload.onprogress = e => { if(e.lengthComputable) onPct(e.loaded / e.total * 100); };
    x.onload = () => x.status >= 200 && x.status < 300 ? res() : rej(new Error('upload ' + x.status));
    x.onerror = () => rej(new Error('network')); x.onabort = () => rej(new Error('aborted'));
    x.send(fd);
  });
}

const Practice = {
  /* Tải thư viện và các buổi đã chấm từ máy chủ. Gọi sau khi đăng nhập và khi mở trang. */
  async hydrate(){
    const D = S.data; if(!D) return;
    const [lib, ses] = await Promise.all([api('/library', {query:{limit:100}}), api('/sessions', {query:{limit:100}})]);
    D.sessions = ses.items.slice().reverse().map(sessFrom);                                  // cũ → mới
    D.library = lib.items.slice().reverse().map(it => libFrom(it, it.session));
    const ps = D.sessions.find(x => x.placement);
    D.placement = ps ? {id:ps.id, score:ps.score, seen:!!(D.placement && D.placement.id === ps.id && D.placement.seen)} : null;
    this.deriveLessons();
    this.resume();
    Team.load();   // nhóm và lời mời (gói Team)
  },
  /* Tiến độ bài học (số lần, điểm cao nhất, hoàn thành) tính từ các buổi đã chấm. */
  deriveLessons(){
    const D = S.data, agg = {};
    D.sessions.forEach(s => { if(!s.lessonId) return; const a = agg[s.lessonId] || (agg[s.lessonId] = {attempts:0, best:0}); a.attempts++; a.best = Math.max(a.best, s.score); });
    Object.keys({...D.lessons, ...agg}).forEach(id => {
      const prev = D.lessons[id] || {}, a = agg[id];
      D.lessons[id] = a ? {...prev, attempts:a.attempts, best:a.best, status:a.best >= CONFIG.passScore ? 'done' : 'doing'}
                        : {...prev, attempts:0, best:0, status:prev.read ? 'doing' : undefined};
    });
  },
  async refreshMe(){
    const me = await Auth.me(); if(!me || !S.data) return;
    Object.assign(S.data, {plan:me.plan, expiry:me.premiumExpiresAt ? me.premiumExpiresAt.slice(0, 10) : null, used:me.usage.used, limit:me.usage.limit, usageScope:me.usage.scope});
  },
  /* Sau khi tải lại trang: nếu có bài đang phân tích thì theo dõi tiếp. */
  resume(){
    const it = S.data.library.filter(l => l.status === 'analyzing' && l.sessionId).pop();
    if(it && !(S.job && S.job.status === 'running')) this.watch(it);
  },

  /* ---- Nộp bài ---- */
  ctx(d){
    const o = {goal:d.goal, speakingLanguage:d.lang};
    if(d.placement) o.isPlacement = true; else if(d.lessonId) o.lessonSlug = d.lessonId; else o.customTitle = draftTitle(d);
    return o;
  },
  async submitScript(text){
    const d = S.draft, v = await api('/sessions/script', {method:'POST', body:{text, ...this.ctx(d)}});
    return this.accept(v, {lessonId:d.lessonId, text});
  },
  /* Tạo buổi luyện, tải tệp lên Storage, báo hoàn tất. Dùng cho cả ghi âm/quay video lẫn tải file. */
  startMedia(file, dur, kind, name){
    if(!navigator.onLine){ toast(L('Bạn đang ngoại tuyến. Kết nối mạng rồi thử lại.','You’re offline. Reconnect and try again.'), 'err'); return; }
    S.upload = {file:{name:name || file.name || 'recording', size:file.size, type:file.type, dur}, blob:file, kind, source:name === 'recording' ? 'recording' : 'upload', draft:{...S.draft}, pct:0, status:'uploading', ctl:{}};
    go('tai-len'); this.runUpload();
  },
  async runUpload(){
    const u = S.upload; if(!u) return; u.status = 'uploading'; u.pct = Math.min(u.pct, 95);
    const upd = p => { u.pct = p; const b = $('#up-bar'), t = $('#up-pct'); if(b) b.style.width = p + '%'; if(t) t.textContent = Math.round(p) + '%'; };
    try {
      if(!u.created) u.created = await api('/sessions', {method:'POST', body:{kind:u.kind, mimeType:u.blob.type || (u.kind === 'video' ? 'video/webm' : 'audio/webm'), sizeBytes:u.blob.size, source:u.source, ...this.ctx(u.draft)}});
      await putSigned(u.created.upload.signedUrl, u.blob, upd, u.ctl);
      if(S.upload !== u) return;
      upd(100);
      const v = await api(`/sessions/${u.created.session.id}/upload-complete`, {method:'POST', body:{durationSec:Math.max(1, u.file.dur || 1)}});
      if(S.upload !== u) return;
      S.upload = null; S.draft = u.draft.placement ? S.draft : null;
      this.accept(v, {lessonId:u.draft.lessonId});
    } catch(e){
      if(S.upload !== u || e.message === 'aborted') return;
      if(e instanceof ApiError && !['NETWORK'].includes(e.code)){ // lỗi nghiệp vụ (quá dài, quá nặng, cần Premium…): không thử lại được
        S.upload = null; toast(e.message || L('Không nộp được bài. Vui lòng thử lại.','Couldn’t submit. Please try again.'), 'err'); return go('luyen-tap');
      }
      u.status = 'error'; if(S.route === 'tai-len') render();
    }
  },
  cancelUpload(){ const u = S.upload; if(u && u.ctl && u.ctl.abort) u.ctl.abort(); S.upload = null; },

  /* Đưa kết quả tạo/phân tích lại vào thư viện rồi chuyển theo trạng thái. */
  accept(v, extra = {}){
    const D = S.data, item = libFromView(v, extra), old = D.library.findIndex(l => l.id === item.id);
    if(old >= 0) D.library[old] = {...D.library[old], ...item, text:item.text || D.library[old].text, lessonId:item.lessonId || D.library[old].lessonId}; else D.library.push(item);
    const it = D.library.find(l => l.id === item.id);
    this.refreshMe().then(() => { if(S.data) render(); });
    if(it.status === 'analyzing'){ this.watch(it); go('dang-phan-tich', {id:it.id}); return it; }
    if(it.status === 'pending_premium'){ S.modal = {type:'over-limit', id:it.id}; go('thu-vien'); return it; }
    if(it.status === 'pending_quota'){ S.modal = {type:'quota', id:it.id}; go('thu-vien'); return it; }
    toast(L('Không bắt đầu phân tích được. Mở Thư viện để thử lại.','Couldn’t start the analysis. Open your Library to retry.'), 'err'); go('thu-vien'); return it;
  },
  async analyze(id){
    const it = libItem(id); if(!it || !it.sessionId) return;
    if(!navigator.onLine){ toast(L('Bạn đang ngoại tuyến. Bài nói đã được lưu, hãy phân tích khi có mạng.','You’re offline. Your talk is saved; analyse it once you’re back online.'), 'err'); return; }
    if(S.job && S.job.status === 'running' && S.job.libId !== id){ toast(L('Đang phân tích một bài khác. Vui lòng đợi.','Another talk is being analysed. Please wait.')); return; }
    try { const v = await api(`/sessions/${it.sessionId}/analyze`, {method:'POST'}); this.accept(v, {lessonId:it.lessonId, text:it.text}); }
    catch(e){ toast(e.message || L('Không phân tích được. Vui lòng thử lại.','Couldn’t analyse. Please try again.'), 'err'); }
  },

  /* ---- Theo dõi phân tích (poll trạng thái buổi luyện) ---- */
  watch(item){
    clearInterval(S.jobTimer);
    const n = item.kind === 'script' ? AN_STEPS.script.length : AN_STEPS.speech.length - (item.kind === 'video' ? 0 : 1);
    /* Màn "AI đang phân tích" luôn hiện ít nhất CONFIG.analyzeMinMs để người xem thấy đủ các bước.
       Các bước chạy đều theo thời gian; báo cáo chỉ mở khi backend đã xong THẬT và đã đủ thời gian tối thiểu. */
    const minMs = Math.max(0, CONFIG.analyzeMinMs || 0);
    const j = S.job = {libId:item.id, sid:item.sessionId, i:0, n, status:'running', t0:Date.now(), minMs, result:null, lastPoll:0};
    let busy = false;
    const step = () => Math.min(n - 1, Math.floor((Date.now() - j.t0) / Math.max(1, (minMs || n * 1800) / n)));
    const poll = async () => {
      busy = true; j.lastPoll = Date.now();
      try {
        const v = await api('/sessions/' + j.sid);
        if(S.job !== j) return;
        if(v.status === 'completed'){ j.result = v; return; }
        if(['failed', 'cancelled'].includes(v.status)) return this.fail(item, j, v.error && v.error.code);
        if(!['queued', 'processing'].includes(v.status)){ clearInterval(S.jobTimer); S.job = null; }
      } catch(e){ if(e instanceof ApiError && e.status === 401) clearInterval(S.jobTimer); }
      finally { busy = false; }
    };
    const tick = () => {
      if(S.job !== j || j.status !== 'running') return;
      if(j.result && Date.now() - j.t0 >= minMs) return this.finish(item, j, j.result);
      const i = step();
      if(i !== j.i){ j.i = i; if(S.route === 'dang-phan-tich') render(); }
      if(!j.result && !busy && Date.now() - j.lastPoll >= 1200) poll();
    };
    S.jobTimer = setInterval(tick, 200); tick();
  },
  fail(item, j, code){
    clearInterval(S.jobTimer); j.status = 'failed'; item.status = 'error'; item.reason = failReason(code); item.failStep = j.i;
    this.refreshMe();
    if(S.route === 'dang-phan-tich') render(); else toast(L('Phân tích lỗi. Mở Thư viện để thử lại.','Analysis failed. Open your Library to retry.'), 'err');
  },
  async finish(item, j, v){
    clearInterval(S.jobTimer); j.i = j.n; j.status = 'done';
    const D = S.data, text = item.kind === 'script' ? await this.scriptText(item) : null;
    const s = adaptResult({id:v.id, libId:item.id, title:v.title, goal:v.goal, lang:v.speakingLanguage, kind:item.kind, date:dayOf(v.completedAt), dur:v.libraryItem.durationSec || item.dur,
      placement:v.isPlacement, lessonId:item.lessonId}, v, text);
    const k = D.sessions.findIndex(x => x.id === s.id); if(k >= 0) D.sessions[k] = s; else D.sessions.push(s);
    item.status = 'analyzed'; item.sessionId = s.id; item.dur = s.dur;
    if(item.placement){ D.placement = {id:s.id, score:s.score, seen:false}; D.onboarded = true; S.draft = null; }
    this.deriveLessons(); await this.refreshMe(); save(); S.qa = {};
    const here = S.route === 'dang-phan-tich' && S.params.id === item.id;
    const onScreen = S.route === 'dang-phan-tich' && S.params.id === item.id;
    if(!onScreen) toast(item.placement ? L('Đã có kết quả bài test đầu vào','Your placement result is ready') : L('Báo cáo đã sẵn sàng','Your report is ready'));
    if(here){ render(); setTimeout(() => { if(S.route === 'dang-phan-tich' && S.params.id === item.id) item.placement ? go('tong-quan') : go('bao-cao', {id:s.id}); }, 900); } // khoảnh khắc "100%" trước khi mở báo cáo
    else render();
  },

  /* ---- Báo cáo và thư viện ---- */
  async scriptText(item){
    if(item.text) return item.text;
    const d = await api('/library/' + item.id); item.text = d.scriptText || ''; return item.text;
  },
  /* Mở báo cáo từ bản tóm tắt: tải chi tiết (bản chép lời, lỗi, gợi ý) rồi vẽ lại. */
  async ensureFull(s){
    if(s.full || s.loading) return; s.loading = true;
    try {
      const v = await api('/sessions/' + s.id), item = libItem(s.libId) || {text:null, id:s.libId};
      const text = s.kind === 'script' ? await this.scriptText(item) : null;
      const full = adaptResult(s, v, text), k = S.data.sessions.findIndex(x => x.id === s.id);
      if(k >= 0) S.data.sessions[k] = full;
    } catch(e){ s.loading = false; s.loadErr = true; }
    render();
  },
  async mediaUrl(id, download){ const r = await api(`/library/${id}/media`, {query:download ? {download:1} : {}}); return r.url; },
  async remove(id){
    await api('/library/' + id, {method:'DELETE'});
    const D = S.data, it = libItem(id);
    D.library = D.library.filter(l => l.id !== id);
    if(it && it.sessionId){ D.sessions = D.sessions.filter(s => s.id !== it.sessionId); if(D.placement && D.placement.id === it.sessionId) D.placement = null; }
    this.deriveLessons();
  },
};
const startJob = id => Practice.analyze(id);
