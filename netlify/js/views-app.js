'use strict';
/* AppLayout: các trang sau khi đăng nhập. */

/* ---------- Thiết lập sau đăng ký ---------- */
const OB_STEPS = () => [L('Mục tiêu','Goal'), L('Ngôn ngữ bài nói','Speech language'), L('Buổi tập đầu','First session'), L('Bài test','Test')];
function vObGoal(){
  return OnboardLayout(`${progressSteps(OB_STEPS(), 0)}<h1>${L('Chọn mục tiêu luyện tập chính','Choose your main goal')}</h1>
    <p class="lead">${L('Mục tiêu được lưu làm mặc định. Mỗi buổi luyện bạn đổi nhanh được, không phải chọn lại từ đầu.','This is saved as your default. You can switch quickly in any session without starting over.')}</p>
    ${goalChoices(S.data.profile.goal, 'set-goal')}
    <div class="flow-actions"><span></span><button class="btn btn-primary" data-go="thiet-lap-ngon-ngu">${L('Tiếp tục','Continue')}</button></div>`);
}
function vObSpeech(){
  return OnboardLayout(`${progressSteps(OB_STEPS(), 1)}<h1>${L('Ngôn ngữ bài nói mặc định','Default speech language')}</h1>
    <p class="lead">${L('Dùng cho các buổi luyện và bài học. Bạn đổi được trong từng buổi.','Used for sessions and lessons. You can change it per session.')}</p>
    ${langChoices(S.data.profile.speechLang, 'set-speech')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="thiet-lap-muc-tieu">${L('Quay lại','Back')}</button><button class="btn btn-primary" data-go="thiet-lap-xem-truoc">${L('Tiếp tục','Continue')}</button></div>`);
}
function vObPreview(){
  const p = S.data.profile, g = GOALS[p.goal], first = COURSES[p.goal][0];
  return OnboardLayout(`${progressSteps(OB_STEPS(), 2)}<h1>${L(`Buổi luyện ${tx(g.name).toLowerCase()} đầu tiên của bạn`, `Your first ${tx(g.name).toLowerCase()} session`)}</h1>
    <p class="lead">${L('Đề bài và người nghe AI được chọn theo đúng mục tiêu của bạn.','The topic and AI listener are picked for your goal.')}</p>
    <div class="preview-card">
      <div class="quote"><small>${L('Đề bài mẫu','Sample topic')} · ${langName(p.speechLang)}</small><b>${esc(g.prompts[0][p.speechLang])}</b></div>
      <div class="persona"><div class="avatar">${g.persona.split(' ').pop()[0]}</div><div><b>${g.persona}</b> · ${tx(g.role)}<div class="muted" style="font-size:13px">${L('Tập trung chấm','Focuses on')} ${tx(g.focus)}</div></div></div>
      <div class="quote"><small>${L('Bài học đầu tiên trong lộ trình','First lesson in your path')}</small>${tx(first.title)}</div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-go="thiet-lap-ngon-ngu">${L('Quay lại','Back')}</button><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" data-act="ob-finish">${L('Để sau, vào Tổng quan','Later, go to dashboard')}</button><button class="btn btn-primary" data-act="ob-test">${L('Làm bài test đầu vào','Take the placement test')}</button></div></div>`);
}
function vTest(){
  return OnboardLayout(`${progressSteps(OB_STEPS(), 3)}<h1 style="margin-top:12px">${L('Giới thiệu bản thân trong 60 giây','Introduce yourself in 60 seconds')}</h1>
    <span class="eyebrow">${L('60 giây · không tính lượt phân tích','60 seconds · free of charge')}</span>
    <p class="lead">${L('AI dùng bài nói này để xác định trình độ và sắp xếp lộ trình khóa học cho bạn.','AI uses this to gauge your level and order your course path.')}</p>
    <div class="intro-list">
      <div><div class="feat-ic c-blue">1</div><div><h3>${L('Bạn là ai','Who you are')}</h3><p>${L('Tên, đang học hoặc làm gì.','Your name and what you do.')}</p></div></div>
      <div><div class="feat-ic c-orange">2</div><div><h3>${L('Một điều bạn tự hào','Something you’re proud of')}</h3><p>${L('Một thành tích hoặc trải nghiệm ngắn.','A short achievement or experience.')}</p></div></div>
      <div><div class="feat-ic c-green">3</div><div><h3>${L('Mục tiêu khi luyện thuyết trình','Your speaking goal')}</h3><p>${L('Bạn muốn nói tốt hơn ở đâu.','Where you want to speak better.')}</p></div></div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-act="ob-finish">${L('Để sau','Later')}</button><button class="btn btn-primary" data-act="test-start">${ic('mic',18)} ${L('Bắt đầu ghi âm','Start recording')}</button></div>`);
}

/* ---------- Tổng quan ---------- */
function rowHtml(s){
  return `<button class="row" data-go="bao-cao" data-p="id=${s.id}"><div style="min-width:0"><div class="row-t">${esc(s.title)}</div><div class="row-m">${tx(GOALS[s.goal].name)} · ${langName(s.lang)} · ${tx(KIND[s.kind])} · ${fmtT(s.dur)}${s.lessonId ? ' · ' + L('Bài học','Lesson') : ''}</div></div><span class="row-m row-d num">${fmtD(s.date)}</span><span class="score-pill num ${sCls(s.score)}">${s.score}</span></button>`;
}
function nextLessonCard(){
  const goal = S.data.profile.goal, path = coursePath(goal, S.data), n = path.next, g = GOALS[goal];
  if(!n) return `<div class="card soft"><h3>${L('Bạn đã hoàn thành khóa','You finished the course')} ${tx(g.name).toLowerCase()}</h3><p class="sub">${L('Thử một khóa học khác để mở rộng kỹ năng.','Try another course to broaden your skills.')}</p><button class="btn btn-primary btn-sm" style="margin-top:12px" data-go="khoa-hoc">${L('Xem khóa học','See courses')}</button></div>`;
  return `<div class="card"><div class="next-lesson"><div class="num-badge ${'c-' + g.color}">${n.n}</div><div style="min-width:0"><div class="hint">${L('Bài học tiếp theo cho bạn','Your next lesson')} · ${tx(g.name)} · ${path.done}/${path.total}</div><h3 style="font-size:17px;margin-top:2px">${tx(n.title)}</h3>${path.reason(n) ? `<div class="hint" style="color:var(--blue)">${path.reason(n)}</div>` : `<div class="hint">${tx(SKILL[n.skill])} · ${n.mins} ${L('phút','min')}</div>`}</div><button class="btn btn-primary" data-go="bai-hoc" data-p="id=${n.id}">${L('Học ngay','Start lesson')}</button></div></div>`;
}
function vDashboard(){
  const D = S.data, ss = D.sessions, name = esc((D.profile.name || '').trim().split(' ').pop() || L('bạn','there'));
  const pending = D.library.filter(l => /^pending|error/.test(l.status));
  let body = '';
  if(D.placement && !D.placement.seen) body += `<div class="banner good"><div><h3>${L(`Kết quả bài test đầu vào: ${levelName(D.placement.score)}, ${D.placement.score} điểm`, `Placement result: ${levelName(D.placement.score)}, ${D.placement.score} points`)}</h3><p>${L('Lộ trình khóa học đã được sắp xếp theo điểm yếu của bạn.','Your course path is now ordered by your weak spots.')}</p></div><div class="acts"><button class="btn btn-primary btn-sm" data-go="bao-cao" data-p="id=${D.placement.id}">${L('Xem báo cáo','View report')}</button><button class="btn btn-ghost btn-sm" data-act="placement-seen">${L('Đóng','Dismiss')}</button></div></div>`;
  if(pending.length) body += `<div class="banner warn"><div><h3>${L(`${pending.length} bài nói đang chờ phân tích`, `${pending.length} talk${pending.length>1?'s':''} waiting for analysis`)}</h3><p>${esc(pending[0].title)}${pending.length > 1 ? L(` và ${pending.length-1} bài khác`, ` and ${pending.length-1} more`) : ''}</p></div><button class="btn btn-primary btn-sm" data-go="thu-vien" data-p="f=pending">${L('Mở thư viện','Open library')}</button></div>`;
  else if(!isPro() && left() <= 1) body += `<div class="banner"><div><h3>${left() ? L('Còn 1 lượt phân tích trong tháng','1 analysis left this month') : L('Bạn đã dùng hết lượt phân tích tháng này','You’ve used all analyses this month')}</h3><p>${L('Premium có 50 lượt mỗi tháng, phân tích video và khán giả AI.','Premium includes 50 analyses a month, video analysis and the AI audience.')}</p></div><button class="btn btn-primary btn-sm" data-act="buy">${L('Nâng cấp','Upgrade')}</button></div>`;
  const head = `<div class="page-head"><div><h1>${L(`Chào ${name}`, `Hi ${name}`)}${isPro() ? proChip() : ''}</h1><p>${ss.length > 1 ? L(`Điểm của bạn đã thay đổi ${ss[ss.length-1].score - ss[0].score >= 0 ? '+' : ''}${ss[ss.length-1].score - ss[0].score} điểm kể từ lần đầu.`, `Your score has changed by ${ss[ss.length-1].score - ss[0].score >= 0 ? '+' : ''}${ss[ss.length-1].score - ss[0].score} since your first session.`) : L('Mỗi buổi luyện chỉ mất khoảng 5 phút.','Each session takes about 5 minutes.')}</p></div><button class="btn btn-primary" data-act="new-practice">${ic('mic',18)} ${L('Bắt đầu luyện','Start practising')}</button></div>`;
  if(!ss.length){
    return AppLayout(head + body + nextLessonCard() + `<div class="empty mt" style="padding:44px 24px"><b>${L('Bạn chưa có buổi luyện nào','No sessions yet')}</b><span>${L('Làm bài test đầu vào 60 giây để AI cá nhân hóa lộ trình, hoặc bắt đầu luyện ngay.','Take the 60-second placement test so AI can personalise your path, or start practising now.')}</span><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px"><button class="btn btn-primary" data-act="test-start">${L('Làm bài test đầu vào','Take the placement test')}</button><button class="btn btn-outline" data-act="new-practice">${L('Luyện tập','Practise')}</button></div></div>`);
  }
  const last = ss[ss.length-1], prev = ss[ss.length-2], avgS = Math.round(avg(ss.map(s => s.score))), mins = Math.round(ss.reduce((a,s) => a + s.dur, 0)/60);
  const speech = ss.filter(s => s.kind !== 'script');
  body += nextLessonCard() + `
    <div class="grid g-4 mt">
      <div class="card stat"><div class="k">${L('Điểm gần nhất','Latest score')}</div><div class="v num">${last.score}</div><div class="d ${prev ? (last.score >= prev.score ? 'up' : 'down') : 'muted'}">${prev ? (last.score >= prev.score ? '+' : '') + (last.score - prev.score) + ' ' + L('so với lần trước','vs. last time') : L('Lần luyện đầu tiên','First session')}</div></div>
      <div class="card stat"><div class="k">${L('Điểm trung bình','Average score')}</div><div class="v num">${avgS}</div><div class="d muted">${ss.length} ${L('lần luyện','sessions')}</div></div>
      <div class="card stat"><div class="k">${L('Thời gian đã luyện','Time practised')}</div><div class="v num">${mins} <span style="font-size:15px">${L('phút','min')}</span></div><div class="d muted">${L('từ','since')} ${fmtDL(ss[0].date)}</div></div>
      <div class="card stat"><div class="k">${L('Lượt phân tích còn lại','Analyses left')}</div><div class="v num">${left()}<span style="font-size:15px" class="muted"> / ${plan().limit}</span></div><div class="meter"><b style="width:${Math.min(100, D.used/plan().limit*100)}%"></b></div></div>
    </div>
    <div class="grid g-main mt">
      <div class="card"><h3>${L('Điểm qua các lần luyện','Score across sessions')}</h3><div class="sub">${L('Thang 100','Out of 100')}</div><div style="margin-top:12px">${ss.length > 1 ? lineChart(ss.slice(-10).map(s => ({label:fmtD(s.date), v:s.score}))) : `<div class="empty"><span>${L('Luyện thêm 1 lần để xem biểu đồ tiến bộ.','Practise once more to see your progress chart.')}</span></div>`}</div></div>
      <div class="card"><div class="card-head"><h3>${L('Lần luyện gần đây','Recent sessions')}</h3><button class="btn-link" style="font-size:13px" data-go="tien-bo">${L('Xem tất cả','See all')}</button></div><div class="list" style="margin-top:6px">${ss.slice(-5).reverse().map(rowHtml).join('')}</div></div>
    </div>
    ${speech.length ? `<div class="card mt"><h3>${L('Lỗi thường gặp','Common issues')}</h3><div class="grid g-3" style="margin-top:12px">${[['filler', L('Từ đệm mỗi bài','Fillers per talk'), speech[0].fillers, speech[speech.length-1].fillers, true],['pace', tx(CRIT.pace), speech[0].c.pace, speech[speech.length-1].c.pace],['structure', tx(CRIT.structure), speech[0].c.structure, speech[speech.length-1].c.structure]].map(([k,l,a,b,lower]) => `<div><div class="hint">${l}</div><div style="display:flex;gap:8px;align-items:center;margin-top:6px" class="num">${speech.length > 1 ? `<span class="chip">${a}</span>${ic('arrow',14)}` : ''}<span class="chip ${speech.length > 1 ? ((lower ? b <= a : b >= a) ? 'good' : 'bad') : 'blue'}">${b}</span></div></div>`).join('')}</div></div>` : ''}`;
  return AppLayout(head + body);
}

