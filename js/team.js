'use strict';
/* Gói Team: trang nhóm (thành viên, lời mời, bảng điều khiển của trưởng nhóm, kịch bản dùng chung).
   Dữ liệu từ /api/team (S.team = {team, invites}) và /api/team/scripts (S.teamScripts). */
const Team = {
  async load(){
    try { S.team = await api('/team'); } catch(e){ S.team = S.team || {team:null, invites:[]}; }
    if(['nhom', 'tong-quan', 'goi-dich-vu', 'tai-khoan'].includes(S.route)) render();
    return S.team;
  },
  async loadScripts(){
    S.teamScripts = null;
    try { S.teamScripts = (await api('/team/scripts')).items; } catch(e){ S.teamScripts = []; }
    if(S.route === 'nhom') render();
  },
  async run(fn, ok){
    try { const r = await fn(); if(r && 'invites' in r) S.team = r; if(ok) toast(ok); }
    catch(e){ toast(e.message || L('Không thực hiện được. Vui lòng thử lại.','That didn’t work. Please try again.'), 'err'); }
    render();
  },
};

const fmtAgo = iso => { if(!iso) return '–'; const d = Math.floor((Date.now() - Date.parse(iso)) / 86400000); return d <= 0 ? L('Hôm nay','Today') : d === 1 ? L('Hôm qua','Yesterday') : L(`${d} ngày trước`, `${d} days ago`); };

/* Lời mời vào nhóm (hiện trên Tổng quan và trang Nhóm). */
function teamInviteBanner(){
  const inv = S.team && !S.team.team && (S.team.invites || []).filter(i => i.active);
  if(!inv || !inv.length) return '';
  return inv.map(i => `<div class="banner team-invite"><div><h3>${ic('users',18)} ${L(`Bạn được mời vào nhóm “${esc(i.teamName)}”`, `You’re invited to join “${esc(i.teamName)}”`)}</h3><p>${L('Tham gia để luyện tập với đầy đủ quyền lợi Premium tới hết kỳ của nhóm.','Join to practise with every Premium feature until the team’s period ends.')}</p></div><div class="acts"><button class="btn btn-primary btn-sm" data-act="team-join" data-id="${i.teamId}">${L('Tham gia','Join')}</button><button class="btn btn-ghost btn-sm" data-act="team-decline" data-id="${i.teamId}">${L('Từ chối','Decline')}</button></div></div>`).join('');
}

