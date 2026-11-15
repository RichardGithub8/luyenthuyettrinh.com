'use strict';
/* Dữ liệu mẫu cho bản thử nghiệm. Khi có backend, các hằng số này được thay bằng dữ liệu từ API. */

const MODES = {
  presentation:{name:'Thuyết trình', desc:'Bài thuyết trình trên lớp, hội thảo, seminar.', persona:'Cô Hạnh', role:'Giảng viên phản biện', focus:'cấu trúc, logic và cách dẫn dắt',
    img:'stage.jpg', alt:'Diễn giả đứng giữa sân khấu hội nghị', target:[3,7],
    prompt:'Trình bày trong 2 phút: Ứng dụng AI trong giáo dục.',
    questions:['Em có thể đưa một ví dụ thực tế cho luận điểm thứ hai không?','Nguồn số liệu em dùng là từ năm nào?','Nếu chỉ có 30 giây, em sẽ giữ lại ý nào?']},
  pitching:{name:'Gọi vốn', desc:'Giới thiệu sản phẩm, thuyết phục nhà đầu tư trong 3–5 phút.', persona:'Anh Minh', role:'Nhà đầu tư thiên thần', focus:'sức thuyết phục, con số và lời kêu gọi',
    img:'pitch.jpg', alt:'Người thuyết trình chỉ vào màn hình trước nhóm khán giả', target:[3,5],
    prompt:'Gọi vốn trong 2 phút cho ứng dụng đặt sân cầu lông dành cho sinh viên.',
    questions:['Mô hình doanh thu là gì, và bao lâu thì hòa vốn?','Đối thủ lớn nhất là ai? Vì sao khách hàng chọn bạn?','Bạn cần bao nhiêu vốn và sẽ dùng vào việc gì?']},
  reporting:{name:'Báo cáo', desc:'Báo cáo tiến độ, kết quả dự án, họp định kỳ.', persona:'Chị Thảo', role:'Trưởng phòng vận hành', focus:'rõ ràng, súc tích, số liệu chính xác',
    img:'report.jpg', alt:'Nhân viên trình bày trên bảng trong phòng họp', target:[2,5],
    prompt:'Báo cáo tiến độ dự án nhóm trong tuần này, trong 2 phút.',
    questions:['Chỉ số nào chưa đạt mục tiêu, nguyên nhân là gì?','Rủi ro lớn nhất cho tháng tới là gì?','Bạn cần hỗ trợ gì từ các phòng ban khác?']},
  debating:{name:'Tranh biện', desc:'Lập luận, phản biện, bảo vệ quan điểm.', persona:'Bạn Quân', role:'Đội phản đề', focus:'lập luận chặt, phản bác nhanh',
    img:'mic.jpg', alt:'Micro trên sân khấu trước khán giả', target:[2,4],
    prompt:'Phản biện trong 2 phút: Có nên cấm điện thoại trong lớp học?',
    questions:['Số liệu bạn đưa ra lấy từ nguồn nào?','Nếu lập luận của bạn đúng, sao các trường khác chưa áp dụng?','Bạn trả lời thế nào về chi phí của giải pháp này?']},
};
const PURPOSES = ['Thuyết trình trên lớp','Gọi vốn','Thuyết trình học thuật','Báo cáo công việc','Phỏng vấn xin việc','Thi tranh biện'];
const LANGS = {vi:'Tiếng Việt', en:'Tiếng Anh'};
const INPUTS = {audio:'Ghi âm', video:'Quay video', upload:'Tải file', script:'Kịch bản'};
const CRIT = {content:'Nội dung', structure:'Cấu trúc & logic', relevance:'Bám sát chủ đề', pace:'Tốc độ nói', fluency:'Độ trôi chảy', filler:'Từ đệm', body:'Ngôn ngữ cơ thể'};
const SCRIPT_CRIT = {content:'Nội dung', structure:'Cấu trúc & logic', relevance:'Bám sát chủ đề', length:'Độ dài', opening:'Mở bài', closing:'Kết bài', wording:'Diễn đạt'};
const PLANS = {
  free:{name:'Miễn phí', limit:3, maxMin:5, video:false, live:false},
  premium:{name:'Premium', limit:50, maxMin:30, video:true, live:true},
};
const PRICE = {m:149000, y:1290000};

