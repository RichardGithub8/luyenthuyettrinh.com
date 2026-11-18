'use strict';
/* Cấu hình sản phẩm. Các giá trị đánh dấu CẦN XÁC NHẬN phải được product owner duyệt trước khi ra mắt. */
const CONFIG = {
  brand: 'luyenthuyettrinh.com',
  // CẦN XÁC NHẬN: thông tin liên hệ chính thức
  contact: {
    email: 'lienhe@luyenthuyettrinh.com',
    hotline: '1900 0000',
    address: {vi:'TP. Hồ Chí Minh, Việt Nam', en:'Ho Chi Minh City, Vietnam'},
    hours: {vi:'Thứ 2 – Thứ 6, 8:00 – 18:00', en:'Mon – Fri, 8:00 – 18:00'},
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
    tiktok: 'https://tiktok.com/',
  },
  // Bảng giá của chủ sản phẩm (2026-11-18). Phải khớp backend: luyenthuyettrinh-app/src/config/plans.ts.
  prices: {
    pass:    {once:59000},
    premium: {monthly:79000, semiannual:399000},
    team:    {monthly:299000, semiannual:1490000},
  },
  // Quyền lợi theo gói (giá trị thật lấy từ /api/me khi đã đăng nhập; đây là mặc định để hiển thị).
  plans: {
    free:    {limit:3,  period:'month', maxAnalyzeSec:300,  video:false, upload:false, live:false, allGoals:false, timeline:false, qa:false, history:false, compareMax:0},
    pass:    {limit:15, period:'pass',  maxAnalyzeSec:1200, video:true,  upload:true,  live:false, allGoals:true,  timeline:true,  qa:true,  history:false, compareMax:0},
    premium: {limit:90, period:'month', maxAnalyzeSec:1800, video:true,  upload:true,  live:true,  allGoals:true,  timeline:true,  qa:true,  history:true,  compareMax:6},
    team:    {limit:90, period:'month', maxAnalyzeSec:1800, video:true,  upload:true,  live:true,  allGoals:true,  timeline:true,  qa:true,  history:true,  compareMax:6},
  },
  freeGoals: ['presentation', 'reporting'],
  teamMaxMembers: 5,
  passDays: 7,
  maxRecordSec: 1800,          // giới hạn cứng mỗi bản ghi (30 phút)
  maxUploadMB: 200,
  uploadTypes: ['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/m4a','audio/webm','audio/ogg','video/mp4','video/webm','video/quicktime'],
  uploadExt: ['mp3','wav','m4a','mp4','webm','ogg','mov'],
  scriptExt: ['txt','md'],
  minScriptWords: 40,
  compareMin: 3,
  passScore: 60,               // điểm tối thiểu để hoàn thành một bài học
  codeTTL: 10*60*1000,         // mã xác thực có hiệu lực 10 phút
  resendAfter: 30*1000,
  aiTimeoutMs: 6000,           // bản thử: thời gian chờ trước khi báo quá hạn
  analyzeMinMs: 8500,          // màn "AI đang phân tích" hiện tối thiểu 8,5 giây (7–10 giây theo yêu cầu) để trình diễn đủ các bước
};