function vTeam(){
  if(!S.team){ Team.load(); return AppLayout(`<div class="an"><span class="spinner"></span></div>`); }
  const T = S.team.team;
  if(!T){
    return AppLayout(`<div class="page-head"><div><h1>${L('Nhóm','Team')}</h1><p>${L('Luyện cùng nhóm dự án, đội tranh biện hoặc câu lạc bộ.','Practise with your project group, debate team or club.')}</p></div></div>
      ${teamInviteBanner()}
      <div class="card team-empty"><div class="team-empty-ic">${ic('users',36)}</div><div><h3>${L('Bạn chưa ở trong nhóm nào','You’re not in a team yet')}</h3><p class="muted" style="margin-top:6px">${L(`Gói Team cho tối đa ${CONFIG.teamMaxMembers} tài khoản, mỗi người đủ quyền lợi Premium, kèm bảng điều khiển nhóm và kịch bản dùng chung.`, `Team covers up to ${CONFIG.teamMaxMembers} accounts, each with every Premium feature, plus a team dashboard and shared scripts.`)}</p>
        <ul class="unlock">${planFeatures('team').map(x => `<li>${ic('check',16)}<span>${x}</span></li>`).join('')}</ul>
        <div class="practice-btns"><button class="btn btn-primary" data-act="buy" data-product="team">${L('Tạo nhóm','Start a team')} · ${fmtVND(CONFIG.prices.team.monthly)}/${L('tháng','month')}</button><button class="btn btn-ghost" data-go="goi-dich-vu">${L('So sánh các gói','Compare plans')}</button></div></div></div>`);
  }
  if(S.teamScripts === undefined) Team.loadScripts();
  const leader = T.role === 'leader', seats = T.members.length, tot = T.totals;
  const head = `<div class="page-head"><div><span class="eyebrow">${leader ? L('Bạn là trưởng nhóm','You lead this team') : L('Bạn là thành viên','You’re a member')}</span>
      ${leader && S.teamRename ? `<form id="teamNameForm" class="team-rename"><input class="input" id="team-name" value="${esc(T.name)}" maxlength="80" aria-label="${L('Tên nhóm','Team name')}"><button class="btn btn-primary btn-sm" type="submit">${L('Lưu','Save')}</button><button class="btn btn-ghost btn-sm" type="button" data-act="team-rename">${L('Hủy','Cancel')}</button></form>` : `<h1>${esc(T.name)}${leader ? ` <button class="icon-btn" data-act="team-rename" aria-label="${L('Đổi tên nhóm','Rename team')}" title="${L('Đổi tên nhóm','Rename team')}">${ic('sliders',18)}</button>` : ''}</h1>`}
      <p>${T.active ? L(`Gói Team hiệu lực đến ${fmtDL(T.planExpiresAt.slice(0,10))}`, `Team plan active until ${fmtDL(T.planExpiresAt.slice(0,10))}`) : L('Gói Team đã hết hạn','The Team plan has ended')} · ${L(`${seats}/${T.maxMembers} tài khoản`, `${seats}/${T.maxMembers} seats`)}</p></div>
      ${leader ? `<button class="btn btn-outline" data-act="buy" data-product="team">${L('Gia hạn nhóm','Renew team')}</button>` : ''}</div>
    ${T.active ? '' : `<div class="banner warn"><div><h3>${L('Nhóm đã hết hạn','This team has ended')}</h3><p>${leader ? L('Gia hạn để thành viên tiếp tục dùng quyền lợi Premium.','Renew so members keep their Premium features.') : L('Nhờ trưởng nhóm gia hạn để tiếp tục.','Ask your team leader to renew.')}</p></div></div>`}`;
  const stats = leader && tot ? `<div class="dash-stats team-stats">
      <div class="dash-stat tone-coral"><div class="k">${L('Thành viên','Members')}</div><div class="v num">${tot.members}<small> / ${T.maxMembers}</small></div><div class="d">${tot.pendingInvites ? L(`${tot.pendingInvites} lời mời đang chờ`, `${tot.pendingInvites} pending invite${tot.pendingInvites > 1 ? 's' : ''}`) : L('Không có lời mời chờ','No pending invites')}</div></div>
      <div class="dash-stat tone-sand"><div class="k">${L('Bài đã chấm (30 ngày)','Talks analysed (30 days)')}</div><div class="v num">${tot.sessions30d}</div><div class="d">${L(`${tot.activeMembers30d} người có luyện tập`, `${tot.activeMembers30d} active member${tot.activeMembers30d === 1 ? '' : 's'}`)}</div></div>
      <div class="dash-stat tone-teal"><div class="k">${L('Điểm trung bình nhóm','Team average')}</div><div class="v num">${tot.avgScore30d ?? '–'}</div><div class="d">${L('30 ngày gần nhất','Last 30 days')}</div></div>
      <div class="dash-stat tone-mauve"><div class="k">${L('Chỗ trống','Open seats')}</div><div class="v num">${T.maxMembers - seats}</div><div class="d">${L('Mời qua email bên dưới','Invite by email below')}</div></div>
    </div>` : '';
  const row = m => `<tr class="${m.status === 'invited' ? 'invited' : ''}">
      <td><div class="tm-who"><span class="avatar sm">${esc((m.name || m.email).trim().slice(0,1).toUpperCase())}</span><div><b>${esc(m.name || m.email.split('@')[0])}${m.isMe ? ` <span class="chip line">${L('Bạn','You')}</span>` : ''}</b><div class="row-m">${esc(m.email)}</div></div></div></td>
      <td>${m.role === 'leader' ? `<span class="chip pro">${L('TRƯỞNG NHÓM','LEADER')}</span>` : m.status === 'invited' ? `<span class="chip warn">${L('Đã mời','Invited')}</span>` : `<span class="chip good">${L('Thành viên','Member')}</span>`}</td>
      ${leader ? `<td class="num">${m.stats ? m.stats.sessions30d : '–'}</td><td class="num">${m.stats && m.stats.avgScore30d != null ? `<span class="score-pill ${sCls(m.stats.avgScore30d)}">${m.stats.avgScore30d}</span>` : '–'}</td><td class="num">${m.stats && m.stats.bestScore30d != null ? m.stats.bestScore30d : '–'}</td><td>${m.stats ? fmtAgo(m.stats.lastPracticeAt) : '–'}</td>` : ''}
      <td style="text-align:right">${leader && m.role !== 'leader' ? `<button class="btn btn-ghost btn-sm" data-act="team-remove" data-email="${esc(m.email)}">${m.status === 'invited' ? L('Hủy lời mời','Cancel invite') : L('Xóa','Remove')}</button>` : !leader && m.isMe ? `<button class="btn btn-ghost btn-sm" data-act="team-leave" data-email="${esc(m.email)}">${L('Rời nhóm','Leave team')}</button>` : ''}</td></tr>`;
  const members = `<div class="card mt"><div class="card-head"><div><h3>${L('Thành viên','Members')}</h3><div class="sub">${leader ? L('Số liệu tính trong 30 ngày gần nhất.','Figures cover the last 30 days.') : L('Mỗi thành viên có đủ quyền lợi Premium.','Every member has all Premium features.')}</div></div></div>
      <div class="tbl-wrap" style="margin-top:10px"><table class="team-table"><thead><tr><th>${L('Người','Person')}</th><th>${L('Vai trò','Role')}</th>${leader ? `<th>${L('Bài','Talks')}</th><th>${L('Điểm TB','Avg')}</th><th>${L('Cao nhất','Best')}</th><th>${L('Luyện gần nhất','Last practice')}</th>` : ''}<th></th></tr></thead><tbody>${T.members.map(row).join('')}</tbody></table></div>
      ${leader ? (seats < T.maxMembers && T.active ? `<form id="teamInviteForm" class="team-invite-form"><input class="input" id="team-email" type="email" required placeholder="${L('Email thành viên, vd. ban@truong.edu.vn','Member email, e.g. friend@school.edu')}" aria-label="${L('Email thành viên','Member email')}"><button class="btn btn-primary" type="submit">${ic('mail',16)} ${L('Gửi lời mời','Send invite')}</button></form><p class="hint" style="margin-top:8px">${L('Người được mời đăng nhập hoặc đăng ký bằng đúng email này rồi bấm “Tham gia”.','Invitees log in or sign up with this exact email, then press “Join”.')}</p>` : `<p class="hint" style="margin-top:12px">${T.active ? L(`Nhóm đã đủ ${T.maxMembers} tài khoản. Xóa một lời mời hoặc thành viên để mời người khác.`, `The team has all ${T.maxMembers} seats. Remove an invite or member to invite someone else.`) : ''}</p>`) : ''}</div>`;
  const sc = S.teamScripts;
  const scripts = `<div class="card mt"><div class="card-head"><div><h3>${L('Kịch bản dùng chung','Shared scripts')}</h3><div class="sub">${L('Chia sẻ kịch bản và tài liệu luyện tập với cả nhóm.','Share scripts and practice material with the whole team.')}</div></div>${T.active ? `<button class="btn btn-outline btn-sm" data-act="team-script-new">${ic('doc',16)} ${S.teamScriptNew ? L('Đóng','Close') : L('Thêm kịch bản','Add a script')}</button>` : ''}</div>
      ${S.teamScriptNew ? `<form id="teamScriptForm" class="form team-script-form"><div class="field"><label for="ts-title">${L('Tiêu đề','Title')}</label><input class="input" id="ts-title" maxlength="120" required></div><div class="field"><label for="ts-body">${L('Nội dung','Content')}</label><textarea class="input" id="ts-body" style="min-height:180px" required placeholder="${L('Dán kịch bản hoặc dàn ý…','Paste a script or outline…')}"></textarea></div><div><button class="btn btn-primary btn-sm" type="submit">${L('Chia sẻ với nhóm','Share with the team')}</button></div></form>` : ''}
      <div class="team-scripts">${sc === null || sc === undefined ? '<span class="spinner"></span>' : sc.length ? sc.map(x => `<article class="ts-card"><div><b>${esc(x.title)}</b><div class="row-m">${esc(x.authorName || L('Thành viên','Member'))} · ${fmtDL(x.createdAt.slice(0,10))}</div></div><p>${esc(x.body.slice(0, 260))}${x.body.length > 260 ? '…' : ''}</p><div class="ts-acts"><button class="btn btn-tonal btn-sm" data-act="team-script-use" data-id="${x.id}">${ic('mic',16)} ${L('Luyện với kịch bản này','Practise with this script')}</button>${x.mine || leader ? `<button class="btn btn-ghost btn-sm" data-act="team-script-del" data-id="${x.id}">${ic('trash',16)}</button>` : ''}</div></article>`).join('') : `<p class="muted" style="font-size:14px">${L('Chưa có kịch bản nào. Thêm kịch bản đầu tiên để cả nhóm cùng luyện.','No scripts yet. Add the first one so everyone can practise it.')}</p>`}</div></div>`;
  return AppLayout(head + stats + members + scripts);
}