function mkSession(id, title, mode, date, dur, c, fillers, input='audio', lang='vi'){
  const vals = Object.values(c).filter(v => v != null);
  return {id, title, mode, date, dur, c, fillers, input, lang, score:Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)};
}
/* Lịch sử của tài khoản dùng thử (đăng nhập bằng "Tài khoản dùng thử"). */
function demoSessions(){
  return [
    mk('s1','Giới thiệu bản thân (bài test đầu vào)','presentation','2026-09-07',64,{content:60,structure:52,relevance:70,pace:58,fluency:55,filler:40,body:null},21),
    mk('s2','Thuyết trình môn Marketing căn bản','presentation','2026-09-14',312,{content:64,structure:58,relevance:74,pace:60,fluency:59,filler:46,body:null},18),
    mk('s3','Gọi vốn: ứng dụng đặt sân cầu lông','pitching','2026-09-21',198,{content:68,structure:61,relevance:72,pace:63,fluency:62,filler:50,body:55},16,'video'),
    mk('s4','Báo cáo tiến độ dự án nhóm','reporting','2026-09-28',245,{content:70,structure:66,relevance:80,pace:62,fluency:64,filler:55,body:null},15),
    mk('s5','Tranh biện: Có nên cấm điện thoại trong lớp?','debating','2026-10-05',180,{content:72,structure:68,relevance:76,pace:66,fluency:68,filler:60,body:60},12,'video'),
    mk('s6','Gọi vốn: ứng dụng đặt sân cầu lông (lần 2)','pitching','2026-10-12',205,{content:76,structure:72,relevance:82,pace:68,fluency:71,filler:64,body:63},10,'video'),
    mk('s7','Thuyết trình: Ứng dụng AI trong giáo dục','presentation','2026-10-20',287,{content:78,structure:74,relevance:85,pace:66,fluency:72,filler:66,body:64},9,'video'),
    mk('s8','Gọi vốn bằng tiếng Anh: bãi đỗ xe thông minh','pitching','2026-10-29',176,{content:80,structure:78,relevance:86,pace:72,fluency:74,filler:72,body:70},7,'video','en'),
  ];
  function mk(...a){ const s = mkSession(...a); if(s.id==='s1') s.placement = true; return s; }
}

