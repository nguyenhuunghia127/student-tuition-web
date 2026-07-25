import { supabaseAdmin } from './supabase.js';

async function cleanup() {
  console.log('Bắt đầu dọn dẹp điểm 15 phút bị đồng bộ từ điểm bài tập...');

  // 1. Lấy tất cả các submission đã chấm điểm
  const { data: submissions, error: subErr } = await supabaseAdmin
    .from('assignment_submissions')
    .select('student_id, grade')
    .eq('status', 'graded');

  if (subErr) {
    console.error('Lỗi lấy bài nộp:', subErr);
    return;
  }

  // 2. Lấy tất cả các grades
  const { data: grades, error: gradesErr } = await supabaseAdmin
    .from('grades')
    .select('*')
    .not('grade_15m', 'is', null);

  if (gradesErr) {
    console.error('Lỗi lấy bảng điểm:', gradesErr);
    return;
  }

  let cleanedCount = 0;

  for (const grade of grades) {
    // Tìm xem học sinh này có bài tập nào có điểm trùng với grade_15m không
    const matchedSubmission = submissions.find(
      s => s.student_id === grade.student_id && s.grade === grade.grade_15m
    );

    if (matchedSubmission) {
      // Có vẻ là điểm tự động đồng bộ. Ta set null cho grade_15m và tính lại summary_grade
      const g15 = null;
      const g45 = grade.grade_45m;
      const mid = grade.midterm_grade;
      const fin = grade.final_grade;
      
      let summary_grade = null;
      if (g15 !== null && g45 !== null && mid !== null && fin !== null) {
        summary_grade = parseFloat(((g15 + g45 * 2 + mid * 2 + fin * 3) / 8).toFixed(2));
      }

      const { error: updateErr } = await supabaseAdmin
        .from('grades')
        .update({
          grade_15m: null,
          summary_grade: summary_grade // sẽ là null vì thiếu 15m
        })
        .eq('grade_id', grade.grade_id);

      if (updateErr) {
        console.error(`Lỗi cập nhật cho grade_id ${grade.grade_id}:`, updateErr);
      } else {
        console.log(`Đã gỡ điểm 15 phút (${grade.grade_15m}) của student ${grade.student_id} ở môn ${grade.subject_name}`);
        cleanedCount++;
      }
    }
  }

  console.log(`Hoàn tất dọn dẹp. Tổng cộng đã gỡ ${cleanedCount} điểm 15 phút.`);
  process.exit(0);
}

cleanup();
