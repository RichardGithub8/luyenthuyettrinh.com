'use strict';
/* Lưu trữ phía trình duyệt. Tài khoản, hồ sơ, gói và lượt dùng đã chuyển sang backend (xem Auth, UserStore.sync).
   - localStorage: dữ liệu luyện tập tạm thời của từng người dùng (sẽ chuyển dần lên máy chủ).
   - IndexedDB: tệp ghi âm/video để nghe lại và tải về sau khi tải lại trang. */
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


class AuthError extends Error { constructor(code, extra={}){ super(code); this.code = code; Object.assign(this, extra); } }

/* Xác thực qua backend (Supabase Auth, phiên lưu trong cookie httpOnly).
   Xác thực email và đặt lại mật khẩu dùng LINK gửi qua email; link mở lại trang này đã đăng nhập sẵn. */
const AUTH_CODES = {EMAIL_TAKEN:'exists', INVALID_CREDENTIALS:'badcred', EMAIL_NOT_CONFIRMED:'unverified', WEAK_PASSWORD:'weak', SAME_PASSWORD:'same', RATE_LIMITED:'wait', LINK_EXPIRED:'expired', NETWORK:'network', VALIDATION_ERROR:'invalid'};
const asAuthError = e => e instanceof ApiError ? new AuthError(AUTH_CODES[e.code] || 'unknown', {status:e.status}) : e;
const Auth = {
  /* Email đang chờ xác thực, giữ lại để màn hình "kiểm tra email" còn đó sau khi tải lại trang. */
  pending(){ return DB.get('ltt.pendingEmail'); },
  setPending(email){ email ? DB.set('ltt.pendingEmail', email) : DB.del('ltt.pendingEmail'); },
  async register({name, email, password, ui, goal, lang}){
    try { await api('/auth/register', {method:'POST', body:{fullName:name, email, password, uiLanguage:ui, defaultGoal:goal, speakingLanguage:lang}}); }
    catch(e){ throw asAuthError(e); }
    this.setPending(email.trim().toLowerCase());
  },
  async resend(email){ try { await api('/auth/resend-verification', {method:'POST', body:{email}}); } catch(e){ throw asAuthError(e); } },
  async login(email, password){
    try { const r = await api('/auth/login', {method:'POST', body:{email, password}}); this.setPending(null); return r.me; }
    catch(e){ throw asAuthError(e); }
  },
  async me(){ try { return await api('/me'); } catch(e){ if(e instanceof ApiError && e.status === 401) return null; throw e; } },
  async logout(){ try { await api('/auth/logout', {method:'POST'}); } catch(e){} },
  async forgot(email){ try { await api('/auth/forgot-password', {method:'POST', body:{email}}); } catch(e){ throw asAuthError(e); } },
  async reset(password){ try { await api('/auth/reset-password', {method:'POST', body:{password}}); } catch(e){ throw asAuthError(e); } },
  async changePassword(current, next){ try { await api('/auth/change-password', {method:'POST', body:{currentPassword:current, newPassword:next}}); } catch(e){ throw asAuthError(e); } },
  google(){ location.href = '/api/auth/oauth/google?next=' + encodeURIComponent('/'); },
};

/* Dữ liệu của một người dùng.
   Máy chủ giữ: hồ sơ, mục tiêu, ngôn ngữ, onboarding, gói và lượt dùng (lấy từ /api/me).
   Trình duyệt vẫn giữ tạm: buổi luyện, thư viện, tiến độ bài học, hóa đơn (chuyển dần lên máy chủ ở các phần sau). */
const UserStore = {
  key: email => 'ltt.data.' + email,
  fromMe(me){
    const local = DB.get(this.key(me.email)) || {lessons:{}, placement:null, invoices:[], cycle:'m', autoRenew:true, payMethod:'MoMo'};
    const d = {...local, sessions:[], library:[],
      profile:{...(local.profile || {}), name:me.fullName, email:me.email, org:me.organization || '', goal:me.defaultGoal || 'presentation', speechLang:me.speakingLanguage || 'vi', ui:me.uiLanguage || I18N.ui},
      onboarded:me.onboarded, plan:me.plan, expiry:me.premiumExpiresAt ? me.premiumExpiresAt.slice(0,10) : null, used:me.usage.used, limit:me.usage.limit, usageScope:me.usage.scope, usedMonth:monthKey(),
    };
    // Bản chụp phần máy chủ đang giữ, để chỉ gửi lên khi người dùng thật sự đổi.
    Object.defineProperty(d, '_srv', {value:this.serverView(d), writable:true, enumerable:false});
    return d;
  },
  serverView: d => ({name:d.profile.name, org:d.profile.org || '', goal:d.profile.goal, speechLang:d.profile.speechLang, ui:d.profile.ui, onboarded:!!d.onboarded}),
  save(email, data){
    const {sessions, library, ...keep} = data;   // buổi luyện và thư viện nằm trên máy chủ, không lưu cục bộ
    if(!DB.set(this.key(email), keep)) toast(L('Bộ nhớ trình duyệt đã đầy. Một số thay đổi có thể không được lưu.', 'Browser storage is full. Some changes may not be saved.'));
    this.sync(data);
  },
  /* Đẩy các thay đổi hồ sơ lên máy chủ (gọi sau mỗi lần save). Lỗi chỉ báo, không làm mất thao tác của người dùng. */
  async sync(d){
    const now = this.serverView(d), was = d._srv; if(!was) return;
    const diff = k => now[k] !== was[k];
    const jobs = [];
    if(diff('name') || diff('org')) jobs.push(api('/me', {method:'PATCH', body:{fullName:now.name, organization:now.org || null}}));
    if(now.onboarded && !was.onboarded) jobs.push(api('/me/onboarding', {method:'POST', body:{defaultGoal:now.goal, speakingLanguage:now.speechLang, uiLanguage:now.ui}}));
    else if(diff('goal') || diff('speechLang') || diff('ui')) jobs.push(api('/me/preferences', {method:'PATCH', body:{defaultGoal:now.goal, speakingLanguage:now.speechLang, uiLanguage:now.ui}}));
    if(!jobs.length) return;
    d._srv = now;
    try { await Promise.all(jobs); }
    catch(e){ d._srv = was; toast(e instanceof ApiError && e.status === 401 ? L('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.', 'Your session expired. Please log in again.') : L('Chưa lưu được lên máy chủ. Thay đổi sẽ được thử lại ở lần lưu sau.', 'Couldn’t save to the server. We’ll retry on the next save.'), 'err'); }
  },
};
function todayISO(){ return new Date().toISOString().slice(0,10); }
function monthKey(){ return new Date().toISOString().slice(0,7); }
