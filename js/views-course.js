'use strict';
/* Khóa học: danh sách loại hình → trang khóa học (lộ trình cá nhân hóa) → bài học (lý thuyết, bài tập, luyện cùng AI). */

function vCourses(){
  const goal = S.data.profile.goal, path = coursePath(goal, S.data), g = GOALS[goal];
  const order = [goal, ...GOAL_KEYS.filter(k => k !== goal)];
  return AppLayout(`
    <div class="page-head"><div><h1>${L('Khóa học','Courses')}</h1><p>${L('Chọn loại hình bạn muốn luyện. Mỗi khóa có lộ trình bài học riêng, sắp xếp theo điểm yếu của bạn.','Pick a format to train. Each course has its own lesson path, ordered by your weak spots.')}</p></div></div>
    ${path.next ? `<div class="card soft" style="margin-bottom:20px"><div class="next-lesson"><div class="num-badge ${'c-' + g.color}">${path.next.n}</div><div style="min-width:0"><div class="hint">${L('Gợi ý tiếp theo trong khóa','Suggested next in')} ${tx(g.name).toLowerCase()}</div><h3 style="font-size:17px;margin-top:2px">${tx(path.next.title)}</h3><div class="hint" style="color:var(--blue)">${path.reason(path.next) || (path.hasData ? L('Bài tiếp theo trong lộ trình','Next lesson in your path') : L('Làm bài test đầu vào để AI cá nhân hóa thứ tự bài','Take the placement test so AI can personalise the order'))}</div></div><button class="btn btn-primary" data-go="bai-hoc" data-p="id=${path.next.id}">${L('Học ngay','Start lesson')}</button></div></div>` : ''}
    <div class="course-grid">${order.map(k => courseCard(k)).join('')}</div>`);
}