/* Báo cáo chi tiết mẫu cho bài nói (âm thanh / video). */
const SAMPLE_REPORT = {
  dur:270,
  segments:[
    {t:'00:00',p:[['n','Xin chào thầy cô và các bạn. '],['f','Ừm'],['n',', hôm nay nhóm em sẽ '],['f','à'],['n',' trình bày về ứng dụng AI trong giáo dục.']],issue:2},
    {t:'00:14',p:[['n','Thì '],['f','kiểu như'],['n',' là AI bây giờ đang có mặt ở khắp nơi, '],['f','ừm'],['n',' và giáo dục cũng không ngoại lệ.']],issue:1},
    {t:'00:31',p:[['n','Theo một khảo sát năm 2025, 68% sinh viên đã dùng công cụ AI để học ít nhất một lần mỗi tuần.']]},
    {t:'00:52',p:[['n','Phần thứ nhất em nói về lợi ích: cá nhân hóa lộ trình, phản hồi ngay lập tức, và giảm tải cho giảng viên. Cái này rất quan trọng vì nó giúp mọi người học nhanh hơn rất nhiều và tiết kiệm thời gian cho tất cả mọi người.']],issue:3},
    {t:'01:40',p:[['n','Ngoài ra thì em cũng từng dùng AI để viết tiểu luận môn Triết, '],['f','à'],['n',' hồi đó em được 8 điểm, thầy còn khen nữa.']],issue:5},
    {t:'02:05',p:[['n','Phần thứ hai là rủi ro: gian lận học thuật, phụ thuộc vào công cụ, và dữ liệu cá nhân của học sinh.']]},
    {t:'02:48',p:[['n','Nhóm em đề xuất ba nguyên tắc: minh bạch khi dùng AI, đánh giá bằng quá trình, và đào tạo kỹ năng kiểm chứng thông tin.']]},
    {t:'04:12',p:[['n','Vâng, '],['f','ừm'],['n',', phần trình bày của nhóm em đến đây là hết ạ. Em cảm ơn.']],issue:4},
  ],
  weak:[
    {title:'Dùng nhiều từ đệm ở phần mở đầu', detail:'9 trong 14 từ đệm (“ừm”, “à”, “kiểu như”) nằm ở 40 giây đầu, lúc người nghe đang hình thành ấn tượng.', seg:1, fix:'Học thuộc 2 câu mở đầu. Khi cần suy nghĩ, dừng im lặng 1 giây thay vì nói “ừm”.'},
    {title:'Mở bài thiếu câu thu hút', detail:'Bài bắt đầu bằng lời chào và tên chủ đề, chưa cho người nghe lý do để chú ý.', seg:0, fix:'Mở bằng con số 68% hoặc một câu hỏi: “Tuần này có bao nhiêu bạn đã hỏi AI một bài tập?”'},
    {title:'Tốc độ tăng mạnh ở phút thứ 2', detail:'Tốc độ lên 176 từ/phút ở phần lợi ích, cao hơn ngưỡng dễ nghe (120–150 từ/phút).', seg:3, fix:'Đánh dấu điểm dừng sau mỗi lợi ích. Nói chậm lại khi liệt kê.'},
    {title:'Kết bài chưa có thông điệp chốt', detail:'Bài kết thúc bằng “đến đây là hết”, người nghe không nhớ được đề xuất chính.', seg:7, fix:'Nhắc lại 3 nguyên tắc trong một câu, rồi mới cảm ơn.'},
    {title:'Một đoạn đi lệch khỏi chủ đề', detail:'Câu chuyện điểm tiểu luận kéo dài 25 giây và làm yếu luận điểm về gian lận học thuật.', seg:4, fix:'Bỏ đoạn này, hoặc chuyển nó thành ví dụ cho phần rủi ro.'},
  ],
  pace:[128,142,176,158,134,121],
  body:[
    {k:'Ánh mắt', v:'38%', s:'bad', note:'Nhìn xuống ghi chú 62% thời gian, nhất là phút 1–2.'},
    {k:'Cử chỉ tay', v:'Ổn', s:'good', note:'Dùng tay đếm 3 lợi ích, rõ ràng và tự nhiên.'},
    {k:'Biểu cảm', v:'Ít', s:'warn', note:'Gương mặt ít thay đổi khi nói về rủi ro.'},
    {k:'Tư thế', v:'Lệch', s:'warn', note:'Dồn trọng tâm sang chân trái, đung đưa nhẹ ở phút 3.'},
  ],
  marks:[
    {t:'00:05',type:'filler',seg:0,label:'2 từ đệm ở câu mở đầu'},
    {t:'00:14',type:'filler',seg:1,label:'“kiểu như”, “ừm” liên tiếp'},
    {t:'00:31',type:'good',seg:2,label:'Dẫn số liệu 68% rõ ràng'},
    {t:'00:52',type:'pace',seg:3,label:'Tốc độ lên 176 từ/phút'},
    {t:'01:10',type:'eye',seg:3,label:'Nhìn xuống ghi chú 22 giây'},
    {t:'01:40',type:'off',seg:4,label:'Lệch chủ đề 25 giây'},
    {t:'02:48',type:'good',seg:6,label:'Đề xuất 3 nguyên tắc, ngắt nghỉ tốt'},
    {t:'04:12',type:'filler',seg:7,label:'Kết bài bằng “ừm… đến đây là hết”'},
  ],
  rewrites:[
    {old:'Thì kiểu như là AI bây giờ đang có mặt ở khắp nơi, ừm và giáo dục cũng không ngoại lệ.', neu:'AI đã có mặt trong lớp học của chúng ta, dù ta có chuẩn bị hay chưa.'},
    {old:'Cái này rất quan trọng vì nó giúp mọi người học nhanh hơn rất nhiều và tiết kiệm thời gian cho tất cả mọi người.', neu:'Ba lợi ích này giúp người học tiến nhanh hơn và trả lại thời gian cho giảng viên.'},
    {old:'Vâng, ừm, phần trình bày của nhóm em đến đây là hết ạ.', neu:'Minh bạch, đánh giá quá trình, kiểm chứng thông tin: đó là ba điều nhóm em mong nhà trường bắt đầu từ học kỳ này. Em cảm ơn.'},
  ],
};
const MARK = {filler:['Từ đệm','bad'], pace:['Tốc độ','warn'], eye:['Ánh mắt','sky'], off:['Lệch chủ đề','pro'], good:['Điểm tốt','good']};

