'use strict';
/* Phân tích (bản thử nghiệm):
   - Kịch bản: phân tích thật trên văn bản người dùng gửi (quy tắc, chưa dùng mô hình AI).
   - Bài nói: điểm và bản chép lời là dữ liệu mẫu theo đúng loại hình và ngôn ngữ, chờ kết nối AI giọng nói.
   Lỗi được lưu dưới dạng mã + tham số và chỉ dịch ra chữ khi hiển thị, nên đổi ngôn ngữ giao diện vẫn đúng. */
const wordsOf = t => String(t || '').split(/\s+/).filter(Boolean).length;
const clampScore = (v, a=40, b=95) => Math.round(Math.max(a, Math.min(b, v)));
const avg = a => a.length ? a.reduce((x,y) => x+y, 0)/a.length : null;

const LEX = {
  vi:{weak:['thì','kiểu như','cái này','rất là','nói chung','đại loại'], trans:['thứ nhất','thứ hai','đầu tiên','tiếp theo','cuối cùng','ngoài ra','vì vậy','tóm lại','trước hết'],
      greet:/^(xin chào|chào|kính thưa|hôm nay|dạ)/i, hook:/(bạn có|chúng ta|hãy tưởng tượng|bạn đã bao giờ)/i, cta:/(cần|đề xuất|kêu gọi|hãy|mời|cùng nhau|đầu tư|hành động|bắt đầu)/i, thanks:/cảm ơn/i, join:/^(và|nhưng|nên|vì)$/i},
  en:{weak:['basically','actually','like','you know','really','very','so'], trans:['first','second','next','finally','also','therefore','in short','to sum up','firstly'],
      greet:/^(hello|hi|good morning|good afternoon|today)/i, hook:/(have you ever|imagine|what if|did you know)/i, cta:/(raising|need|propose|join|invest|let'?s|start|ask|invite)/i, thanks:/thank/i, join:/^(and|but|so|because)$/i},
};
const STOP = new Set(['của','và','cho','với','trong','các','những','một','này','được','không','về','tại','theo','trên','khi','thì','là','mà','có','để','từ','bài','nói','the','and','for','with','your','you','how','what','why','about','that','this','are','our']);

function analyzeScript(text, title, goal, lang){
  const X = LEX[lang] || LEX.vi, clean = String(text).replace(/\r/g,'').trim();
  const paras = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const sentences = [];
  paras.forEach((p,pi) => (p.match(/[^.!?…]+[.!?…]*/g) || []).map(x => x.trim()).filter(Boolean).forEach(x => sentences.push({t:x, p:pi, i:sentences.length})));
  const wc = wordsOf(clean), estSec = Math.round(wc/130*60), [tmin, tmax] = GOALS[goal].target;
  const norm = ' ' + clean.toLowerCase().replace(/[,.!?…;:()"“”]/g,' ').replace(/\s+/g,' ') + ' ';
  const has = (s, w) => (' ' + s.toLowerCase().replace(/[,.!?…;:]/g,' ') + ' ').includes(' ' + w + ' ');
  const weakCount = {}; X.weak.forEach(w => { const n = norm.split(' ' + w + ' ').length - 1; if(n) weakCount[w] = n; });
  const weakTotal = Object.values(weakCount).reduce((a,b) => a+b, 0);
  const longS = sentences.filter(s => wordsOf(s.t) > 30);
  const numCount = (clean.match(/\d+([.,]\d+)?/g) || []).length;
  const first = sentences[0] ? sentences[0].t : '', last = sentences.length ? sentences[sentences.length-1].t : '';
  const hook = /\?|\d/.test(first) || X.hook.test(first), greet = X.greet.test(first);
  const cta = X.cta.test(sentences.slice(-2).map(s => s.t).join(' '));
  const transN = X.trans.filter(t => norm.includes(' ' + t + ' ')).length;
  const kw = String(title || '').toLowerCase().split(/[\s:,.;!?()]+/).filter(w => w.length >= 3 && !STOP.has(w));
  const kwHit = kw.length ? kw.filter(w => norm.includes(' ' + w)).length/kw.length : .8;
  const lenDiff = estSec < tmin*60 ? (tmin*60 - estSec)/60 : estSec > tmax*60 ? (estSec - tmax*60)/60 : 0;
  const c = {
    content:clampScore(58 + Math.min(18, numCount*4) + (paras.length >= 3 ? 6 : 0)),
    structure:clampScore(55 + Math.min(20, paras.length*5) + transN*5),
    relevance:clampScore(60 + kwHit*35),
    length:clampScore(92 - lenDiff*16),
    opening:hook ? 88 : greet ? 55 : 68,
    closing:cta ? 86 : X.thanks.test(last) ? 58 : 66,
    wording:clampScore(92 - longS.length*8 - weakTotal*3),
  };
  const weak = [];
  if(!hook) weak.push({code:greet ? 'hook_greet' : 'hook', s:0});
  longS.slice(0,2).forEach(s => weak.push({code:'long', n:wordsOf(s.t), s:s.i}));
  if(weakTotal >= 2){ const ws = sentences.find(s => X.weak.some(w => has(s.t, w))); weak.push({code:'wordy', list:weakCount, s:ws ? ws.i : null}); }
  if(!cta) weak.push({code:'cta', s:sentences.length - 1});
  if(lenDiff > 0) weak.push({code:estSec < tmin*60 ? 'short' : 'toolong', est:estSec, tmin, tmax});
  if(transN === 0 && paras.length >= 3) weak.push({code:'trans'});
  if(!numCount) weak.push({code:'nonum'});
  if(kw.length && kwHit < .5) weak.push({code:'offtopic', title});
  const tighten = t => (lang === 'en'
    ? t.replace(/\b(basically|actually|you know),?\s*/gi,'').replace(/\breally\s+/gi,'').replace(/^so,?\s+/i,'')
    : t.replace(/^thì\s+/i,'').replace(/\s+thì\s+/gi,' ').replace(/rất là/gi,'rất').replace(/kiểu như\s*/gi,'').replace(/cái này/gi,'điều này')).replace(/\s{2,}/g,' ').trim();
  const splitLong = t => {
    const ws = t.split(' '); if(ws.length <= 30) return t;
    const mid = Math.floor(ws.length/2);
    let k = ws.findIndex((w,j) => j >= mid-6 && X.join.test(w)); if(k < 0) k = ws.findIndex((w,j) => j >= mid-6 && /,$/.test(w)) + 1; if(k <= 0) return t;
    const a = ws.slice(0,k).join(' ').replace(/,$/,''), b = ws.slice(k).join(' ').replace(/^(và|nhưng|nên|vì|and|but|so|because)\s+/i,'');
    return a + '. ' + b.charAt(0).toUpperCase() + b.slice(1);
  };
  const rewrites = [];
  sentences.forEach(s => { if(rewrites.length >= 3) return; const n = splitLong(tighten(s.t)); if(n !== s.t && (wordsOf(s.t) > 30 || X.weak.some(w => has(s.t, w)))) rewrites.push({old:s.t, neu:n.charAt(0).toUpperCase() + n.slice(1)}); });
  return {c, wc, estSec, paras:paras.length, sentences, weak:weak.slice(0,5), rewrites, weakTotal, numCount};
}

/* Lời nhận xét theo mã lỗi, dịch theo ngôn ngữ giao diện lúc hiển thị. */
function weakText(w, goal){
  if(w.title) return {title:esc(w.title), detail:esc(w.detail || ''), fix:esc(w.fix || '')};   // lỗi do máy chủ trả về đã có sẵn lời nhận xét
  const g = GOALS[goal] || GOALS.presentation, gname = tx(g.name).toLowerCase();
  const T = {
    hook:{t:L('Mở bài chưa có câu thu hút','The opening has no hook'), d:L('Câu đầu chưa có câu hỏi, con số hay câu chuyện để giữ người nghe.','Your first line has no question, number or story to grab attention.'), f:L('Mở bằng một con số, một câu hỏi hoặc một tình huống ngắn liên quan tới người nghe.','Open with a number, a question or a short situation the audience relates to.')},
    hook_greet:{t:L('Mở bài chưa có câu thu hút','The opening has no hook'), d:L('Bài mở bằng lời chào và tên chủ đề, chưa cho người nghe lý do để chú ý.','You open with a greeting and the topic name, giving no reason to listen.'), f:L('Bỏ lời chào dài. Mở bằng một con số, câu hỏi hoặc tình huống ngắn.','Skip the long greeting. Open with a number, a question or a short story.')},
    long:{t:L(`Câu quá dài (${w.n} từ)`,`Sentence too long (${w.n} words)`), d:L('Câu trên 30 từ khó nói trong một hơi và khó theo dõi khi nghe.','Sentences over 30 words are hard to say in one breath and hard to follow.'), f:L('Tách thành 2 câu, mỗi câu một ý. Xem gợi ý viết lại bên dưới.','Split it into 2 sentences, one idea each. See the rewrite below.')},
    wordy:{t:L('Có từ thừa','Unnecessary words'), d:Object.entries(w.list || {}).map(([k,n]) => `“${k}” × ${n}`).join(', ') + '.', f:L('Bỏ các từ này khi viết. Khi nói, dừng một nhịp thay vì chêm từ.','Cut these words in writing. When speaking, pause instead.')},
    cta:{t:L('Kết bài chưa có lời kêu gọi','No call to action at the end'), d:L('Người nghe chưa biết bạn muốn họ làm gì sau bài nói.','Listeners don’t know what you want them to do next.'), f:goal === 'pitching' ? L('Nêu rõ số vốn cần, dùng vào việc gì và mốc thời gian.','State how much you are raising, what for, and by when.') : L('Chốt 1 thông điệp chính và một việc cụ thể người nghe nên làm.','Close with one key message and one concrete next step.')},
    short:{t:L('Kịch bản ngắn hơn thời lượng phù hợp','Script is shorter than ideal'), d:L(`Khoảng ${fmtDur(w.est)} khi nói ở 130 từ/phút. ${tx(g.name)} phù hợp ${w.tmin}–${w.tmax} phút.`,`About ${fmtDur(w.est)} at 130 words per minute. ${tx(g.name)} works best at ${w.tmin}–${w.tmax} minutes.`), f:L('Thêm 1 ví dụ hoặc số liệu cho mỗi ý chính.','Add one example or number for each key point.')},
    toolong:{t:L('Kịch bản dài hơn thời lượng phù hợp','Script is longer than ideal'), d:L(`Khoảng ${fmtDur(w.est)} khi nói. ${tx(g.name)} phù hợp ${w.tmin}–${w.tmax} phút.`,`About ${fmtDur(w.est)} when spoken. ${tx(g.name)} works best at ${w.tmin}–${w.tmax} minutes.`), f:L('Bỏ bớt ý phụ, giữ tối đa 3 ý chính.','Cut minor points and keep at most 3 key points.')},
    trans:{t:L('Thiếu từ nối giữa các phần','Missing transitions'), d:L('Các đoạn đứng cạnh nhau nhưng người nghe khó biết khi nào chuyển ý.','Paragraphs sit side by side but listeners can’t tell when you move on.'), f:L('Thêm “Đầu tiên”, “Tiếp theo”, “Cuối cùng” ở đầu mỗi phần.','Add “First”, “Next”, “Finally” at the start of each part.')},
    nonum:{t:L('Chưa có số liệu','No numbers or data'), d:L('Bài chưa có con số nào để tăng độ tin cậy.','There are no numbers to make your case credible.'), f:L('Thêm ít nhất 1 số liệu có nguồn cho luận điểm quan trọng nhất.','Add at least one sourced number to your most important point.')},
    offtopic:{t:L('Chưa bám sát chủ đề','Drifts off topic'), d:L(`Kịch bản ít nhắc tới các từ khóa của chủ đề “${w.title}”.`,`The script rarely mentions the key words of “${w.title}”.`), f:L('Nhắc lại chủ đề ở mở bài và kết bài, nối mỗi ý chính với chủ đề.','Restate the topic in your opening and closing, and link each point to it.')},
    filler:{t:L('Dùng nhiều từ đệm','Too many filler words'), d:L(`${w.n} từ đệm, phần lớn nằm ở 30 giây đầu khi người nghe đang hình thành ấn tượng.`,`${w.n} filler words, mostly in the first 30 seconds when first impressions form.`), f:L('Khi cần suy nghĩ, dừng im lặng 1 giây thay vì nói “ừm”.','When you need to think, pause silently for a second instead of saying “um”.')},
    pace:{t:L('Câu dài, tốc độ tăng mạnh','Long sentence, pace spikes'), d:L('Đoạn này lên khoảng 172 từ/phút, cao hơn ngưỡng dễ nghe 120–150.','This part reaches about 172 words per minute, above the easy 120–150 range.'), f:L('Tách câu và dừng một nhịp sau mỗi ý.','Split the sentence and pause after each point.')},
    closing:{t:L('Kết bài chưa có thông điệp chốt','The ending has no key message'), d:L('Bài kết thúc đột ngột, người nghe khó nhớ được ý chính.','The talk ends abruptly, so the main point is easy to forget.'), f:L(`Kết bằng thông điệp chính của bài ${gname} và một việc người nghe nên làm.`,`End with the key message of your ${gname} and one next step for the audience.`)},
    eye:{t:L('Ánh mắt rời khán giả','Eye contact drops'), d:L('Nhìn xuống ghi chú khoảng 62% thời gian, nhất là ở phần giữa bài.','You look down at your notes about 62% of the time, mostly mid-talk.'), f:L('Chọn 3 điểm nhìn trong phòng, chỉ liếc ghi chú ở đầu mỗi ý.','Pick 3 points in the room and glance at notes only at the start of each point.')},
  };
  const r = T[w.code] || {t:w.code, d:'', f:''};
  return {title:r.t, detail:r.d, fix:r.f};
}
/* Ghi chú về cách nói do máy chủ trả về dạng mã + số liệu; dịch theo ngôn ngữ giao diện lúc hiển thị. */
function noteText(n){
  const d = n.data || {};
  const T = {
    pace_fast:() => L(`Bạn nói nhanh, trung bình ${d.wpm} từ/phút (dễ nghe: 120–150).`, `You speak fast, about ${d.wpm} words per minute (easy range: 120–150).`),
    pace_slow:() => L(`Bạn nói chậm, trung bình ${d.wpm} từ/phút (dễ nghe: 120–150).`, `You speak slowly, about ${d.wpm} words per minute (easy range: 120–150).`),
    pace_spike:() => L(`Phút ${d.minute} tốc độ tăng lên ${d.wpm} từ/phút. Hãy tách câu và dừng một nhịp.`, `In minute ${d.minute} your pace spiked to ${d.wpm} wpm. Split sentences and pause.`),
    pace_drop:() => L(`Phút ${d.minute} tốc độ giảm còn ${d.wpm} từ/phút, dễ làm người nghe mất tập trung.`, `In minute ${d.minute} your pace dropped to ${d.wpm} wpm, which can lose listeners.`),
    filler_high:() => L(`Có ${d.count} từ đệm, khoảng ${d.perMin} từ mỗi phút.`, `${d.count} filler words, about ${d.perMin} per minute.`),
    pauses_long:() => L(`Có ${d.count} lần ngắt nghỉ quá dài.`, `${d.count} overly long pauses.`),
    eye_low:() => L(`Giao tiếp bằng mắt thấp (${d.ratio}% thời gian nhìn vào khán giả).`, `Low eye contact (${d.ratio}% of the time looking at the audience).`),
    gesture_low:() => L(`Ít cử chỉ tay (${d.perMin} lần mỗi phút).`, `Few hand gestures (${d.perMin} per minute).`),
    posture_sway:() => L(`Tư thế đung đưa nhiều (${d.perMin} lần đổi tư thế mỗi phút).`, `A lot of swaying (${d.perMin} posture shifts per minute).`),
    expression_flat:() => L('Gương mặt ít biểu cảm. Thử mỉm cười ở phần mở và kết.', 'Little facial expression. Try smiling at the opening and close.'),
  };
  return T[n.code] ? T[n.code]() : '';
}
const MARK_TYPES = {filler:['bad', () => L('Từ đệm','Filler')], pace:['warn', () => L('Tốc độ','Pace')], eye:['sky', () => L('Ánh mắt','Eye contact')], structure:['pro', () => L('Cấu trúc','Structure')], good:['good', () => L('Điểm tốt','Strength')]};
function markLabel(m){
  if(m.label) return esc(m.label);
  return {hook:L('Mở bài chưa thu hút','Weak opening'), filler:L('Từ đệm ở câu mở đầu','Fillers in the opening'), good:L('Dẫn số liệu rõ ràng','Clear use of data'), pace:L('Tốc độ lên khoảng 172 từ/phút','Pace up to about 172 wpm'), eye:L('Nhìn xuống ghi chú','Looking down at notes'), closing:L('Kết bài đột ngột','Abrupt ending')}[m.code] || m.code;
}

function parseSeg(s){ return s.split(/(\[[^\]]+\])/).filter(Boolean).map(p => /^\[.*\]$/.test(p) ? ['f', p.slice(1,-1)] : ['n', p]); }
const segPlain = s => s.replace(/\[([^\]]+)\]/g, '$1');

/* Dựng báo cáo bài nói theo loại hình + ngôn ngữ bài nói. */
function buildSpeechReport({goal, lang, placement, video, dur, fillers}){
  const tr = (TRANSCRIPTS[placement ? 'placement' : goal] || TRANSCRIPTS.presentation)[lang === 'en' ? 'en' : 'vi'];
  const segs = tr.segs.map((s,i) => ({t:Math.round(dur*i/4), p:parseSeg(s)}));
  const weak = [{code:'hook', s:0}, {code:'filler', s:0, n:fillers}, {code:'pace', s:2}, {code:'closing', s:3}];
  if(video) weak.push({code:'eye', s:2});
  const marks = [{code:'filler', type:'filler', s:0, t:Math.min(dur-1, 3)}, {code:'good', type:'good', s:1, t:segs[1].t + 2}, {code:'pace', type:'pace', s:2, t:segs[2].t + 3}];
  if(video) marks.push({code:'eye', type:'eye', s:2, t:segs[2].t + Math.round(dur/12)});
  marks.push({code:'closing', type:'structure', s:3, t:Math.max(segs[3].t + 1, dur - 3)});
  const mins = Math.min(30, Math.max(1, Math.ceil(dur/60))), spike = Math.min(mins-1, Math.floor(segs[2].t/60));
  const pace = Array.from({length:mins}, (_,i) => i === spike ? 172 : Math.round(132 + Math.sin(i*1.3)*10));
  return {segs, weak, marks, pace, rewrites:[{old:segPlain(tr.segs[0]), neu:tr.rw[0]}, {old:segPlain(tr.segs[3]), neu:tr.rw[1]}], dur, video};
}
const DEFAULT_C = {content:62, structure:56, relevance:70, pace:60, fluency:58, filler:48, body:55};
function speechScores(prev, video){
  const c = {};
  Object.keys(CRIT).forEach(k => { c[k] = k === 'body' && !video ? null : clampScore(((prev && prev.c[k]) ?? DEFAULT_C[k]) + Math.round(Math.random()*6 - 2)); });
  return c;
}
const scoreOf = c => Math.round(avg(Object.values(c).filter(v => v != null)));

function gradeAnswer(text, goal){
  const n = wordsOf(text), hasNum = /\d/.test(text), fill = (text.match(/(^|[\s,.])(ừm|ờ|à|kiểu như|um|uh|like)(?=[\s,.!?]|$)/giu) || []).length;
  const score = clampScore(60 + Math.min(20, n/3) + (hasNum ? 10 : 0) - fill*4, 45, 92);
  const pts = [n < 15 ? L(`Câu trả lời còn ngắn (${n} từ). Người hỏi cần thêm lý do hoặc ví dụ.`, `Your answer is short (${n} words). Add a reason or an example.`) : L(`Độ dài phù hợp (${n} từ), đủ cho 30–45 giây.`, `Good length (${n} words), enough for 30–45 seconds.`),
    hasNum ? L('Có số liệu cụ thể, tăng độ tin cậy.','You used a concrete number, which builds credibility.') : L('Chưa có con số nào. Thêm một số liệu sẽ thuyết phục hơn.','No numbers yet. Adding one would be more convincing.') + (goal === 'pitching' ? L(' Nhà đầu tư rất cần điều này.',' Investors especially need this.') : '')];
  if(fill) pts.push(L(`Có ${fill} từ đệm. Dừng 1 giây thay vì nói “ừm”.`, `${fill} filler words. Pause for a second instead of saying “um”.`));
  return {score, head:score >= 75 ? L('Trả lời thuyết phục','Convincing answer') : score >= 60 ? L('Ổn, có thể gọn và chắc hơn','Good, could be tighter') : L('Chưa thuyết phục','Not convincing yet'), pts};
}

/* Lộ trình cá nhân hóa: điểm theo kỹ năng từ các lần luyện gần nhất → sắp thứ tự bài chưa hoàn thành. */
function skillScores(sessions){
  const recent = sessions.slice(-6), out = {};
  Object.entries(SKILL).forEach(([k, s]) => {
    const vals = recent.map(x => x.kind === 'script' ? (k === 'opening' ? x.c.opening : k === 'closing' ? x.c.closing : x.c[s.crit]) : x.c[s.crit]).filter(v => v != null);
    out[k] = vals.length ? Math.round(avg(vals)) : null;
  });
  return out;
}
function coursePath(goal, data){
  const ls = COURSES[goal].map(l => LESSON_BY_ID[l.id]), sk = skillScores(data.sessions);
  const st = id => (data.lessons[id] || {}).status;
  const done = ls.filter(l => st(l.id) === 'done'), todo = ls.filter(l => st(l.id) !== 'done');
  const hasData = data.sessions.length > 0;
  let ordered = todo;
  if(hasData){
    const lead = todo.length && todo[0].n === 1 && !(data.lessons[todo[0].id] || {}).status ? [todo[0]] : [];
    ordered = [...lead, ...todo.filter(l => !lead.includes(l)).sort((a,b) => ((sk[a.skill] ?? 72) - (sk[b.skill] ?? 72)) || a.n - b.n)];
  }
  const reason = l => hasData && sk[l.skill] != null && sk[l.skill] < 72 ? L(`Điểm ${tx(SKILL[l.skill]).toLowerCase()} gần đây của bạn: ${sk[l.skill]}`, `Your recent ${tx(SKILL[l.skill]).toLowerCase()} score: ${sk[l.skill]}`) : '';
  return {list:[...ordered, ...done], next:ordered[0] || null, done:done.length, total:ls.length, sk, hasData, reason};
}
