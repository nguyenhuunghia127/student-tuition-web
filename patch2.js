import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. UPDATE ROUTES
const adminRoutesFile = path.join(__dirname, 'backend', 'routes', 'adminRoutes.js');
let adminRoutesContent = fs.readFileSync(adminRoutesFile, 'utf8');
if (!adminRoutesContent.includes('/leave-requests')) {
  adminRoutesContent = adminRoutesContent.replace(
    `export default router;`,
    `// Leave Requests\nrouter.get('/leave-requests', adminController.getAllLeaveRequests);\nrouter.put('/leave-requests/:id/status', adminController.updateLeaveStatus);\n\nexport default router;`
  );
  fs.writeFileSync(adminRoutesFile, adminRoutesContent);
}

const studentRoutesFile = path.join(__dirname, 'backend', 'routes', 'studentRoutes.js');
let studentRoutesContent = fs.readFileSync(studentRoutesFile, 'utf8');
if (!studentRoutesContent.includes('/leave-requests')) {
  studentRoutesContent = studentRoutesContent.replace(
    `export default router;`,
    `// Leave Requests\nrouter.get('/leave-requests', studentController.getLeaveRequests);\nrouter.post('/leave-requests', studentController.submitLeaveRequest);\n\nexport default router;`
  );
  fs.writeFileSync(studentRoutesFile, studentRoutesContent);
}

// 2. UPDATE ADMIN CONTROLLER
const adminControllerFile = path.join(__dirname, 'backend', 'controllers', 'adminController.js');
let adminContent = fs.readFileSync(adminControllerFile, 'utf8');

// Modify getStats
const getStatsOld = `const paidAmount = paidFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalAmount = allFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);`;

const getStatsNew = `const paidAmount = paidFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalAmount = allFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

    // Tính toán doanh thu theo tháng cho Chart
    const monthlyRevenue = {};
    paidFees.forEach(fee => {
      const month = new Date(fee.paid_at || new Date()).getMonth() + 1;
      const year = new Date(fee.paid_at || new Date()).getFullYear();
      const label = \`Tháng \${month}/\${year}\`;
      monthlyRevenue[label] = (monthlyRevenue[label] || 0) + Number(fee.amount || 0);
    });
    const revenueChartData = Object.keys(monthlyRevenue).map(key => ({
      name: key,
      revenue: monthlyRevenue[key]
    }));`;

adminContent = adminContent.replace(getStatsOld, getStatsNew);
adminContent = adminContent.replace(
  `averageGPA\n    }, 'Lấy dữ liệu thống kê thành công');`,
  `averageGPA,\n      revenueChartData\n    }, 'Lấy dữ liệu thống kê thành công');`
);

// Add Leave Request Methods
const adminLeaveRequests = `
// ==========================================
// 10. LEAVE REQUESTS (ADMIN)
// ==========================================
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leave_requests').select('*, students(full_name, class_name, classes(class_name))').order('created_at', { ascending: false }).limit(1000);
    if (error) return errorResponse(res, 'Lỗi lấy danh sách nghỉ phép', error);
    return successResponse(res, data || [], 'Thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { data, error } = await supabaseAdmin.from('leave_requests').update({ status }).eq('request_id', id).select().single();
    if (error) return errorResponse(res, 'Lỗi cập nhật', error);
    
    // Gửi thông báo cho học sinh
    await supabaseAdmin.from('notifications').insert({
      title: 'Kết quả Đơn xin phép',
      message: \`Đơn xin phép nghỉ của bạn đã bị \${status === 'approved' ? 'chấp thuận' : 'từ chối'}\`,
      target_type: 'student',
      target_id: \`student:\${data.student_id}\`,
      is_global: false
    });
    
    return successResponse(res, data, 'Cập nhật thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};
`;
if (!adminContent.includes('getAllLeaveRequests')) {
  adminContent += adminLeaveRequests;
}
fs.writeFileSync(adminControllerFile, adminContent);

// 3. UPDATE STUDENT CONTROLLER
const studentControllerFile = path.join(__dirname, 'backend', 'controllers', 'studentController.js');
let studentContent = fs.readFileSync(studentControllerFile, 'utf8');

// Modify getDashboard
const getDashboardOld1 = `supabaseAdmin.from('attendances').select('*, schedules(title, study_date, class_name, subject_name)').eq('student_id', student_id).then(r => r).catch(() => ({ data: [] }))
    ]);`;

const getDashboardNew1 = `supabaseAdmin.from('attendances').select('*, schedules(title, study_date, class_name, subject_name)').eq('student_id', student_id).then(r => r).catch(() => ({ data: [] })),
      supabaseAdmin.from('leave_requests').select('*').eq('student_id', student_id).order('created_at', { ascending: false }).then(r => r).catch(() => ({ data: [] }))
    ]);`;

const getDashboardOld2 = `const [
      feesRes, paymentsRes, schedulesRes, gradesRes,
      assignmentsRes, submissionsRes, notifsRes, appealsRes, docsRes, attendancesRes
    ] = await Promise.all([`;

const getDashboardNew2 = `const [
      feesRes, paymentsRes, schedulesRes, gradesRes,
      assignmentsRes, submissionsRes, notifsRes, appealsRes, docsRes, attendancesRes, leavesRes
    ] = await Promise.all([`;

studentContent = studentContent.replace(getDashboardOld1, getDashboardNew1);
studentContent = studentContent.replace(getDashboardOld2, getDashboardNew2);
studentContent = studentContent.replace(
  `attendances: attendancesRes.data || []\n    }, 'Tải thông tin dashboard cá nhân thành công');`,
  `attendances: attendancesRes.data || [],\n      leaveRequests: leavesRes.data || []\n    }, 'Tải thông tin dashboard cá nhân thành công');`
);

// Add Leave Request Methods
const studentLeaveRequests = `
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
    return successResponse(res, data, 'Nộp đơn xin phép thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống', error, 500);
  }
};
`;
if (!studentContent.includes('submitLeaveRequest')) {
  studentContent += studentLeaveRequests;
}
fs.writeFileSync(studentControllerFile, studentContent);

console.log('Controllers and Routes patched successfully!');