/* ---------- Luyện tập ---------- */
function ensureDraft(){
  if(!S.draft) S.draft = {goal:S.data.profile.goal, lang:S.data.profile.speechLang, promptIdx:0, custom:'', kind:'audio', file:null, lessonId:null, placement:false};
  return S.draft;
}
const draftTitle = d => d.placement ? L('Giới thiệu bản thân (bài test đầu vào)','Self-introduction (placement test)') : d.lessonId ? tx(LESSON_BY_ID[d.lessonId].title) : (d.custom.trim() || GOALS[d.goal].prompts[d.promptIdx][d.lang]);
function vPractice(){
  const d = ensureDraft(), g = GOALS[d.goal], p = plan(), D = S.data, lesson = d.lessonId && LESSON_BY_ID[d.lessonId];
  const kinds = [['audio','mic',L('Ghi âm','Record audio'),L('Nói trực tiếp qua micro','Speak into your microphone'),false],['video','video',L('Quay video','Record video'),L('Phân tích cả ngôn ngữ cơ thể','Includes body language'),!p.video],['upload','upload',L('Tải file lên','Upload a file'),L('Âm thanh hoặc video có sẵn','An existing audio or video file'),false],['script','doc',L('Chấm kịch bản','Review a script'),L('Dán hoặc tải kịch bản để AI chấm','Paste or upload a script for review'),false]];
  const fe = S.fileErr;
  const label = {audio:L('Bắt đầu ghi âm','Start recording'), video:L('Bắt đầu quay','Start video'), upload:L('Tải lên và phân tích','Upload and analyse'), script:L('Tiếp tục tới kịch bản','Continue to script')}[d.kind];
  return AppLayout(`
    <div class="page-head"><div>${lesson ? `<div class="crumbs"><button data-go="khoa-hoc">${L('Khóa học','Courses')}</button>›<button data-go="khoa-hoc-chi-tiet" data-p="g=${lesson.goal}">${tx(GOALS[lesson.goal].name)}</button>›<button data-go="bai-hoc" data-p="id=${lesson.id}">${L('Bài','Lesson')} ${lesson.n}</button></div>` : ''}<h1>${lesson ? L('Luyện tập bài học','Lesson practice') : L('Luyện tập','Practice')}</h1><p>${lesson ? esc(tx(lesson.title)) : L('Đổi nhanh mục tiêu, chọn đề bài và hình thức nộp bài.','Switch your goal, pick a topic and how to submit.')}</p></div>${lesson ? `<button class="btn btn-ghost btn-sm" data-act="leave-lesson">${L('Luyện tự do','Free practice')}</button>` : ''}</div>
    ${!d.placement && !isPro() && left() <= 0 ? `<div class="banner warn"><div><h3>${L('Bạn đã dùng hết lượt phân tích tháng này','No analyses left this month')}</h3><p>${L('Bạn vẫn luyện được. Bài nói sẽ được lưu vào Thư viện và phân tích ngay khi bạn nâng cấp.','You can still practise. Your talk is saved to your Library and analysed as soon as you upgrade.')}</p></div><button class="btn btn-primary btn-sm" data-act="buy">${L('Nâng cấp','Upgrade')}</button></div>` : ''}
    <div class="practice">
      <div class="card section-gap">
        <div><div class="sec-t">${L('Mục tiêu','Goal')}${lesson ? '' : `<button class="btn-link" style="font-size:13px" data-act="toggle-goals">${S.goalPick ? L('Xong','Done') : L('Đổi nhanh','Switch')}</button>`}</div>
          <div class="goal-now"><span class="chip ${'c-' + g.color}" style="font-size:14px;padding:6px 14px">${ic(goalIcon[d.goal],16)} ${tx(g.name)}</span><span class="muted" style="font-size:13px">${L('Người nghe AI','AI listener')}: <b style="color:var(--ink)">${g.persona}</b>, ${tx(g.role).toLowerCase()}</span>${!lesson && d.goal !== D.profile.goal ? `<button class="btn-link" style="font-size:13px" data-act="make-default">${L('Đặt làm mặc định','Make default')}</button>` : ''}</div>
          ${S.goalPick && !lesson ? `<div class="pills" style="margin-top:12px">${GOAL_KEYS.map(k => `<button class="pill ${d.goal===k?'on':''}" data-act="d-goal" data-goal="${k}" aria-pressed="${d.goal===k}">${tx(GOALS[k].name)}</button>`).join('')}</div>` : ''}
        </div>
        <div><div class="sec-t">${L('Ngôn ngữ bài nói','Speech language')}</div><div class="seg" role="group"><button class="${d.lang==='vi'?'on':''}" data-act="d-lang" data-v="vi">Tiếng Việt</button><button class="${d.lang==='en'?'on':''}" data-act="d-lang" data-v="en">English</button></div></div>
        ${lesson ? `<div><div class="sec-t">${L('Đề bài','Task')}</div><div class="task" style="margin-top:0"><b>${esc(tx(lesson.task))}</b><span class="hint">${L('Thời lượng gợi ý','Suggested length')}: ${fmtDur(lesson.target)}</span></div></div>`
        : `<div><div class="sec-t">${L(`Đề bài ${tx(g.name).toLowerCase()}`, `${tx(g.name)} topics`)}</div><div class="prompt-list">${g.prompts.map((pr,i) => `<button class="prompt ${!d.custom && d.promptIdx===i?'on':''}" data-act="d-prompt" data-i="${i}"><span class="dot"></span><span>${esc(pr[d.lang])}</span></button>`).join('')}
          <div class="field" style="margin-top:4px"><label for="d-custom">${L('Hoặc tự nhập chủ đề','Or write your own topic')}</label><input class="input" id="d-custom" data-draft="custom" value="${esc(d.custom)}" placeholder="${L('VD: Bảo vệ đồ án môn Marketing','e.g. My marketing project defence')}"></div></div></div>`}
        <div><div class="sec-t">${L('Hình thức nộp bài','How to submit')}</div><div class="choice-grid">${kinds.map(([k,i,l,s,lock]) => `<button class="choice ${d.kind===k?'on':''}" data-act="d-kind" data-v="${k}" ${lock ? 'data-locked="1"' : ''} aria-pressed="${d.kind===k}">${lock ? `<span class="tag">${proChip()}</span>` : ''}<span class="ic">${ic(i)}</span><h3>${l}</h3><p>${s}</p></button>`).join('')}</div>
          ${d.kind === 'upload' ? `<label class="drop ${fe ? 'err' : ''}" for="d-file" style="margin-top:14px"><input type="file" id="d-file" accept="${CONFIG.uploadExt.map(e => '.' + e).join(',')},audio/*,video/*" class="sr-only"><b>${d.file ? esc(d.file.name) : L('Chọn file âm thanh hoặc video','Choose an audio or video file')}</b><div class="hint" style="margin-top:4px">${d.file ? `${(d.file.size/1048576).toFixed(1)} MB${d.file.dur ? ' · ' + fmtT(d.file.dur) : ''}` : `MP3, WAV, M4A, MP4, WEBM, MOV · ${L('tối đa','max')} ${CONFIG.maxUploadMB} MB, 30 ${L('phút','min')}`}</div></label>${fe ? `<div style="margin-top:10px">${alertBox('err', fe)}</div>` : ''}${d.file && d.file.dur > p.maxAnalyzeSec ? `<div style="margin-top:10px">${alertBox('warn', L(`File dài ${fmtT(d.file.dur)}, vượt 5 phút của gói Miễn phí. File sẽ được lưu vào Thư viện và phân tích khi bạn nâng cấp Premium.`, `This file is ${fmtT(d.file.dur)}, over the 5-minute Free limit. It will be saved to your Library and analysed when you upgrade.`))}</div>` : ''}` : ''}
          ${!isPro() && (d.kind === 'audio' || d.kind === 'upload') ? `<p class="hint" style="margin-top:10px">${L('Gói Miễn phí phân tích bài dài tối đa 5 phút. Bài dài hơn được lưu vào Thư viện và phân tích khi nâng cấp.','The Free plan analyses talks up to 5 minutes. Longer talks are saved to your Library and analysed when you upgrade.')}</p>` : ''}
        </div>
        <div class="flow-actions" style="margin-top:4px"><span class="hint">${esc(draftTitle(d))}</span><button class="btn btn-primary btn-lg" data-act="begin" ${d.kind === 'upload' && (!d.file || fe) ? 'disabled' : ''}>${label}</button></div>
      </div>
      <div class="p-side">
        <div class="card"><span class="eyebrow">${L('Người nghe của bạn','Your listener')}</span><div class="persona" style="margin-top:12px"><div class="avatar">${g.persona.split(' ').pop()[0]}</div><div><b>${g.persona}</b><div class="muted" style="font-size:13px">${tx(g.role)}</div></div></div><p class="muted" style="font-size:14px;margin-top:12px">${L('Tập trung chấm','Focuses on')} ${tx(g.focus)}.</p><div class="quote" style="margin-top:12px"><small>${L('Có thể sẽ hỏi','Might ask')}</small>“${tx(g.questions[0])}”</div></div>
        <div class="card"><h3>${L('Gói','Plan')} ${planName()}</h3><div class="sub">${L(`Còn ${left()} / ${p.limit} lượt · phân tích tối đa ${p.maxAnalyzeSec/60} phút mỗi bài`, `${left()} of ${p.limit} left · up to ${p.maxAnalyzeSec/60} min per talk`)}</div>${isPro() ? '' : `<button class="btn btn-outline btn-sm" style="margin-top:12px" data-act="buy">${L('Nâng cấp Premium','Upgrade to Premium')}</button>`}</div>
      </div>
    </div>`);
}

