import { supabaseAdmin } from '../supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';

const matchesStudentTarget = (item, student) => {
  if (!item || !student) return false;
  if (item.target_type === 'global' || item.target_type === 'all') return true;
  if (item.target_type === 'class' && student.classes) {
    return item.target_id === student.classes.class_id || item.target_id === student.classes.class_name;
  }
  if (item.target_type === 'student') {
    return item.target_id === student.student_id;
  }
  if (item.class_name && student.classes) {
    return item.class_name === student.classes.class_name;
  }
  return true;
};

export const getProfile = async (req, res) => {
  const { phone } = req.query;
  if (!phone) return errorResponse(res, 'Thiếu số điện thoại tra cứu');

  try {
    const trimmedPhone = phone.trim();

    // Tìm theo SĐT học sinh
    let { data: student, error } = await supabaseAdmin
      .from('students')
      .select('*, classes(class_id, class_name, grade_level, academic_year)')
      .eq('phone_number', trimmedPhone)
      .maybeSingle();

    if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
      const fallback = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('phone_number', trimmedPhone)
        .maybeSingle();
      student = fallback.data;
      error = fallback.error;
    }

    if (!student) return errorResponse(res, 'Không tìm thấy thông tin học sinh với số điện thoại này', null, 404);

    return successResponse(res, { ...student, role: 'student' }, 'Tìm thấy học sinh');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống tra cứu', error, 500);
  }
};

export const getParentProfile = async (req, res) => {
  const { phone } = req.query;
  if (!phone) return errorResponse(res, 'Thiếu số điện thoại phụ huynh');

  try {
    const trimmedPhone = phone.trim();
    let { data: students, error } = await supabaseAdmin
      .from('students')
      .select('*, classes(class_id, class_name, grade_level, academic_year)')
      .eq('parent_phone', trimmedPhone);

    if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
      const fallback = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('parent_phone', trimmedPhone);
      students = fallback.data;
      error = fallback.error;
    }

    if (error || !students || students.length === 0) {
      return errorResponse(res, 'Không tìm thấy thông tin phụ huynh/học sinh với số điện thoại này', null, 404);
    }

    const parentProfile = {
      role: 'parent',
      parent_phone: trimmedPhone,
      parent_name: students[0].parent_name || 'Phụ huynh',
      students: students
    };

    return successResponse(res, parentProfile, 'Tìm thấy thông tin phụ huynh');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống tra cứu phụ huynh', error, 500);
  }
};

