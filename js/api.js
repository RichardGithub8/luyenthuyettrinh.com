'use strict';
/* Cầu nối tới backend (cùng origin với trang này, nên cookie phiên tự gửi kèm, không cần CORS).
   Thành công: backend trả { data }. Lỗi: { error: { code, message, details } } → ném ApiError. */
class ApiError extends Error {
  constructor(status, code, message, details){ super(message || code); this.status = status; this.code = code; this.details = details; }
}
async function api(path, {method = 'GET', body, query} = {}){
  const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')).toString() : '';
  let res;
  try {
    res = await fetch('/api' + path + qs, {
      method, credentials:'same-origin',
      headers:{'Accept':'application/json', 'x-ui-language':I18N.ui, ...(body !== undefined ? {'Content-Type':'application/json'} : {})},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch(e){ throw new ApiError(0, 'NETWORK', L('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.', 'Couldn’t reach the server. Check your connection and try again.')); }
  let json = null; try { json = await res.json(); } catch(e){}
  if(!res.ok){ const er = (json && json.error) || {}; throw new ApiError(res.status, er.code || 'UNKNOWN', er.message, er.details); }
  return json ? json.data : null;
}