const SAMPLE_SCRIPT = `Mỗi tuần, một sinh viên mất trung bình 40 phút chỉ để gọi điện tìm sân cầu lông còn trống. Đó là vấn đề nhóm chúng em muốn giải quyết.

Ứng dụng SânNhanh cho phép đặt sân trong 3 phút. Bạn chọn khung giờ, xem sân trống gần trường và thanh toán ngay trên điện thoại. Chủ sân nhận lịch tự động và không còn phải ghi sổ.

Thì hiện tại nhóm em đã làm việc với 12 sân quanh khu Thủ Đức và có 850 sinh viên dùng thử trong tháng đầu, và tỉ lệ quay lại đặt sân lần hai là 46% cho thấy nhu cầu là có thật và rất là lớn.

Chúng em thu phí 8% trên mỗi lượt đặt. Với 50 sân, doanh thu dự kiến đạt 120 triệu đồng mỗi tháng.

Nhóm em cần 1,5 tỷ đồng để mở rộng ra 50 sân trong 12 tháng tới. Em cảm ơn.`;

const PLAN4 = [
  {w:'Tuần 1', t:'Mở bài 30 giây', items:[['w1a','Viết 3 câu mở: câu hỏi, con số, câu chuyện'],['w1b','Ghi âm mỗi câu mở 2 lần'],['w1c','Giữ từ đệm dưới 2 lần trong 30 giây đầu']]},
  {w:'Tuần 2', t:'Nhịp nói', items:[['w2a','Luyện 1 bài 3 phút ở 130 từ/phút'],['w2b','Đánh dấu điểm dừng sau mỗi ý chính'],['w2c','Không đoạn nào vượt 150 từ/phút']]},
  {w:'Tuần 3', t:'Ánh mắt và cử chỉ', items:[['w3a','Quay video 1 bài, ánh mắt trên 60%'],['w3b','Dùng tay đếm ý khi liệt kê'],['w3c','Đứng yên, không đung đưa ở phút 3']]},
  {w:'Tuần 4', t:'Hỏi đáp', items:[['w4a','Trả lời 3 câu phản biện của khán giả AI'],['w4b','Mỗi câu trả lời có 1 con số'],['w4c','Bài tổng kết đạt từ 80 điểm']]},
];
const LIVE_TIPS = [
  [6,'Mở bài tốt. Thử nhìn thẳng vào camera ở câu tiếp theo.'],
  [12,'Bạn vừa nói “ừm” 2 lần liên tiếp. Dừng im lặng 1 giây sẽ tốt hơn.'],
  [20,'Q'],
  [28,'Tốc độ đang lên 168 từ/phút. Chậm lại một chút.'],
  [38,'Ngắt nghỉ sau ý chính rất tốt, giữ nhịp này.'],
  [48,'Q'],
  [58,'Sắp hết thời gian dự kiến. Chuẩn bị kết bài.'],
];
const AN_STEPS = {
  speech:['Tải bài nói lên máy chủ','Chuyển giọng nói thành văn bản','Phân tích nội dung và cấu trúc','Đo tốc độ nói và ngắt nghỉ','Phát hiện từ đệm và độ trôi chảy','Phân tích ngôn ngữ cơ thể','Viết báo cáo và gợi ý'],
  script:['Đọc kịch bản','Tách đoạn và câu','Phân tích nội dung và cấu trúc','Kiểm tra mở bài và kết bài','Ước lượng thời lượng khi nói','Viết báo cáo và gợi ý'],
};
