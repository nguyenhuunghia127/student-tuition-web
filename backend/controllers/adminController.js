import { supabaseAdmin } from '../supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';
import * as xlsx from 'xlsx';

// Helper xử lý fallback khi Supabase chưa có Foreign Key 3NF hoặc cột created_at (lỗi 42703 & PGRST200)
const safeQuery = async (primaryQueryFn, fallbackQueryFn) => {
  try {
    const result = await primaryQueryFn();
    if (result.error && (result.error.code === 'PGRST200' || result.error.code === '42703' || result.error.message?.includes('relationship') || result.error.message?.includes('does not exist'))) {
      return await fallbackQueryFn();
    }
    return result;
  } catch (e) {
    return await fallbackQueryFn();
  }
};

const autoNotify = async (title, message, target_type, target_id) => {
  try {
    const payload = { title, message, is_global: false };
    if (target_type) payload.target_type = target_type;
    if (target_id) payload.target_id = target_id;
    if (!target_type) payload.is_global = true;
    await supabaseAdmin.from('notifications').insert(payload);
  } catch (err) {
    console.error('Error auto-notifying:', err);
  }
};

// ==========================================
// 1. QUẢN LÝ LỚP HỌC (Classes)
// ==========================================
export const getClasses = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('classes').select('*').order('class_name', { ascending: true }),
      () => supabaseAdmin.from('classes').select('*')
    );
    if (error && error.code !== '42P01') return errorResponse(res, 'Lỗi tải danh sách lớp học', error);
    return successResponse(res, data || [], 'Lấy danh sách lớp học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createClass = async (req, res) => {
  const { class_name, grade_level, academic_year } = req.body;
  if (!class_name) return errorResponse(res, 'Tên lớp học không được để trống');

  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({ class_name: class_name.trim(), grade_level, academic_year: academic_year || '2024-2025' })
      .select()
      .single();

    if (error) return errorResponse(res, 'Không thể tạo lớp học (hãy đảm bảo đã chạy database.sql)', error);
    await logActivity('admin', req.user?.id, 'CREATE', 'classes', `Tạo lớp học mới: ${class_name}`);
    return successResponse(res, data, 'Tạo lớp học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateClass = async (req, res) => {
  const { id } = req.params;
  const { class_name, grade_level, academic_year } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .update({ class_name, grade_level, academic_year })
      .eq('class_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Không thể cập nhật thông tin lớp học', error);
    await logActivity('admin', req.user?.id, 'UPDATE', 'classes', `Cập nhật lớp học ID: ${id}`);
    return successResponse(res, data, 'Cập nhật lớp học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('classes').delete().eq('class_id', id);
    if (error) return errorResponse(res, 'Không thể xóa lớp học (lớp đang chứa học sinh)', error);
    await logActivity('admin', req.user?.id, 'DELETE', 'classes', `Xóa lớp học ID: ${id}`);
    return successResponse(res, null, 'Xóa lớp học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

// ==========================================
// 2. QUẢN LÝ MÔN HỌC (Subjects)
// ==========================================
export const getSubjects = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('subjects').select('*').order('subject_name', { ascending: true }),
      () => supabaseAdmin.from('subjects').select('*')
    );
    if (error && error.code !== '42P01') return errorResponse(res, 'Lỗi tải danh sách môn học', error);
    return successResponse(res, data || [], 'Lấy danh sách môn học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createSubject = async (req, res) => {
  const { subject_code, subject_name, description } = req.body;
  if (!subject_code || !subject_name) return errorResponse(res, 'Mã môn và Tên môn không được để trống');

  try {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({ subject_code: subject_code.trim().toUpperCase(), subject_name: subject_name.trim(), description })
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi tạo môn học', error);
    await logActivity('admin', req.user?.id, 'CREATE', 'subjects', `Tạo môn học mới: ${subject_name}`);
    return successResponse(res, data, 'Tạo môn học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { subject_code, subject_name, description } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .update({ subject_code, subject_name, description })
      .eq('subject_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi cập nhật môn học', error);
    await logActivity('admin', req.user?.id, 'UPDATE', 'subjects', `Cập nhật môn học ID: ${id}`);
    return successResponse(res, data, 'Cập nhật môn học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('subjects').delete().eq('subject_id', id);
    if (error) return errorResponse(res, 'Không thể xóa môn học này', error);
    await logActivity('admin', req.user?.id, 'DELETE', 'subjects', `Xóa môn học ID: ${id}`);
    return successResponse(res, null, 'Xóa môn học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

// ==========================================
// 3. QUẢN LÝ HỌC SINH (Students - Tương thích 3NF & CSDL cũ)
// ==========================================
export const getStudents = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('students').select('*, classes(class_id, class_name, grade_level)'),
      () => supabaseAdmin.from('students').select('*')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy danh sách học sinh', error);
    return successResponse(res, data || [], 'Lấy danh sách học sinh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createStudent = async (req, res) => {
  const { full_name, class_id, class_name, phone_number, parent_name, parent_phone } = req.body;

  if (!full_name || !phone_number) {
    return errorResponse(res, 'Thiếu thông tin bắt buộc (Họ tên, SĐT)');
  }

  try {
    let targetClassId = class_id;

    if (!targetClassId && class_name) {
      const { data: cls } = await supabaseAdmin.from('classes').select('class_id').eq('class_name', class_name.trim()).maybeSingle();
      if (cls) {
        targetClassId = cls.class_id;
      } else {
        const { data: newCls } = await supabaseAdmin.from('classes').insert({ class_name: class_name.trim() }).select().maybeSingle();
        if (newCls) targetClassId = newCls.class_id;
      }
    }

    const payload = {
      full_name: full_name.trim(),
      phone_number: phone_number.trim(),
      parent_name: parent_name ? parent_name.trim() : null,
      parent_phone: parent_phone ? parent_phone.trim() : null
    };

    if (targetClassId) payload.class_id = targetClassId;
    if (class_name) payload.class_name = class_name.trim();

    const { data, error } = await supabaseAdmin
      .from('students')
      .insert(payload)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi thêm học sinh (SĐT có thể đã tồn tại)', error);
    await logActivity('admin', req.user?.id, 'CREATE', 'students', `Thêm học sinh mới: ${full_name}`);
    return successResponse(res, data, 'Thêm học sinh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { full_name, class_id, class_name, phone_number, parent_name, parent_phone } = req.body;

  try {
    const updateObj = { full_name, phone_number, parent_name, parent_phone };
    if (class_id) updateObj.class_id = class_id;
    if (class_name) updateObj.class_name = class_name;

    const { data, error } = await supabaseAdmin
      .from('students')
      .update(updateObj)
      .eq('student_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Không thể cập nhật thông tin học sinh', error);
    await logActivity('admin', req.user?.id, 'UPDATE', 'students', `Cập nhật thông tin học sinh: ${full_name}`);
    return successResponse(res, data, 'Cập nhật thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('students').delete().eq('student_id', id);
    if (error) return errorResponse(res, 'Lỗi xóa học sinh', error);
    await logActivity('admin', req.user?.id, 'DELETE', 'students', `Xóa học sinh ID: ${id}`);
    return successResponse(res, null, 'Xóa học sinh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteMultipleStudents = async (req, res) => {
  const { student_ids } = req.body;
  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return errorResponse(res, 'Danh sách xóa rỗng');
  }

  try {
    const { error } = await supabaseAdmin.from('students').delete().in('student_id', student_ids);
    if (error) return errorResponse(res, 'Lỗi xóa danh sách học sinh', error);
    await logActivity('admin', req.user?.id, 'DELETE', 'students', `Xóa hàng loạt ${student_ids.length} học sinh`);
    return successResponse(res, null, 'Xóa thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const importStudents = async (req, res) => {
  if (!req.file) return errorResponse(res, 'Vui lòng upload tệp Excel (.xlsx hoặc .csv)');

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) return errorResponse(res, 'File Excel không có dữ liệu');

    let inserted = 0;
    for (const row of sheetData) {
      const fullName = row['Họ và tên'] || row['full_name'] || row['Name'];
      const className = row['Lớp'] || row['class_name'] || row['Class'];
      const phone = row['SĐT Học Sinh'] || row['phone_number'] || row['Phone'];
      const parentName = row['Tên Phụ Huynh'] || row['parent_name'];
      const parentPhone = row['SĐT Phụ Huynh'] || row['parent_phone'];

      if (!fullName || !phone) continue;

      const payload = {
        full_name: String(fullName).trim(),
        class_name: className ? String(className).trim() : 'Lớp chung',
        phone_number: String(phone).trim(),
        parent_name: parentName ? String(parentName).trim() : null,
        parent_phone: parentPhone ? String(parentPhone).trim() : null
      };

      const { error } = await supabaseAdmin.from('students').insert(payload);
      if (!error) inserted++;
    }

    await logActivity('admin', req.user?.id, 'IMPORT', 'students', `Import thành công ${inserted} học sinh từ file Excel`);
    return successResponse(res, { count: inserted }, `Import thành công ${inserted} học sinh`);
  } catch (error) {
    return errorResponse(res, 'Lỗi xử lý file Excel', error, 500);
  }
};

export const exportStudents = async (req, res) => {
  try {
    const { data: students, error } = await safeQuery(
      () => supabaseAdmin.from('students').select('full_name, phone_number, parent_name, parent_phone, class_name, classes(class_name)'),
      () => supabaseAdmin.from('students').select('full_name, phone_number, parent_name, parent_phone, class_name')
    );

    if (error) return errorResponse(res, 'Lỗi xuất dữ liệu', error);

    const exportData = (students || []).map(s => ({
      'Họ và tên': s.full_name,
      'Lớp': s.classes?.class_name || s.class_name || '',
      'SĐT Học sinh': s.phone_number,
      'Tên Phụ huynh': s.parent_name || '',
      'SĐT Phụ huynh': s.parent_phone || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'HocSinh');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=danh_sach_hoc_sinh.xlsx');
    return res.send(buffer);
  } catch (error) {
    return errorResponse(res, 'Lỗi xuất Excel', error, 500);
  }
};

// ==========================================
// 4. QUẢN LÝ ĐIỂM SỐ & PHÚC KHẢO (Tương thích 3NF & CSDL cũ)
// ==========================================
export const getGrades = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('grades').select('*, students(student_id, full_name, phone_number, class_name, classes(class_name)), subjects(subject_id, subject_name, subject_code)'),
      () => supabaseAdmin.from('grades').select('*')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy bảng điểm', error);
    return successResponse(res, data || [], 'Tải bảng điểm thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createGrade = async (req, res) => {
  const { id, student_id, subject_id, subject_name, semester, academic_year, score_15m, score_45m, score_midterm, score_final, grade_15m, grade_45m, midterm_grade, final_grade } = req.body;

  if (!student_id) return errorResponse(res, 'Thiếu student_id');

  try {
    const s15 = score_15m ?? grade_15m ?? null;
    const s45 = score_45m ?? grade_45m ?? null;
    const sMid = score_midterm ?? midterm_grade ?? null;
    const sFin = score_final ?? final_grade ?? null;

    let score_summary = null;
    const vals = [s15, s45, sMid, sFin].map(v => v !== null ? Number(v) : null).filter(v => v !== null && !isNaN(v));
    if (vals.length > 0) {
      score_summary = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    }

    const gradeData = {
      student_id,
      subject_name: subject_name || 'Môn chung',
      score_15m: s15 !== null ? Number(s15) : null,
      score_45m: s45 !== null ? Number(s45) : null,
      score_midterm: sMid !== null ? Number(sMid) : null,
      score_final: sFin !== null ? Number(sFin) : null,
      summary_grade: score_summary,
      score_summary: score_summary,
      updated_at: new Date().toISOString()
    };
    if (subject_id) gradeData.subject_id = subject_id;

    let data, error;

    if (id && !id.toString().startsWith('virtual')) {
      const resData = await supabaseAdmin.from('grades').update(gradeData).eq('grade_id', id).select().single();
      data = resData.data;
      error = resData.error;
    } else {
      const resData = await supabaseAdmin.from('grades').insert(gradeData).select().single();
      data = resData.data;
      error = resData.error;
    }

    if (error) return errorResponse(res, 'Lỗi lưu điểm số', error);

    await logActivity('admin', req.user?.id, 'UPDATE', 'grades', `Cập nhật điểm cho học sinh ID: ${student_id}`);
    
    await autoNotify('Cập nhật điểm số', `Điểm môn ${gradeData.subject_name} của bạn vừa được cập nhật.`, 'student', `student:${student_id}`);
    
    return successResponse(res, data, 'Lưu điểm thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const importGrades = async (req, res) => {
  if (!req.file) return errorResponse(res, 'Vui lòng upload file Excel điểm');

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    let count = 0;
    for (const row of sheetData) {
      const phone = row['SĐT Học Sinh'] || row['phone_number'];
      const subjectName = row['Môn Học'] || row['subject_name'] || 'Môn chung';
      if (!phone) continue;

      const { data: student } = await supabaseAdmin.from('students').select('student_id').eq('phone_number', String(phone).trim()).maybeSingle();
      if (!student) continue;

      const s15 = row['Điểm 15P'] !== undefined ? Number(row['Điểm 15P']) : null;
      const s45 = row['Điểm 45P'] !== undefined ? Number(row['Điểm 45P']) : null;
      const sMid = row['Điểm Giữa Kỳ'] !== undefined ? Number(row['Điểm Giữa Kỳ']) : null;
      const sFin = row['Điểm Cuối Kỳ'] !== undefined ? Number(row['Điểm Cuối Kỳ']) : null;

      await createGrade({
        body: { student_id: student.student_id, subject_name: subjectName, score_15m: s15, score_45m: s45, score_midterm: sMid, score_final: sFin }
      }, { json: () => {}, status: () => ({ json: () => {} }) });
      count++;
    }

    return successResponse(res, { count }, `Đã nhập điểm cho ${count} lượt học sinh`);
  } catch (error) {
    return errorResponse(res, 'Lỗi xử lý file điểm', error, 500);
  }
};

export const exportGrades = async (req, res) => {
  try {
    const { data: grades } = await safeQuery(
      () => supabaseAdmin.from('grades').select('*, students(full_name, phone_number, class_name, classes(class_name)), subjects(subject_name)'),
      () => supabaseAdmin.from('grades').select('*, students(full_name, phone_number, class_name)')
    );

    const exportData = (grades || []).map(g => ({
      'Họ và tên': g.students?.full_name || '',
      'Lớp': g.students?.classes?.class_name || g.students?.class_name || '',
      'SĐT': g.students?.phone_number || '',
      'Môn học': g.subjects?.subject_name || g.subject_name || '',
      'Điểm 15P': g.score_15m ?? g.grade_15m ?? '',
      'Điểm 45P': g.score_45m ?? g.grade_45m ?? '',
      'Giữa kỳ': g.score_midterm ?? g.midterm_grade ?? '',
      'Cuối kỳ': g.score_final ?? g.final_grade ?? '',
      'Điểm tổng kết': g.score_summary ?? g.summary_grade ?? ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'BangDiem');
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bang_diem.xlsx');
    return res.send(buffer);
  } catch (error) {
    return errorResponse(res, 'Lỗi xuất Excel bảng điểm', error, 500);
  }
};

export const getGradeSettings = async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('grade_settings').select('*').limit(1).maybeSingle();
    return successResponse(res, data || { weight_15m: 0.1, weight_45m: 0.2, weight_midterm: 0.3, weight_final: 0.4 }, 'Thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateGradeSettings = async (req, res) => {
  const { weight_15m, weight_45m, weight_midterm, weight_final } = req.body;
  try {
    const { data: existing } = await supabaseAdmin.from('grade_settings').select('setting_id').limit(1).maybeSingle();
    const payload = { weight_15m, weight_45m, weight_midterm, weight_final, updated_at: new Date().toISOString() };

    let resData;
    if (existing) {
      resData = await supabaseAdmin.from('grade_settings').update(payload).eq('setting_id', existing.setting_id).select().single();
    } else {
      resData = await supabaseAdmin.from('grade_settings').insert(payload).select().single();
    }

    return successResponse(res, resData.data, 'Cập nhật hệ số điểm thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi cập nhật hệ số', error, 500);
  }
};

export const getGradeAppeals = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('grade_appeals').select('*, students(full_name, phone_number, class_name), subjects(subject_name)'),
      () => supabaseAdmin.from('grade_appeals').select('*')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi tải danh sách phúc khảo', error);
    return successResponse(res, data || [], 'Lấy danh sách phúc khảo thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateGradeAppealStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_response } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('grade_appeals')
      .update({ status, admin_response, updated_at: new Date().toISOString() })
      .eq('appeal_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi cập nhật trạng thái phúc khảo', error);
    return successResponse(res, data, 'Cập nhật đơn phúc khảo thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

// ==========================================
// 5. QUẢN LÝ BÀI TẬP (Assignments)
// ==========================================
export const getAssignments = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('assignments').select('*, assignment_targets(*, classes(class_name), students(full_name)), assignment_submissions(submission_id)'),
      () => supabaseAdmin.from('assignments').select('*, assignment_submissions(submission_id)')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy bài tập', error);
    return successResponse(res, data || [], 'Lấy danh sách bài tập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createAssignment = async (req, res) => {
  const { title, description, file_url, deadline, submission_folder_url, target_type, target_id, class_id, student_id } = req.body;

  if (!title || !deadline) return errorResponse(res, 'Tiêu đề và Hạn nộp là bắt buộc');

  try {
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('assignments')
      .insert({ title, description, file_url, deadline, submission_folder_url, target_type, target_id })
      .select()
      .single();

    if (assignErr) return errorResponse(res, 'Lỗi tạo bài tập', assignErr);

    if (target_type) {
      await supabaseAdmin.from('assignment_targets').insert({
        assignment_id: assignment.assignment_id,
        target_type: target_type || 'global',
        class_id: class_id || null,
        student_id: student_id || null
      }).then(() => {}).catch(() => {});
    }

    await logActivity('admin', req.user?.id, 'CREATE', 'assignments', `Tạo bài tập mới: ${title}`);
    await autoNotify('Bài tập mới', `Bài tập mới: ${title} (Hạn nộp: ${new Date(deadline).toLocaleDateString('vi-VN')})`, target_type, target_id);
    return successResponse(res, assignment, 'Tạo bài tập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, description, file_url, deadline, submission_folder_url } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .update({ title, description, file_url, deadline, submission_folder_url })
      .eq('assignment_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi cập nhật bài tập', error);
    return successResponse(res, data, 'Cập nhật bài tập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('assignments').delete().eq('assignment_id', id);
    if (error) return errorResponse(res, 'Lỗi xóa bài tập', error);
    return successResponse(res, null, 'Xóa bài tập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const getSubmissions = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('assignment_submissions').select('*, students(full_name, phone_number, class_name, classes(class_name))').eq('assignment_id', id),
      () => supabaseAdmin.from('assignment_submissions').select('*, students(full_name, phone_number, class_name)').eq('assignment_id', id)
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy bài nộp', error);
    return successResponse(res, data || [], 'Lấy danh sách bài nộp thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const gradeSubmission = async (req, res) => {
  const { submission_id, grade, feedback } = req.body;
  if (!submission_id) return errorResponse(res, 'Thiếu submission_id');

  try {
    const { data, error } = await supabaseAdmin
      .from('assignment_submissions')
      .update({ grade, feedback, status: 'graded' })
      .eq('submission_id', submission_id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi chấm bài', error);
    await autoNotify('Đã chấm điểm bài tập', `Bài tập của bạn đã được chấm: ${grade} điểm.`, 'student', `student:${data.student_id}`);
    return successResponse(res, data, 'Chấm bài thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateSubmissionFile = async (req, res) => {
  const { id } = req.params;
  const { file_url } = req.body;
  if (!id || !file_url) return errorResponse(res, 'Thiếu thông tin cập nhật bài nộp');
  try {
    const { data, error } = await supabaseAdmin
      .from('assignment_submissions')
      .update({ file_url })
      .eq('submission_id', id)
      .select()
      .single();
    if (error) return errorResponse(res, 'Lỗi cập nhật bài nộp', error);
    await logActivity('admin', req.user?.id, 'UPDATE', 'assignment_submissions', `Cập nhật link bài nộp ID: ${id}`);
    await autoNotify('Admin đã sửa bài nộp', `Admin vừa cập nhật link bài nộp của bạn.`, 'student', `student:${data.student_id}`);
    return successResponse(res, data, 'Cập nhật bài nộp thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const getAllAssignmentGrades = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('assignment_submissions').select('*, assignments(title), students(full_name, phone_number, class_name, classes(class_name))').not('grade', 'is', null),
      () => supabaseAdmin.from('assignment_submissions').select('*, assignments(title), students(full_name, phone_number, class_name)').not('grade', 'is', null)
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy điểm bài tập', error);
    return successResponse(res, data || [], 'Thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

// ==========================================
// 6. QUẢN LÝ HỌC PHÍ (Tuition)
// ==========================================
export const getTuitions = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name, classes(class_name))'),
      () => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name)')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy danh sách học phí', error);
    return successResponse(res, data || [], 'Lấy danh sách học phí thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createTuition = async (req, res) => {
  const { student_id, title, amount, due_date } = req.body;
  if (!student_id || !title || !amount || !due_date) {
    return errorResponse(res, 'Thiếu thông tin khoản học phí');
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('tuition_fees')
      .insert({ student_id, title, amount: Number(amount), due_date, status: 'unpaid' })
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi tạo khoản thu', error);
    await logActivity('admin', req.user?.id, 'CREATE', 'tuition_fees', `Tạo khoản thu mới: ${title}`);
    return successResponse(res, data, 'Tạo khoản thu thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateTuition = async (req, res) => {
  const { id } = req.params;
  const { title, amount, due_date, status } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('tuition_fees')
      .update({ title, amount: Number(amount), due_date, status })
      .eq('fee_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi cập nhật học phí', error);
    return successResponse(res, data, 'Cập nhật thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteTuition = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('tuition_fees').delete().eq('fee_id', id);
    if (error) return errorResponse(res, 'Lỗi xóa khoản học phí', error);
    return successResponse(res, null, 'Xóa thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteMultipleTuitions = async (req, res) => {
  const { fee_ids } = req.body;
  if (!Array.isArray(fee_ids) || fee_ids.length === 0) {
    return errorResponse(res, 'Danh sách xóa rỗng');
  }

  try {
    const { error } = await supabaseAdmin.from('tuition_fees').delete().in('fee_id', fee_ids);
    if (error) return errorResponse(res, 'Lỗi xóa danh sách học phí', error);
    await logActivity('admin', req.user?.id, 'DELETE', 'tuition_fees', `Xóa hàng loạt ${fee_ids.length} khoản học phí`);
    return successResponse(res, null, 'Xóa thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const assignClassTuition = async (req, res) => {
  const { class_id, class_name, title, amount, due_date } = req.body;
  if ((!class_id && !class_name) || !title || !amount || !due_date) {
    return errorResponse(res, 'Thiếu thông tin gán học phí theo lớp');
  }

  try {
    let students = [];
    if (class_id) {
      const { data } = await supabaseAdmin.from('students').select('student_id').eq('class_id', class_id);
      students = data || [];
    }
    if (students.length === 0 && class_name) {
      const { data } = await supabaseAdmin.from('students').select('student_id').eq('class_name', class_name);
      students = data || [];
    }

    if (students.length === 0) return errorResponse(res, 'Không tìm thấy học sinh nào trong lớp này');

    const feesToInsert = students.map(s => ({
      student_id: s.student_id,
      title,
      amount: Number(amount),
      due_date,
      status: 'unpaid'
    }));

    const { error } = await supabaseAdmin.from('tuition_fees').insert(feesToInsert);
    if (error) return errorResponse(res, 'Lỗi giao học phí cho lớp', error);

    await logActivity('admin', req.user?.id, 'CREATE', 'tuition_fees', `Gán khoản học phí "${title}" cho ${students.length} học sinh`);
    return successResponse(res, { count: students.length }, `Đã gán học phí thành công cho ${students.length} học sinh`);
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const assignAdvancedTuition = async (req, res) => {
  const { assign_mode, student_id, class_name, subject_configs, start_date, split_by_month, custom_title } = req.body;

  let configs = [];
  if (Array.isArray(subject_configs)) {
    configs = subject_configs;
  } else if (typeof subject_configs === 'object' && subject_configs !== null) {
    configs = Object.entries(subject_configs)
      .filter(([name, cfg]) => cfg.active)
      .map(([name, cfg]) => ({
        subject_name: name,
        months_count: parseInt(cfg.months_count || 1),
        monthly_amount: parseFloat(cfg.monthly_amount || 0)
      }));
  }

  if (configs.length === 0) {
    return errorResponse(res, 'Vui lòng chọn ít nhất một môn học (Toán, Lý hoặc Hóa)');
  }

  try {
    let targetStudents = [];
    if (assign_mode === 'class') {
      const { data } = await supabaseAdmin.from('students').select('student_id, full_name, class_name, enrolled_subjects');
      targetStudents = (data || []).filter(s => s.class_name === class_name);
      
      // Validate that all students in the class are actually enrolled in the subjects being assigned
      for (const student of targetStudents) {
        const enrolled = student.enrolled_subjects || [];
        for (const cfg of configs) {
          const isEnrolled = enrolled.some(e => String(e).toLowerCase().includes(cfg.subject_name.toLowerCase()));
          if (!isEnrolled) {
            return errorResponse(res, `Học sinh ${student.full_name} có môn học/học phí khác (không học ${cfg.subject_name}). Vui lòng kiểm tra lại!`);
          }
        }
      }
    } else {
      if (!student_id) return errorResponse(res, 'Vui lòng chọn học sinh');
      const { data: st } = await supabaseAdmin.from('students').select('student_id, full_name, class_name, enrolled_subjects').eq('student_id', student_id).single();
      targetStudents = [st || { student_id }];
    }

    if (targetStudents.length === 0) {
      return errorResponse(res, 'Không tìm thấy học sinh nào trong phạm vi được chọn');
    }

    const startDateObj = start_date ? new Date(start_date) : new Date();
    const batchTuitions = [];

    for (const student of targetStudents) {
      for (const cfg of configs) {
        const subjectName = cfg.subject_name;
        const numMonths = Math.max(1, parseInt(cfg.months_count || 1));
        const pricePerMonth = parseFloat(cfg.monthly_amount || 0);

        if (pricePerMonth <= 0) continue;

        if (split_by_month) {
          // Tạo từng khoản nợ theo tháng
          for (let m = 0; m < numMonths; m++) {
            const dueDate = new Date(startDateObj);
            dueDate.setMonth(dueDate.getMonth() + m);
            const monthStr = `${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`;

            batchTuitions.push({
              student_id: student.student_id,
              title: custom_title ? `${custom_title} - ${subjectName} (T${monthStr})` : `Học phí Môn ${subjectName} - Tháng ${monthStr}`,
              amount: pricePerMonth,
              due_date: dueDate.toISOString().split('T')[0],
              status: 'unpaid'
            });
          }
        } else {
          // Gộp N tháng thành 1 gói duy nhất
          const endDateObj = new Date(startDateObj);
          endDateObj.setMonth(endDateObj.getMonth() + numMonths - 1);
          const startStr = `${startDateObj.getMonth() + 1}/${startDateObj.getFullYear()}`;
          const endStr = `${endDateObj.getMonth() + 1}/${endDateObj.getFullYear()}`;

          batchTuitions.push({
            student_id: student.student_id,
            title: custom_title ? `${custom_title} - ${subjectName}` : `Học phí Môn ${subjectName} (Gói ${numMonths} tháng: T${startStr} - T${endStr})`,
            amount: pricePerMonth * numMonths,
            due_date: startDateObj.toISOString().split('T')[0],
            status: 'unpaid'
          });
        }
      }
    }

    const { error } = await supabaseAdmin.from('tuition_fees').insert(batchTuitions);
    if (error) return errorResponse(res, 'Lỗi lưu khoản học phí', error);

    const subjectNames = configs.map(c => c.subject_name).join(', ');
    await logActivity('admin', req.user?.id, 'CREATE', 'tuition_fees', `Gán học phí linh hoạt cho ${targetStudents.length} học sinh (${subjectNames})`);
    return successResponse(res, { count: batchTuitions.length }, `Đã gán học phí thành công! Tạo mới ${batchTuitions.length} khoản thu.`);
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống gán học phí', error, 500);
  }
};

export const payManual = async (req, res) => {
  const { fee_id } = req.body;
  if (!fee_id) return errorResponse(res, 'Thiếu fee_id');

  try {
    const { data: fee, error: feeErr } = await supabaseAdmin.from('tuition_fees').select('*').eq('fee_id', fee_id).single();
    if (feeErr || !fee) return errorResponse(res, 'Không tìm thấy khoản phí', feeErr);

    await supabaseAdmin.from('tuition_fees').update({ status: 'paid' }).eq('fee_id', fee_id);

    await supabaseAdmin.from('payment_history').insert({
      student_id: fee.student_id,
      fee_id: fee.fee_id,
      amount: fee.amount,
      payment_method: 'cash',
      status: 'success',
      paid_at: new Date().toISOString()
    });

    await logActivity('admin', req.user?.id, 'PAYMENT', 'tuition_fees', `Xác nhận thanh toán tiền mặt cho khoản phí: ${fee.title}`);
    return successResponse(res, null, 'Xác nhận đã thu tiền thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const unpayManual = async (req, res) => {
  const { fee_id } = req.body;
  try {
    await supabaseAdmin.from('tuition_fees').update({ status: 'unpaid' }).eq('fee_id', fee_id);
    await supabaseAdmin.from('payment_history').delete().eq('fee_id', fee_id);
    return successResponse(res, null, 'Đã chuyển về trạng thái chưa thanh toán');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

// ==========================================
// 7. QUẢN LÝ THỜI KHÓA BIỂU & ĐIỂM DANH (Schedules)
// ==========================================
export const getSchedules = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('schedules').select('*, classes(class_name), subjects(subject_name, subject_code)'),
      () => supabaseAdmin.from('schedules').select('*')
    );

    if (error && error.code !== '42703') return errorResponse(res, 'Lỗi lấy lịch học', error);
    return successResponse(res, data || [], 'Tải thời khóa biểu thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createSchedule = async (req, res) => {
  const { class_id, subject_id, subject_name, room_name, study_date, start_time, end_time, target_type, target_id } = req.body;
  if (!study_date || !start_time || !end_time) {
    return errorResponse(res, 'Thiếu thông tin thời gian tạo lịch học');
  }

  try {
    const payload = {
      room_name: room_name || 'Phòng học',
      study_date,
      start_time,
      end_time,
      subject_name: subject_name || 'Môn chung',
      target_type: target_type || 'class',
      target_id: target_id || ''
    };
    if (class_id) payload.class_id = class_id;
    if (subject_id) payload.subject_id = subject_id;

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert(payload)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi tạo lịch học', error);
    await logActivity('admin', req.user?.id, 'CREATE', 'schedules', `Tạo buổi học ngày ${study_date}`);
    
    await autoNotify('Lịch học mới', `Lịch học mới: ${payload.subject_name || 'Môn chung'} vào ngày ${new Date(study_date).toLocaleDateString('vi-VN')}.`, payload.target_type, payload.target_id);
    
    return successResponse(res, data, 'Tạo buổi học thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createScheduleBatch = async (req, res) => {
  const { schedules, class_id, subject_id } = req.body;
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return errorResponse(res, 'Danh sách lịch học rỗng');
  }

  try {
    const batch = schedules.map(s => ({
      ...s,
      class_id: s.class_id || class_id || null,
      subject_id: s.subject_id || subject_id || null
    }));

    const { error } = await supabaseAdmin.from('schedules').insert(batch);
    if (error) return errorResponse(res, 'Lỗi tạo lịch hàng loạt', error);

    await logActivity('admin', req.user?.id, 'CREATE', 'schedules', `Tạo hàng loạt ${batch.length} buổi học`);
    return successResponse(res, { count: batch.length }, `Tạo thành công ${batch.length} buổi học`);
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { room_name, study_date, start_time, end_time, subject_name } = req.body;

  try {
    const updateObj = { room_name, study_date, start_time, end_time };
    if (subject_name) updateObj.subject_name = subject_name;

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .update(updateObj)
      .eq('schedule_id', id)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi cập nhật lịch học', error);
    await autoNotify('Cập nhật lịch học', `Lịch học ngày ${new Date(data.study_date).toLocaleDateString('vi-VN')} đã được cập nhật.`, data.target_type, data.target_id);
    return successResponse(res, data, 'Cập nhật thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.from('schedules').delete().eq('schedule_id', id);
    if (error) return errorResponse(res, 'Lỗi xóa buổi học', error);
    return successResponse(res, null, 'Xóa thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const getScheduleAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: schedule } = await supabaseAdmin.from('schedules').select('*').eq('schedule_id', id).single();
    if (!schedule) return errorResponse(res, 'Không tìm thấy lịch học');

    const { data: allStudents } = await supabaseAdmin.from('students').select('*');
    let students = [];

    if (schedule.target_type === 'class') {
      const classes = schedule.target_id ? schedule.target_id.split(',').filter(Boolean) : [];
      students = (allStudents || []).filter(s => classes.includes(s.class_name));
    } else if (schedule.target_type === 'student_phone') {
      const phones = schedule.target_id ? schedule.target_id.split(',').filter(Boolean) : [];
      students = (allStudents || []).filter(s => phones.includes(s.phone_number));
    } else if (schedule.target_type === 'student_name') {
      const names = schedule.target_id ? schedule.target_id.split(',').filter(Boolean) : [];
      students = (allStudents || []).filter(s => names.includes(s.full_name));
    } else if (schedule.target_type === 'mixed') {
      let mixedData = { classes: [], phones: [], names: [] };
      try {
        mixedData = JSON.parse(schedule.target_id);
      } catch(e) {}
      students = (allStudents || []).filter(s => 
        (mixedData.classes && mixedData.classes.includes(s.class_name)) ||
        (mixedData.phones && mixedData.phones.includes(s.phone_number)) ||
        (mixedData.names && mixedData.names.includes(s.full_name))
      );
    } else if (schedule.class_id) {
      // Fallback cho data cũ
      students = (allStudents || []).filter(s => s.class_name === schedule.class_id);
    } else {
      students = allStudents || [];
    }

    const { data: attendances } = await supabaseAdmin.from('attendances').select('*').eq('schedule_id', id);
    const attMap = new Map((attendances || []).map(a => [a.student_id, a]));

    const result = students.map(s => ({
      student_id: s.student_id,
      full_name: s.full_name,
      phone_number: s.phone_number,
      is_present: attMap.get(s.student_id)?.is_present || false,
      note: attMap.get(s.student_id)?.note || ''
    }));

    return successResponse(res, { schedule, students: result }, 'Tải dữ liệu điểm danh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const saveScheduleAttendance = async (req, res) => {
  const { id } = req.params;
  const { attendances } = req.body;

  if (!Array.isArray(attendances)) return errorResponse(res, 'Dữ liệu điểm danh không hợp lệ');

  try {
    for (const item of attendances) {
      const { student_id, is_present, note } = item;
      const { data: existing } = await supabaseAdmin.from('attendances').select('attendance_id').eq('schedule_id', id).eq('student_id', student_id).maybeSingle();

      if (existing) {
        await supabaseAdmin.from('attendances').update({ is_present, note }).eq('attendance_id', existing.attendance_id);
      } else {
        await supabaseAdmin.from('attendances').insert({ schedule_id: id, student_id, is_present, note });
      }
    }

    await logActivity('admin', req.user?.id, 'UPDATE', 'attendances', `Lưu dữ liệu điểm danh buổi học ID: ${id}`);
    return successResponse(res, null, 'Lưu điểm danh thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi lưu điểm danh', error, 500);
  }
};

// ==========================================
// 8. THÔNG BÁO & LOGS & THỐNG KÊ
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications').select('*');
    if (error && error.code !== '42P01') return errorResponse(res, 'Lỗi tải thông báo', error);
    return successResponse(res, data || [], 'Lấy danh sách thông báo thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const createNotification = async (req, res) => {
  const { title, message, is_global, target_type, target_id, class_id, student_id } = req.body;
  if (!title || !message) return errorResponse(res, 'Tiêu đề và nội dung thông báo bắt buộc');

  try {
    const payload = { title, message, is_global: !!is_global };
    if (target_type) payload.target_type = target_type;
    if (target_id) payload.target_id = target_id;

    const { data: notif, error } = await supabaseAdmin
      .from('notifications')
      .insert(payload)
      .select()
      .single();

    if (error) return errorResponse(res, 'Lỗi tạo thông báo', error);

    await logActivity('admin', req.user?.id, 'CREATE', 'notifications', `Tạo thông báo: ${title}`);
    return successResponse(res, notif, 'Tạo thông báo thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { data, error } = await safeQuery(
      () => supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
      () => supabaseAdmin.from('activity_logs').select('*').limit(100)
    );
    if (error && error.code !== '42P01') return errorResponse(res, 'Lỗi tải nhật ký hoạt động', error);
    return successResponse(res, data || [], 'Lấy nhật ký thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const getStats = async (req, res) => {
  try {
    const [studentsRes, classesRes, feesRes, paidFeesRes, submissionsRes, gradesRes] = await Promise.all([
      supabaseAdmin.from('students').select('student_id', { count: 'exact' }),
      supabaseAdmin.from('classes').select('class_id', { count: 'exact' }).then(r => r).catch(() => ({ count: 0 })),
      supabaseAdmin.from('tuition_fees').select('amount, status'),
      supabaseAdmin.from('tuition_fees').select('amount').eq('status', 'paid'),
      supabaseAdmin.from('assignment_submissions').select('status, grade').then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('grades').select('score_summary, summary_grade').then(r => r).catch(() => ({ data: [] }))
    ]);

    const totalStudents = studentsRes.count || (studentsRes.data || []).length || 0;
    const totalClasses = classesRes.count || 0;
    const allFees = feesRes.data || [];
    const paidFees = paidFeesRes.data || [];

    const paidAmount = paidFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalAmount = allFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const unpaidFeesCount = allFees.filter(f => f.status === 'unpaid').length;
    const tuitionRate = totalAmount > 0 ? Number(((paidAmount / totalAmount) * 100).toFixed(1)) : 100;

    const subs = submissionsRes.data || [];
    const totalSubmissions = subs.length;
    const gradedSubmissions = subs.filter(s => s.status === 'graded').length;
    const pendingGrading = subs.filter(s => s.status === 'submitted').length;
    const lateSubmissions = subs.filter(s => s.status === 'late').length;

    const gradesList = (gradesRes.data || []).map(g => Number(g.score_summary ?? g.summary_grade)).filter(s => !isNaN(s));
    const averageGPA = gradesList.length > 0 ? Number((gradesList.reduce((a, b) => a + b, 0) / gradesList.length).toFixed(2)) : 0;

    return successResponse(res, {
      totalStudents,
      totalClasses,
      paidAmount,
      unpaidAmount,
      unpaidFeesCount,
      tuitionRate,
      pendingGrading,
      gradedSubmissions,
      totalSubmissions,
      lateSubmissions,
      averageGPA
    }, 'Lấy dữ liệu thống kê thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi thống kê', error, 500);
  }
};

// ==========================================
// 9. TEMPLATES EXCEL DOWNLOAD
// ==========================================
export const downloadStudentTemplate = (req, res) => {
  const sampleData = [
    { 'Họ và tên': 'Nguyễn Văn A', 'Lớp': '12A1', 'SĐT Học Sinh': '0912345678', 'Tên Phụ Huynh': 'Nguyễn Văn B', 'SĐT Phụ Huynh': '0987654321' }
  ];
  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Template_HocSinh');
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=mau_import_hoc_sinh.xlsx');
  return res.send(buffer);
};

export const downloadGradeTemplate = (req, res) => {
  const sampleData = [
    { 'SĐT Học Sinh': '0912345678', 'Môn Học': 'Toán', 'Điểm 15P': 8.5, 'Điểm 45P': 9.0, 'Điểm Giữa Kỳ': 8.0, 'Điểm Cuối Kỳ': 9.5 }
  ];
  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Template_Diem');
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=mau_import_diem.xlsx');
  return res.send(buffer);
};