/* ---------- Ghi âm / quay video ---------- */
function vRecord(){
  const d = S.draft, g = GOALS[d.goal], r = S.rec, p = plan(), max = d.placement ? 60 : CONFIG.maxRecordSec;
  const head = `<div class="page-head"><div><h1 style="margin-top:8px">${esc(draftTitle(d))}</h1><span class="eyebrow">${d.placement ? L('Bài test đầu vào','Placement test') : tx(g.name)} · ${langName(d.lang)}</span></div><button class="btn btn-ghost btn-sm" data-act="rec-cancel">${L('Hủy','Cancel')}</button></div>`;
  if(r.state === 'denied'){
    const why = {denied:L('Bạn hoặc trình duyệt đã chặn quyền dùng micro/camera cho trang này.','You or your browser blocked microphone/camera access for this page.'), nodevice:L('Không tìm thấy micro hoặc camera trên thiết bị.','No microphone or camera was found on this device.'), busy:L('Micro hoặc camera đang được ứng dụng khác sử dụng.','Your microphone or camera is being used by another app.'), unsupported:L('Trình duyệt này không hỗ trợ ghi âm, hoặc trang không chạy qua https.','This browser doesn’t support recording, or the page isn’t on https.')}[r.err] || L('Không mở được micro/camera.','Could not open the microphone/camera.');
    return AppLayout(head + `<div class="card"><div class="perm"><div class="ic">${ic('micoff',28)}</div><div>
      <h3 style="font-size:18px">${d.kind === 'video' ? L('Chưa có quyền dùng camera và micro','No camera or microphone access') : L('Chưa có quyền dùng micro','No microphone access')}</h3><p class="muted" style="margin-top:4px">${why}</p>
      <ol><li>${L('Bấm biểu tượng ổ khóa cạnh thanh địa chỉ.','Click the lock icon next to the address bar.')}</li><li>${L('Chọn “Cho phép” cho Micro','Set Microphone')}${d.kind === 'video' ? L(' và Camera',' and Camera') : ''}${L('.',' to “Allow”.')}</li><li>${L('Bấm “Thử lại” bên dưới.','Click “Try again” below.')}</li></ol>
      <div class="practice-btns"><button class="btn btn-primary" data-act="rec-retry">${L('Thử lại','Try again')}</button>${d.kind === 'video' ? `<button class="btn btn-outline" data-act="rec-audio-only">${L('Chỉ ghi âm','Audio only')}</button>` : ''}<button class="btn btn-ghost" data-act="switch-kind" data-v="upload">${L('Tải file lên thay thế','Upload a file instead')}</button><button class="btn btn-ghost" data-act="switch-kind" data-v="script">${L('Chấm kịch bản','Review a script')}</button></div>
      <p class="demo-note" style="margin-top:14px">${L('Bản thử nghiệm:','Beta:')} <button class="btn-link" style="font-size:12px" data-act="rec-sim">${L('dùng micro giả lập để xem tiếp luồng','use a simulated microphone to continue')}</button></p>
    </div></div></div>`);
  }
  if(r.state === 'asking') return AppLayout(head + `<div class="card" style="text-align:center;padding:48px"><span class="spinner"></span><h3 style="margin-top:14px">${L('Đang xin quyền dùng micro…','Requesting microphone access…')}</h3><p class="muted" style="margin-top:6px">${L('Hãy bấm “Cho phép” trong hộp thoại của trình duyệt.','Click “Allow” in your browser’s prompt.')}</p></div>`);
  return AppLayout(head + `
    <div class="rec">
      <div class="rec-stage">
        ${d.kind === 'video' ? `<div class="cam"><video id="camv" autoplay muted playsinline></video><div class="ph" id="camph">${r.sim ? L('Camera giả lập (bản thử nghiệm)','Simulated camera (beta)') : L('Đang mở camera…','Opening camera…')}</div><span class="tag">${L('Theo dõi ánh mắt và cử chỉ','Tracking eye contact and gestures')}</span></div>` : ''}
        <div style="display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600"><span class="rec-dot ${r.paused?'paused':''}" id="recdot"></span><span id="recst">${r.paused ? L('Tạm dừng','Paused') : L('Đang ghi','Recording')}</span></div><div class="timer num" id="timer">${fmtT(r.t)}</div><div class="hint num">${d.placement ? L('Tự dừng ở 01:00','Stops at 01:00') : L(`Tối đa ${fmtT(max)}`, `Max ${fmtT(max)}`)}${!isPro() && !d.placement ? ' · ' + L('Gói Miễn phí phân tích tối đa 05:00','Free plan analyses up to 05:00') : ''}</div></div>
          <div class="rec-actions"><button class="btn btn-ghost" data-act="rec-pause" id="pausebtn">${r.paused ? L('Tiếp tục','Resume') : L('Tạm dừng','Pause')}</button><button class="btn btn-primary" data-act="rec-stop">${L('Kết thúc và nộp bài','Finish and submit')}</button></div>
        </div>
        <div id="over-note">${overNote(r)}</div>
        <canvas class="wv" id="wv" aria-hidden="true"></canvas>
        <div class="demo-note">${r.sim ? L('Đang dùng micro giả lập (bản thử nghiệm).','Using a simulated microphone (beta).') : L('Đang ghi bằng micro của bạn. Bản ghi được lưu vào Thư viện.','Recording with your microphone. It will be saved to your Library.')} ${d.placement ? '' : `· <button class="btn-link" style="font-size:12px" data-act="rec-ff">${L('Tua nhanh +1 phút (bản thử)','Skip ahead +1 min (beta)')}</button>`}</div>
        <div class="kpis"><div class="kpi"><div class="k">${L('Tốc độ','Pace')}</div><div class="v num" id="k-wpm">–</div><div class="k">${L('từ/phút','wpm')}</div></div><div class="kpi"><div class="k">${L('Từ đệm','Fillers')}</div><div class="v num" id="k-fill">${r.fill}</div><div class="k">${L('lần','times')}</div></div><div class="kpi"><div class="k">${L('Ngắt nghỉ','Pauses')}</div><div class="v num" id="k-pause">${r.pause}</div><div class="k">&gt; 2s</div></div></div>
      </div>
      ${gate(`<div class="card" style="height:100%"><div class="card-head"><div class="t"><h3>${L('Nhắc nhở thời gian thực','Live coaching')}</h3>${proChip()}</div></div><div class="sub">${g.persona}, ${tx(g.role).toLowerCase()}, ${L('đang nghe','is listening')}</div><div class="live" id="live" style="margin-top:14px">${r.tips.map(tipHtml).join('') || `<p class="muted" style="font-size:14px">${L('Gợi ý và câu hỏi của khán giả AI sẽ hiện ở đây.','Tips and AI audience questions will appear here.')}</p>`}</div></div>`,
        L('Nhắc nhở thời gian thực','Live coaching'), L('AI nhắc ngay khi bạn nói quá nhanh, dùng từ đệm, và đặt câu hỏi phản biện trong lúc bạn nói.','AI nudges you when you rush or use fillers, and asks questions while you speak.'))}
    </div>`);
}
const overNote = r => !isPro() && !S.draft.placement && r.t > plan().maxAnalyzeSec ? alertBox('warn', L('Bài đã dài hơn 5 phút. Khi kết thúc, bài sẽ được lưu vào Thư viện và phân tích khi bạn nâng cấp Premium.','You’re past 5 minutes. When you finish, the talk is saved to your Library and analysed when you upgrade to Premium.')) : '';
const tipHtml = t => `<div class="tip ${t.q ? 'q' : ''}"><small>${t.at} · ${t.q ? L('CÂU HỎI TỪ KHÁN GIẢ','AUDIENCE QUESTION') : L('GỢI Ý','TIP')}</small>${esc(t.text)}</div>`;

/* ---------- Tải lên ---------- */
function vUpload(){
  const u = S.upload;
  if(u.status === 'error') return AppLayout(`<div class="an"><h1>${L('Tải lên bị gián đoạn','Upload interrupted')}</h1><span class="eyebrow">${L('Tải lên','Upload')}</span>
    <div class="big-meter fail"><b style="width:${u.pct}%"></b></div><div class="hint num" style="margin-top:6px">${Math.round(u.pct)}% · ${esc(u.file.name)}</div>
    <div style="margin-top:18px">${alertBox('err', L('Mất kết nối mạng khi đang tải lên. Kiểm tra Wi‑Fi hoặc dữ liệu di động rồi thử lại, phần đã tải sẽ được giữ.','The connection dropped during upload. Check your Wi‑Fi or mobile data and try again; uploaded progress is kept.'))}</div>
    <div class="practice-btns"><button class="btn btn-primary" data-act="upload-retry">${L('Thử lại','Try again')}</button><button class="btn btn-ghost" data-act="upload-cancel">${L('Hủy','Cancel')}</button></div></div>`);
  return AppLayout(`<div class="an"><h1>${L('Đang tải bài nói lên','Uploading your talk')}</h1><span class="eyebrow">${L('Tải lên','Upload')}</span><p class="muted" style="margin-top:8px">${esc(u.file.name)} · ${(u.file.size/1048576).toFixed(1)} MB</p>
    <div class="big-meter" role="progressbar" aria-valuenow="${Math.round(u.pct)}" aria-valuemin="0" aria-valuemax="100"><b id="up-bar" style="width:${u.pct}%"></b></div><div class="hint num" id="up-pct" style="margin-top:6px">${Math.round(u.pct)}%</div>
    <div class="practice-btns"><button class="btn btn-ghost" data-act="upload-cancel">${L('Hủy tải lên','Cancel upload')}</button></div></div>`);
}

