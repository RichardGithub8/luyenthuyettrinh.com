'use strict';
/* PublicLayout: trang chủ, bắt đầu (khách), bảng giá, báo cáo mẫu, đăng nhập, đăng ký, xác thực email, quên mật khẩu. */

/* Báo cáo mẫu thu gọn trong hero: dùng đúng dữ liệu của trang Báo cáo mẫu (cùng điểm 72 và các tiêu chí). */
function heroReport(){
  const c = {relevance:85, content:78, pace:66, filler:66};
  const seg = (TRANSCRIPTS.presentation[I18N.ui] || TRANSCRIPTS.presentation.vi).segs[0].replace(/\[(.+?)\]/g, '<span class="f">$1</span>');
  return `<div class="hero-rep" aria-label="${L('Báo cáo mẫu','Sample report')}">
    <div class="hr-bar"><b>${L('Thuyết trình: Ứng dụng AI trong giáo dục','Presentation: AI in education')}</b><span>${L('Báo cáo mẫu','Sample report')}</span></div>
    <div class="hr-top"><div class="hr-score num"><span class="count" role="img" aria-label="72"></span><small>${L('Điểm tổng','Overall')} · / 100</small></div>
      <div class="bars">${Object.keys(c).map(k => barRow(tx(CRIT[k]), c[k])).join('')}</div></div>
    <div class="hr-line"><span class="ts">00:00</span><span>${seg}</span></div>
    <div class="hr-fix"><b>${L('Sửa:','Fix:')}</b><span>${L('Khi cần suy nghĩ, dừng im lặng 1 giây thay vì nói “ừm”.','When you need to think, pause silently for a second instead of saying “um”.')}</span></div>
    <div class="hr-foot"><span class="chip blue">${L('Trình độ','Level')}: ${levelName(72)}</span><span class="chip bad">${L('Ánh mắt','Eye contact')} 38%</span><span class="chip line">9 ${L('từ đệm','fillers')}</span></div>
  </div>`;
}