export const getParentDashboard = async (req, res) => {
  const { parent_phone } = req.query;
  if (!parent_phone) return errorResponse(res, 'Thiếu số điện thoại phụ huynh');

  try {
    const trimmedPhone = parent_phone.trim();
    let students = null;
    const { data: studentsData, error: stuError } = await supabaseAdmin
      .from('students')
      .select('student_id, full_name, class_name, enrolled_subjects, status, classes(class_id, class_name)')
      .eq('parent_phone', trimmedPhone);

    if (studentsData) {
      students = studentsData;
    } else {
      const fallback = await supabaseAdmin.from('students').select('*').eq('parent_phone', trimmedPhone);
      students = fallback.data || [];
    }

    if (!students || students.length === 0) {
      return errorResponse(res, 'Không tìm thấy dữ liệu học sinh', null, 404);
    }

    const studentIds = students.map(s => s.student_id);

    // Fetch data for all children
    const [feesRes, paymentsRes, schedulesRes, gradesRes, notifsRes, attendancesRes, assignmentsRes, submissionsRes, appealsRes, leavesRes] = await Promise.all([
      supabaseAdmin.from('tuition_fees').select('*').in('student_id', studentIds).order('due_date', { ascending: true }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('payment_history').select('*').in('student_id', studentIds).order('paid_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('schedules').select('*').order('study_date', { ascending: true }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('grades').select('*, subjects(subject_name, subject_code)').in('student_id', studentIds).then(r => {
        if (r.error) return supabaseAdmin.from('grades').select('*').in('student_id', studentIds);
        return r;
      }).catch(() => ({ data: [] })),
      supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('attendances').select('*, schedules(title, study_date, class_name, subject_name)').in('student_id', studentIds).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('assignments').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('assignment_submissions').select('*').in('student_id', studentIds).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('grade_appeals').select('*').in('student_id', studentIds).order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('leave_requests').select('*').in('student_id', studentIds).order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] }))
    ]);

    // Filter schedules for all children
    const allSchedules = schedulesRes.data || [];
    const parentSchedules = allSchedules.filter(sch => {
      return students.some(stu => matchesStudentTarget(sch, stu));
    });

    // Filter notifications based on target
    const allNotifs = notifsRes.data || [];
    const parentNotifs = allNotifs.filter(notif => {
      return students.some(stu => matchesStudentTarget(notif, stu));
    });

    let gradesData = gradesRes.data || [];
    students.forEach(student => {
      const enrolledSubjects = student.enrolled_subjects || [];
      const studentGrades = gradesData.filter(g => g.student_id === student.student_id);
      const existingSubjects = studentGrades.map(g => g.subject_name || (g.subjects && g.subjects.subject_name));
      enrolledSubjects.forEach(subject => {
        if (!existingSubjects.includes(subject)) {
          gradesData.push({
            grade_id: `temp-${student.student_id}-${subject}`,
            student_id: student.student_id,
            subject_name: subject,
            grade_15m: null,
            grade_45m: null,
            midterm_grade: null,
            final_grade: null,
            summary_grade: null
          });
        }
      });
    });

    return successResponse(res, {
      students,
      tuitionFees: feesRes.data || [],
      paymentHistory: paymentsRes.data || [],
      schedules: parentSchedules,
      grades: gradesData,
      assignments: assignmentsRes.data || [],
      submissions: submissionsRes.data || [],
      gradeAppeals: appealsRes.data || [],
      notifications: parentNotifs,
      attendances: attendancesRes.data || [],
      leaveRequests: leavesRes.data || []
    }, 'Tải thông tin dashboard phụ huynh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống tải dashboard', error, 500);
  }
};

export const getDashboard = async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) {
    return errorResponse(res, 'Thiếu thông tin student_id');
  }

  try {
    // 1. Lấy thông tin học sinh an toàn
    let student = null;
    const studentRes = await supabaseAdmin
      .from('students')
      .select('*, classes(class_id, class_name, grade_level)')
      .eq('student_id', student_id)
      .maybeSingle();

    if (studentRes.data) {
      student = studentRes.data;
    } else {
      const fallback = await supabaseAdmin.from('students').select('*').eq('student_id', student_id).maybeSingle();
      student = fallback.data;
    }

    if (!student) return errorResponse(res, 'Không tìm thấy thông tin học sinh', null, 404);

    // 2. Tải tất cả dữ liệu liên quan đồng thời, chống sập trang khi thiếu FK
    const [
      feesRes, paymentsRes, schedulesRes, gradesRes,
      assignmentsRes, submissionsRes, notifsRes, appealsRes, docsRes, attendancesRes, leavesRes
    ] = await Promise.all([
      supabaseAdmin.from('tuition_fees').select('*').eq('student_id', student_id).order('due_date', { ascending: true }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('payment_history').select('*').eq('student_id', student_id).order('paid_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('schedules').select('*').order('study_date', { ascending: true }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('grades').select('*, subjects(subject_name, subject_code)').eq('student_id', student_id).then(r => {
        if (r.error) return supabaseAdmin.from('grades').select('*').eq('student_id', student_id);
        return r;
      }).catch(() => ({ data: [] })),
      supabaseAdmin.from('assignments').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('assignment_submissions').select('*').eq('student_id', student_id).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('grade_appeals').select('*').eq('student_id', student_id).order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('documents').select('*').then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('attendances').select('*, schedules(title, study_date, class_name, subject_name)').eq('student_id', student_id).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('leave_requests').select('*').eq('student_id', student_id).order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] }))
    ]);

    // Lọc lịch học thuộc về học sinh (theo class_id, class_name hoặc target_id)
    const allSchedules = schedulesRes.data || [];
    const studentSchedules = allSchedules.filter(sch => matchesStudentTarget(sch, student));

    let gradesData = gradesRes.data || [];
    const enrolledSubjects = student.enrolled_subjects || [];
    const existingSubjects = gradesData.map(g => g.subject_name || (g.subjects && g.subjects.subject_name));
    enrolledSubjects.forEach(subject => {
      if (!existingSubjects.includes(subject)) {
        gradesData.push({
          grade_id: `temp-${subject}`,
          subject_name: subject,
          grade_15m: null,
          grade_45m: null,
          midterm_grade: null,
          final_grade: null,
          summary_grade: null
        });
      }
    });

    const allNotifs = notifsRes.data || [];
    const studentNotifs = allNotifs.filter(notif => matchesStudentTarget(notif, student));

    return successResponse(res, {
      student,
      tuitionFees: feesRes.data || [],
      paymentHistory: paymentsRes.data || [],
      schedules: studentSchedules,
      grades: gradesData,
      assignments: assignmentsRes.data || [],
      submissions: submissionsRes.data || [],
      notifications: studentNotifs,
      gradeAppeals: appealsRes.data || [],
      documents: docsRes.data || [],
      attendances: attendancesRes.data || [],
      leaveRequests: leavesRes.data || []
    }, 'Tải thông tin dashboard học sinh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống tải dashboard', error, 500);
  }
};