/* ---------- Chấm kịch bản ---------- */
function vScript(){
  const d = S.draft, g = GOALS[d.goal], n = wordsOf(S.scriptText);
  return AppLayout(`
    <div class="page-head"><div><h1 style="margin-top:8px">${esc(draftTitle(d))}</h1><span class="eyebrow">${tx(g.name)} · ${langName(d.lang)} · ${L('Chấm kịch bản','Script review')}</span><p>${L('AI chấm nội dung, cấu trúc, mở bài, kết bài và ước lượng thời lượng khi nói.','AI reviews content, structure, opening, closing and estimated speaking time.')}</p></div><button class="btn btn-ghost btn-sm" data-act="script-back">${L('Quay lại','Back')}</button></div>
    <div class="practice">
      <div class="card">
        <div class="field"><label for="sc-text">${L('Kịch bản của bạn','Your script')}</label><textarea class="input ${S.scriptErr ? 'invalid' : ''}" id="sc-text" style="min-height:340px" placeholder="${L('Dán toàn bộ kịch bản. Mỗi đoạn cách nhau một dòng trống.','Paste your full script. Separate paragraphs with a blank line.')}">${esc(S.scriptText)}</textarea></div>
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px;align-items:center"><span class="hint num" id="sc-count">${countText(n)}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-ghost btn-sm" for="sc-file">${ic('upload',16)} ${L('Tải file .txt','Upload .txt')}<input type="file" id="sc-file" accept=".txt,.md,text/plain" class="sr-only"></label><button class="btn btn-ghost btn-sm" data-act="use-sample">${L('Dùng kịch bản mẫu','Use a sample script')}</button></div></div>
        ${S.scriptErr ? `<div style="margin-top:12px">${alertBox('err', S.scriptErr)}</div>` : ''}
        <div class="flow-actions" style="margin-top:20px"><span class="hint">${L(`Cần ít nhất ${CONFIG.minScriptWords} từ.`, `At least ${CONFIG.minScriptWords} words.`)}</span><button class="btn btn-primary btn-lg" data-act="script-go">${L('Chấm kịch bản','Review script')}</button></div>
      </div>
      <div class="p-side"><div class="card"><h3>${L('AI sẽ kiểm tra','AI will check')}</h3><ul class="unlock">${[L('Mở bài có thu hút không','Whether the opening hooks'),L('Cấu trúc và từ nối giữa các phần','Structure and transitions'),L('Câu quá dài, từ thừa','Long sentences and filler words'),L('Số liệu và dẫn chứng','Numbers and evidence'),L('Kết bài có lời kêu gọi không','Whether you end with a call to action'),L(`Thời lượng phù hợp ${g.target[0]}–${g.target[1]} phút`, `Fits ${g.target[0]}–${g.target[1]} minutes`)].map(x => `<li>${ic('check',16)}<span>${x}</span></li>`).join('')}</ul></div></div>
    </div>`);
}
const countText = n => L(`${n} từ · khoảng ${fmtDur(Math.round(n/130*60))} khi nói`, `${n} words · about ${fmtDur(Math.round(n/130*60))} spoken`);

/* ---------- Đang phân tích ---------- */
function vAnalyzing(){
  const id = S.params.id, item = libItem(id), j = S.job && S.job.libId === id ? S.job : null;
  if(!item) return AppLayout(`<div class="empty">${L('Không tìm thấy bài nói này.','This talk could not be found.')}<button class="btn btn-primary btn-sm" data-go="thu-vien">${L('Mở thư viện','Open library')}</button></div>`);
  const steps = item.kind === 'script' ? AN_STEPS.script : AN_STEPS.speech.filter((s,i) => i !== 5 || item.kind === 'video');
  const failed = item.status === 'error' && (!j || j.status !== 'running'), i = j ? j.i : failed ? (item.failStep ?? 2) : 0, pct = Math.round(i/steps.length*100);
  const timeout = failed && item.reason === 'timeout';
  return AppLayout(`<div class="an">
    <h1>${failed ? (timeout ? L('Phân tích lâu hơn dự kiến','Analysis is taking too long') : L('AI chưa phân tích được bài này','AI couldn’t analyse this talk')) : item.kind === 'script' ? L('AI đang đọc kịch bản của bạn','AI is reading your script') : L('AI đang nghe lại bài nói của bạn','AI is listening to your talk')}</h1>
    <span class="eyebrow">${item.kind === 'script' ? L(`Kịch bản ${wordsOf(item.text)} từ`, `Script, ${wordsOf(item.text)} words`) : L(`Bài nói ${fmtT(item.dur)}`, `Talk, ${fmtT(item.dur)}`)}</span>
    <p class="muted" style="margin-top:8px">${esc(item.title)}</p>
    ${failed ? `<div style="margin-top:16px">${alertBox('err', timeout ? L('Máy chủ phản hồi quá thời gian chờ. Lượt phân tích chưa bị trừ, bài nói vẫn được lưu trong Thư viện.','The server timed out. No analysis was used up, and your talk is still saved in your Library.') : L('Máy chủ AI gặp lỗi khi xử lý. Lượt phân tích chưa bị trừ, bài nói vẫn được lưu trong Thư viện.','The AI server hit an error. No analysis was used up, and your talk is still saved in your Library.'))}</div>` : `<p class="muted" style="margin-top:4px">${L('Thường mất dưới 2 phút. Bạn có thể rời trang, kết quả sẽ có trong Thư viện.','Usually under 2 minutes. You can leave this page; results will appear in your Library.')}</p>`}
    <div class="big-meter ${failed ? 'fail' : ''}"><b style="width:${failed ? Math.max(pct, 20) : pct}%"></b></div>
    <ul class="an-steps">${steps.map((s,k) => `<li class="${k<i ? 'done' : k===i ? (failed ? 'fail' : 'act') : ''}"><span class="st">${k<i ? ic('check',14) : k===i && failed ? ic('x',12) : ''}</span>${tx(s)}</li>`).join('')}</ul>
    ${failed ? `<div class="practice-btns"><button class="btn btn-primary" data-act="analyze" data-id="${id}">${L('Thử lại','Try again')}</button><button class="btn btn-ghost" data-go="thu-vien">${L('Về thư viện','Go to library')}</button></div>` : ''}
  </div>`);
}