function vLanding(){
  const pains = [
    ['mic','c-blue', L('Quan trọng nhưng khó tiếp cận','Important but hard to access'), L('Thuyết trình là một kỹ năng quan trọng nhưng chưa dễ tiếp cận. Từ bài tập nhóm, bảo vệ đồ án đến phỏng vấn và gọi vốn đều cần, nhưng hiếm nơi dạy bài bản.','Presenting matters, from group projects and thesis defences to interviews and pitches, yet few places teach it properly.'), L('Luyện mọi lúc ngay trên trình duyệt.','Practise any time, right in your browser.')],
    ['user','c-orange', L('Thiếu tự tin','Low confidence'), L('Cần thiết trong học tập và công việc, nhưng nhiều người ngại đứng trước đám đông và né các cơ hội trình bày.','Many people avoid speaking up because standing in front of a crowd feels scary.'), L('Tập riêng với AI, không ai nhìn, không sợ sai.','Practise privately with AI. No audience, no pressure.')],
    ['dollar','c-green', L('Chi phí cao','High cost'), L('Khóa học và người hướng dẫn chất lượng thường tốn kém, lịch học cố định và khó theo kịp.','Good courses and coaches are expensive and run on fixed schedules.'), L('Miễn phí 3 lượt mỗi tháng, luyện lúc nào cũng được.','3 free analyses a month, on your schedule.')],
    ['help','c-purple', L('Thiếu phản hồi','No feedback'), L('Tự luyện ở nhà khó nhận ra mình nói nhanh, dùng từ đệm hay rời mắt khỏi khán giả.','Practising alone, it’s hard to notice when you rush, say “um” or lose eye contact.'), L('Báo cáo chỉ ra đúng câu, đúng giây cần sửa.','Reports point to the exact sentence and second to fix.')],
  ];
  const feats = [['wave','c-blue',L('Giọng nói','Voice'),L('Chuyển giọng nói thành văn bản, đo tốc độ, ngắt nghỉ và đếm từ đệm.','Transcribes your speech, measures pace and pauses, counts filler words.')],['doc','c-green',L('Nội dung và kịch bản','Content and script'),L('Chấm logic, cấu trúc, cảnh báo khi lạc đề. Chấm cả kịch bản trước khi bạn nói.','Scores logic and structure, flags off-topic parts, and reviews scripts before you speak.')],['eye','c-orange',L('Ngôn ngữ cơ thể','Body language'),L('Theo dõi ánh mắt, biểu cảm, cử chỉ và tư thế qua video.','Tracks eye contact, expression, gestures and posture on video.')],['users','c-purple',L('Khán giả AI','AI audience'),L('Mỗi loại hình có một người nghe AI riêng đặt câu hỏi phản biện.','Each format has its own AI listener who asks tough questions.')]];
  const seg0 = (TRANSCRIPTS.presentation[I18N.ui] || TRANSCRIPTS.presentation.vi).segs[3].replace(/\[(.+?)\]/g, '<span class="f">$1</span>'), q0 = GOALS.presentation;
  const shots = [
    `<div class="pace">${[133,142,172,123,125].map(v => `<i class="${v > 150 ? 'over' : ''}" style="height:${Math.round(v/2)}%"></i>`).join('')}</div><small>${L('Tốc độ nói','Pace')} · 172 ${L('từ/phút','wpm')}</small>`,
    `<small>03:23</small><span>${seg0}</span>`,
    `<small>${L('Ánh mắt','Eye contact')}</small><span class="big num">38%</span><small>${L('Nhìn xuống ghi chú 62% thời gian.','Looking at notes 62% of the time.')}</small>`,
    `<small>${q0.persona}, ${tx(q0.role).toLowerCase()}</small><span>“${tx(q0.questions[0])}”</span>`,
  ];
  const nLessons = Object.values(COURSES).reduce((a,c) => a + c.length, 0);
  /* Trang chủ gọn: giữ nguyên câu chữ gốc nhưng chỉ giữ phần cốt lõi (tiêu đề + một dòng). */
  return PublicLayout(`
  <section class="hero"><div class="wrap">
    <div class="hero-copy">
      <h1>${L('Thuyết trình <span class="hl">tốt hơn</span> qua từng khoảnh khắc bạn luyện cùng chúng tôi.','Present <span class="hl">better</span> every moment you practise with us.')}</h1>
      <p class="lead">${L(`${CONFIG.brand} lắng nghe bạn nói, chỉ ra từng lỗi nhỏ và gợi ý lộ trình học phù hợp với mục tiêu của bạn.`, `${CONFIG.brand} listens to you speak, points out every small mistake, and suggests a learning path that fits your goal.`)}</p>
      <div class="ctas"><button class="btn btn-primary btn-lg" data-go="bat-dau">${L('Bắt đầu ngay','Get started')} ${ic('arrow',18)}</button><button class="btn btn-outline btn-lg" data-go="bao-cao-mau">${L('Xem báo cáo mẫu','See a sample report')}</button></div>
      <div class="facts"><div><b class="num">${GOAL_KEYS.length}</b><span>${L('loại hình thuyết trình','speaking formats')}</span></div><div><b class="num">${nLessons}</b><span>${L('bài học có lộ trình','guided lessons')}</span></div><div><b class="num">7</b><span>${L('tiêu chí chấm điểm','scoring criteria')}</span></div><div><b class="num">2</b><span>${L('ngôn ngữ bài nói','speech languages')}</span></div></div>
    </div>
    <div class="hero-visual">${heroReport()}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="sec-head"><h2>${L('Vấn đề phổ biến của các bạn là gì?','What holds most people back?')}</h2></div>
    <div class="pain-grid">${pains.map(([i,c,t,p,f]) => `<div class="pain-card"><span class="pain-ic">${ic(i,20)}</span><h3>${t}</h3><p class="pain-fix">${ic('check',16)}<span>${f}</span></p></div>`).join('')}</div>
  </div></section>

  <section class="section tint"><div class="wrap">
    <div class="sec-head"><h2>${L('AI nghe, xem và đọc bài nói của bạn.','AI listens to, watches and reads your talk.')}</h2><p>${L('Rồi chỉ ra đúng câu, đúng giây cần sửa.','Then shows you the exact sentence and second to fix.')}</p></div>
    <div class="feat-grid">${feats.map(([i,c,t,p], n) => `<div class="feat"><div class="feat-shot" aria-hidden="true">${shots[n]}</div><h3>${ic(i,18)} ${t}</h3><p>${p}</p></div>`).join('')}</div>
  </div></section>

  <section class="section steps-sec"><div class="wrap">
    <div class="sec-head"><h2>${L('Ba bước, khoảng năm phút.','Three steps, about five minutes.')}</h2></div>
    <ol class="steps">
      <li class="step"><span class="n">1</span><h3>${L('Chọn mục tiêu','Pick your goal')}</h3></li>
      <li class="step"><span class="n">2</span><h3>${L('Nói hoặc gửi kịch bản','Speak or send a script')}</h3></li>
      <li class="step"><span class="n">3</span><h3>${L('Nhận báo cáo và bài học tiếp theo','Get a report and your next lesson')}</h3></li>
    </ol>
  </div></section>

  <section class="section tint" id="khoa-hoc-gt"><div class="wrap">
    <div class="sec-head"><h2>${L('Luyện cho đúng sân khấu bạn sắp bước lên.','Train for the stage you are about to step on.')}</h2><p class="strong">${L('AI riêng cho từng loại hình thuyết trình.','A dedicated AI for each speaking format.')}</p></div>
    <div class="format-grid">${GOAL_KEYS.map(k => formatCard(k)).join('')}</div>
  </div></section>

  <section class="section" style="padding-bottom:96px"><div class="wrap">
    <div class="cta-band"><div><h2>${L('Bài thuyết trình tiếp theo sẽ khác.','Your next presentation will be different.')}</h2><p>${L('Miễn phí 3 lượt phân tích mỗi tháng. Không cần thẻ ngân hàng.','3 free analyses every month. No card needed.')}</p></div><button class="btn btn-white btn-lg" data-go="bat-dau">${L('Bắt đầu miễn phí','Start for free')}</button></div>
  </div></section>`);
}
/* Thẻ loại hình gọn cho trang chủ: ảnh, tên khóa, người nghe AI; bấm cả thẻ để bắt đầu. */
function formatCard(k){
  const g = GOALS[k], ls = COURSES[k];
  return `<button class="format-card" data-act="start-goal" data-goal="${k}"><span class="format-img"><img src="img/${g.img}" alt="${tx(g.alt)}" loading="lazy" width="800" height="600"></span>
    <span class="format-body"><b>${L('Khóa luyện','Course:')} ${tx(g.name).toLowerCase()}</b><span class="format-meta">${ic('book',14)} ${ls.length} ${L('bài học','lessons')} · ${ic('users',14)} ${g.persona}</span></span>
    <span class="format-go">${L('Khám phá khóa học','Explore course')} ${ic('arrow',14)}</span></button>`;
}
function courseCard(k, {guest=false}={}){
  const g = GOALS[k], ls = COURSES[k], mins = ls.reduce((a,l) => a + l.mins, 0);
  const path = !guest && S.data ? coursePath(k, S.data) : null, mine = !guest && S.data && S.data.profile.goal === k;
  return `<div class="course-card"><div class="course-top"><img src="img/${g.img}" alt="${tx(g.alt)}" loading="lazy" width="800" height="600">${mine ? `<span class="chip yellow badge">${ic('star',12)} ${L('Mục tiêu của bạn','Your goal')}</span>` : ''}</div>
    <div class="course-body"><span class="chip ${'c-' + g.color}" style="align-self:flex-start">${ic(goalIcon[k],14)} ${tx(g.name)}</span><h3>${L('Khóa luyện','Course:')} ${tx(g.name).toLowerCase()}</h3><p>${tx(g.desc)}</p>
      <div class="course-meta"><span>${ic('book',14)} ${ls.length} ${L('bài học','lessons')}</span><span>${ic('clock',14)} ${mins} ${L('phút','min')}</span><span>${ic('users',14)} ${g.persona}</span></div>
      ${path ? `<div class="meter good" aria-label="${path.done}/${path.total}"><b style="width:${path.done/path.total*100}%"></b></div><div class="hint">${L(`Đã hoàn thành ${path.done}/${path.total} bài`, `${path.done} of ${path.total} lessons done`)}</div>` : ''}
      <div class="course-acts">${guest ? `<button class="btn btn-primary btn-sm" data-act="start-goal" data-goal="${k}">${L('Khám phá khóa học','Explore course')}</button><button class="btn btn-outline btn-sm" data-go="bao-cao-mau">${L('Xem báo cáo mẫu','Sample report')}</button>` : `<button class="btn btn-primary btn-sm" data-go="khoa-hoc-chi-tiet" data-p="g=${k}">${path && path.done ? L('Học tiếp','Continue') : L('Vào khóa học','Open course')}</button>`}</div>
    </div></div>`;
}