export const submitAssignment = async (req, res) => {
  const { student_id, assignment_id, file_url } = req.body;

  if (!student_id || !assignment_id) {
    return errorResponse(res, 'Thiếu thông tin nộp bài (student_id, assignment_id)');
  }

  try {
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('assignment_id', assignment_id)
      .single();

    if (assignError || !assignment) {
      return errorResponse(res, 'Không tìm thấy bài tập', assignError);
    }

    // 3. Quản lý Múi Giờ (Timezone Shift) - Ép về giờ VN (UTC+7) để so sánh deadline
    const now = new Date();
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const deadlineDate = new Date(assignment.deadline);
    const isLate = vnTime > deadlineDate;
    const status = isLate ? 'late' : 'submitted';

    const { data: existingSub } = await supabaseAdmin
      .from('assignment_submissions')
      .select('submission_id, file_url')
      .eq('assignment_id', assignment_id)
      .eq('student_id', student_id)
      .maybeSingle();

    let submission, submitError;
    if (existingSub) {
      // 4. Chống rác máy chủ (Storage Leak): Xóa file cũ nếu có file mới
      if (existingSub.file_url && existingSub.file_url !== file_url) {
        try {
          const urlParts = existingSub.file_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          if (oldFileName) {
            await supabaseAdmin.storage.from('assignments').remove([oldFileName]);
          }
        } catch (e) { console.error('Lỗi xóa file rác:', e); }
      }

      const result = await supabaseAdmin
        .from('assignment_submissions')
        .update({
          file_url,
          submitted_at: new Date().toISOString(),
          status
        })
        .eq('submission_id', existingSub.submission_id)
        .select()
        .single();
      submission = result.data;
      submitError = result.error;
    } else {
      const result = await supabaseAdmin
        .from('assignment_submissions')
        .insert({
          assignment_id,
          student_id,
          file_url,
          submitted_at: new Date().toISOString(),
          status
        })
        .select()
        .single();
      submission = result.data;
      submitError = result.error;
    }

    if (submitError) {
      return errorResponse(res, 'Lỗi lưu dữ liệu bài nộp', submitError);
    }

    const { data: student } = await supabaseAdmin.from('students').select('full_name').eq('student_id', student_id).maybeSingle();
    await logActivity('student', student_id, 'UPDATE', 'assignment_submissions', `${student?.full_name || 'Học sinh'} nộp bài tập: ${assignment.title}`);

    await supabaseAdmin.from('notifications').insert({
      title: 'Học sinh nộp bài tập',
      message: `Học sinh ${student?.full_name || 'Không rõ'} đã nộp bài tập "${assignment.title}".`,
      target_type: 'admin',
      target_id: ''
    });

    return successResponse(res, submission, 'Nộp bài tập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống nộp bài', error, 500);
  }
};