function vCourse(){
  const k = S.params.g in GOALS ? S.params.g : S.data.profile.goal, g = GOALS[k], path = coursePath(k, S.data), mins = COURSES[k].reduce((a,l) => a + l.mins, 0);
  const weakest = Object.entries(path.sk).filter(([s,v]) => v != null && COURSES[k].some(l => l.skill === s)).sort((a,b) => a[1] - b[1]).slice(0,3);
  const status = l => (S.data.lessons[l.id] || {}).status, best = l => (S.data.lessons[l.id] || {}).best;
  return AppLayout(`
    <div class="crumbs"><button data-go="khoa-hoc">${L('Khóa học','Courses')}</button>›<span>${tx(g.name)}</span></div>
    <div class="c-hero ${'c-' + g.color}">
      <div><span class="chip line">${ic(goalIcon[k],14)} ${tx(g.name)}${S.data.profile.goal === k ? ' · ' + L('Mục tiêu của bạn','Your goal') : ''}</span><h1 style="margin-top:12px">${L('Khóa luyện','Course:')} ${tx(g.name).toLowerCase()}</h1><p>${tx(g.desc)} ${L('Người nghe AI:','AI listener:')} <b>${g.persona}</b>, ${tx(g.role).toLowerCase()}.</p>
        <div class="course-meta"><span>${ic('book',14)} ${COURSES[k].length} ${L('bài học','lessons')}</span><span>${ic('clock',14)} ${mins} ${L('phút','min')}</span><span>${ic('check',14)} ${L(`Đạt từ ${CONFIG.passScore} điểm để hoàn thành bài`, `Score ${CONFIG.passScore}+ to complete a lesson`)}</span></div>
        ${path.next ? `<button class="btn btn-primary" style="margin-top:18px" data-go="bai-hoc" data-p="id=${path.next.id}">${path.done ? L('Học tiếp','Continue') : L('Bắt đầu khóa học','Start course')}: ${L('Bài','Lesson')} ${path.next.n}</button>` : `<span class="chip good" style="margin-top:18px">${L('Đã hoàn thành khóa học','Course completed')}</span>`}
      </div>
      <div style="text-align:center">${ring(Math.round(path.done/path.total*100), 120)}<div class="hint" style="margin-top:6px">${path.done}/${path.total} ${L('bài hoàn thành','lessons done')}</div></div>
    </div>
    <div class="card" style="margin-bottom:16px"><div class="card-head"><div><h3>${L('Lộ trình được cá nhân hóa','Your personalised path')}</h3><div class="sub">${path.hasData ? L('Thứ tự bài dựa trên mục tiêu của bạn và kết quả các lần luyện gần nhất. Bài nền tảng luôn đứng đầu.','Lessons are ordered by your goal and recent results. The foundation lesson always comes first.') : L('Chưa có dữ liệu luyện tập, nên bài học đang theo thứ tự chuẩn.','No practice data yet, so lessons follow the standard order.')}</div></div>${path.hasData ? '' : `<button class="btn btn-outline btn-sm" data-act="test-start">${L('Làm bài test đầu vào','Take placement test')}</button>`}</div>
      ${weakest.length ? `<div class="chips" style="margin-top:12px">${weakest.map(([s,v]) => `<span class="chip ${v < 60 ? 'bad' : v < 72 ? 'warn' : 'good'}">${tx(SKILL[s])}: ${v}</span>`).join('')}</div>` : ''}</div>
    <div class="lesson-list">${path.list.map((l,i) => { const st = status(l), isNext = path.next && path.next.id === l.id; return `<button class="lesson ${st === 'done' ? 'done' : ''} ${isNext ? 'next' : ''}" data-go="bai-hoc" data-p="id=${l.id}">
      <span class="n">${st === 'done' ? ic('check',20) : l.n}</span>
      <div style="min-width:0"><h4>${tx(l.title)}</h4><div class="meta"><span class="chip">${tx(SKILL[l.skill])}</span><span>${ic(l.kind === 'script' ? 'doc' : l.kind === 'video' ? 'video' : 'mic',14)} ${tx(KIND[l.kind])}</span><span>${ic('clock',14)} ${l.mins} ${L('phút','min')}</span>${i === 0 && isNext ? `<span class="chip blue">${L('Gợi ý cho bạn','Suggested')}</span>` : ''}</div>${st !== 'done' && path.reason(l) ? `<div class="why">${path.reason(l)}</div>` : ''}</div>
      <span class="st">${st === 'done' ? `<span class="chip good">${L('Hoàn thành','Done')} · ${best(l)}</span>` : st === 'doing' ? `<span class="chip warn">${L('Đang học','In progress')}${best(l) != null ? ' · ' + best(l) : ''}</span>` : `<span class="chip">${L('Chưa học','Not started')}</span>`}</span>
    </button>`; }).join('')}</div>`);
}