/* ---------- Báo cáo ---------- */
function vReport(sample){
  let s;
  if(sample){
    const c = {content:78, structure:74, relevance:85, pace:66, fluency:72, filler:66, body:64};
    s = {id:'sample', title:L('Thuyết trình: Ứng dụng AI trong giáo dục','Presentation: AI in education'), goal:'presentation', lang:I18N.ui, kind:'video', date:'2026-10-20', dur:270, c, score:scoreOf(c), fillers:9, report:buildSpeechReport({goal:'presentation', lang:I18N.ui, video:true, dur:270, fillers:9})};
  } else s = S.data.sessions.find(x => x.id === S.params.id);
  if(!s) return AppLayout(`<div class="empty"><b>${L('Không tìm thấy báo cáo','Report not found')}</b><button class="btn btn-primary btn-sm" data-go="tien-bo">${L('Xem các báo cáo','See reports')}</button></div>`);
  const g = GOALS[s.goal], isScript = s.kind === 'script', crit = isScript ? SCRIPT_CRIT : CRIT;
  const same = sample ? [] : S.data.sessions.filter(x => (x.kind === 'script') === isScript), prev = same[same.indexOf(s) - 1];
  const ranked = Object.keys(crit).filter(k => s.c[k] != null).sort((a,b) => s.c[b] - s.c[a]);
  const lesson = s.lessonId && LESSON_BY_ID[s.lessonId], passed = s.score >= CONFIG.passScore;
  const nextL = lesson ? coursePath(lesson.goal, S.data).next : null;
  const acts = sample ? `<button class="btn btn-primary btn-sm" data-go="bat-dau">${L('Luyện bài của bạn','Practise your own talk')}</button>`
    : `<button class="btn btn-ghost btn-sm" data-act="retry" data-id="${s.id}">${L('Luyện lại','Practise again')}</button><button class="btn btn-ghost btn-sm" data-go="thu-vien" data-p="q=${encodeURIComponent(s.title.slice(0,30))}">${ic('lib',16)} ${L('Mở trong thư viện','Open in library')}</button>`;
  let html = `
    <div class="page-head"><div><h1 style="margin-top:8px">${esc(s.title)}</h1><span class="eyebrow">${s.placement ? L('Bài test đầu vào','Placement test') + ' · ' : ''}${L('Báo cáo','Report')} · ${fmtDL(s.date)}</span><p>${tx(g.name)} · ${langName(s.lang)} · ${tx(KIND[s.kind])} · ${isScript ? L('ước tính ','est. ') : ''}${fmtT(s.dur)}</p></div><div class="acts">${acts}</div></div>
    ${sample ? `<div class="banner"><div><h3>${L('Đây là báo cáo mẫu','This is a sample report')}</h3><p>${L('Bài thuyết trình 4 phút từ video. Phần Premium được làm mờ.','A 4-minute video presentation. Premium sections are blurred.')}</p></div></div>` : ''}
    ${lesson ? `<div class="banner ${passed ? 'good' : 'warn'}"><div><h3>${passed ? L(`Hoàn thành bài ${lesson.n}: ${tx(lesson.title)}`, `Lesson ${lesson.n} complete: ${tx(lesson.title)}`) : L(`Chưa đạt ${CONFIG.passScore} điểm để hoàn thành bài ${lesson.n}`, `You need ${CONFIG.passScore} points to complete lesson ${lesson.n}`)}</h3><p>${passed ? L('Tiến độ khóa học đã được cập nhật.','Your course progress has been updated.') : L('Xem các gợi ý bên dưới rồi thử lại nhé.','Check the tips below and try again.')}</p></div><div class="acts"><button class="btn btn-ghost btn-sm" data-go="bai-hoc" data-p="id=${lesson.id}">${L('Về bài học','Back to lesson')}</button>${passed && nextL ? `<button class="btn btn-primary btn-sm" data-go="bai-hoc" data-p="id=${nextL.id}">${L('Bài tiếp theo','Next lesson')}</button>` : !passed ? `<button class="btn btn-primary btn-sm" data-act="lesson-practice" data-id="${lesson.id}" data-kind="${lesson.kind}">${L('Thử lại','Try again')}</button>` : ''}</div></div>` : ''}
    ${!sample && !isScript ? `<div class="banner"><div><h3>${L('Bản thử nghiệm chưa kết nối AI giọng nói','Beta: speech AI not connected yet')}</h3><p>${L(`Điểm, bản chép lời và gợi ý là dữ liệu mẫu theo loại hình ${tx(g.name).toLowerCase()}. Bản ghi của bạn vẫn được lưu để nghe lại.`, `Scores, transcript and tips are sample data for ${tx(g.name).toLowerCase()}. Your recording is still saved for playback.`)}</p></div></div>` : ''}
    ${isScript ? `<div class="banner good"><div><h3>${L('Phân tích tự động trên kịch bản của bạn','Automatic analysis of your script')}</h3><p>${L('Điểm và lỗi dưới đây được tính từ chính nội dung bạn gửi.','The scores and issues below are calculated from your own text.')}</p></div></div>` : ''}
    <div class="card"><div class="rep-top">${ring(s.score)}<div style="min-width:0">
      <div class="chips" style="margin-bottom:12px"><span class="chip blue">${L('Trình độ','Level')}: ${levelName(s.score)}</span>${prev ? `<span class="chip ${s.score >= prev.score ? 'good' : 'bad'}">${s.score >= prev.score ? '+' : ''}${s.score - prev.score} ${L('so với lần trước','vs. last time')}</span>` : ''}<span class="chip line">${isScript ? s.script.weakTotal + ' ' + L('từ thừa','filler words') : s.fillers + ' ' + L('từ đệm','fillers')}</span></div>
      <h3 style="font-size:19px">${L(`Mạnh nhất: ${tx(crit[ranked[0]]).toLowerCase()}. Cần ưu tiên: ${tx(crit[ranked[ranked.length-1]]).toLowerCase()}.`, `Strongest: ${tx(crit[ranked[0]]).toLowerCase()}. Focus next on: ${tx(crit[ranked[ranked.length-1]]).toLowerCase()}.`)}</h3>
      <p class="muted" style="margin-top:6px;font-size:14px">${isScript ? L(`Kịch bản ${s.script.wc} từ, ${s.script.paras} đoạn, khoảng ${fmtDur(s.script.estSec)} khi nói.`, `${s.script.wc} words in ${s.script.paras} paragraphs, about ${fmtDur(s.script.estSec)} spoken.`) : L(`Người nghe AI: ${g.persona}, ${tx(g.role).toLowerCase()}.`, `AI listener: ${g.persona}, ${tx(g.role).toLowerCase()}.`)}</p>
      <div class="crit">${ranked.map(k => barRow(tx(crit[k]), s.c[k])).join('')}</div>
    </div></div></div>`;
  html += isScript ? reportScript(s, g) : reportSpeech(s, g, sample);
  return sample ? PublicLayout(`<div class="wrap" style="padding-block:32px 40px">${html}</div>`) : AppLayout(html);
}
function weakList(items, goal, quote){
  if(!items.length) return `<div class="empty" style="margin-top:10px"><b>${L('Không có lỗi lớn','No major issues')}</b><span>${L('Thử ghi âm để luyện phần nói.','Try recording it to practise delivery.')}</span></div>`;
  return items.map((w,i) => { const t = weakText(w, goal); return `<div class="weak-item"><span class="ix">${i+1}</span><div style="min-width:0"><h4>${t.title}</h4><p class="muted" style="font-size:14px;margin-top:4px">${t.detail}</p>${quote(w)}<div class="fix"><b>${L('Sửa:','Fix:')}</b><span>${t.fix}</span></div></div></div>`; }).join('');
}
const segText = sg => sg.p.map(x => x[1]).join('');
function reportSpeech(s, g, sample){
  const R = s.report, issueAt = {}; R.weak.forEach((w,i) => { if(!(w.s in issueAt)) issueAt[w.s] = i+1; });
  const hasBody = s.c.body != null;
  return `
    <div class="grid g-main mt">
      <div class="card"><h3>${L('Điểm cần cải thiện','What to improve')}</h3><div class="sub">${L('Xếp theo mức ảnh hưởng tới người nghe','Ordered by impact on your audience')}</div>
        <div style="margin-top:6px">${weakList(R.weak, s.goal, w => `<div class="quote" style="margin-top:10px"><small>${L('Bản chép lời','Transcript')} · ${fmtT(R.segs[w.s].t)} · <button class="btn-link" style="font-size:12px" data-act="jump" data-to="seg-${w.s}">${L('Xem vị trí','Show')}</button></small>“${esc(segText(R.segs[w.s]))}”</div>`)}</div></div>
      <div class="section-gap" style="gap:16px;min-width:0">
        <div class="card"><h3>${L('Tốc độ nói','Pace')}</h3><div class="sub">${L('Từ/phút. Vùng xanh 120–150 là dễ nghe.','Words per minute. The green band (120–150) is easy to follow.')}</div><div style="margin-top:10px">${paceChart(R.pace)}</div></div>
        ${qaCard(g, s.goal)}
      </div>
    </div>
    ${timelineCard(R)}
    <div class="card mt"><h3>${L('Ngôn ngữ cơ thể','Body language')}</h3><div class="sub">${hasBody ? L('Phân tích từ video: ánh mắt, cử chỉ, biểu cảm, tư thế','From your video: eye contact, gestures, expression, posture') : L('Bài này nộp bằng âm thanh. Quay video để nhận phân tích ngôn ngữ cơ thể.','This was audio only. Record a video to get body language feedback.')}</div>
      ${hasBody ? `<div class="body-l">${[[L('Ánh mắt','Eye contact'),'38%','bad',L('Nhìn xuống ghi chú 62% thời gian.','Looking at notes 62% of the time.')],[L('Cử chỉ tay','Gestures'),L('Ổn','Good'),'good',L('Dùng tay đếm ý rõ ràng, tự nhiên.','Clear, natural counting gestures.')],[L('Biểu cảm','Expression'),L('Ít','Limited'),'warn',L('Gương mặt ít thay đổi ở phần giữa.','Little change in the middle section.')],[L('Tư thế','Posture'),L('Lệch','Uneven'),'warn',L('Dồn trọng tâm sang một chân, đung đưa nhẹ.','Weight on one leg, slight swaying.')]].map(([k,v,st,n]) => `<div class="card"><div class="muted" style="font-size:13px">${k}</div><div style="font-size:22px;font-weight:700;margin-top:2px">${v}</div><div class="status" style="color:var(--${st})">${st==='good' ? L('Tốt','Good') : st==='bad' ? L('Cần sửa','Fix') : L('Cần chú ý','Watch')}</div><p class="muted" style="font-size:13px;margin-top:6px">${n}</p></div>`).join('')}</div>` : (sample ? '' : `<button class="btn btn-outline btn-sm" style="margin-top:12px" data-act="retry" data-id="${s.id}" data-kind="video">${L('Luyện lại bằng video','Practise again on video')}</button>`)}
    </div>
    <div class="grid g-2 mt">
      <div class="card"><h3>${L('Bản chép lời','Transcript')}</h3><div class="sub"><span style="color:var(--bad);font-weight:600">${L('Chữ đỏ','Red')}</span>: ${L('từ đệm · số: điểm cần cải thiện','filler words · numbers: issues')}</div>
        <div class="transcript" style="margin-top:12px">${R.segs.map((sg,i) => `<div class="seg-t" id="seg-${i}"><span class="ts num">${fmtT(sg.t)}</span><span>${sg.p.map(([t,x]) => t === 'f' ? `<span class="f">${esc(x)}</span>` : esc(x)).join('')}${issueAt[i] ? `<span class="iss">#${issueAt[i]}</span>` : ''}</span></div>`).join('')}</div></div>
      <div class="card"><h3>${L('Diễn đạt tốt hơn','Say it better')}</h3><div class="sub">${L('Gợi ý cho các câu chưa rõ','Suggestions for unclear sentences')}</div>
        <div style="margin-top:10px">${R.rewrites.map(w => `<div class="rewrite"><div class="old"><small>${L('Bạn đã nói','You said')}</small>${esc(w.old)}</div><div class="new"><small>${L('Thử nói','Try')}</small>${esc(w.neu)}</div></div>`).join('')}</div></div>
    </div>`;
}
function reportScript(s, g){
  const r = s.script, issueAt = {}; r.weak.forEach((w,i) => { if(w.s != null && !(w.s in issueAt)) issueAt[w.s] = i+1; });
  const paras = [...new Set(r.sentences.map(x => x.p))];
  return `
    <div class="grid g-main mt">
      <div class="card"><h3>${L('Điểm cần cải thiện','What to improve')}</h3><div class="sub">${L('Xếp theo mức ảnh hưởng tới người nghe','Ordered by impact on your audience')}</div>
        <div style="margin-top:6px">${weakList(r.weak, s.goal, w => w.s != null && r.sentences[w.s] ? `<div class="quote" style="margin-top:10px"><small>${L('Trong kịch bản','In your script')} · <button class="btn-link" style="font-size:12px" data-act="jump" data-to="sen-${w.s}">${L('Xem vị trí','Show')}</button></small>“${esc(r.sentences[w.s].t)}”</div>` : '')}</div></div>
      <div class="section-gap" style="gap:16px;min-width:0">
        <div class="card"><h3>${L('Số liệu kịch bản','Script stats')}</h3><div class="kv"><span>${L('Số từ','Words')}</span><b class="num">${r.wc}</b><span>${L('Số đoạn','Paragraphs')}</span><b class="num">${r.paras}</b><span>${L('Số câu','Sentences')}</span><b class="num">${r.sentences.length}</b><span>${L('Thời lượng khi nói','Speaking time')}</span><b class="num">${fmtDur(r.estSec)}</b><span>${L(`Phù hợp với ${tx(g.name).toLowerCase()}`, `Ideal for ${tx(g.name).toLowerCase()}`)}</span><b class="num">${g.target[0]}–${g.target[1]} ${L('phút','min')}</b><span>${L('Con số, số liệu','Numbers used')}</span><b class="num">${r.numCount}</b></div></div>
        ${qaCard(g, s.goal)}
      </div>
    </div>
    <div class="grid g-2 mt">
      <div class="card"><h3>${L('Kịch bản của bạn','Your script')}</h3><div class="sub">${L('Câu được tô màu có số là điểm cần cải thiện tương ứng','Highlighted sentences match the numbered issues')}</div><div class="script-view" style="margin-top:12px">${paras.map(pi => `<p>${r.sentences.filter(x => x.p === pi).map(x => issueAt[x.i] ? `<mark id="sen-${x.i}">${esc(x.t)}</mark><span class="iss">#${issueAt[x.i]}</span>` : esc(x.t)).join(' ')}</p>`).join('')}</div></div>
      <div class="card"><h3>${L('Viết lại tốt hơn','Write it better')}</h3><div class="sub">${L('Gọn hơn, dễ nói hơn','Tighter and easier to say')}</div><div style="margin-top:10px">${r.rewrites.length ? r.rewrites.map(w => `<div class="rewrite"><div class="old"><small>${L('Bạn đã viết','You wrote')}</small>${esc(w.old)}</div><div class="new"><small>${L('Thử viết','Try')}</small>${esc(w.neu)}</div></div>`).join('') : `<p class="muted" style="font-size:14px">${L('Không có câu nào cần viết lại.','No sentences need rewriting.')}</p>`}</div></div>
    </div>`;
}
function timelineCard(R){
  const ticks = Array.from({length:5}, (_,i) => fmtT(Math.round(R.dur*i/4)));
  const html = `<div class="card mt"><div class="card-head"><div class="t"><h3>${L('Dòng thời gian lỗi','Issue timeline')}</h3>${proChip()}</div></div><div class="sub">${L('Bấm vào một chấm để xem đoạn bản chép lời tương ứng.','Click a dot to jump to that part of the transcript.')}</div>
    <div class="tl"><div class="tl-track"></div>${R.marks.map(m => `<button class="tl-m" style="left:${m.t/R.dur*100}%" data-act="jump" data-to="seg-${m.s}" aria-label="${fmtT(m.t)}: ${markLabel(m)}" title="${fmtT(m.t)} · ${markLabel(m)}"><i style="background:var(--${MARK_TYPES[m.type][0]})"></i></button>`).join('')}</div>
    <div class="tl-ticks num">${ticks.map(x => `<span>${x}</span>`).join('')}</div>
    <div class="legend">${Object.values(MARK_TYPES).map(([c,l]) => `<span><i style="background:var(--${c});height:8px;width:8px;border-radius:50%"></i>${l()}</span>`).join('')}</div>
    <div class="tl-list">${R.marks.map(m => `<button class="tl-item" data-act="jump" data-to="seg-${m.s}"><span class="num muted">${fmtT(m.t)}</span><span class="dot" style="background:var(--${MARK_TYPES[m.type][0]})"></span><span>${markLabel(m)}</span></button>`).join('')}</div></div>`;
  return gate(html, L('Dòng thời gian lỗi','Issue timeline'), L('Xem chính xác giây nào bạn nói nhanh, dùng từ đệm hay rời mắt khỏi khán giả.','See the exact second you rushed, used fillers or lost eye contact.'));
}
function qaCard(g, goal){
  const ini = g.persona.split(' ').pop()[0];
  const items = g.questions.map((q,i) => {
    const a = S.qa[i] || {};
    let body = '';
    if(S.data && isPro() && a.open){
      body = `<div class="qa-ans"><label class="hint" for="qa-${i}" style="font-weight:600">${L('Câu trả lời của bạn','Your answer')}</label><textarea class="input" id="qa-${i}" data-qa="${i}" placeholder="${L(`Trả lời như khi đứng trước ${g.persona}…`, `Answer as if ${g.persona} were in front of you…`)}">${esc(a.text || '')}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-act="qa-grade" data-i="${i}" data-goal="${goal}" ${a.state === 'loading' ? 'disabled' : ''}>${a.state === 'loading' ? L('AI đang chấm…','AI is scoring…') : L('Chấm câu trả lời','Score my answer')}</button><button class="btn-text" style="font-size:13px" data-act="qa-open" data-i="${i}">${L('Thu gọn','Collapse')}</button></div>
        ${a.fb ? `<div class="fb" role="status"><div style="display:flex;gap:8px;align-items:center"><span class="score-pill num ${sCls(a.fb.score)}">${a.fb.score}</span><b>${a.fb.head}</b></div>${a.fb.pts.map(x => `<div>• ${x}</div>`).join('')}<div class="hint"><b>${L('Khung gợi ý:','Suggested frame:')}</b> ${L('trả lời thẳng trong 1 câu, đưa 1 bằng chứng, rồi nối lại thông điệp chính.','answer directly in one sentence, give one piece of evidence, then tie back to your message.')}</div></div>` : ''}</div>`;
    }
    return `<div class="qa-item"><div class="avatar sm">${ini}</div><div style="min-width:0"><div class="quote">“${tx(q)}”</div>${!a.open ? `<button class="btn-link" style="font-size:13px;margin-top:6px" data-act="qa-open" data-i="${i}">${S.data && isPro() ? (a.fb ? L('Xem lại câu trả lời','Review my answer') : L('Trả lời phản biện','Answer this')) : L('Trả lời phản biện · Premium','Answer this · Premium')}</button>` : ''}${body}</div></div>`;
  }).join('');
  return `<div class="card"><div class="card-head"><div class="t"><h3>${L(`Câu hỏi từ ${g.persona}`, `Questions from ${g.persona}`)}</h3>${proChip()}</div></div><div class="sub">${tx(g.role)}. ${L('Trả lời ngay để AI chấm phần hỏi đáp.','Answer now and AI scores your Q&A.')}</div><div class="qa">${items}</div></div>`;
}

