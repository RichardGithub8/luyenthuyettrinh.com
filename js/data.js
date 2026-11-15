'use strict';
/* Nội dung sản phẩm: loại hình (mục tiêu), đề bài, nhân vật AI, khóa học, bản chép lời mẫu.
   Khi có backend/CMS, các hằng số này được thay bằng dữ liệu từ API. */

const CRIT = {
  content:{vi:'Nội dung', en:'Content'}, structure:{vi:'Cấu trúc & logic', en:'Structure & logic'}, relevance:{vi:'Bám sát chủ đề', en:'On topic'},
  pace:{vi:'Tốc độ nói', en:'Pace'}, fluency:{vi:'Độ trôi chảy', en:'Fluency'}, filler:{vi:'Từ đệm', en:'Filler words'}, body:{vi:'Ngôn ngữ cơ thể', en:'Body language'},
};
const SCRIPT_CRIT = {
  content:{vi:'Nội dung', en:'Content'}, structure:{vi:'Cấu trúc & logic', en:'Structure & logic'}, relevance:{vi:'Bám sát chủ đề', en:'On topic'},
  length:{vi:'Độ dài', en:'Length'}, opening:{vi:'Mở bài', en:'Opening'}, closing:{vi:'Kết bài', en:'Closing'}, wording:{vi:'Diễn đạt', en:'Wording'},
};
const KIND = {audio:{vi:'Ghi âm', en:'Audio'}, video:{vi:'Video', en:'Video'}, script:{vi:'Kịch bản', en:'Script'}};
const SKILL = {
  structure:{vi:'Cấu trúc', en:'Structure', crit:'structure'}, opening:{vi:'Mở bài', en:'Opening', crit:'structure'}, closing:{vi:'Kết bài', en:'Closing', crit:'relevance'},
  pace:{vi:'Nhịp nói', en:'Pace', crit:'pace'}, filler:{vi:'Từ đệm', en:'Filler words', crit:'filler'}, body:{vi:'Ngôn ngữ cơ thể', en:'Body language', crit:'body'},
  content:{vi:'Nội dung', en:'Content', crit:'content'}, qa:{vi:'Hỏi đáp', en:'Q&A', crit:'fluency'},
};