/* ---------- Bắt đầu (khách): ngôn ngữ giao diện → mục tiêu → ngôn ngữ bài nói → xem trước ---------- */
const GS_STEPS = () => [L('Ngôn ngữ','Language'), L('Mục tiêu','Goal'), L('Ngôn ngữ bài nói','Speech language'), L('Xem trước','Preview')];
const flow = (inner, narrow) => PublicLayout(`<div class="wrap flow-body"><div class="flow-card ${narrow ? 'narrow' : ''}">${inner}</div></div>`, {footer:false});
function goalChoices(sel, act){
  return `<div class="choice-grid" style="margin-top:24px">${GOAL_KEYS.map(k => { const g = GOALS[k]; return `<button class="choice ${sel===k?'on':''}" data-act="${act}" data-goal="${k}" aria-pressed="${sel===k}"><span class="ic ${'c-' + g.color}">${ic(goalIcon[k])}</span><h3>${tx(g.name)}</h3><p>${tx(g.desc)}</p><span class="who">${L('Người nghe AI','AI listener')}: ${g.persona}, ${tx(g.role).toLowerCase()}</span></button>`; }).join('')}</div>`;
}
function langChoices(sel, act, kind){
  const ui = kind === 'ui';
  return `<div class="choice-grid" style="margin-top:24px">
    <button class="choice ${sel==='vi'?'on':''}" data-act="${act}" data-v="vi" aria-pressed="${sel==='vi'}"><h3>Tiếng Việt</h3><p>${ui ? 'Giao diện, hướng dẫn và báo cáo bằng tiếng Việt.' : L('Nhận diện từ đệm “ừm”, “à”, “ờ”, “kiểu như”.','Detects Vietnamese fillers like “ừm”, “à”, “kiểu như”.')}</p></button>
    <button class="choice ${sel==='en'?'on':''}" data-act="${act}" data-v="en" aria-pressed="${sel==='en'}"><h3>English</h3><p>${ui ? 'Interface, guidance and reports in English.' : L('Nhận diện “um”, “uh”, “like”, “you know”.','Detects “um”, “uh”, “like”, “you know”.')}</p></button></div>`;
}
function vGsLang(){
  return flow(`${progressSteps(GS_STEPS(), 0)}<h1>${L('Chọn ngôn ngữ giao diện','Choose your interface language')}</h1><p class="lead">${L('Bạn có thể đổi lại bất cứ lúc nào trong phần Tài khoản.','You can change it any time in Account settings.')}</p>
    ${langChoices(I18N.ui, 'ui-lang', 'ui')}
    <div class="flow-actions"><button class="btn-text" data-go="">${L('Về trang chủ','Back to home')}</button><button class="btn btn-primary" data-go="bat-dau-muc-tieu">${L('Tiếp tục','Continue')}</button></div>`);
}
function vGsGoal(){
  return flow(`${progressSteps(GS_STEPS(), 1)}<h1>${L('Bạn muốn luyện cho dịp nào?','What do you want to practise for?')}</h1><p class="lead">${L('Mục tiêu này sẽ là mặc định của bạn. Mỗi buổi luyện vẫn đổi nhanh được.','This becomes your default goal. You can still switch it quickly in any session.')}</p>
    ${goalChoices(S.ob.goal, 'ob-goal')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="bat-dau">${L('Quay lại','Back')}</button><button class="btn btn-primary" data-go="bat-dau-ngon-ngu">${L('Tiếp tục','Continue')}</button></div>`);
}
function vGsSpeech(){
  return flow(`${progressSteps(GS_STEPS(), 2)}<h1>${L('Bạn sẽ nói bằng ngôn ngữ nào?','Which language will you speak in?')}</h1><p class="lead">${L('Đây là ngôn ngữ bài nói, khác với ngôn ngữ giao diện. Bạn đổi được trong từng buổi luyện.','This is your speech language, separate from the interface language. You can change it per session.')}</p>
    ${langChoices(S.ob.lang, 'ob-lang')}
    <div class="flow-actions"><button class="btn btn-ghost" data-go="bat-dau-muc-tieu">${L('Quay lại','Back')}</button><button class="btn btn-primary" data-go="bat-dau-xem-truoc">${L('Tiếp tục','Continue')}</button></div>`);
}
function vGsPreview(){
  const g = GOALS[S.ob.goal];
  return flow(`${progressSteps(GS_STEPS(), 3)}<h1>${L(`Một buổi luyện ${tx(g.name).toLowerCase()} trông như thế này`, `Here’s what a ${tx(g.name).toLowerCase()} session looks like`)}</h1><p class="lead">${L('Đây là bản minh họa. Tạo tài khoản để luyện với bài nói của chính bạn.','This is a preview. Create an account to practise with your own talk.')}</p>
    <div class="preview-card">
      <div class="persona"><div class="avatar">${g.persona.split(' ').pop()[0]}</div><div><b>${g.persona}</b> · ${tx(g.role)}<div class="muted" style="font-size:13px">${tx(g.name)} · ${langName(S.ob.lang)}</div></div></div>
      <div class="quote"><small>${L('Đề bài mẫu','Sample topic')}</small><b>${tx(g.prompts[0])}</b></div>
      <div class="hv-score">${ring(72,64)}<div style="flex:1;min-width:0"><div class="bars">${barRow(tx(CRIT.structure),74)}${barRow(tx(CRIT.pace),66)}${barRow(tx(CRIT.filler),58)}</div></div></div>
      <div class="quote"><small>${L(`${g.persona} hỏi`, `${g.persona} asks`)}</small>“${tx(g.questions[0])}”</div>
    </div>
    <div class="flow-actions"><button class="btn btn-ghost" data-go="bat-dau-ngon-ngu">${L('Quay lại','Back')}</button><button class="btn btn-primary" data-act="need-account">${L('Bắt đầu luyện','Start practising')}</button></div>`);
}

