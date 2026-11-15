'use strict';
/* Lưu trữ phía trình duyệt (bản thử nghiệm, chưa có backend):
   - localStorage: tài khoản, phiên đăng nhập, dữ liệu luyện tập của từng người dùng.
   - IndexedDB: tệp ghi âm/video để nghe lại và tải về sau khi tải lại trang.
   Khi có backend, thay các hàm trong Auth và UserStore bằng lời gọi API, giữ nguyên chữ ký hàm. */
const DB = {
  get(k, d=null){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ return false; } },
  del(k){ try { localStorage.removeItem(k); } catch(e){} },
};

const Media = {
  _db:null, urls:{},
  open(){
    if(this._db) return Promise.resolve(this._db);
    return new Promise(res => {
      try { const r = indexedDB.open('ltt-media', 1); r.onupgradeneeded = () => r.result.createObjectStore('m'); r.onsuccess = () => res(this._db = r.result); r.onerror = () => res(null); }
      catch(e){ res(null); }
    });
  },
  async run(mode, fn){ const db = await this.open(); if(!db) return null; return new Promise(res => { try { const t = db.transaction('m', mode), st = t.objectStore('m'), r = fn(st); t.oncomplete = () => res(r && 'result' in r ? r.result : true); t.onerror = () => res(null); } catch(e){ res(null); } }); },
  save(id, blob){ this.urls[id] = URL.createObjectURL(blob); return this.run('readwrite', st => st.put(blob, id)); },
  async url(id){ if(this.urls[id]) return this.urls[id]; const b = await this.run('readonly', st => st.get(id)); return b ? (this.urls[id] = URL.createObjectURL(b)) : null; },
  remove(id){ if(this.urls[id]){ URL.revokeObjectURL(this.urls[id]); delete this.urls[id]; } return this.run('readwrite', st => st.delete(id)); },
};

async function hashPw(pw){
  try { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ltt::' + pw)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2,'0')).join(''); }
  catch(e){ return 'p:' + btoa(unescape(encodeURIComponent(pw))); }
}
class AuthError extends Error { constructor(code, extra={}){ super(code); this.code = code; Object.assign(this, extra); } }

/* Dịch vụ xác thực (mô phỏng). Mã xác thực hiển thị trên màn hình thay cho email thật. */
const Auth = {
  users(){ return DB.get('ltt.users', {}); },
  saveUsers(u){ DB.set('ltt.users', u); },
  find(email){ return this.users()[String(email).trim().toLowerCase()] || null; },
  async register({name, email, password}){
    const e = email.trim().toLowerCase(), us = this.users();
    if(us[e] && us[e].verified) throw new AuthError('exists');
    us[e] = {name, email:e, pw:await hashPw(password), verified:false, provider:'email', created:Date.now()};
    this.saveUsers(us);
    return this.issueCode(e, 'verify');
  },
  issueCode(email, purpose){
    const c = {email, purpose, code:String(Math.floor(100000 + Math.random()*900000)), exp:Date.now() + CONFIG.codeTTL, resendAt:Date.now() + CONFIG.resendAfter, tries:0};
    DB.set('ltt.code', c); return c;
  },
  pending(purpose){ const c = DB.get('ltt.code'); return c && c.purpose === purpose ? c : null; },
  resend(purpose){ const c = this.pending(purpose); if(!c) throw new AuthError('nocode'); if(Date.now() < c.resendAt) throw new AuthError('wait', {sec:Math.ceil((c.resendAt - Date.now())/1000)}); return this.issueCode(c.email, purpose); },
  checkCode(input, purpose){
    const c = this.pending(purpose);
    if(!c) throw new AuthError('nocode');
    if(Date.now() > c.exp) throw new AuthError('expired');
    if(c.tries >= 5) throw new AuthError('locked');
    if(String(input).trim() !== c.code){ c.tries++; DB.set('ltt.code', c); throw new AuthError('wrong', {left:5 - c.tries}); }
    DB.del('ltt.code'); return c.email;
  },
  verify(code){ const e = this.checkCode(code, 'verify'), us = this.users(); if(us[e]){ us[e].verified = true; this.saveUsers(us); } return us[e]; },
  async login(email, pw){
    const u = this.find(email);
    if(!u) throw new AuthError('nouser');
    if(!u.pw) throw new AuthError('google');
    if(u.pw !== await hashPw(pw)) throw new AuthError('badpass');
    if(!u.verified){ this.issueCode(u.email, 'verify'); throw new AuthError('unverified', {email:u.email}); }
    return u;
  },
  google({name, email}){
    const e = email.trim().toLowerCase(), us = this.users();
    us[e] = us[e] ? {...us[e], verified:true, provider:us[e].provider === 'email' ? 'email+google' : 'google'} : {name, email:e, pw:null, verified:true, provider:'google', created:Date.now()};
    this.saveUsers(us); return us[e];
  },
  forgot(email){ const u = this.find(email); return u ? this.issueCode(u.email, 'reset') : null; },
  async reset(code, pw){ const e = this.checkCode(code, 'reset'), us = this.users(); us[e].pw = await hashPw(pw); us[e].verified = true; this.saveUsers(us); return us[e]; },
  async changePassword(email, cur, next){ const us = this.users(), u = us[email]; if(u.pw && u.pw !== await hashPw(cur)) throw new AuthError('badpass'); u.pw = await hashPw(next); this.saveUsers(us); },
  session(){ return DB.get('ltt.session'); },
  start(email){ DB.set('ltt.session', email); },
  end(){ DB.del('ltt.session'); },
};

/* Dữ liệu của một người dùng. */
const UserStore = {
  key: email => 'ltt.data.' + email,
  blank(user){
    return {
      profile:{name:user.name, email:user.email, org:'', goal:'presentation', speechLang:'vi'},
      onboarded:false, plan:'free', expiry:null, cycle:'m', autoRenew:true, payMethod:'MoMo', invoices:[],
      used:0, usedMonth:monthKey(), sessions:[], library:[], lessons:{}, placement:null,
    };
  },
  load(user){
    const d = DB.get(this.key(user.email)) || this.blank(user);
    if(d.usedMonth !== monthKey()){ d.used = 0; d.usedMonth = monthKey(); }
    if(d.plan === 'premium' && d.expiry && d.expiry < todayISO() && !d.autoRenew){ d.plan = 'free'; d.expiry = null; }
    return d;
  },
  save(email, data){ if(!DB.set(this.key(email), data)) toast(L('Bộ nhớ trình duyệt đã đầy. Một số thay đổi có thể không được lưu.', 'Browser storage is full. Some changes may not be saved.')); },
};
function todayISO(){ return new Date().toISOString().slice(0,10); }
function monthKey(){ return new Date().toISOString().slice(0,7); }