const GOALS = {
  presentation:{
    name:{vi:'Thuyết trình', en:'Presentation'}, desc:{vi:'Thuyết trình trên lớp, hội thảo, bảo vệ đồ án.', en:'Class presentations, seminars, thesis defence.'},
    persona:'Cô Hạnh', role:{vi:'Giảng viên phản biện', en:'Critical lecturer'}, focus:{vi:'cấu trúc, logic và cách dẫn dắt', en:'structure, logic and flow'},
    img:'stage.jpg', alt:{vi:'Diễn giả đứng giữa sân khấu hội nghị', en:'A speaker on a conference stage'}, color:'blue', target:[3,7],
    prompts:[
      {vi:'Ứng dụng AI trong giáo dục: lợi ích và rủi ro', en:'AI in education: benefits and risks'},
      {vi:'Giới thiệu môn học bạn thích nhất trong 2 phút', en:'Introduce your favourite subject in 2 minutes'},
      {vi:'Bảo vệ đề tài đồ án tốt nghiệp của bạn', en:'Defend your graduation project topic'},
      {vi:'Thói quen đọc sách của người trẻ hiện nay', en:'Reading habits of young people today'},
    ],
    questions:[{vi:'Em có thể đưa một ví dụ thực tế cho luận điểm thứ hai không?', en:'Can you give a real example for your second point?'},{vi:'Nguồn số liệu em dùng là từ năm nào?', en:'Which year is your data from?'},{vi:'Nếu chỉ có 30 giây, em sẽ giữ lại ý nào?', en:'If you only had 30 seconds, which point would you keep?'}],
  },
  reporting:{
    name:{vi:'Báo cáo', en:'Reporting'}, desc:{vi:'Báo cáo tiến độ, kết quả dự án, họp định kỳ.', en:'Progress updates, project results, team meetings.'},
    persona:'Chị Thảo', role:{vi:'Trưởng phòng vận hành', en:'Operations manager'}, focus:{vi:'rõ ràng, súc tích, số liệu chính xác', en:'clarity, brevity, accurate numbers'},
    img:'report.jpg', alt:{vi:'Nhân viên trình bày trên bảng trong phòng họp', en:'An employee presenting at a whiteboard in a meeting'}, color:'green', target:[2,5],
    prompts:[
      {vi:'Báo cáo tiến độ dự án nhóm trong tuần này', en:'Report this week’s team project progress'},
      {vi:'Báo cáo kết quả kinh doanh tháng trước', en:'Report last month’s sales results'},
      {vi:'Giải thích vì sao một hạng mục bị chậm và đề xuất xử lý', en:'Explain why a task is late and propose a fix'},
      {vi:'Tổng kết một sự kiện bạn vừa tổ chức', en:'Summarise an event you just organised'},
    ],
    questions:[{vi:'Chỉ số nào chưa đạt mục tiêu, nguyên nhân là gì?', en:'Which metric missed its target, and why?'},{vi:'Rủi ro lớn nhất cho tháng tới là gì?', en:'What is the biggest risk for next month?'},{vi:'Bạn cần hỗ trợ gì từ các phòng ban khác?', en:'What support do you need from other teams?'}],
  },
  interview:{
    name:{vi:'Phỏng vấn', en:'Interview'}, desc:{vi:'Phỏng vấn xin việc, học bổng, câu lạc bộ.', en:'Job, scholarship and club interviews.'},
    persona:'Anh Khoa', role:{vi:'Chuyên viên tuyển dụng', en:'Recruiter'}, focus:{vi:'sự tự tin, ví dụ cụ thể và độ phù hợp', en:'confidence, concrete examples and fit'},
    img:'interview.jpg', alt:{vi:'Ứng viên và nhà tuyển dụng trao đổi bên bàn', en:'A candidate and recruiter talking at a desk'}, color:'orange', target:[1,3],
    prompts:[
      {vi:'Hãy giới thiệu về bản thân bạn', en:'Tell me about yourself'},
      {vi:'Kể về một lần bạn giải quyết mâu thuẫn trong nhóm', en:'Tell me about a time you resolved a team conflict'},
      {vi:'Điểm yếu lớn nhất của bạn là gì?', en:'What is your biggest weakness?'},
      {vi:'Vì sao chúng tôi nên chọn bạn?', en:'Why should we hire you?'},
    ],
    questions:[{vi:'Kết quả cụ thể của dự án đó là gì?', en:'What was the concrete result of that project?'},{vi:'Bạn sẽ làm gì trong 30 ngày đầu tiên?', en:'What would you do in your first 30 days?'},{vi:'Mức lương mong muốn của bạn là bao nhiêu?', en:'What salary are you expecting?'}],
  },
  pitching:{
    name:{vi:'Gọi vốn', en:'Pitching'}, desc:{vi:'Giới thiệu sản phẩm, thuyết phục nhà đầu tư trong 3–5 phút.', en:'Pitch a product and convince investors in 3–5 minutes.'},
    persona:'Anh Minh', role:{vi:'Nhà đầu tư thiên thần', en:'Angel investor'}, focus:{vi:'sức thuyết phục, con số và lời kêu gọi', en:'persuasion, numbers and the ask'},
    img:'pitch.jpg', alt:{vi:'Người thuyết trình chỉ vào màn hình trước nhóm khán giả', en:'A presenter pointing at a screen in front of a group'}, color:'purple', target:[3,5],
    prompts:[
      {vi:'Gọi vốn cho ứng dụng đặt sân thể thao dành cho sinh viên', en:'Pitch a sports court booking app for students'},
      {vi:'Thuyết phục nhà đầu tư trong 60 giây (elevator pitch)', en:'Convince an investor in 60 seconds (elevator pitch)'},
      {vi:'Giới thiệu sản phẩm mới cho khách hàng doanh nghiệp', en:'Introduce a new product to business customers'},
      {vi:'Trình bày kế hoạch mở rộng thị trường', en:'Present a market expansion plan'},
    ],
    questions:[{vi:'Mô hình doanh thu là gì, và bao lâu thì hòa vốn?', en:'What is your revenue model, and when do you break even?'},{vi:'Đối thủ lớn nhất là ai? Vì sao khách hàng chọn bạn?', en:'Who is your main competitor? Why would customers choose you?'},{vi:'Bạn cần bao nhiêu vốn và sẽ dùng vào việc gì?', en:'How much are you raising, and what will you use it for?'}],
  },
  debating:{
    name:{vi:'Tranh biện', en:'Debating'}, desc:{vi:'Lập luận, phản biện, bảo vệ quan điểm.', en:'Argue, rebut and defend a position.'},
    persona:'Bạn Quân', role:{vi:'Đội phản đề', en:'Opposition team'}, focus:{vi:'lập luận chặt, phản bác nhanh', en:'tight arguments, quick rebuttals'},
    img:'mic.jpg', alt:{vi:'Micro trên sân khấu trước khán giả', en:'A microphone on stage in front of an audience'}, color:'pink', target:[2,4],
    prompts:[
      {vi:'Có nên cấm điện thoại trong lớp học?', en:'Should phones be banned in classrooms?'},
      {vi:'Học đại học có còn cần thiết trong thời đại AI?', en:'Is university still necessary in the age of AI?'},
      {vi:'Mạng xã hội gây hại nhiều hơn lợi cho người trẻ', en:'Social media does more harm than good to young people'},
      {vi:'Nên miễn học phí cho toàn bộ sinh viên', en:'University tuition should be free for all students'},
    ],
    questions:[{vi:'Số liệu bạn đưa ra lấy từ nguồn nào?', en:'Where does your data come from?'},{vi:'Nếu lập luận của bạn đúng, sao các nơi khác chưa áp dụng?', en:'If you are right, why hasn’t everyone done it already?'},{vi:'Bạn trả lời thế nào về chi phí của giải pháp này?', en:'How do you answer the cost of your solution?'}],
  },
};
const GOAL_KEYS = Object.keys(GOALS);