function vLesson(){
  const l = LESSON_BY_ID[S.params.id];
  if(!l) return AppLayout(`<div class="empty"><b>${L('Không tìm thấy bài học','Lesson not found')}</b><button class="btn btn-primary btn-sm" data-go="khoa-hoc">${L('Về khóa học','Back to courses')}</button></div>`);
  const g = GOALS[l.goal], st = S.data.lessons[l.id] || {}, list = COURSES[l.goal], idx = l.n - 1;
  const attempts = S.data.sessions.filter(s => s.lessonId === l.id).reverse();
  const btns = [['audio','mic',L('Ghi âm','Record audio'),false],['video','video',L('Quay video','Record video'),!plan().video],['script','doc',L('Chấm kịch bản','Review a script'),false]];
  btns.sort((a,b) => (b[0] === l.kind) - (a[0] === l.kind));
  return AppLayout(`
    <div class="crumbs"><button data-go="khoa-hoc">${L('Khóa học','Courses')}</button>›<button data-go="khoa-hoc-chi-tiet" data-p="g=${l.goal}">${tx(g.name)}</button>›<span>${L('Bài','Lesson')} ${l.n}</span></div>
    <div class="page-head"><div><h1>${tx(l.title)}</h1><p>${tx(SKILL[l.skill])} · ${l.mins} ${L('phút','min')} · ${st.status === 'done' ? L(`Đã hoàn thành, điểm cao nhất ${st.best}`, `Completed, best score ${st.best}`) : st.status === 'doing' ? L('Đang học','In progress') : L('Chưa học','Not started')}</p></div>
      <div class="acts">${idx > 0 ? `<button class="btn btn-ghost btn-sm" data-go="bai-hoc" data-p="id=${list[idx-1].id}">${ic('back',16)} ${L('Bài trước','Previous')}</button>` : ''}${idx < list.length-1 ? `<button class="btn btn-ghost btn-sm" data-go="bai-hoc" data-p="id=${list[idx+1].id}">${L('Bài sau','Next')} ${ic('arrow',16)}</button>` : ''}</div></div>
    <div class="grid g-main">
      <div class="section-gap" style="gap:16px">
        <div class="card"><div class="ls-sec"><span class="n">1</span><div><h3>${L('Lý thuyết và hướng dẫn','Theory and guidance')}</h3>
          <ul class="theory">${l.theory.map(t => `<li>${ic('check',16)}<span>${tx(t)}</span></li>`).join('')}</ul>
          <div class="tipbox"><b>${L('Mẹo','Tip')}</b><span>${tx(l.tip)}</span></div>
          <div style="margin-top:14px">${st.read ? `<span class="chip good">${ic('check',12)} ${L('Đã đọc','Read')}</span>` : `<button class="btn btn-outline btn-sm" data-act="lesson-read" data-id="${l.id}">${L('Đánh dấu đã đọc','Mark as read')}</button>`}</div></div></div></div>
        <div class="card"><div class="ls-sec"><span class="n">2</span><div><h3>${L('Bài luyện tập','Practice task')}</h3>
          <div class="task"><b>${esc(tx(l.task))}</b><span class="hint">${L('Thời lượng gợi ý','Suggested length')}: ${fmtDur(l.target)} · ${L('Hình thức gợi ý','Suggested format')}: ${tx(KIND[l.kind])}</span></div>
          <p class="hint" style="margin-top:10px">${L(`Đạt từ ${CONFIG.passScore} điểm để hoàn thành bài học. ${g.persona} sẽ chấm theo ${tx(g.focus)}.`, `Score ${CONFIG.passScore}+ to complete this lesson. ${g.persona} focuses on ${tx(g.focus)}.`)}</p></div></div></div>
        <div class="card"><div class="ls-sec"><span class="n">3</span><div><h3>${L('Luyện tập cùng AI','Practise with AI')}</h3><p class="muted" style="font-size:14px;margin-top:4px">${L('Bắt đầu ngay với đề bài ở trên. Kết quả được tính vào tiến độ bài học.','Start right away with the task above. The result counts toward this lesson.')}</p>
          <div class="practice-btns">${btns.map(([k,i,lab,lock],n) => `<button class="btn ${n === 0 ? 'btn-primary' : 'btn-outline'}" data-act="lesson-practice" data-id="${l.id}" data-kind="${k}" ${lock ? 'data-locked="1"' : ''}>${ic(i,18)} ${lab}${lock ? ' · Premium' : ''}</button>`).join('')}</div></div></div></div>
      </div>
      <div class="section-gap" style="gap:16px;min-width:0">
        <div class="card"><h3>${L('Kết quả của bạn','Your attempts')}</h3>${attempts.length ? `<div class="list" style="margin-top:6px">${attempts.map(rowHtml).join('')}</div>` : `<p class="hint" style="margin-top:8px">${L('Chưa có lần luyện nào cho bài này.','No attempts yet for this lesson.')}</p>`}</div>
        <div class="card"><h3>${L('Các bài trong khóa','Lessons in this course')}</h3><div class="list" style="margin-top:8px">${list.map(x => { const s2 = (S.data.lessons[x.id] || {}).status; return `<button class="row" data-go="bai-hoc" data-p="id=${x.id}" ${x.id === l.id ? 'aria-current="page"' : ''}><div style="min-width:0"><div class="row-t" style="${x.id === l.id ? 'color:var(--blue)' : ''}">${L('Bài','Lesson')} ${LESSON_BY_ID[x.id].n}: ${tx(x.title)}</div></div><span></span><span class="chip ${s2 === 'done' ? 'good' : s2 === 'doing' ? 'warn' : ''}">${s2 === 'done' ? ic('check',12) : s2 === 'doing' ? '…' : '–'}</span></button>`; }).join('')}</div></div>
      </div>
    </div>`);
}