export const payTuition = async (req, res) => {
  const { student_id, fee_id, amount, payment_method } = req.body;
  if (!student_id || !fee_id || !amount) {
    return errorResponse(res, 'Thiếu thông tin thanh toán');
  }

  try {
    const { error: feeErr } = await supabaseAdmin
      .from('tuition_fees')
      .update({ status: 'paid' })
      .eq('fee_id', fee_id)
      .eq('student_id', student_id);

    if (feeErr) return errorResponse(res, 'Không thể cập nhật trạng thái học phí', feeErr);

    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payment_history')
      .insert({
        student_id,
        fee_id,
        amount: Number(amount),
        payment_method: payment_method || 'cash',
        status: 'success',
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (payErr) return errorResponse(res, 'Lỗi lưu lịch sử giao dịch', payErr);

    const { data: student } = await supabaseAdmin.from('students').select('full_name').eq('student_id', student_id).maybeSingle();
    await logActivity('student', student_id, 'PAYMENT', 'tuition_fees', `${student?.full_name || 'Học sinh'} đã đóng học phí số tiền ${Number(amount).toLocaleString('vi-VN')} VND`);

    await supabaseAdmin.from('notifications').insert({
      title: 'Thanh toán học phí',
      message: `Phụ huynh/Học sinh ${student?.full_name || 'Không rõ'} đã thanh toán thành công số tiền ${Number(amount).toLocaleString('vi-VN')} đ.`,
      target_type: 'admin',
      target_id: ''
    });

    return successResponse(res, payment, 'Thanh toán học phí thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống thanh toán học phí', error, 500);
  }
};

export const submitGradeAppeal = async (req, res) => {
  const { student_id, subject_name, reference_type, reference_id, reason } = req.body;
  if (!student_id || !reason) {
    return errorResponse(res, 'Thiếu thông tin phúc khảo (student_id, reason)');
  }

  try {
    let finalReferenceId = reference_id;
    if (reference_id && typeof reference_id === 'string' && reference_id.startsWith('temp-')) {
      finalReferenceId = null; // Do not insert 'temp-' string into UUID column
    }

    const payload = {
      student_id,
      subject_name: subject_name || 'Không rõ',
      reference_type: reference_type || 'grade',
      reason,
      status: 'pending'
    };
    
    if (finalReferenceId) {
      payload.reference_id = finalReferenceId;
    }

    const { data, error } = await supabaseAdmin
      .from('grade_appeals')
      .insert(payload)
      .select()
      .single();

    if (error) return errorResponse(res, 'Không thể gửi đơn phúc khảo', error);

    const { data: student } = await supabaseAdmin.from('students').select('full_name').eq('student_id', student_id).maybeSingle();
    await logActivity('student', student_id, 'CREATE', 'grade_appeals', `${student?.full_name || 'Học sinh'} gửi đơn phúc khảo điểm`);

    return successResponse(res, data, 'Gửi đơn phúc khảo thành công, vui lòng chờ Admin duyệt.');
  } catch (error) {
    return errorResponse(res, 'Lỗi gửi đơn phúc khảo', error, 500);
  }
};

// ==========================================
// 6. LEAVE REQUESTS (STUDENT)
// ==========================================
export const getLeaveRequests = async (req, res) => {
  const { student_id } = req.query;
  try {
    const { data, error } = await supabaseAdmin.from('leave_requests').select('*').eq('student_id', student_id).order('created_at', { ascending: false });
    if (error) return errorResponse(res, 'Lỗi tải đơn xin phép', error);
    return successResponse(res, data || [], 'Thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const submitLeaveRequest = async (req, res) => {
  const { student_id, leave_date, reason } = req.body;
  if (!student_id || !leave_date || !reason) return errorResponse(res, 'Thiếu thông tin xin phép');
  
  try {
    const { data, error } = await supabaseAdmin.from('leave_requests').insert({ student_id, leave_date, reason }).select().single();
    if (error) return errorResponse(res, 'Lỗi nộp đơn xin phép', error);
    await logActivity('student', student_id, 'CREATE', 'leave_requests', `Học sinh/Phụ huynh gửi đơn xin nghỉ phép ngày ${leave_date}`);
    return successResponse(res, data, 'Nộp đơn xin phép thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};