/* Khóa học: mỗi loại hình một lộ trình 4 bài. skill dùng để cá nhân hóa thứ tự bài. */
const L3 = (a,b,c,d,e,f) => [{vi:a,en:b},{vi:c,en:d},{vi:e,en:f}];
const COURSES = {
  presentation:[
    {id:'pr1', skill:'structure', mins:10, kind:'script', target:60, title:{vi:'Cấu trúc 3 phần: mở, thân, kết', en:'The three-part structure'},
     theory:L3('Mở bài nêu vấn đề và lý do người nghe nên quan tâm.','The opening states the problem and why the audience should care.','Thân bài có tối đa 3 ý chính, mỗi ý kèm một ví dụ.','The body has at most 3 key points, each with an example.','Kết bài nhắc lại thông điệp và một việc người nghe nên làm.','The closing repeats the message and one thing the audience should do.'),
     tip:{vi:'Viết một câu tóm tắt cả bài trước khi viết chi tiết.', en:'Write one sentence that sums up the whole talk before writing the details.'},
     task:{vi:'Viết kịch bản 1 phút giới thiệu môn học bạn thích nhất, đủ 3 phần.', en:'Write a 1-minute script introducing your favourite subject, with all 3 parts.'}},
    {id:'pr2', skill:'opening', mins:12, kind:'audio', target:45, title:{vi:'Mở bài 30 giây gây chú ý', en:'A 30-second opening that hooks'},
     theory:L3('Ba cách mở hiệu quả: một câu hỏi, một con số, một câu chuyện ngắn.','Three openings that work: a question, a number, a short story.','Tránh mở bằng “Hôm nay em xin trình bày về…”.','Avoid opening with “Today I’m going to talk about…”.','Nói câu mở chậm hơn bình thường và nhìn thẳng khán giả.','Say your first line slower than usual and look at the audience.'),
     tip:{vi:'Học thuộc 2 câu đầu tiên. Phần còn lại có thể linh hoạt.', en:'Memorise your first two sentences. The rest can be flexible.'},
     task:{vi:'Ghi âm 3 câu mở khác nhau cho chủ đề “Ứng dụng AI trong giáo dục”.', en:'Record 3 different openings for “AI in education”.'}},
    {id:'pr3', skill:'pace', mins:12, kind:'audio', target:120, title:{vi:'Nhịp nói và ngắt nghỉ', en:'Pace and pauses'},
     theory:L3('Tốc độ dễ nghe là 120–150 từ mỗi phút.','An easy-to-follow pace is 120–150 words per minute.','Dừng 1 giây sau mỗi ý chính để người nghe kịp ghi nhớ.','Pause for one second after each key point.','Chậm lại khi đọc số liệu hoặc tên riêng.','Slow down for numbers and names.'),
     tip:{vi:'Đánh dấu “/” vào kịch bản ở những chỗ cần dừng.', en:'Mark “/” in your script wherever you want to pause.'},
     task:{vi:'Trình bày 2 phút về một số liệu khiến bạn bất ngờ, dừng sau mỗi ý.', en:'Talk for 2 minutes about a statistic that surprised you, pausing after each point.'}},
    {id:'pr4', skill:'body', mins:15, kind:'video', target:90, title:{vi:'Ánh mắt và cử chỉ', en:'Eye contact and gestures'},
     theory:L3('Chia khán giả thành 3 vùng và lần lượt nhìn từng vùng.','Split the audience into 3 zones and look at each in turn.','Dùng tay đếm ý khi liệt kê.','Use your fingers to count points when listing.','Đứng vững, hai chân rộng bằng vai, không đung đưa.','Stand steady, feet shoulder-width apart, no swaying.'),
     tip:{vi:'Quay video và xem lại không có tiếng để thấy rõ cử chỉ.', en:'Record yourself and watch it on mute to see your gestures clearly.'},
     task:{vi:'Quay video 90 giây trình bày 3 lợi ích của việc đọc sách.', en:'Record a 90-second video on 3 benefits of reading.'}},
  ],
  reporting:[
    {id:'re1', skill:'structure', mins:10, kind:'script', target:90, title:{vi:'Khung Kết quả, Vấn đề, Đề xuất', en:'Results, Issues, Proposal'},
     theory:L3('Bắt đầu bằng kết quả chính trong một câu.','Start with the main result in one sentence.','Nêu vấn đề kèm nguyên nhân, không đổ lỗi.','State issues with causes, without blaming.','Kết bằng đề xuất cụ thể và việc cần người nghe quyết định.','End with a concrete proposal and what you need decided.'),
     tip:{vi:'Người nghe bận rộn: điều quan trọng nhất nói trước.', en:'Busy listeners: say the most important thing first.'},
     task:{vi:'Viết kịch bản báo cáo tiến độ 90 giây theo khung 3 phần.', en:'Write a 90-second progress report script using the 3-part frame.'}},
    {id:'re2', skill:'content', mins:12, kind:'audio', target:90, title:{vi:'Trình bày số liệu dễ hiểu', en:'Presenting numbers clearly'},
     theory:L3('Mỗi câu chỉ nên có một con số.','Use only one number per sentence.','Làm tròn số và so sánh với mục tiêu hoặc kỳ trước.','Round numbers and compare them with the target or last period.','Nói ý nghĩa của con số, không chỉ đọc con số.','Explain what the number means, not just the number.'),
     tip:{vi:'“Đạt 70% kế hoạch” dễ nhớ hơn “7 trên 10 hạng mục”.', en:'“70% of plan” is easier to remember than “7 of 10 items”.'},
     task:{vi:'Báo cáo kết quả kinh doanh tháng trước với 3 con số chính.', en:'Report last month’s sales results with 3 key numbers.'}},
    {id:'re3', skill:'filler', mins:10, kind:'audio', target:60, title:{vi:'Bỏ từ đệm khi báo cáo', en:'Cutting filler words'},
     theory:L3('Từ đệm như “ừm”, “à”, “kiểu như” làm bạn kém chắc chắn.','Fillers like “um”, “uh”, “like” make you sound unsure.','Khi cần suy nghĩ, hãy im lặng một nhịp.','When you need to think, pause silently.','Chuẩn bị sẵn câu chuyển ý để không bị khựng.','Prepare transition phrases so you never stall.'),
     tip:{vi:'Tập nói chậm hơn 10%: từ đệm giảm rõ rệt.', en:'Speak 10% slower and your fillers drop noticeably.'},
     task:{vi:'Báo cáo 1 phút về một hạng mục bị chậm, không dùng từ đệm.', en:'Give a 1-minute update on a late task with no filler words.'}},
    {id:'re4', skill:'qa', mins:12, kind:'audio', target:60, title:{vi:'Trả lời câu hỏi của cấp trên', en:'Answering your manager’s questions'},
     theory:L3('Trả lời thẳng câu hỏi trong câu đầu tiên.','Answer the question directly in your first sentence.','Thêm một lý do hoặc số liệu để chứng minh.','Add one reason or number as evidence.','Nếu chưa biết, hẹn thời điểm trả lời cụ thể.','If you don’t know, promise a specific time to follow up.'),
     tip:{vi:'Lặp lại ngắn câu hỏi giúp bạn có thêm 2 giây suy nghĩ.', en:'Briefly repeating the question buys you 2 seconds to think.'},
     task:{vi:'Trả lời: “Rủi ro lớn nhất cho tháng tới là gì?”', en:'Answer: “What is the biggest risk for next month?”'}},
  ],
  interview:[
    {id:'in1', skill:'opening', mins:10, kind:'audio', target:60, title:{vi:'Giới thiệu bản thân 60 giây', en:'Your 60-second introduction'},
     theory:L3('Hiện tại: bạn là ai, đang làm gì.','Present: who you are and what you do now.','Quá khứ: một thành tích liên quan tới vị trí.','Past: one achievement relevant to the role.','Tương lai: vì sao bạn muốn vị trí này.','Future: why you want this role.'),
     tip:{vi:'Kết thúc bằng lý do bạn phù hợp, không phải “em hết rồi ạ”.', en:'End with why you fit, not “that’s all”.'},
     task:{vi:'Ghi âm phần giới thiệu bản thân trong 60 giây.', en:'Record your self-introduction in 60 seconds.'}},
    {id:'in2', skill:'structure', mins:15, kind:'script', target:90, title:{vi:'Trả lời theo khung STAR', en:'Answering with STAR'},
     theory:L3('Tình huống và nhiệm vụ: bối cảnh ngắn gọn.','Situation and task: brief context.','Hành động: bạn đã làm gì, dùng “em” thay vì “nhóm”.','Action: what you did, say “I”, not “we”.','Kết quả: con số hoặc thay đổi cụ thể.','Result: a number or a concrete change.'),
     tip:{vi:'Dành 60% thời lượng cho phần Hành động.', en:'Spend 60% of your answer on the Action.'},
     task:{vi:'Viết câu trả lời STAR cho: “Kể về một lần bạn giải quyết mâu thuẫn trong nhóm.”', en:'Write a STAR answer to: “Tell me about a time you resolved a team conflict.”'}},
    {id:'in3', skill:'filler', mins:10, kind:'audio', target:60, title:{vi:'Tự tin, không ậm ừ', en:'Confident, no hesitation'},
     theory:L3('Câu hỏi khó: hít một hơi trước khi trả lời.','Hard question: take a breath before answering.','Dùng câu đệm có nghĩa: “Đó là câu hỏi hay, em nghĩ…”.','Use meaningful bridges: “Good question, I think…”.','Nói rõ, kết câu dứt khoát, không lên giọng cuối câu.','Finish sentences firmly, without rising intonation.'),
     tip:{vi:'Ghi âm và đếm số lần “ừm”: mục tiêu dưới 2 lần mỗi phút.', en:'Record and count your “ums”: aim for under 2 per minute.'},
     task:{vi:'Trả lời “Điểm yếu lớn nhất của bạn là gì?” trong 1 phút.', en:'Answer “What is your biggest weakness?” in 1 minute.'}},
    {id:'in4', skill:'closing', mins:10, kind:'audio', target:45, title:{vi:'Đặt câu hỏi ngược cho nhà tuyển dụng', en:'Asking the recruiter good questions'},
     theory:L3('Hỏi về công việc thật: 3 tháng đầu cần đạt gì.','Ask about the real job: what success looks like in 3 months.','Hỏi về đội nhóm và cách làm việc.','Ask about the team and how it works.','Tránh hỏi lương ở vòng đầu, trừ khi được hỏi.','Avoid asking about salary in the first round unless asked.'),
     tip:{vi:'Chuẩn bị sẵn 3 câu, dùng 1–2 câu tùy thời gian.', en:'Prepare 3 questions and use 1–2 depending on time.'},
     task:{vi:'Ghi âm phần kết buổi phỏng vấn kèm 2 câu hỏi cho nhà tuyển dụng.', en:'Record your interview closing with 2 questions for the recruiter.'}},
  ],
  pitching:[
    {id:'pi1', skill:'opening', mins:10, kind:'audio', target:30, title:{vi:'Nêu vấn đề trong 20 giây', en:'State the problem in 20 seconds'},
     theory:L3('Nhà đầu tư cần thấy vấn đề có thật và đủ lớn.','Investors need to see a real, big enough problem.','Dùng một con số hoặc một khách hàng cụ thể.','Use a number or a specific customer.','Không giới thiệu sản phẩm trước khi nêu vấn đề.','Don’t introduce the product before the problem.'),
     tip:{vi:'“Mỗi tuần, sinh viên mất 40 phút để tìm sân” mạnh hơn “tìm sân rất khó”.', en:'“Students lose 40 minutes a week finding a court” beats “finding a court is hard”.'},
     task:{vi:'Ghi âm 20 giây nêu vấn đề mà sản phẩm của bạn giải quyết.', en:'Record 20 seconds stating the problem your product solves.'}},
    {id:'pi2', skill:'content', mins:15, kind:'script', target:120, title:{vi:'Giải pháp và con số chứng minh', en:'Solution and proof'},
     theory:L3('Giải pháp nói trong một câu: cho ai, làm gì, khác biệt gì.','Describe the solution in one sentence: for whom, what, what’s different.','Bằng chứng: người dùng, doanh thu, tỉ lệ quay lại.','Proof: users, revenue, retention.','Mô hình kinh doanh: thu tiền từ đâu, bao nhiêu.','Business model: who pays and how much.'),
     tip:{vi:'Ba con số tốt hơn mười con số.', en:'Three numbers beat ten.'},
     task:{vi:'Viết kịch bản 2 phút gồm vấn đề, giải pháp và 3 con số chứng minh.', en:'Write a 2-minute script with the problem, solution and 3 proof numbers.'}},
    {id:'pi3', skill:'closing', mins:10, kind:'audio', target:30, title:{vi:'Lời kêu gọi đầu tư rõ ràng', en:'A clear investment ask'},
     theory:L3('Nêu số vốn cần gọi.','State how much you are raising.','Nêu vốn dùng vào việc gì và mốc thời gian.','Say what it is for and the timeline.','Kết bằng một câu mời hành động.','End with a call to action.'),
     tip:{vi:'Đừng kết bằng “vậy thôi ạ”. Kết bằng con số.', en:'Don’t end with “that’s it”. End with a number.'},
     task:{vi:'Ghi âm 30 giây lời kêu gọi đầu tư.', en:'Record a 30-second investment ask.'}},
    {id:'pi4', skill:'qa', mins:15, kind:'audio', target:60, title:{vi:'Trả lời câu hỏi khó của nhà đầu tư', en:'Handling tough investor questions'},
     theory:L3('Câu hỏi về đối thủ: thừa nhận, rồi nêu khác biệt.','Competitor questions: acknowledge, then differentiate.','Câu hỏi về rủi ro: nêu kế hoạch giảm rủi ro.','Risk questions: give your mitigation plan.','Không tranh cãi, không né câu hỏi.','Don’t argue and don’t dodge.'),
     tip:{vi:'Trả lời trong 30–45 giây, rồi dừng.', en:'Answer in 30–45 seconds, then stop.'},
     task:{vi:'Trả lời: “Đối thủ lớn nhất là ai? Vì sao khách hàng chọn bạn?”', en:'Answer: “Who is your main competitor? Why would customers choose you?”'}},
  ],
  debating:[
    {id:'de1', skill:'structure', mins:12, kind:'script', target:90, title:{vi:'Luận điểm, lý do, dẫn chứng', en:'Claim, reason, evidence'},
     theory:L3('Luận điểm: một câu khẳng định rõ ràng.','Claim: one clear statement.','Lý do: vì sao điều đó đúng.','Reason: why it is true.','Dẫn chứng: số liệu, nghiên cứu hoặc ví dụ có nguồn.','Evidence: data, research or a sourced example.'),
     tip:{vi:'Mỗi luận điểm chỉ nên có một dẫn chứng mạnh nhất.', en:'Give each claim its single strongest piece of evidence.'},
     task:{vi:'Viết 2 luận điểm ủng hộ việc cấm điện thoại trong lớp học.', en:'Write 2 claims supporting a classroom phone ban.'}},
    {id:'de2', skill:'content', mins:12, kind:'audio', target:60, title:{vi:'Phản bác có dẫn chứng', en:'Rebuttal with evidence'},
     theory:L3('Tóm tắt lại lập luận của đối phương một cách công bằng.','Summarise the other side’s argument fairly.','Chỉ ra điểm yếu: thiếu dẫn chứng, suy diễn sai, hoặc ngoại lệ.','Point out the flaw: no evidence, false logic, or exceptions.','Đưa dẫn chứng phản bác của bạn.','Give your counter-evidence.'),
     tip:{vi:'Phản bác ý, không công kích người.', en:'Attack the idea, never the person.'},
     task:{vi:'Phản bác trong 1 phút: “Điện thoại giúp học sinh tra cứu nhanh hơn.”', en:'Rebut in 1 minute: “Phones help students look things up faster.”'}},
    {id:'de3', skill:'pace', mins:10, kind:'audio', target:60, title:{vi:'Nói chắc dưới áp lực thời gian', en:'Speaking steadily under time pressure'},
     theory:L3('Biết trước bạn có bao nhiêu giây cho mỗi luận điểm.','Know how many seconds you have for each point.','Giữ tốc độ đều, không tăng tốc khi gần hết giờ.','Keep an even pace, don’t rush near the end.','Bỏ ý phụ trước khi bỏ phần kết.','Drop minor points before you drop your conclusion.'),
     tip:{vi:'Tập với đồng hồ đếm ngược.', en:'Practise with a countdown timer.'},
     task:{vi:'Trình bày lập trường của bạn trong đúng 60 giây.', en:'Present your position in exactly 60 seconds.'}},
    {id:'de4', skill:'closing', mins:10, kind:'audio', target:45, title:{vi:'Tổng kết lập trường', en:'Summing up your case'},
     theory:L3('Nhắc lại 2 luận điểm mạnh nhất.','Repeat your 2 strongest claims.','Chỉ ra vì sao lập luận đối phương yếu hơn.','Show why the other side is weaker.','Kết bằng một câu dễ nhớ.','End with one memorable line.'),
     tip:{vi:'Câu kết nên ngắn hơn 15 từ.', en:'Keep your final line under 15 words.'},
     task:{vi:'Ghi âm phần tổng kết 45 giây cho đội của bạn.', en:'Record a 45-second summary for your team.'}},
  ],
};
const LESSON_BY_ID = {}; Object.entries(COURSES).forEach(([g,ls]) => ls.forEach((l,i) => LESSON_BY_ID[l.id] = {...l, goal:g, n:i+1}));