/* ---------- Thư viện ---------- */
function libItem(id){ return S.data.library.find(l => l.id === id); }
function libStatus(l){
  return {analyzed:['good', L('Đã phân tích','Analysed')], analyzing:['blue', L('Đang phân tích','Analysing')], pending_premium:['warn', L('Chờ Premium (dài hơn 5 phút)','Needs Premium (over 5 min)')], pending_quota:['warn', L('Chờ lượt phân tích','Waiting for credits')], error:['bad', L('Phân tích lỗi','Analysis failed')], new:['', L('Mới','New')]}[l.status] || ['', l.status];
}
function vLibrary(){
  const f = S.params.f || 'all', q = (S.params.q || '').toLowerCase();
  const tabs = [['all', L('Tất cả','All')], ['audio', L('Ghi âm','Audio')], ['video', 'Video'], ['script', L('Kịch bản','Scripts')], ['pending', L('Chờ xử lý','Pending')]];
  const items = S.data.library.slice().reverse().filter(l => (f === 'all' || (f === 'pending' ? /^pending|error/.test(l.status) : l.kind === f)) && (!q || l.title.toLowerCase().includes(q)));
  const row = l => {
    const [cls, label] = libStatus(l), icn = l.kind === 'script' ? 'doc' : l.kind === 'video' ? 'video' : 'mic', col = l.kind === 'script' ? 'c-green' : l.kind === 'video' ? 'c-purple' : 'c-blue', open = S.openLib === l.id;
    const canPlay = l.kind === 'script' || l.hasMedia, needs = /^pending|error/.test(l.status);
    return `<div class="lib-row"><div class="lib-ic ${col}">${ic(icn,22)}</div>
      <div style="min-width:0"><div class="row-t">${esc(l.title)}</div><div class="row-m">${tx(GOALS[l.goal].name)} · ${langName(l.lang)} · ${fmtDL(l.date)} · ${l.kind === 'script' ? wordsOf(l.text) + ' ' + L('từ','words') : fmtT(l.dur)}${l.lessonId ? ' · ' + L('Bài học','Lesson') : ''}</div><div style="margin-top:6px"><span class="chip ${cls}">${label}</span></div></div>
      <div class="lib-acts">
        ${needs ? `<button class="btn btn-primary btn-sm" data-act="analyze" data-id="${l.id}">${L('Phân tích ngay','Analyse now')}</button>` : ''}
        ${l.status === 'analyzed' ? `<button class="btn btn-outline btn-sm" data-go="bao-cao" data-p="id=${l.sessionId}">${L('Báo cáo','Report')}</button>` : ''}
        <button class="btn btn-ghost btn-sm" data-act="lib-play" data-id="${l.id}" ${canPlay ? '' : `disabled title="${L('Tệp không còn trên thiết bị này','The file is no longer on this device')}"`} aria-expanded="${open}">${ic(l.kind === 'script' ? 'doc' : 'play',14)} ${open ? L('Đóng','Close') : l.kind === 'script' ? L('Xem','View') : l.kind === 'video' ? L('Xem lại','Watch') : L('Nghe lại','Listen')}</button>
        <button class="btn btn-ghost btn-sm" data-act="lib-dl" data-id="${l.id}" ${canPlay ? '' : 'disabled'}>${ic('down',14)} ${L('Tải về','Download')}</button>
        <button class="btn btn-ghost btn-sm" data-act="lib-del" data-id="${l.id}" aria-label="${L('Xóa','Delete')} ${esc(l.title)}">${ic('trash',14)}</button>
      </div>
      ${open ? `<div class="lib-extra">${l.kind === 'script' ? `<div class="quote" style="white-space:pre-wrap;max-height:260px;overflow:auto">${esc(l.text)}</div>` : S.openUrl ? (l.kind === 'video' ? `<video src="${S.openUrl}" controls playsinline></video>` : `<audio src="${S.openUrl}" controls></audio>`) : ''}</div>` : ''}
      ${S.confirmDel === l.id ? `<div class="confirm" role="alertdialog" aria-label="${L('Xác nhận xóa','Confirm delete')}"><span>${L('Xóa vĩnh viễn bài này và tệp ghi âm? Báo cáo liên quan cũng bị xóa.','Permanently delete this talk and its recording? Its report will be deleted too.')}</span><span style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" data-act="lib-del-no">${L('Hủy','Cancel')}</button><button class="btn btn-danger btn-sm" data-act="lib-del-yes" data-id="${l.id}">${L('Xóa','Delete')}</button></span></div>` : ''}
    </div>`;
  };
  return AppLayout(`
    <div class="page-head"><div><h1>${L('Thư viện bài nói','Talk library')}</h1><p>${L('Toàn bộ bài bạn đã luyện: nghe lại, xem lại, tải về hoặc xóa.','Everything you’ve practised: listen, watch, download or delete.')}</p></div><button class="btn btn-primary" data-act="new-practice">${L('Luyện bài mới','New practice')}</button></div>
    <div class="lib-tools"><div class="seg" role="tablist">${tabs.map(([k,l]) => `<button role="tab" aria-selected="${f===k}" class="${f===k?'on':''}" data-go="thu-vien" data-p="f=${k}${q ? '&q=' + encodeURIComponent(q) : ''}">${l}</button>`).join('')}</div><input class="input" id="lib-q" type="search" placeholder="${L('Tìm theo tên bài…','Search by title…')}" value="${esc(S.params.q || '')}" aria-label="${L('Tìm kiếm','Search')}"></div>
    <div class="card">${items.length ? `<div class="list">${items.map(row).join('')}</div>` : `<div class="empty" style="border:none"><b>${S.data.library.length ? L('Không có bài nào khớp bộ lọc','Nothing matches this filter') : L('Thư viện còn trống','Your library is empty')}</b><span>${L('Mỗi bài bạn ghi âm, tải lên hoặc gửi kịch bản đều được lưu ở đây.','Every recording, upload or script you submit is saved here.')}</span><button class="btn btn-primary btn-sm" data-act="new-practice">${L('Luyện tập','Practise')}</button></div>`}</div>`);
}

/* ---------- Tiến bộ ---------- */
function vProgress(){
  const ss = S.data.sessions, speech = ss.filter(s => s.kind !== 'script'), min = CONFIG.compareMin, max = plan().compareMax;
  const path = coursePath(S.data.profile.goal, S.data);
  if(!ss.length) return AppLayout(`<div class="page-head"><div><h1>${L('Tiến bộ','Progress')}</h1><p>${L('Lịch sử, so sánh và lộ trình.','History, comparison and your path.')}</p></div></div><div class="empty"><b>${L('Chưa có lần luyện nào','No sessions yet')}</b><span>${L('Sau mỗi buổi luyện, báo cáo được lưu ở đây.','Reports appear here after each session.')}</span><button class="btn btn-primary btn-sm" data-act="new-practice">${L('Luyện tập','Practise')}</button></div>`);
  let cmp;
  if(ss.length < min){
    cmp = `<div class="need-more" role="status"><div class="dots">${Array.from({length:min}, (_,i) => `<i class="${i < ss.length ? 'ok' : ''}">${i < ss.length ? ic('check',14) : i+1}</i>`).join('')}</div><div style="flex:1;min-width:220px"><b>${L(`Cần ít nhất ${min} lần luyện đã phân tích để so sánh`, `You need at least ${min} analysed sessions to compare`)}</b><div class="hint">${L(`Bạn đang có ${ss.length}. Luyện thêm ${min - ss.length} lần nữa để mở tính năng này.`, `You have ${ss.length}. Practise ${min - ss.length} more time${min - ss.length > 1 ? 's' : ''} to unlock it.`)}</div></div><button class="btn btn-primary btn-sm" data-act="new-practice">${L('Luyện thêm','Practise more')}</button></div>`;
  } else {
    S.compare = S.compare.filter(id => ss.some(s => s.id === id)).slice(0, max);
    if(S.compare.length < min) S.compare = ss.slice(-min).map(s => s.id);
    const picks = S.compare.map(id => ss.find(s => s.id === id)).sort((a,b) => ss.indexOf(a) - ss.indexOf(b));
    const rows = [[L('Điểm tổng','Overall'), s => s.score, 'max'], ...Object.entries(CRIT).map(([k,l]) => [tx(l), s => s.kind === 'script' ? null : s.c[k], 'max']), [L('Từ đệm / từ thừa','Fillers / filler words'), s => s.fillers, 'min']];
    cmp = `<div class="cmp-picks">${ss.slice().reverse().map(s => { const on = S.compare.includes(s.id); return `<button class="cmp-pick ${on?'on':''}" data-act="cmp" data-id="${s.id}" aria-pressed="${on}"><span class="box">${on ? ic('check',11) : ''}</span><span>${fmtD(s.date)} · ${esc(s.title)}</span></button>`; }).join('')}</div>
      <div class="tbl-wrap" style="margin-top:16px"><table><thead><tr><th>${L('Tiêu chí','Criterion')}</th>${picks.map(s => `<th>${fmtD(s.date)} · ${tx(GOALS[s.goal].name)}${s.kind === 'script' ? ' (' + L('kịch bản','script') + ')' : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(([l,f,dir]) => { const vals = picks.map(f), nums = vals.filter(v => v != null), best = nums.length >= 2 ? (dir === 'max' ? Math.max(...nums) : Math.min(...nums)) : null; return `<tr><td>${l}</td>${vals.map(v => `<td class="num ${v != null && v === best ? 'best' : ''}">${v ?? '–'}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
  }
  return AppLayout(`
    <div class="page-head"><div><h1>${L('Tiến bộ','Progress')}</h1><p>${L(`${ss.length} lần luyện đã phân tích`, `${ss.length} analysed sessions`)}</p></div><button class="btn btn-primary" data-act="new-practice">${L('Luyện thêm','Practise more')}</button></div>
    <div class="grid g-main">
      <div class="card"><h3>${L('Điểm tổng và độ trôi chảy','Overall and fluency')}</h3><div class="sub">${L('Các bài nói, không gồm kịch bản','Spoken sessions only, scripts excluded')}</div><div style="margin-top:10px">${speech.length > 1 ? lineChart(speech.slice(-12).map(s => ({label:fmtD(s.date), v:s.score})), {series2:speech.slice(-12).map(s => s.c.fluency)}) + `<div class="legend"><span><i style="background:var(--blue)"></i>${L('Điểm tổng','Overall')}</span><span><i style="background:var(--orange)"></i>${L('Độ trôi chảy','Fluency')}</span></div>` : `<div class="empty"><span>${L('Cần ít nhất 2 bài nói để vẽ biểu đồ.','Needs at least 2 spoken sessions.')}</span></div>`}</div></div>
      <div class="card"><h3>${L('Lộ trình của bạn','Your path')}</h3><div class="sub">${tx(GOALS[S.data.profile.goal].name)} · ${path.done}/${path.total} ${L('bài','lessons')}</div><div class="meter good"><b style="width:${path.done/path.total*100}%"></b></div>
        <div class="bars" style="margin-top:16px">${Object.entries(path.sk).filter(([,v]) => v != null).slice(0,5).map(([k,v]) => barRow(tx(SKILL[k]), v)).join('') || `<p class="hint">${L('Chưa có dữ liệu kỹ năng.','No skill data yet.')}</p>`}</div>
        ${path.next ? `<button class="btn btn-primary btn-sm" style="margin-top:16px" data-go="bai-hoc" data-p="id=${path.next.id}">${L('Học bài gợi ý','Start suggested lesson')}</button>` : ''}</div>
    </div>
    <div class="card mt"><div class="card-head"><div><h3>${L('So sánh nhiều lần luyện','Compare sessions')}</h3><div class="sub">${L(`Chọn ${min}–${max} lần. Ô xanh là kết quả tốt nhất mỗi tiêu chí.`, `Pick ${min}–${max} sessions. Green cells are the best result for each criterion.`)}${isPro() ? '' : ' ' + L(`Premium so sánh tối đa ${CONFIG.plans.premium.compareMax} lần.`, `Premium compares up to ${CONFIG.plans.premium.compareMax}.`)}</div></div></div>${cmp}</div>
    <div class="card mt"><h3>${L('Tất cả báo cáo','All reports')}</h3><div class="list" style="margin-top:6px">${ss.slice().reverse().map(rowHtml).join('')}</div></div>`);
}

/* ---------- Gói dịch vụ ---------- */
function vPricing(inApp){
  const li = (t, ok=true) => `<li class="${ok ? '' : 'no'}">${ic(ok ? 'check' : 'x',16)}<span>${t}</span></li>`, pro = inApp && isPro();
  const pend = inApp && S.data.library.find(l => /^pending/.test(l.status));
  const cell = v => v === '✓' ? `<span class="sr-only">${L('Có','Yes')}</span>${ic('check',16).replace('<svg ','<svg class="yes" ')}` : v === '–' ? `<span class="sr-only">${L('Không','No')}</span>${ic('x',16)}` : v;
  const rows = [[L('Lượt phân tích mỗi tháng','Analyses per month'),'3','50'],[L('Thời lượng phân tích mỗi bài','Max talk length analysed'),L('5 phút','5 min'),L('30 phút','30 min')],[L('Bài dài hơn giới hạn','Talks over the limit'),L('Lưu vào thư viện, chờ nâng cấp','Saved, analysed after upgrade'),L('Phân tích ngay','Analysed right away')],[L('Ghi âm, tải file, chấm kịch bản','Audio, uploads, script review'),'✓','✓'],[L('Khóa học và lộ trình cá nhân hóa','Courses and personalised path'),'✓','✓'],[L('Thư viện bài nói','Talk library'),'✓','✓'],[L('Quay video, phân tích ngôn ngữ cơ thể','Video and body language'),'–','✓'],[L('Nhắc nhở thời gian thực','Live coaching'),'–','✓'],[L('Trả lời phản biện của khán giả AI','Answer AI audience questions'),L('Chỉ xem câu hỏi','View questions only'),L('Trả lời và được chấm','Answer and get scored')],[L('Dòng thời gian lỗi','Issue timeline'),'–','✓'],[L('So sánh nhiều lần luyện','Compare sessions'),L('3 lần','3 sessions'),L('Tối đa 6 lần','Up to 6')]];
  const html = `
    <div class="${inApp ? 'page-head' : 'sec-head'}"><div><h1 style="${inApp ? '' : 'font-size:clamp(28px,3.6vw,42px)'}">${inApp ? L('Gói dịch vụ','Plans') : L('Bảng giá','Pricing')}</h1><p>${pro ? L('Bạn đang dùng Premium. Quản lý gói trong phần Tài khoản.','You’re on Premium. Manage it in Account.') : L('Bắt đầu miễn phí. Nâng cấp khi bạn cần luyện nhiều hơn.','Start free. Upgrade when you need more.')}</p></div></div>
    ${pend ? `<div class="banner warn"><div><h3>${L('Có bài đang chờ Premium','A talk is waiting for Premium')}</h3><p>${L(`Nâng cấp để phân tích ngay “${esc(pend.title)}”.`, `Upgrade to analyse “${esc(pend.title)}” right away.`)}</p></div></div>` : ''}
    <div class="price-grid" style="${inApp ? '' : 'margin:0 auto'}">
      <div class="price"><div><span class="eyebrow">${L('Miễn phí','Free')}</span><div class="amt num" style="margin-top:10px">0đ</div><div class="muted">${L('Không giới hạn thời gian','Forever')}</div></div>
        <ul>${li(L('3 lượt phân tích mỗi tháng, bài tối đa 5 phút','3 analyses a month, up to 5 minutes each'))}${li(L('Ghi âm, tải file âm thanh, chấm kịch bản','Audio, uploads and script review'))}${li(L('Khóa học và lộ trình cá nhân hóa','Courses and personalised path'))}${li(L('Thư viện bài nói','Talk library'))}${li(L('Video và ngôn ngữ cơ thể','Video and body language'), false)}${li(L('Khán giả AI và nhắc nhở thời gian thực','AI audience and live coaching'), false)}</ul>
        ${inApp ? `<button class="btn btn-ghost" disabled>${pro ? L('Gói cơ bản','Basic plan') : L('Gói hiện tại','Current plan')}</button>` : `<button class="btn btn-outline" data-go="bat-dau">${L('Bắt đầu miễn phí','Start for free')}</button>`}</div>
      <div class="price pro-card"><span class="chip yellow ribbon">${L('Tiết kiệm 28% theo năm','Save 28% yearly')}</span><div><span class="eyebrow">Premium</span><div class="amt num" style="margin-top:10px">${fmtVND(CONFIG.price.m)}<span style="font-size:15px;font-weight:500" class="muted"> /${L('tháng','month')}</span></div><div class="muted">${L('hoặc','or')} ${fmtVND(CONFIG.price.y)}/${L('năm','year')}</div></div>
        <ul>${li(L('50 lượt phân tích mỗi tháng, bài tối đa 30 phút','50 analyses a month, up to 30 minutes each'))}${li(L('Phân tích video: ánh mắt, biểu cảm, cử chỉ, tư thế','Video: eye contact, expression, gestures, posture'))}${li(L('Nhắc nhở thời gian thực khi đang nói','Live coaching while you speak'))}${li(L('Trả lời phản biện của khán giả AI','Answer AI audience questions'))}${li(L('Dòng thời gian lỗi trong báo cáo','Issue timeline in reports'))}${li(L('So sánh tối đa 6 lần luyện','Compare up to 6 sessions'))}</ul>
        ${!inApp ? `<button class="btn btn-primary" data-go="dang-ky">${L('Đăng ký để nâng cấp','Sign up to upgrade')}</button>` : pro ? `<button class="btn btn-outline" data-go="tai-khoan">${L('Quản lý gói','Manage plan')}</button>` : `<button class="btn btn-primary" data-act="buy">${L('Nâng cấp Premium','Upgrade to Premium')}</button>`}</div>
    </div>
    <div class="card" style="margin:24px ${inApp ? '0' : 'auto'} 0;max-width:900px"><h3>${L('So sánh chi tiết','Full comparison')}</h3><div class="tbl-wrap" style="margin-top:10px"><table><thead><tr><th>${L('Tính năng','Feature')}</th><th>${L('Miễn phí','Free')}</th><th>Premium</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="${r[1] === '–' ? 'faint' : ''}">${cell(r[1])}</td><td style="font-weight:600">${cell(r[2])}</td></tr>`).join('')}</tbody></table></div></div>
    <div style="margin:28px ${inApp ? '0' : 'auto'} 0;max-width:900px"><h3 style="font-size:18px;margin-bottom:12px">${L('Câu hỏi thường gặp','FAQ')}</h3>
      ${[[L('Tôi có thể hủy Premium bất cứ lúc nào không?','Can I cancel any time?'),L('Có. Tắt tự động gia hạn trong Tài khoản. Bạn vẫn dùng Premium đến hết chu kỳ đã trả.','Yes. Turn off auto-renew in Account. You keep Premium until the end of the paid period.')],[L('Nếu thanh toán thất bại thì sao?','What if a payment fails?'),L('Bạn không bị trừ tiền. Bài nói đang chờ vẫn được giữ trong Thư viện để bạn thử lại.','You aren’t charged. Any waiting talk stays in your Library so you can try again.')],[L('Lượt chưa dùng có cộng dồn không?','Do unused analyses roll over?'),L('Không. Lượt làm mới vào ngày 1 hằng tháng. Bài test đầu vào và phân tích lỗi không tính lượt.','No. Credits reset on the 1st of each month. The placement test and failed analyses don’t use credits.')],[L('Bản ghi của tôi có bị chia sẻ không?','Is my recording shared?'),L('Không. Bản ghi chỉ dùng để phân tích bài nói của bạn và bạn có thể xóa bất cứ lúc nào.','No. It’s only used to analyse your talk and you can delete it any time.')]].map(([q,a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}
    </div>`;
  return inApp ? AppLayout(html) : PublicLayout(`<section class="section"><div class="wrap">${html}</div></section>`);
}

/* ---------- Tài khoản ---------- */
function vAccount(){
  const D = S.data, p = D.profile, u = Auth.find(p.email) || {};
  const manage = `<div class="card mt"><div class="card-head"><div class="t"><h3>${L('Quản lý gói Premium','Manage Premium')}</h3>${proChip()}</div></div>
    <div class="grid g-2">
      <div><div class="kv"><span>${L('Chu kỳ','Billing')}</span><b>${D.cycle === 'm' ? L('Hằng tháng','Monthly') + ' · ' + fmtVND(CONFIG.price.m) : L('Hằng năm','Yearly') + ' · ' + fmtVND(CONFIG.price.y)}</b><span>${D.autoRenew ? L('Gia hạn tiếp theo','Next renewal') : L('Hết hạn vào','Expires on')}</span><b class="num">${D.expiry ? fmtDL(D.expiry) : '–'}</b><span>${L('Phương thức','Method')}</span><b>${D.payMethod}</b><span>${L('Tự động gia hạn','Auto-renew')}</span><button class="switch ${D.autoRenew ? 'on' : ''}" data-act="autorenew" role="switch" aria-checked="${D.autoRenew}" aria-label="${L('Tự động gia hạn','Auto-renew')}"></button></div>
        ${D.autoRenew ? '' : `<p class="hint" style="margin-top:12px">${L(`Bạn vẫn dùng Premium đến ${fmtDL(D.expiry)}, sau đó về gói Miễn phí. Lịch sử được giữ nguyên.`, `You keep Premium until ${fmtDL(D.expiry)}, then move to Free. Your history is kept.`)}</p>`}
        ${D.cycle === 'm' ? `<button class="btn btn-outline btn-sm" style="margin-top:16px" data-act="to-yearly">${L('Chuyển sang gói năm, tiết kiệm 28%','Switch to yearly and save 28%')}</button>` : ''}</div>
      <div><div class="sec-t" style="margin-top:14px">${L('Lịch sử thanh toán','Billing history')}</div><div class="tbl-wrap"><table><thead><tr><th>${L('Mã hóa đơn','Invoice')}</th><th>${L('Ngày','Date')}</th><th>${L('Số tiền','Amount')}</th><th>${L('Phương thức','Method')}</th></tr></thead><tbody>${D.invoices.slice().reverse().map(v => `<tr><td class="num">${v.id}</td><td class="num">${fmtD(v.date)}/${v.date.slice(0,4)}</td><td class="num">${fmtVND(v.amount)}</td><td>${v.method}</td></tr>`).join('') || `<tr><td colspan="4" class="muted">${L('Chưa có hóa đơn','No invoices yet')}</td></tr>`}</tbody></table></div></div>
    </div></div>`;
  return AppLayout(`
    <div class="page-head"><div><h1>${L('Tài khoản','Account')}</h1><p>${L('Thông tin cá nhân, ngôn ngữ, mục tiêu mặc định và gói dịch vụ.','Profile, language, default goal and plan.')}</p></div><button class="btn btn-ghost btn-sm" data-act="logout">${L('Đăng xuất','Log out')}</button></div>
    <div class="grid g-main">
      <form class="card" id="profileForm"><h3>${L('Thông tin cá nhân','Profile')}</h3>
        <div class="form" style="margin-top:16px">
          <div class="grid g-2"><div class="field"><label for="p-name">${L('Họ và tên','Full name')}</label><input class="input" id="p-name" value="${esc(p.name)}" autocomplete="name"></div><div class="field"><label>Email</label><div class="input" style="background:var(--soft);display:flex;justify-content:space-between;gap:8px;align-items:center"><span style="overflow:hidden;text-overflow:ellipsis">${esc(p.email)}</span><span class="chip good">${ic('check',12)} ${L('Đã xác thực','Verified')}</span></div></div></div>
          <div class="field"><label for="p-org">${L('Trường hoặc công ty','School or company')}</label><input class="input" id="p-org" value="${esc(p.org || '')}"></div>
          <div><button class="btn btn-primary btn-sm" type="submit">${L('Lưu thay đổi','Save changes')}</button></div>
        </div>
      </form>
      <div class="card"><h3>${L('Tùy chọn','Preferences')}</h3>
        <div class="form" style="margin-top:16px">
          <div class="field"><span class="label">${L('Ngôn ngữ giao diện','Interface language')}</span><div class="seg"><button class="${I18N.ui==='vi'?'on':''}" data-act="ui-lang" data-v="vi">Tiếng Việt</button><button class="${I18N.ui==='en'?'on':''}" data-act="ui-lang" data-v="en">English</button></div></div>
          <div class="field"><label for="p-goal">${L('Mục tiêu mặc định','Default goal')}</label><select class="input" id="p-goal" data-act-change="pref-goal">${GOAL_KEYS.map(k => `<option value="${k}" ${p.goal === k ? 'selected' : ''}>${tx(GOALS[k].name)}</option>`).join('')}</select></div>
          <div class="field"><span class="label">${L('Ngôn ngữ bài nói mặc định','Default speech language')}</span><div class="seg"><button class="${p.speechLang==='vi'?'on':''}" data-act="set-speech" data-v="vi">Tiếng Việt</button><button class="${p.speechLang==='en'?'on':''}" data-act="set-speech" data-v="en">English</button></div></div>
        </div></div>
    </div>
    <div class="grid g-2 mt">
      <div class="card"><h3>${L('Gói dịch vụ','Plan')}</h3>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px">${isPro() ? proChip() : `<span class="chip">${L('Miễn phí','Free')}</span>`}<span class="muted" style="font-size:13px">${isPro() ? (D.autoRenew ? L('Gia hạn','Renews') + ' ' : L('Hết hạn','Expires') + ' ') + fmtDL(D.expiry) : L('Không giới hạn thời gian','No expiry')}</span></div>
        <div style="margin-top:16px;font-size:14px">${L(`Đã dùng <b class="num">${D.used}</b> / ${plan().limit} lượt tháng này`, `Used <b class="num">${D.used}</b> of ${plan().limit} this month`)}</div><div class="meter"><b style="width:${Math.min(100, D.used/plan().limit*100)}%"></b></div>
        <div class="hint" style="margin-top:6px">${L('Lượt làm mới vào ngày 1 hằng tháng','Credits reset on the 1st of every month')}</div>
        ${isPro() ? '' : `<button class="btn btn-tonal btn-sm" style="margin-top:16px" data-act="buy">${L('Nâng cấp Premium','Upgrade to Premium')}</button>`}</div>
      <form class="card" id="pwForm"><h3>${u.pw ? L('Đổi mật khẩu','Change password') : L('Đặt mật khẩu','Set a password')}</h3><div class="sub">${u.pw ? '' : L('Bạn đang đăng nhập bằng Google. Đặt mật khẩu để đăng nhập bằng email.','You signed in with Google. Set a password to also log in with email.')}</div>
        <div class="form" style="margin-top:14px">${alertBox('err', S.pwErr)}${alertBox('ok', S.pwOk)}
          ${u.pw ? `<div class="field"><label for="pw-cur">${L('Mật khẩu hiện tại','Current password')}</label><input class="input" id="pw-cur" type="password" autocomplete="current-password"></div>` : ''}
          <div class="field"><label for="pw-new">${L('Mật khẩu mới','New password')}</label><input class="input" id="pw-new" type="password" autocomplete="new-password"><span class="hint">${L('Tối thiểu 8 ký tự, có cả chữ và số.','At least 8 characters with letters and numbers.')}</span></div>
          <div><button class="btn btn-outline btn-sm" type="submit">${L('Lưu mật khẩu','Save password')}</button></div></div></form>
    </div>
    ${gate(manage, L('Quản lý gói Premium','Manage Premium'), L('Đổi chu kỳ, bật tắt tự động gia hạn và xem hóa đơn khi bạn dùng Premium.','Change billing, toggle auto-renew and see invoices on Premium.'))}`);
}