const TEAM_ACTIONS = {
  'team-join'(el){ Team.run(() => api('/team/join', {method:'POST', body:{teamId:el.dataset.id}}), L('Đã tham gia nhóm','You joined the team')).then(() => Practice.refreshMe()).then(render); },
  'team-decline'(el){ Team.run(() => api('/team/decline', {method:'POST', body:{teamId:el.dataset.id}}), L('Đã từ chối lời mời','Invite declined')); },
  'team-remove'(el){ const e = el.dataset.email; if(!confirm(L(`Xóa ${e} khỏi nhóm?`, `Remove ${e} from the team?`))) return; Team.run(() => api('/team/members', {method:'DELETE', query:{email:e}}), L('Đã cập nhật nhóm','Team updated')); },
  'team-leave'(el){ if(!confirm(L('Rời nhóm? Bạn sẽ mất quyền lợi Premium của nhóm.','Leave the team? You’ll lose the team’s Premium features.'))) return; Team.run(() => api('/team/members', {method:'DELETE', query:{email:el.dataset.email}}), L('Bạn đã rời nhóm','You left the team')).then(() => Practice.refreshMe()).then(() => { S.teamScripts = undefined; render(); }); },
  'team-rename'(){ S.teamRename = !S.teamRename; render(); },
  'team-script-new'(){ S.teamScriptNew = !S.teamScriptNew; render(); },
  'team-script-del'(el){ if(!confirm(L('Xóa kịch bản này?','Delete this script?'))) return; Team.run(() => api('/team/scripts/' + el.dataset.id, {method:'DELETE'}), L('Đã xóa kịch bản','Script deleted')).then(() => Team.loadScripts()); },
  'team-script-use'(el){
    const x = (S.teamScripts || []).find(s => s.id === el.dataset.id); if(!x) return;
    const p = S.data.profile;
    S.draft = {goal:goalAllowed(p.goal) ? p.goal : CONFIG.freeGoals[0], lang:p.speechLang, promptIdx:0, custom:x.title, kind:'script', file:null, lessonId:null, placement:false};
    S.scriptText = x.body; S.scriptErr = ''; go('kich-ban');
  },
};

async function teamSubmit(id, v){
  if(id === 'teamInviteForm'){ const email = v('team-email').trim(); if(!email) return; await Team.run(() => api('/team/members', {method:'POST', body:{email}}), L(`Đã gửi lời mời tới ${email}`, `Invite sent to ${email}`)); return true; }
  if(id === 'teamNameForm'){ const name = v('team-name').trim(); if(!name) return; S.teamRename = false; await Team.run(() => api('/team', {method:'PATCH', body:{name}}), L('Đã đổi tên nhóm','Team renamed')); return true; }
  if(id === 'teamScriptForm'){
    const title = v('ts-title').trim(), body = v('ts-body').trim(); if(!title || !body) return true;
    try { await api('/team/scripts', {method:'POST', body:{title, body}}); S.teamScriptNew = false; toast(L('Đã chia sẻ kịch bản','Script shared')); await Team.loadScripts(); }
    catch(e){ toast(e.message || L('Không lưu được kịch bản.','Couldn’t save the script.'), 'err'); }
    return true;
  }
  return false;
}