/* Bản chép lời mẫu (bản thử nghiệm chưa kết nối AI giọng nói). [f] = từ đệm. */
const TRANSCRIPTS = {
  presentation:{
    vi:{segs:['Xin chào thầy cô và các bạn. [Ừm], hôm nay em sẽ [à] trình bày về ứng dụng AI trong giáo dục.','Theo một khảo sát năm 2025, 68% sinh viên dùng AI để học ít nhất một lần mỗi tuần.','Lợi ích đầu tiên là cá nhân hóa lộ trình, phản hồi ngay và giảm tải cho giảng viên, cái này rất quan trọng vì giúp mọi người học nhanh hơn rất nhiều.','Vâng, [ừm], phần trình bày của em đến đây là hết ạ.'],
        rw:['Tuần này có bao nhiêu bạn đã hỏi AI một bài tập? Hôm nay em nói về điều đó.','Minh bạch khi dùng AI và đánh giá bằng quá trình: đó là hai điều em mong nhà trường bắt đầu. Em cảm ơn.']},
    en:{segs:['Hello everyone. [Um], today I’m going to [uh] talk about AI in education.','A 2025 survey found that 68% of students use AI to study at least once a week.','The first benefit is personalised learning, instant feedback and less work for teachers, which is really important because it helps everyone learn much faster.','So, [um], that’s all from me, thank you.'],
        rw:['How many of you asked AI for help with homework this week? Today, let’s talk about that.','Be transparent about AI and assess the process: those are the two changes I hope our school starts with. Thank you.']},
  },
  reporting:{
    vi:{segs:['Dạ, [ừm], em xin báo cáo tiến độ dự án tuần này ạ.','Chúng ta đã hoàn thành 7 trên 10 hạng mục, đạt 70% kế hoạch.','Hạng mục thanh toán bị chậm vì [kiểu như] đối tác gửi tài liệu muộn, nên bên em chưa kiểm thử được và chắc là phải lùi thêm một tuần nữa.','[À], em hết rồi ạ.'],
        rw:['Tuần này dự án đạt 70% kế hoạch, chậm một hạng mục.','Em đề xuất lùi hạng mục thanh toán một tuần và họp với đối tác vào thứ Hai.']},
    en:{segs:['[Um], so this is the project update for this week.','We have finished 7 of 10 work items, which is 70% of the plan.','The payment module is late because [like] the partner sent documents late, so we couldn’t test it yet and we will probably need one more week.','[Uh], that’s it.'],
        rw:['This week we are at 70% of plan, with one item behind.','I propose moving the payment module back one week and meeting the partner on Monday.']},
  },
  interview:{
    vi:{segs:['[Dạ], em chào anh, em tên là Lan Anh, em mới tốt nghiệp ngành Marketing.','Ở kỳ thực tập, em phụ trách fanpage và tăng lượng tương tác 45% trong 3 tháng.','Điểm yếu của em là [ừm] em hay cầu toàn, [kiểu như] làm gì cũng muốn hoàn hảo nên đôi khi bị chậm hạn chót.','Dạ, em nghĩ là vậy thôi ạ.'],
        rw:['Em là Lan Anh, vừa tốt nghiệp Marketing, và em đã tăng 45% tương tác cho fanpage trong kỳ thực tập.','Em rất muốn đóng góp cho chiến dịch Tết của công ty. Anh có thể chia sẻ thêm về đội ngũ không ạ?']},
    en:{segs:['[Um], hi, my name is Lan Anh and I just graduated in Marketing.','During my internship I ran the fanpage and grew engagement by 45% in three months.','My weakness is [uh] I’m a perfectionist, [like] I want everything perfect so sometimes I miss deadlines.','Yeah, I think that’s all.'],
        rw:['I’m Lan Anh, a Marketing graduate who grew fanpage engagement by 45% during my internship.','I’d love to contribute to your Tet campaign. Could you tell me more about the team?']},
  },
  pitching:{
    vi:{segs:['[Ừm], chào các anh chị, nhóm em làm ứng dụng đặt sân cầu lông.','Mỗi tuần một sinh viên mất 40 phút để gọi điện tìm sân trống.','Ứng dụng của tụi em giúp đặt sân trong 3 phút, đã có 12 sân và 850 người dùng thử, [à] tỉ lệ quay lại là 46% cho thấy nhu cầu là có thật và rất là lớn.','[Ừm], vậy thôi ạ, cảm ơn mọi người.'],
        rw:['Mỗi tuần, một sinh viên mất 40 phút chỉ để tìm sân. Chúng em giảm con số đó xuống còn 3 phút.','Chúng em cần 1,5 tỷ đồng để mở rộng ra 50 sân trong 12 tháng. Anh chị có muốn đồng hành không?']},
    en:{segs:['[Um], hi everyone, our team built a badminton court booking app.','Every week a student spends 40 minutes calling around for a free court.','Our app books a court in 3 minutes, we already have 12 courts and 850 trial users, [uh] and a 46% return rate which shows the demand is real and really big.','[Um], so that’s it, thank you.'],
        rw:['Every week, students lose 40 minutes finding a court. We cut that to 3 minutes.','We are raising 1.5 billion dong to grow to 50 courts in 12 months. Would you like to join us?']},
  },
  debating:{
    vi:{segs:['[Ừm], đội em ủng hộ việc cấm điện thoại trong lớp học.','Một nghiên cứu năm 2024 cho thấy điểm thi tăng 6% ở các trường đã cấm điện thoại.','Ngoài ra thì [kiểu như] học sinh cũng tập trung hơn, ít bị phân tâm hơn, và giáo viên cũng đỡ mệt hơn rất nhiều khi đứng lớp mỗi ngày.','[À], đó là quan điểm của đội em.'],
        rw:['Một chiếc điện thoại trên bàn đủ làm cả lớp mất tập trung. Vì vậy đội em ủng hộ lệnh cấm.','Điểm thi tăng 6%, lớp học tập trung hơn: lợi ích của lệnh cấm lớn hơn chi phí của nó.']},
    en:{segs:['[Um], our team supports banning phones in classrooms.','A 2024 study found test scores rose 6% in schools that banned phones.','Also [like] students focus more, get distracted less, and teachers are a lot less tired after teaching every day.','[Uh], that’s our position.'],
        rw:['One phone on a desk is enough to distract a whole class. That is why we support the ban.','Scores up 6%, classes more focused: the benefits of the ban outweigh its costs.']},
  },
  placement:{
    vi:{segs:['Dạ, [ừm], em chào mọi người, em tên là Lan Anh, sinh viên năm hai ngành Quản trị kinh doanh.','Điều em tự hào nhất là dẫn dắt nhóm 5 người giành giải nhì cuộc thi khởi nghiệp của trường.','Thì [kiểu như] em hay bị run khi đứng trước đông người, nên em muốn luyện để tự tin hơn và nói trôi chảy hơn khi thuyết trình trên lớp.','[Ừm], em hết rồi ạ.'],
        rw:['Em là Lan Anh, sinh viên năm hai ngành Quản trị kinh doanh.','Cuối kỳ này, em muốn tự tin trình bày trước cả lớp. Em cảm ơn.']},
    en:{segs:['[Um], hello everyone, my name is Lan Anh and I’m a second-year Business student.','What I’m most proud of is leading a team of 5 to second place in our school’s startup contest.','So [like] I often get nervous in front of a crowd, so I want to practise to feel more confident and speak more smoothly in class presentations.','[Um], that’s all.'],
        rw:['I’m Lan Anh, a second-year Business student.','By the end of this term, I want to present confidently in front of my whole class. Thank you.']},
  },
};