/* ---------- Xác thực ---------- */
const googleBtn = mode => `<button type="button" class="btn google" data-act="google" data-mode="${mode}"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>${L('Tiếp tục với Google','Continue with Google')}</button>`;
function vLogin(){
  const ret = S.params.returnUrl;
  return flow(`<div class="panel">
    <h1 style="font-size:28px">${L('Chào mừng trở lại','Welcome back')}</h1>
    <p class="lead" style="font-size:15px">${ret ? L('Đăng nhập để tiếp tục tới trang bạn vừa mở.','Log in to continue to the page you opened.') : L('Đăng nhập để tiếp tục luyện tập.','Log in to keep practising.')}</p>
    <form class="form" id="loginForm" novalidate style="margin-top:22px">
      ${googleBtn('login')}<div class="divider">${L('hoặc dùng email','or use email')}</div>
      ${alertBox('err', S.auth.err || LINK_ERRORS()[S.params.error] || '')}${alertBox('ok', S.auth.info)}
      <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" type="email" autocomplete="email" value="${esc(S.auth.email || '')}" placeholder="ban@email.com" required></div>
      <div class="field"><div style="display:flex;justify-content:space-between;align-items:center"><label for="f-pass">${L('Mật khẩu','Password')}</label><button type="button" class="btn-link" style="font-size:13px" data-go="quen-mat-khau">${L('Quên mật khẩu?','Forgot password?')}</button></div><input class="input" id="f-pass" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" ${S.auth.busy ? 'disabled' : ''}>${S.auth.busy ? '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>' : L('Đăng nhập','Log in')}</button>
      <p class="hint" style="text-align:center">${L('Chưa có tài khoản?','No account yet?')} <button type="button" class="btn-link" data-go="dang-ky">${L('Đăng ký miễn phí','Sign up for free')}</button></p>
    </form></div>`, true);
}
function vRegister(){
  return flow(`<div class="panel">
    <h1 style="font-size:28px">${L('Tạo tài khoản','Create your account')}</h1>
    <p class="lead" style="font-size:15px">${L('Miễn phí 3 lượt phân tích mỗi tháng. Không cần thẻ ngân hàng.','3 free analyses a month. No card needed.')}</p>
    <form class="form" id="registerForm" novalidate style="margin-top:22px">
      ${googleBtn('signup')}<div class="divider">${L('hoặc dùng email','or use email')}</div>
      ${alertBox('err', S.auth.err)}
      <div class="field"><label for="f-name">${L('Họ và tên','Full name')}</label><input class="input" id="f-name" autocomplete="name" value="${esc(S.auth.name || '')}" required></div>
      <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" type="email" autocomplete="email" value="${esc(S.auth.email || '')}" placeholder="ban@email.com" required></div>
      <div class="field"><label for="f-pass">${L('Mật khẩu','Password')}</label><input class="input" id="f-pass" type="password" autocomplete="new-password" required><span class="hint">${L('Tối thiểu 8 ký tự, có cả chữ và số.','At least 8 characters with letters and numbers.')}</span></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" ${S.auth.busy ? 'disabled' : ''}>${L('Tạo tài khoản','Create account')}</button>
      <p class="hint" style="text-align:center">${L('Đã có tài khoản?','Already have an account?')} <button type="button" class="btn-link" data-go="dang-nhap">${L('Đăng nhập','Log in')}</button></p>
    </form></div>`, true);
}
const LINK_ERRORS = () => ({LINK_EXPIRED:L('Link đã hết hạn hoặc đã được dùng. Hãy yêu cầu link mới.','This link has expired or was already used. Please request a new one.'), OAUTH_FAILED:L('Không đăng nhập được bằng Google. Vui lòng thử lại.','Couldn’t sign in with Google. Please try again.'), AUTH_FAILED:L('Không đăng nhập được. Vui lòng thử lại.','Couldn’t sign in. Please try again.')});
function vVerify(){
  const email = Auth.pending();
  return flow(`<div class="panel">
    <div class="m-ic c-blue" style="margin-bottom:14px">${ic('mail',28)}</div>
    <h1 style="font-size:26px">${L('Kiểm tra email của bạn','Check your email')}</h1>
    <p class="lead" style="font-size:15px">${L(`Chúng tôi đã gửi link xác thực tới <b>${esc(email)}</b>. Bấm vào link trong email để kích hoạt tài khoản và tiếp tục.`, `We sent a verification link to <b>${esc(email)}</b>. Click the link in the email to activate your account and continue.`)}</p>
    <div class="form" style="margin-top:20px">
      ${alertBox('err', S.auth.err)}${alertBox('ok', S.auth.info)}
      <p class="hint" style="text-align:center">${L('Không thấy email?','Didn’t get it?')} <button type="button" class="btn-link" data-act="resend">${L('Gửi lại email','Resend email')}</button> · <button type="button" class="btn-link" data-act="change-email">${L('Đổi email','Change email')}</button></p>
    </div></div>`, true);
}
function vForgot(){
  const sent = S.auth.resetSent;
  return flow(`<div class="panel">
    <h1 style="font-size:26px">${sent ? L('Kiểm tra email của bạn','Check your email') : L('Quên mật khẩu','Reset your password')}</h1>
    ${!sent ? `<p class="lead" style="font-size:15px">${L('Nhập email đã đăng ký. Chúng tôi sẽ gửi link để đặt lại mật khẩu.','Enter your account email and we’ll send you a link to reset your password.')}</p>
      <form class="form" id="forgotForm" novalidate style="margin-top:20px">${alertBox('err', S.auth.err)}
        <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" type="email" autocomplete="email" value="${esc(S.auth.email || '')}" required></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">${L('Gửi link','Send link')}</button>
        <p class="hint" style="text-align:center"><button type="button" class="btn-link" data-go="dang-nhap">${L('Quay lại đăng nhập','Back to log in')}</button></p></form>`
    : `<p class="lead" style="font-size:15px">${L(`Nếu <b>${esc(S.auth.email)}</b> đã có tài khoản, chúng tôi vừa gửi link đặt lại mật khẩu tới đó. Link có hiệu lực trong thời gian ngắn.`, `If <b>${esc(S.auth.email)}</b> has an account, we just sent a password-reset link there. The link is valid for a short time.`)}</p>
      <div class="form" style="margin-top:20px">${alertBox('err', S.auth.err)}
        <p class="hint" style="text-align:center"><button type="button" class="btn-link" data-act="reset-restart">${L('Dùng email khác','Use another email')}</button> · <button type="button" class="btn-link" data-go="dang-nhap">${L('Quay lại đăng nhập','Back to log in')}</button></p></div>`}
  </div>`, true);
}
function vReset(){
  return flow(`<div class="panel">
    <h1 style="font-size:26px">${L('Đặt mật khẩu mới','Set a new password')}</h1>
    <p class="lead" style="font-size:15px">${L('Nhập mật khẩu mới cho tài khoản của bạn.','Enter a new password for your account.')}</p>
    <form class="form" id="resetForm" novalidate style="margin-top:20px">${alertBox('err', S.auth.err)}
      <div class="field"><label for="f-pass">${L('Mật khẩu mới','New password')}</label><input class="input" id="f-pass" type="password" autocomplete="new-password" required><span class="hint">${L('Tối thiểu 8 ký tự, có cả chữ và số.','At least 8 characters with letters and numbers.')}</span></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">${L('Đặt lại mật khẩu','Reset password')}</button>
    </form></div>`, true);
}