const SAMPLE_SCRIPT = {
  vi:`Mỗi tuần, một sinh viên mất trung bình 40 phút chỉ để gọi điện tìm sân cầu lông còn trống. Đó là vấn đề nhóm chúng em muốn giải quyết.

Ứng dụng SânNhanh cho phép đặt sân trong 3 phút. Bạn chọn khung giờ, xem sân trống gần trường và thanh toán ngay trên điện thoại. Chủ sân nhận lịch tự động và không còn phải ghi sổ.

Thì hiện tại nhóm em đã làm việc với 12 sân quanh khu Thủ Đức và có 850 sinh viên dùng thử trong tháng đầu, và tỉ lệ quay lại đặt sân lần hai là 46% cho thấy nhu cầu là có thật và rất là lớn.

Chúng em thu phí 8% trên mỗi lượt đặt. Với 50 sân, doanh thu dự kiến đạt 120 triệu đồng mỗi tháng.

Nhóm em cần 1,5 tỷ đồng để mở rộng ra 50 sân trong 12 tháng tới. Em cảm ơn.`,
  en:`Every week, a student spends an average of 40 minutes calling around to find a free badminton court. That is the problem our team wants to solve.

Our app CourtNow lets you book a court in 3 minutes. You pick a time slot, see free courts near campus and pay on your phone. Court owners get bookings automatically and no longer keep paper records.

So right now we basically work with 12 courts around Thu Duc and we had 850 students try the app in the first month, and the 46% rate of students booking a second time shows that the demand is real and actually very big.

We charge an 8% fee on every booking. With 50 courts, we expect revenue of 120 million dong per month.

We are raising 1.5 billion dong to expand to 50 courts over the next 12 months. Thank you.`,
};

const LIVE_TIPS = [
  [6,{vi:'Mở bài tốt. Thử nhìn thẳng vào camera ở câu tiếp theo.', en:'Good opening. Try looking straight at the camera in the next sentence.'}],
  [12,{vi:'Bạn vừa nói “ừm” 2 lần liên tiếp. Dừng im lặng 1 giây sẽ tốt hơn.', en:'You just said “um” twice. A one-second silent pause works better.'}],
  [20,'Q'],
  [28,{vi:'Tốc độ đang lên 168 từ/phút. Chậm lại một chút.', en:'Your pace is up to 168 words per minute. Slow down a little.'}],
  [38,{vi:'Ngắt nghỉ sau ý chính rất tốt, giữ nhịp này.', en:'Great pause after your key point. Keep this rhythm.'}],
  [48,'Q'],
];
const AN_STEPS = {
  speech:[{vi:'Tải bài nói lên máy chủ', en:'Uploading your talk'},{vi:'Chuyển giọng nói thành văn bản', en:'Transcribing speech'},{vi:'Phân tích nội dung và cấu trúc', en:'Analysing content and structure'},{vi:'Đo tốc độ nói và ngắt nghỉ', en:'Measuring pace and pauses'},{vi:'Phát hiện từ đệm', en:'Detecting filler words'},{vi:'Phân tích ngôn ngữ cơ thể', en:'Analysing body language'},{vi:'Viết báo cáo và gợi ý', en:'Writing your report'}],
  script:[{vi:'Đọc kịch bản', en:'Reading your script'},{vi:'Tách đoạn và câu', en:'Splitting paragraphs and sentences'},{vi:'Phân tích nội dung và cấu trúc', en:'Analysing content and structure'},{vi:'Kiểm tra mở bài và kết bài', en:'Checking opening and closing'},{vi:'Ước lượng thời lượng khi nói', en:'Estimating speaking time'},{vi:'Viết báo cáo và gợi ý', en:'Writing your report'}],
};
