import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, BookOpen, Calendar, DollarSign, Award, Bell, 
  LogOut, Upload, CheckCircle2, AlertTriangle, Clock, 
  CreditCard, ExternalLink, Shield, User, Loader2, RefreshCw,
  Sun, Moon, Menu, X, FileText, Users, CheckSquare, Edit3, Trash2, ArrowLeft, Inbox, Phone, Download, Settings, Plus, ChevronRight, Save, ShieldCheck, Mail, ArrowRight, LayoutGrid, MessageSquare
} from 'lucide-react'
import { API_URL } from '../config.js'
import { supabase } from '../supabase.js'
import { generateInvoice } from '../utils/pdfGenerator';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import WeeklyCalendar from '../components/WeeklyCalendar.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import AdminDocuments from '../components/AdminDocuments.jsx'
import RevenueChart from '../components/RevenueChart.jsx'
import AdminLeaveRequests from '../components/AdminLeaveRequests.jsx'

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null)
  const [activeSubTab, setActiveSubTab] = useState('stats')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalStudents: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    unpaidFeesCount: 0,
    tuitionRate: 0,
    lateSubmissions: 0,
    pendingGrading: 0,
    gradedSubmissions: 0,
    totalSubmissions: 0,
    averageGPA: 0,
    revenueChartData: []
  })
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [tuitionFees, setTuitionFees] = useState([])
  const [grades, setGrades] = useState([])
  const [assignmentGrades, setAssignmentGrades] = useState([])
  const [activeGradeTab, setActiveGradeTab] = useState('standard')
  const [schedules, setSchedules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifTab, setNotifTab] = useState('inbox')
  const [gradeSettings, setGradeSettings] = useState([])
  const [gradeAppeals, setGradeAppeals] = useState([])

  const [studentForm, setStudentForm] = useState({ id: '', full_name: '', class_name: '', phone_number: '', parent_name: '', parent_phone: '', status: 'active', enrolled_subjects: [], class_ids: [] })
  const [classForm, setClassForm] = useState({ class_id: '', class_name: '', grade_level: '', academic_year: '', subject: '', tuition_fee: '' })
  const [showClassModal, setShowClassModal] = useState(false)
  const [classSearch, setClassSearch] = useState('')
  const [classGradeFilter, setClassGradeFilter] = useState('All')
  const [classYearFilter, setClassYearFilter] = useState('All')
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
  const [managingClass, setManagingClass] = useState(null)
  const [managingTab, setManagingTab] = useState('enrolled')
  const [studentSearchInClass, setStudentSearchInClass] = useState('')
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentClassFilter, setStudentClassFilter] = useState('All')
  const [selectedTuitions, setSelectedTuitions] = useState([])
  const [tuitionPage, setTuitionPage] = useState(1)
  const [tuitionPageSize, setTuitionPageSize] = useState(20)
  
  const [studentPage, setStudentPage] = useState(1)
  const [studentPageSize, setStudentPageSize] = useState(20)
  
  const [gradePage, setGradePage] = useState(1)
  const [gradePageSize, setGradePageSize] = useState(20)
  const [gradeClassFilter, setGradeClassFilter] = useState('All')
  const [gradeSubjectFilter, setGradeSubjectFilter] = useState('All')
  
  const [assignmentGradePage, setAssignmentGradePage] = useState(1)
  const [assignmentGradePageSize, setAssignmentGradePageSize] = useState(20)
  
  const [tuitionForm, setTuitionForm] = useState({
    fee_id: '',
    assign_mode: 'student',
    student_id: '',
    class_name: '',
    subject_configs: {
      'Toán': { active: true, months_count: 4, monthly_amount: 500000 },
      'Lý': { active: false, months_count: 1, monthly_amount: 500000 },
      'Hóa': { active: false, months_count: 1, monthly_amount: 500000 }
    },
    start_date: new Date().toISOString().split('T')[0],
    split_by_month: true,
    custom_title: ''
  })
  const [showTuitionModal, setShowTuitionModal] = useState(false)
  const [tuitionSearch, setTuitionSearch] = useState('')
  const [tuitionView, setTuitionView] = useState('list')
  const [paymentHistory, setPaymentHistory] = useState([])
  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentClassFilter, setPaymentClassFilter] = useState('All')
  const [paymentStartDate, setPaymentStartDate] = useState('')
  const [paymentEndDate, setPaymentEndDate] = useState('')
  const [paymentPage, setPaymentPage] = useState(1)
  const paymentPageSize = 20
  const [tuitionClassFilter, setTuitionClassFilter] = useState('All')
  const [tuitionMonthFilter, setTuitionMonthFilter] = useState('All')
  const [tuitionStatusFilter, setTuitionStatusFilter] = useState('All')
  const [studentPickerQuery, setStudentPickerQuery] = useState('')
  const [showStudentPicker, setShowStudentPicker] = useState(false)

  const [gradeForm, setGradeForm] = useState({ student_id: '', subject_name: '', grade_15m: '', grade_45m: '', midterm_grade: '', final_grade: '' })
  const [showGradeModal, setShowGradeModal] = useState(false)
  
  const [showGradeSettingsModal, setShowGradeSettingsModal] = useState(false)
  const [gradeSettingsForm, setGradeSettingsForm] = useState({ subject_name: '', weight_15m: 1, weight_45m: 2, weight_mid: 2, weight_final: 3 })

  const [scheduleForm, setScheduleForm] = useState({ schedule_id: '', subject_name: '', start_time: '08:00', end_time: '11:30', room_name: '', study_date: new Date().toISOString().split('T')[0], target_type: 'mixed', target_id: JSON.stringify({classes: [], phones: [], names: []}) })
  const [scheduleRepeatWeekly, setScheduleRepeatWeekly] = useState(false)
  const [scheduleRepeatUntil, setScheduleRepeatUntil] = useState('')
  const [weeklySessions, setWeeklySessions] = useState([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleSubjectFilter, setScheduleSubjectFilter] = useState('All')
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceSchedule, setAttendanceSchedule] = useState(null)
  const [attendances, setAttendances] = useState([])

  const [assignmentForm, setAssignmentForm] = useState({ assignment_id: '', title: '', description: '', target_type: 'class', target_id: '', deadline: '', file_url: '', submission_folder_url: '', attached_documents: [] })
  // const [assignmentFile, setAssignmentFile] = useState(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [repoDocuments, setRepoDocuments] = useState([])
  const [docSearchText, setDocSearchText] = useState('')

  const [notifForm, setNotifForm] = useState({ title: '', message: '', target_type: 'global', target_id: '' })

  const [selectedAssignForGrading, setSelectedAssignForGrading] = useState(null)
  const [gradingPayload, setGradingPayload] = useState({ submission_id: '', grade: '', feedback: '', subject_name: '' })
  const [editSubmissionPayload, setEditSubmissionPayload] = useState({ submission_id: '', file_url: '' })

  const fileInputRef = useRef(null)

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session')
    if (!adminSession) {
      navigate('/admin/login')
      return
    }
    const session = JSON.parse(adminSession)
    setAdminUser(session.user)

    // Tự động gắn Token vào mọi request API
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      init = init || {};
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${session.token}`
      };
      
      const response = await originalFetch(input, init);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_session');
        window.location.href = '/admin/login';
      }
      return response;
    };

    fetchAllAdminData()

    // Lắng nghe Realtime từ Supabase
    const adminChannel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table;
        if (table === 'notifications' || table === 'activity_logs') fetchNotifications();
        else if (table === 'tuition_fees') fetchTuition();
        else if (table === 'grades') fetchGrades();
        else if (table === 'schedules') fetchSchedules();
        else if (table === 'students' || table === 'users') fetchStudents();
        else if (table === 'classes') fetchClasses();
        else if (table === 'assignments' || table === 'assignment_submissions') {
          fetchAssignments();
          fetchAssignmentGrades();
        }
        else if (table === 'documents' || table === 'document_categories' || table === 'assignment_documents') fetchRepoDocuments();
      })
      .subscribe();

    return () => {
      window.fetch = originalFetch; // Khôi phục fetch cũ khi rời trang
      supabase.removeChannel(adminChannel);
    };
  }, [navigate])

  useEffect(() => {
    setTuitionPage(1);
  }, [tuitionSearch, tuitionClassFilter, tuitionMonthFilter, tuitionStatusFilter]);

  useEffect(() => {
    setGradePage(1)
  }, [gradeClassFilter, gradeSubjectFilter])

  useEffect(() => {
    setStudentPage(1);
  }, [studentSearch, studentClassFilter]);

  useEffect(() => {
    if (showAssignmentModal) {
      fetchRepoDocuments();
    }
  }, [showAssignmentModal]);

  async function fetchAllAdminData() {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchClasses(),
        fetchStudents(),
        fetchTuition(),
        fetchPaymentHistory(),
        fetchGrades(),
        fetchAssignmentGrades(),
        fetchGradeSettings(),
        fetchGradeAppeals(),
        fetchSchedules(),
        fetchAssignments(),
        fetchNotifications(),
        fetchRepoDocuments()
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const [notifRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/notifications`),
        fetch(`${API_URL}/api/admin/logs`)
      ]);
      const notifData = await notifRes.json();
      const logsData = await logsRes.json();
      
      let combined = [];
      if (notifData.success) {
        combined = [...notifData.data];
      }
      if (logsData.success) {
        const formattedLogs = logsData.data.map(log => ({
          notification_id: log.log_id,
          title: log.action_type === 'LOGIN' ? 'Hệ thống: Đăng nhập' : `Hoạt động hệ thống (${log.action_type})`,
          message: log.description,
          target_type: 'system',
          created_at: log.created_at,
          type: 'system'
        }));
        combined = [...combined, ...formattedLogs];
      }
      
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(combined);
    } catch (error) {
      console.error('Lỗi tải thông báo & logs:', error);
    }
  }

  const [alertFilter, setAlertFilter] = useState('all');
  
  const alerts = useMemo(() => {
    const generatedAlerts = [];
    
    // 1. Tuition Alerts
    tuitionFees.forEach(fee => {
      if (fee.status === 'unpaid' || fee.status === 'partial') {
        const isLate = new Date(fee.due_date) < new Date();
        if (isLate) {
          generatedAlerts.push({
            id: `tuition-${fee.fee_id}`,
            type: 'tuition',
            severity: 'high',
            title: 'Quá hạn học phí',
            message: `Học sinh ${fee.full_name || 'Không rõ'} chưa thanh toán đủ học phí. Số tiền còn thiếu: ${(fee.amount - (fee.paid_amount || 0)).toLocaleString('vi-VN')} đ`,
            date: fee.due_date,
            action: 'Xem học phí',
            targetTab: 'tuition',
            icon: DollarSign
          });
        }
      }
    });

    // 2. Grade Alerts (Average GPA < 5.0)
    const studentGrades = {};
    grades.forEach(g => {
      if (!studentGrades[g.student_id]) studentGrades[g.student_id] = { total: 0, count: 0, name: g.full_name };
      studentGrades[g.student_id].total += parseFloat(g.score);
      studentGrades[g.student_id].count += 1;
    });
    
    Object.keys(studentGrades).forEach(studentId => {
      const avg = studentGrades[studentId].total / studentGrades[studentId].count;
      if (avg < 5.0) {
        generatedAlerts.push({
          id: `grade-${studentId}`,
          type: 'academic',
          severity: 'medium',
          title: 'Kết quả học tập thấp',
          message: `Học sinh ${studentGrades[studentId].name} có GPA hiện tại là ${avg.toFixed(1)}, dưới mức tiêu chuẩn (5.0).`,
          date: new Date().toISOString(),
          action: 'Xem bảng điểm',
          targetTab: 'grades',
          icon: Award
        });
      }
    });

    // 3. Assignment Alerts (Pending grading)
    assignments.forEach(a => {
      if (a.pending_grading > 0) {
        generatedAlerts.push({
          id: `assign-${a.assignment_id}`,
          type: 'assignment',
          severity: 'low',
          title: 'Bài tập chờ chấm',
          message: `Bài tập "${a.title}" có ${a.pending_grading} bài nộp cần được chấm điểm.`,
          date: a.due_date || new Date().toISOString(),
          action: 'Chấm điểm ngay',
          targetTab: 'assignments',
          icon: BookOpen
        });
      }
    });

    return generatedAlerts.sort((a, b) => {
      const severityScore = { high: 3, medium: 2, low: 1 };
      if (severityScore[a.severity] !== severityScore[b.severity]) {
        return severityScore[b.severity] - severityScore[a.severity];
      }
      return new Date(b.date) - new Date(a.date);
    });
  }, [tuitionFees, grades, assignments]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`)
      const data = await res.json()
      if (data.success && data.data) {
        setStats(prev => ({ ...prev, ...data.data }))
      }
    } catch (err) {
      console.error('Lỗi fetchStats:', err)
    }
  }

  const fetchClasses = async () => {
    const res = await fetch(`${API_URL}/api/admin/classes`)
    const data = await res.json()
    if (data.success) setClasses(data.data)
  }

  const fetchStudents = async () => {
    const res = await fetch(`${API_URL}/api/admin/students`)
    const data = await res.json()
    if (data.success) setStudents(data.data)
  }

  const fetchTuition = async () => {
    const res = await fetch(`${API_URL}/api/admin/tuition`)
    const data = await res.json()
    if (data.success) setTuitionFees(data.data)
  }

  const fetchPaymentHistory = async () => {
    const res = await fetch(`${API_URL}/api/admin/tuition/payments`)
    const data = await res.json()
    if (data.success) setPaymentHistory(data.data)
  }

  const fetchGrades = async () => {
    const res = await fetch(`${API_URL}/api/admin/grades`)
    const data = await res.json()
    if (data.success) setGrades(data.data)
  }

  const fetchAssignmentGrades = async () => {
    const res = await fetch(`${API_URL}/api/admin/assignments/grades/all`)
    const data = await res.json()
    if (data.success) setAssignmentGrades(data.data)
  }

  const fetchGradeSettings = async () => {
    const res = await fetch(`${API_URL}/api/admin/grade-settings`)
    const data = await res.json()
    if (data.success) setGradeSettings(data.data)
  }

  const fetchGradeAppeals = async () => {
    const res = await fetch(`${API_URL}/api/admin/grade-appeals`)
    const data = await res.json()
    if (data.success) setGradeAppeals(data.data)
  }

  const fetchSchedules = async () => {
    const res = await fetch(`${API_URL}/api/admin/schedules`)
    const data = await res.json()
    if (data.success) setSchedules(data.data)
  }

  const fetchAssignments = async () => {
    const res = await fetch(`${API_URL}/api/admin/assignments`)
    const data = await res.json()
    if (data.success) setAssignments(data.data)
  }

  const fetchRepoDocuments = async () => {
    const res = await fetch(`${API_URL}/api/documents`)
    const data = await res.json()
    if (data) setRepoDocuments(data)
  }

  const fetchSubmissions = async (assignmentId) => {
    const res = await fetch(`${API_URL}/api/admin/assignments/${assignmentId}/submissions`)
    const data = await res.json()
    if (data.success) setSubmissions(data.data)
  }

  const handleAdminLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('admin_session')
    navigate('/admin/login')
  }

  // --- HỌC SINH CRUD ---
  const handleSaveStudent = async (e) => {
    e.preventDefault()
    const method = studentForm.id ? 'PUT' : 'POST'
    const url = studentForm.id 
      ? `${API_URL}/api/admin/students/${studentForm.id}` 
      : `${API_URL}/api/admin/students`

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })
      const resJson = await response.json()
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi lưu học sinh')
      
      setShowStudentModal(false)
      setStudentForm({ id: '', full_name: '', class_name: '', phone_number: '', parent_name: '', parent_phone: '', status: 'active', enrolled_subjects: [] })
      await fetchStudents()
      await fetchStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này?')) return
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchStudents()
        await fetchStats()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- QUẢN LÝ LỚP HỌC HANDLERS ---
  const handleSaveClass = async (e) => {
    e.preventDefault()
    if (classForm.tuition_fee < 0) {
      alert('Học phí không thể là số âm');
      return;
    }

    const isEdit = !!classForm.class_id && !String(classForm.class_id).startsWith('temp_');
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_URL}/api/admin/classes/${classForm.class_id}`
      : `${API_URL}/api/admin/classes`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm)
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi lưu lớp học');
      
      // Tự động gán nợ học phí cho lớp nếu chọn checkbox auto_assign_tuition
      if (classForm.auto_assign_tuition && Number(classForm.tuition_fee) > 0 && classForm.class_name) {
        const activeSubjects = (classForm.subject || 'Toán').split(',').map(s => s.trim()).filter(Boolean);
        const subjectConfigs = {};
        const feePerSubject = Math.round(Number(classForm.tuition_fee) / (activeSubjects.length || 1));
        activeSubjects.forEach(sub => {
          subjectConfigs[sub] = { active: true, months_count: 1, monthly_amount: feePerSubject };
        });

        await fetch(`${API_URL}/api/admin/tuition/assign-advanced`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assign_mode: 'class',
            class_name: classForm.class_name,
            subject_configs: subjectConfigs,
            start_date: new Date().toISOString().split('T')[0],
            split_by_month: true
          })
        });
        await fetchTuition();
      }

      setShowClassModal(false);
      setClassForm({ class_id: '', class_name: '', grade_level: '', academic_year: '', subject: '', tuition_fee: '' });
      await fetchClasses();
      await fetchStudents();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };


  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${className}? Tất cả gán lớp học sinh liên quan có thể bị ảnh hưởng.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/classes/${classId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Xóa lớp học thành công');
        await fetchClasses();
        await fetchStudents();
      } else {
        alert(data.message || 'Không thể xóa lớp học (lớp đang chứa học sinh)');
      }
    } catch (e) {
      alert('Lỗi kết nối khi xóa lớp');
    }
  };

  const handleAssignStudentsToClass = async (classId, studentIds) => {
    if (!studentIds || studentIds.length === 0) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: studentIds })
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi gán học sinh');
      alert(`Đã thêm ${studentIds.length} học sinh vào lớp!`);
      setSelectedStudentsToAssign([]);
      await fetchStudents();
      await fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveStudentFromClass = async (classId, studentId, studentName) => {
    if (!window.confirm(`Xóa học sinh ${studentName} khỏi lớp này?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi xóa học sinh khỏi lớp');
      await fetchStudents();
      await fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportGrades = async () => {
    await handleDownloadAuth(`${API_URL}/api/admin/grades/export`, 'Bang_Diem.xlsx');
  };

  const handleDownloadAuth = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Lỗi tải file');
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveGradeSettings = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/admin/grade-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeSettingsForm)
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi lưu cấu hình');
      setShowGradeSettingsModal(false);
      await fetchGradeSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateAppealStatus = async (appealId, status) => {
    if (!window.confirm(`Xác nhận ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn phúc khảo này?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/grade-appeals/${appealId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchGradeAppeals();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectAllStudents = (e, currentFilteredStudents) => {
    if (e.target.checked) {
      setSelectedStudents(currentFilteredStudents.map(st => st.student_id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(stId => stId !== id) : [...prev, id]
    )
  }

  const handleBulkDeleteStudents = async () => {
    if (selectedStudents.length === 0) return
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStudents.length} học sinh đã chọn? Hành động này không thể hoàn tác!`)) return
    try {
      const response = await fetch(`${API_URL}/api/admin/students/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStudents })
      })
      if (response.ok) {
        setSelectedStudents([])
        await fetchStudents()
        await fetchStats()
      } else {
        const resJson = await response.json()
        alert(resJson.message || 'Lỗi xóa hàng loạt')
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi hệ thống khi xóa hàng loạt')
    }
  }

  const handleSelectAllTuitions = (e, currentFilteredTuitions) => {
    if (e.target.checked) setSelectedTuitions(currentFilteredTuitions.map(f => f.fee_id))
    else setSelectedTuitions([])
  }

  const handleSelectTuition = (id) => {
    setSelectedTuitions(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id])
  }

  const handleBulkDeleteTuitions = async () => {
    if (selectedTuitions.length === 0) return
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedTuitions.length} khoản phí đã chọn? Hành động này không thể hoàn tác!`)) return
    try {
      const response = await fetch(`${API_URL}/api/admin/tuition/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_ids: selectedTuitions })
      })
      if (response.ok) {
        setSelectedTuitions([])
        await fetchTuition()
        await fetchStats()
      } else {
        const resJson = await response.json()
        alert(resJson.message || 'Lỗi xóa hàng loạt')
      }
    } catch (err) {
      alert('Lỗi hệ thống khi xóa hàng loạt')
    }
  }

  const handleImportStudents = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/students/import`, {
        method: 'POST',
        body: formData
      })
      const resJson = await response.json()
      if (resJson.success) {
        alert(resJson.message)
        await fetchStudents()
        await fetchStats()
      } else {
        alert('Lỗi import: ' + resJson.message)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // --- HỌC PHÍ ---
  const handleAssignTuition = async (e) => {
    e.preventDefault()
    try {
      if (tuitionForm.fee_id) {
        // Chỉnh sửa 1 khoản phí đơn lẻ
        const response = await fetch(`${API_URL}/api/admin/tuition/${tuitionForm.fee_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tuitionForm)
        })
        const resJson = await response.json()
        if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi chỉnh sửa học phí')
        alert('Cập nhật khoản học phí thành công!')
      } else {
        // Gán học phí đa môn & đa tháng nâng cao
        const response = await fetch(`${API_URL}/api/admin/tuition/assign-advanced`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tuitionForm)
        })
        const resJson = await response.json()
        if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi gán học phí')
        alert(resJson.message || 'Gán học phí thành công!')
      }

      setShowTuitionModal(false)
      setTuitionForm({
        fee_id: '',
        assign_mode: 'student',
        student_id: '',
        class_name: '',
        subject_configs: {
          'Toán': { active: true, months_count: 4, monthly_amount: 500000 },
          'Lý': { active: false, months_count: 1, monthly_amount: 500000 },
          'Hóa': { active: false, months_count: 1, monthly_amount: 500000 }
        },
        start_date: new Date().toISOString().split('T')[0],
        split_by_month: true,
        custom_title: ''
      })
      await fetchTuition()
      await fetchStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteTuition = async (fee_id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoản học phí này?')) return
    try {
      const response = await fetch(`${API_URL}/api/admin/tuition/${fee_id}`, { method: 'DELETE' })
      const resJson = await response.json()
      if (resJson.success) {
        await fetchTuition()
        await fetchStats()
      } else {
        alert(resJson.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUnpayManual = async (fee_id) => {
    if (!window.confirm('Bạn có chắc muốn đổi khoản này thành Chưa thu?')) return
    try {
      const response = await fetch(`${API_URL}/api/admin/tuition/unpay-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_id })
      })
      const resJson = await response.json()
      if (resJson.success) {
        await fetchTuition()
        await fetchPaymentHistory()
        await fetchStats()
      } else {
        alert(resJson.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePayManual = async (feeId) => {
    if (!window.confirm('Xác nhận học sinh đã đóng tiền mặt?')) return
    try {
      const response = await fetch(`${API_URL}/api/admin/tuition/pay-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_id: feeId })
      })
      const resJson = await response.json()
      if (resJson.success) {
        await fetchTuition()
        await fetchPaymentHistory()
        await fetchStats()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- ĐIỂM SỐ ---
  const handleSaveGrade = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/admin/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeForm)
      })
      const resJson = await response.json()
      if (!response.ok) throw new Error(resJson.message)

      setShowGradeModal(false)
      setGradeForm({ id: '', student_id: '', subject_name: '', grade_15m: '', grade_45m: '', midterm_grade: '', final_grade: '' })
      await fetchGrades()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleImportGrades = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/import`, {
        method: 'POST',
        body: formData
      })
      const resJson = await response.json()
      if (resJson.success) {
        alert(resJson.message)
        await fetchGrades()
      } else {
        alert('Lỗi: ' + resJson.message)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // --- LỊCH HỌC ---
  const handleSaveSchedule = async (e) => {
    e.preventDefault()
    try {
      let mixedTargets = { classes: [], phones: [], names: [] };
      if (scheduleForm.target_id) {
        try { mixedTargets = JSON.parse(scheduleForm.target_id); } catch(e) {}
      }
      if (scheduleForm.target_type !== 'global' && mixedTargets.classes.length === 0 && mixedTargets.phones.length === 0 && mixedTargets.names.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một đối tượng (Lớp/Học sinh)!');
      }
      const isEdit = !!scheduleForm.schedule_id;

      if (!isEdit && scheduleRepeatWeekly && scheduleRepeatUntil) {
        if (weeklySessions.length === 0) throw new Error('Vui lòng thêm ít nhất một buổi học trong tuần!');
        const schedules = [];
        let current = new Date(scheduleForm.study_date);
        const until = new Date(scheduleRepeatUntil);
        
        while (current <= until) {
          const currentDay = current.getDay();
          // Lọc các ca học đã thiết lập cho ngày hiện tại trong tuần
          const sessionsForDay = weeklySessions.filter(s => s.dayOfWeek === currentDay);
          for (const session of sessionsForDay) {
            if (session.start_time >= session.end_time) {
              throw new Error(`Giờ bắt đầu phải nhỏ hơn giờ kết thúc ở ca thứ ${['CN','T2','T3','T4','T5','T6','T7'][currentDay]}`);
            }
            schedules.push({
              subject_name: scheduleForm.subject_name,
              target_type: scheduleForm.target_type,
              target_id: scheduleForm.target_id,
              study_date: current.toISOString().split('T')[0],
              start_time: session.start_time,
              end_time: session.end_time,
              room_name: session.room_name
            });
          }
          current.setDate(current.getDate() + 1);
        }

        if (schedules.length === 0) throw new Error('Khoảng thời gian lặp không hợp lệ hoặc không khớp ngày nào với cấu hình ca học');

        // Gửi batch tạo nhiều lịch
        const response = await fetch(`${API_URL}/api/admin/schedules/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedules })
        });
        const resJson = await response.json();
        if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi tạo lịch hàng loạt');
        alert(`Đã lưu thành công ${schedules.length} buổi học!`);
      } else {
        if (scheduleForm.start_time >= scheduleForm.end_time) {
          throw new Error('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
        }
        const url = isEdit ? `${API_URL}/api/admin/schedules/${scheduleForm.schedule_id}` : `${API_URL}/api/admin/schedules`;
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleForm)
        });
        const resJson = await response.json();
        if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi');
        alert(isEdit ? 'Cập nhật lịch học thành công!' : 'Tạo lịch học thành công!');
      }
      
      setShowScheduleModal(false)
      setScheduleForm({ schedule_id: '', subject_name: '', start_time: '08:00', end_time: '11:30', room_name: '', study_date: new Date().toISOString().split('T')[0], target_type: 'mixed', target_id: JSON.stringify({classes: [], phones: [], names: []}) })
      setScheduleRepeatWeekly(false)
      setScheduleRepeatUntil('')
      setWeeklySessions([])
      await fetchSchedules()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCopyWeek = async (weekScheds) => {
    try {
      const newSchedules = weekScheds.map(sch => {
        const cleanDateStr = String(sch.study_date).split('T')[0];
        const [y, m, d] = cleanDateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setDate(dateObj.getDate() + 7);
        const nextWeekDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        return {
          subject_name: sch.subject_name,
          target_type: sch.target_type,
          target_id: sch.target_id,
          study_date: nextWeekDateStr,
          start_time: sch.start_time,
          end_time: sch.end_time,
          room_name: sch.room_name
        };
      });

      const response = await fetch(`${API_URL}/api/admin/schedules/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: newSchedules })
      });
      const resJson = await response.json();
      if (!response.ok || !resJson.success) throw new Error(resJson.message || 'Lỗi sao chép lịch');
      alert(`Đã sao chép thành công ${newSchedules.length} ca học sang tuần sau!`);
      await fetchSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateScheduleFromDrop = async (updatedSch) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/schedules/${updatedSch.schedule_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSch)
      })
      const resJson = await response.json()
      if (resJson.success) {
        await fetchSchedules()
      } else {
        alert(resJson.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenAttendanceModal = async (sch) => {
    setAttendanceSchedule(sch);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/schedules/${sch.schedule_id}/attendance`);
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message);
      setAttendances(resJson.data);
      setShowAttendanceModal(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/admin/schedules/${attendanceSchedule.schedule_id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances })
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message);
      alert('Lưu điểm danh thành công!');
      setShowAttendanceModal(false);
      // Cập nhật state schedules cục bộ để hiển thị Đã Điểm Danh
      setSchedules(prev => prev.map(s => s.schedule_id === attendanceSchedule.schedule_id ? { ...s, attendances: [{ attendance_id: 'temp' }] } : s));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/schedules/${id}`, { method: 'DELETE' })
      const resJson = await res.json()
      if (!res.ok) throw new Error(resJson.message || 'Lỗi xoá lịch học')
      alert('Đã xóa lịch học thành công!')
      await fetchSchedules()
    } catch (err) {
      alert(err.message)
    }
  }

  // --- BÀI TẬP ---
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!assignmentForm.assignment_id;
      const url = isEdit ? `${API_URL}/api/admin/assignments/${assignmentForm.assignment_id}` : `${API_URL}/api/admin/assignments`;
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm)
      })
      const resJson = await response.json()
      if (!response.ok) throw new Error(resJson.message)

      setShowAssignmentModal(false)
      setAssignmentForm({ assignment_id: '', title: '', description: '', target_type: 'class', target_id: '', deadline: '', file_url: '', submission_folder_url: '', attached_documents: [] })
      await fetchAssignments()
      await fetchStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này? Toàn bộ bài nộp của học sinh cũng sẽ bị xóa.')) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
        method: 'DELETE'
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message);
      
      await fetchAssignments();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitGrading = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/admin/assignments/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradingPayload)
      })
      const resJson = await response.json()
      if (!response.ok) throw new Error(resJson.message)

      alert('Đã chấm thành công!')
      setGradingPayload({ submission_id: '', grade: '', feedback: '', subject_name: '' })
      await fetchSubmissions(selectedAssignForGrading.assignment_id)
      await fetchGrades()
      await fetchStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUpdateSubmissionFile = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/admin/assignments/submissions/${editSubmissionPayload.submission_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: editSubmissionPayload.file_url })
      })
      const resJson = await response.json()
      if (!response.ok) throw new Error(resJson.message)

      alert('Đã cập nhật link bài nộp thành công!')
      setEditSubmissionPayload({ submission_id: '', file_url: '' })
      if (selectedAssignForGrading) {
        await fetchSubmissions(selectedAssignForGrading.assignment_id)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // --- GỬI THÔNG BÁO ---
  const handleSendNotification = async (e) => {
    e.preventDefault()
    try {
      // Nếu chọn theo cá nhân (student_name = chọn theo student_id)
      if (notifForm.target_type === 'student_name' && notifForm.target_id) {
        const studentIds = notifForm.target_id.split(',').filter(Boolean);
        if (studentIds.length === 0) throw new Error('Vui lòng chọn ít nhất một học sinh');
        
        // Gửi từng thông báo riêng cho từng học sinh
        await Promise.all(studentIds.map(student_id => 
          fetch(`${API_URL}/api/admin/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: notifForm.title,
              message: notifForm.message,
              target_type: 'student',
              target_id: student_id,
              student_id
            })
          })
        ));
        alert(`Đã gửi thông báo đến ${studentIds.length} học sinh!`);
      } else {
        const response = await fetch(`${API_URL}/api/admin/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifForm)
        })
        const resJson = await response.json()
        if (resJson.success) {
          alert('Gửi thông báo thành công!')
        }
      }
      setNotifForm({ title: '', message: '', target_type: 'global', target_id: '' })
      await fetchNotifications()
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080b12] text-slate-700 dark:text-[#c5c6c7] flex flex-col md:flex-row transition-colors duration-500 relative overflow-hidden">
      
      {/* Animated Mesh Gradient Background - ẩn trong dark mode, dùng solid bg */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mesh-bg-light dark:hidden transition-all duration-700">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/15 blur-[60px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[60px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-500/15 blur-[60px]"
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between glass-panel border-b border-slate-200/50 dark:border-white/5 p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Quản Trị Viên</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR (Floating Glassmorphism) */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : (window.innerWidth < 768 ? '100%' : 0) }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed inset-y-0 right-0 z-50 w-72 md:w-64 glass-panel m-0 md:m-4 md:rounded-3xl p-6 flex flex-col gap-6 h-full md:h-[calc(100vh-32px)] overflow-y-auto md:relative md:right-auto md:translate-x-0 shrink-0 custom-scrollbar`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-wider">Admin Portal</h2>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-grow mt-4">
          {[
            { id: 'stats', label: 'Tổng Quan', icon: Award },
            { id: 'alerts', label: 'Cảnh Báo', icon: AlertTriangle },
            { id: 'classes', label: 'Lớp Học', icon: LayoutGrid },
            { id: 'students', label: 'Học Sinh', icon: User },
            { id: 'tuition', label: 'Học Phí', icon: DollarSign },
            { id: 'grades', label: 'Điểm Số', icon: Award },
            { id: 'schedules', label: 'Lịch Học', icon: Calendar },
            { id: 'assignments', label: 'Bài Tập', icon: BookOpen },
            { id: 'documents', label: 'Tài Liệu', icon: FileText },
            { id: 'leaves', label: 'Đơn Nghỉ Phép', icon: MessageSquare },
            { id: 'notifications', label: 'Thông Báo', icon: Bell }
          ].map((menu, idx) => {
            const Icon = menu.icon
            const isAct = activeSubTab === menu.id
            return (
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                key={menu.id}
                onClick={() => {
                  setActiveSubTab(menu.id)
                  setSelectedAssignForGrading(null)
                  if(window.innerWidth < 768) setIsSidebarOpen(false)
                }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left cursor-pointer overflow-hidden ${
                  isAct 
                    ? 'text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-white/5'
                }`}
              >
                {isAct && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-100"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isAct ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="relative z-10">{menu.label}</span>
              </motion.button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-slate-200/50 dark:border-white/10 text-center space-y-4">
          <div className="flex justify-center p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl w-max mx-auto">
            <ThemeToggle />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate px-2">{adminUser?.email}</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdminLogout}
            className="w-full py-3 bg-gradient-to-r from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-red-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 ring-1 ring-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 h-screen overflow-y-auto p-4 md:p-8 transition-colors duration-300 flex flex-col custom-scrollbar">
        
        {/* Header removed as requested */}

        {activeSubTab === 'documents' && <AdminDocuments adminUser={adminUser} fetchStats={fetchStats} />}
                        {activeSubTab === 'leaves' && <AdminLeaveRequests session={{access_token: localStorage.getItem('supabase_token')}} />}
        
        {/* 5.1 STATS (BENTO GRID DASHBOARD) */}
        {activeSubTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">Tổng Quan Hệ Thống</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Nắm bắt nhanh các chỉ số quan trọng hôm nay</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchStats} 
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(140px,auto)]">
              {/* Highlight Card 1 - Students */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="lg:col-span-2 glass-card glow-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-bold rounded-full">Tổng Học Sinh</span>
                </div>
                <div className="z-10 mt-4">
                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.totalStudents || 0}</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Học viên đang theo học tại trung tâm</p>
                </div>
              </motion.div>

              {/* Highlight Card 2 - Revenue */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="lg:col-span-2 glass-card glow-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">Tỷ lệ thu: {stats?.tuitionRate || 0}%</span>
                </div>
                <div className="z-10 mt-4">
                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-200">
                    {`${(stats?.paidAmount || 0) >= 1000000 ? ((stats?.paidAmount || 0) / 1000000).toFixed(1) + 'M' : (stats?.paidAmount || 0).toLocaleString('vi-VN')} đ`}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Tổng doanh thu đã thu được</p>
                </div>
              </motion.div>

              {/* Small Card 1 - GPA */}
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">GPA Trung Bình</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.averageGPA || 0}</p>
              </motion.div>

              {/* Small Card 2 - Unpaid Fees */}
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Nợ Học Phí</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.unpaidFeesCount || 0}</p>
              </motion.div>

              {/* Small Card 3 - Pending Grading */}
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 ring-1 ring-amber-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Chờ Chấm Điểm</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.pendingGrading || 0}</p>
              </motion.div>

              {/* Small Card 4 - Grading Rate */}
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Tỷ Lệ Chấm</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {`${(stats?.totalSubmissions || 0) > 0 ? (((stats?.gradedSubmissions || 0) / stats.totalSubmissions) * 100).toFixed(0) : 0}%`}
                </p>
              </motion.div>
            </div>

            <RevenueChart data={stats.revenueChartData} paidAmount={stats.paidAmount} unpaidAmount={stats.unpaidAmount} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              
              {/* Thống kê Sĩ số theo Lớp (Exact replica of mockup image) */}
              <motion.div 
                whileHover={{ scale: 1.01 }} 
                className="lg:col-span-1 bg-[#181e2e] dark:bg-[#151a29] border border-[#262d42] dark:border-[#222838] rounded-[28px] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#b042ff] shadow-[0_0_12px_#b042ff]"></div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                    SĨ SỐ HỌC SINH THEO LỚP
                  </h3>
                </div>

                {(() => {
                  const classCounts = {};
                  students.forEach(s => {
                    const cName = s.class_name || 'Khác';
                    if (!classCounts[cName]) classCounts[cName] = 0;
                    classCounts[cName]++;
                  });

                  const sortedClasses = Object.keys(classCounts).sort((a, b) => classCounts[b] - classCounts[a]);
                  const total = students.length;

                  if (total === 0) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                        <span className="text-sm font-semibold">Chưa có dữ liệu học sinh</span>
                      </div>
                    );
                  }

                  const colorPalette = ['#9333ea', '#00c6d7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
                  const data = sortedClasses.map((className, idx) => ({
                    name: className,
                    value: classCounts[className],
                    color: colorPalette[idx % colorPalette.length],
                    percent: Math.round((classCounts[className] / total) * 100)
                  }));

                  // SVG Donut Calculations
                  let cumulativePercent = 0;
                  const strokeWidth = 32;
                  const radius = 70;
                  const circumference = 2 * Math.PI * radius;

                  return (
                    <div className="flex-1 flex flex-col items-center justify-between space-y-6">
                      {/* Center Donut Graphic */}
                      <div className="relative w-56 h-56 flex items-center justify-center my-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                          {data.map((item) => {
                            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
                            const strokeDashoffset = -cumulativePercent * circumference;
                            cumulativePercent += item.value / total;

                            return (
                              <circle
                                key={item.name}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap={data.length > 1 ? "round" : "butt"}
                                className="transition-all duration-700 hover:opacity-90 cursor-pointer"
                              />
                            );
                          })}
                        </svg>

                        {/* Inner Circle Cutout with Big Number */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-36 h-36 rounded-full bg-[#131724] border border-[#252c40] flex flex-col items-center justify-center shadow-2xl">
                            <span className="text-4xl font-black text-white leading-none">{total}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">HỌC SINH</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Legend */}
                      <div className="w-full flex flex-wrap items-center justify-between gap-y-3 pt-2">
                        {data.map(d => (
                          <div key={d.name} className="flex items-center gap-2.5 min-w-[110px]">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                            <span className="text-sm font-semibold text-slate-300">{d.name}</span>
                            <span className="text-sm font-black text-white ml-auto">{d.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Tình trạng bài tập (Modern Bar Chart) */}
              <motion.div whileHover={{ scale: 1.01 }} className="lg:col-span-2 glass-card glow-card rounded-3xl p-6 relative overflow-hidden flex flex-col">
                <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8 z-10">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                    Tình Trạng Nộp Bài & Chấm Điểm
                  </h3>
                  <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/50">
                    {assignments.length} Bài Tập
                  </span>
                </div>
                
                <div className="flex-1 flex items-end justify-around gap-4 pt-4 pb-2 z-10">
                  {[
                    { label: 'Đã Nộp', value: stats?.totalSubmissions || 0, max: (stats?.totalSubmissions || 0) + 2, color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/40' },
                    { label: 'Đã Chấm', value: stats?.gradedSubmissions || 0, max: (stats?.totalSubmissions || 0) + 2, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/40' },
                    { label: 'Nộp Trễ', value: stats?.lateSubmissions || 0, max: (stats?.totalSubmissions || 0) + 2, color: 'from-rose-400 to-red-500', shadow: 'shadow-rose-500/40' }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-24 group cursor-pointer">
                      <span className="text-xl font-black text-slate-700 dark:text-slate-200 transition-all duration-300 group-hover:-translate-y-2 group-hover:text-cyan-500">
                        {bar.value}
                      </span>
                      <div className="w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl h-48 flex items-end justify-center p-1.5 relative overflow-hidden border border-slate-200 dark:border-slate-700/50">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${bar.max > 0 ? (bar.value / bar.max * 100) : 0}%` }}
                          transition={{ duration: 1, delay: 0.2 * i, ease: "easeOut" }}
                          className={`w-full bg-gradient-to-t ${bar.color} rounded-xl relative transition-all duration-300 group-hover:scale-x-105 shadow-lg ${bar.shadow}`} 
                        >
                          <div className="absolute inset-0 bg-white/20 w-full rounded-xl -translate-y-full group-hover:translate-y-full transition-transform duration-1000"></div>
                        </motion.div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Cân đối Học Phí (Stacked Modern Bar) */}
              <motion.div whileHover={{ scale: 1.01 }} className="glass-card glow-card rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="z-10">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    Dòng Tiền Học Phí
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Đã Thu</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.paidAmount.toLocaleString('vi-VN')} đ</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-2 text-rose-500">
                          <span className="text-xs font-bold uppercase tracking-wider">Còn Nợ</span>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 tracking-tight">{stats.unpaidAmount.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                    
                    <div className="relative pt-2">
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 h-8 rounded-2xl overflow-hidden flex shadow-inner text-[11px] font-bold text-white">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.tuitionRate}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full relative shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center overflow-hidden" 
                        >
                          <span className="relative z-10 px-2 drop-shadow-md whitespace-nowrap">{stats.tuitionRate}% Đã thu</span>
                          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                        </motion.div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - stats.tuitionRate}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-gradient-to-r from-rose-400 to-red-500 h-full relative opacity-90 flex items-center justify-center overflow-hidden" 
                        >
                          <span className="px-2 drop-shadow-md whitespace-nowrap">{(100 - stats.tuitionRate).toFixed(1)}% Nợ</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lịch sử Thông báo gửi đi (Timeline style) - Premium Redesign */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }} 
                className="relative flex flex-col h-[450px] overflow-hidden rounded-[2rem] border border-white/40 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg dark:shadow-none p-6 sm:p-8 transition-all duration-300"
              >
                {/* Decorative background gradients */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 z-10 relative">
                  <h3 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 uppercase tracking-[0.1em] flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                    </div>
                    Hoạt Động Hệ Thống
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetchNotifications()} 
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                      title="Làm mới hoạt động"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <span className="relative flex items-center justify-center px-4 py-1.5 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md"></div>
                      <div className="absolute inset-0 border border-white/40 dark:border-white/10 rounded-full"></div>
                      <span className="relative z-10 text-[11px] font-black text-indigo-600 dark:text-indigo-400 tracking-wide">
                        {notifications.length} BẢN GHI
                      </span>
                    </span>
                  </div>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-70 z-10">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                      <Bell className="w-8 h-8 opacity-40 text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold tracking-wide">Hệ thống tĩnh lặng</p>
                    <p className="text-[10px] mt-1 opacity-60">Chưa có hoạt động nào được ghi nhận</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-3 relative custom-scrollbar z-10 group/timeline">
                    {/* Animated vertical line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent rounded-full"></div>
                    
                    <div className="space-y-8 pb-4">
                      {notifications.slice(0, 15).map((notif, idx) => {
                        const isTargeted = notif.target_type === 'student' || notif.target_type === 'targeted' || (notif.target_id && notif.target_id.startsWith('student:'))
                        const isClass = notif.target_type === 'class' || notif.target_type === 'mixed'
                        const isSystem = notif.target_type === 'system' || notif.type === 'system'
                        
                        const theme = isSystem
                          ? { from: 'from-emerald-400', to: 'to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', label: 'Hệ thống' }
                          : isTargeted 
                            ? { from: 'from-rose-400', to: 'to-orange-500', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', label: 'Cá nhân' }
                            : isClass 
                              ? { from: 'from-amber-400', to: 'to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Lớp học' }
                              : { from: 'from-indigo-400', to: 'to-purple-500', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', label: 'Toàn trường' }
                        
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                            key={notif.notification_id} 
                            className="relative pl-12 group"
                          >
                            {/* Dot indicator */}
                            <div className="absolute left-[-2px] top-1 w-8 h-8 flex items-center justify-center">
                              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${theme.from} ${theme.to} shadow-lg ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/30 transition-all duration-300 z-20`}></div>
                            </div>
                            
                            {/* Activity Card */}
                            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/60 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
                              {/* Hover glow effect */}
                              <div className={`absolute inset-0 bg-gradient-to-r ${theme.from} ${theme.to} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
                              
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2.5 relative z-10">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                                    {notif.title}
                                  </h4>
                                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md ${theme.bg} ${theme.text} border border-current/10`}>
                                    {theme.label}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                                  {new Date(notif.created_at).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                                {notif.message}
                              </p>
                              
                              {notif.target_id && notif.target_id !== '' && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 text-[11px] flex items-center gap-1.5 text-slate-500">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                  <span>Gửi đến: <strong className="text-slate-700 dark:text-slate-300 ml-0.5">{notif.target_id}</strong></span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* 5.1.2 ALERTS (BENTO GRID STYLE) */}
        {activeSubTab === 'alerts' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                  Trung Tâm Cảnh Báo
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Quản lý và xử lý nhanh các vấn đề tự động phát hiện</p>
              </div>
              
              <div className="flex gap-2">
                {['all', 'tuition', 'academic', 'assignment'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${alertFilter === filter ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {filter === 'all' ? 'Tất cả' : filter === 'tuition' ? 'Học phí' : filter === 'academic' ? 'Học tập' : 'Bài tập'}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between z-10 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-white/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Nợ Học Phí</span>
                </div>
                <div className="z-10">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {alerts.filter(a => a.type === 'tuition').length}
                  </p>
                </div>
              </motion.div>
              
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between z-10 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30 ring-1 ring-white/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">GPA Thấp</span>
                </div>
                <div className="z-10">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {alerts.filter(a => a.type === 'academic').length}
                  </p>
                </div>
              </motion.div>
              
              <motion.div whileHover={{ y: -5 }} className="glass-card glow-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between z-10 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Chờ Chấm Điểm</span>
                </div>
                <div className="z-10">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {alerts.filter(a => a.type === 'assignment').length}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Alert List Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {alerts.filter(a => alertFilter === 'all' || a.type === alertFilter).length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/50"
                  >
                    <ShieldCheck className="w-16 h-16 mb-4 text-emerald-500 opacity-80" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Tuyệt vời! Không có cảnh báo nào.</p>
                    <p className="text-sm mt-1">Mọi thứ đều đang hoạt động tốt.</p>
                  </motion.div>
                ) : (
                  alerts.filter(a => alertFilter === 'all' || a.type === alertFilter).map((alert, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      key={alert.id}
                      className="glass-card glow-card rounded-3xl p-6 relative group overflow-hidden flex flex-col justify-between"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
                        alert.severity === 'high' ? 'bg-rose-500/20' : alert.severity === 'medium' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
                      }`}></div>
                      
                      <div className="z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2.5 rounded-2xl ring-1 ${
                            alert.severity === 'high' 
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20' 
                              : alert.severity === 'medium' 
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 ring-amber-500/20' 
                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20'
                          }`}>
                            <alert.icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
                            {new Date(alert.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{alert.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{alert.message}</p>
                      </div>

                      <div className="z-10 mt-auto flex gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveSubTab(alert.targetTab)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-white shadow-lg ${
                            alert.severity === 'high' 
                              ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30' 
                              : alert.severity === 'medium' 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30' 
                                : 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-indigo-500/30'
                          }`}
                        >
                          {alert.action}
                        </motion.button>
                        
                        {alert.type !== 'assignment' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setActiveSubTab('notifications')
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                            title="Gửi thông báo nhắc nhở"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* 5.1.5 CLASSES */}
        {activeSubTab === 'classes' && (() => {
          const dbClassNames = classes.map(c => c.class_name);
          const studentClassNames = Array.from(new Set(students.map(s => s.classes?.class_name || s.class_name).filter(Boolean)));
          const allClassNames = Array.from(new Set([...dbClassNames, ...studentClassNames])).sort();
          
          const mergedClasses = allClassNames.map(name => {
            const dbClass = classes.find(c => c.class_name === name);
            const gradeMatch = name.match(/^(\d+)/);
            const guessedGrade = gradeMatch ? `Khối ${gradeMatch[1]}` : '';

            if (dbClass) {
              return {
                ...dbClass,
                grade_level: dbClass.grade_level || guessedGrade
              };
            }
            return { 
              class_id: `temp_${name}`, 
              class_name: name, 
              grade_level: guessedGrade, 
              academic_year: '2024-2025' 
            };
          });

          // Filtering
          const filteredClasses = mergedClasses.filter(c => {
            const matchName = c.class_name.toLowerCase().includes(classSearch.toLowerCase()) || 
                              (c.subject || '').toLowerCase().includes(classSearch.toLowerCase());
            const matchGrade = classGradeFilter === 'All' || c.grade_level === classGradeFilter || c.grade_level.includes(classGradeFilter);
            const matchYear = classYearFilter === 'All' || (c.academic_year || '2024-2025') === classYearFilter;
            return matchName && matchGrade && matchYear;
          });

          const totalAssignedStudents = students.filter(s => s.classes?.class_id || s.class_name || (s.student_classes && s.student_classes.length > 0)).length;
          const avgStudentsPerClass = mergedClasses.length > 0 ? (totalAssignedStudents / mergedClasses.length).toFixed(1) : 0;

          return (
            <div className="space-y-6 animate-fade-in pb-10">
              {/* Header & Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Tổng Số Lớp</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{mergedClasses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Tổng Học Sinh</p>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{students.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Trung Bình / Lớp</p>
                    <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{avgStudentsPerClass} <span className="text-xs font-normal text-slate-400">HS</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Filter, Add button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm theo tên lớp hoặc môn..."
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={classGradeFilter}
                    onChange={(e) => setClassGradeFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="All">Tất cả khối</option>
                    {Array.from(new Set(mergedClasses.map(c => c.grade_level).filter(Boolean))).sort().map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={classYearFilter}
                    onChange={(e) => setClassYearFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="All">Tất cả năm học</option>
                    {Array.from(new Set(mergedClasses.map(c => c.academic_year || '2024-2025'))).sort().map(y => (
                      <option key={y} value={y}>Năm {y}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setClassForm({ class_id: '', class_name: '', grade_level: '', academic_year: '2024-2025', subject: '', tuition_fee: '' })
                    setShowClassModal(true)
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm Lớp Mới
                </button>
              </div>

              {/* Class Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold">Không tìm thấy lớp học nào phù hợp.</p>
                  </div>
                ) : (
                  filteredClasses.map(c => {
                    const classStudents = students.filter(s => 
                      s.classes?.class_id === c.class_id || 
                      s.class_name === c.class_name ||
                      (s.student_classes && s.student_classes.some(sc => sc.classes?.class_id === c.class_id))
                    )
                    const isTemp = String(c.class_id).startsWith('temp_');
                    return (
                      <div key={c.class_id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all relative flex flex-col justify-between h-full">
                        <div>
                          {/* Card Top */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                                {c.class_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{c.class_name}</h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                  {c.grade_level || 'Khối ?'} • Năm {c.academic_year || '2024-2025'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Subject & Tuition Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {c.subject && (
                              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                                Môn: {c.subject}
                              </span>
                            )}
                            {c.tuition_fee ? (
                              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                                {Number(c.tuition_fee).toLocaleString('vi-VN')} đ/tháng
                              </span>
                            ) : null}
                          </div>

                          {/* Student list section */}
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Sĩ số: <strong className="text-indigo-600 dark:text-indigo-400 text-sm">{classStudents.length}</strong> học sinh
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs custom-scrollbar">
                              {classStudents.map(st => (
                                <div key={st.student_id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2 truncate cursor-pointer"
                                    onClick={() => {
                                      setStudentProfile(st)
                                      setShowProfileModal(true)
                                    }}>
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                                      {st.full_name?.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{st.full_name}</span>
                                  </div>
                                  {!isTemp && (
                                    <button
                                      onClick={() => handleRemoveStudentFromClass(c.class_id, st.student_id, st.full_name)}
                                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                      title="Xóa học sinh khỏi lớp"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {classStudents.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-3 italic bg-slate-50 dark:bg-slate-800/30 rounded-xl">Lớp chưa có học sinh nào</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setManagingClass(c)
                              setSelectedStudentsToAssign([])
                              setShowManageStudentsModal(true)
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Quản lý HS</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setActiveSubTab('notifications')
                                setNotifForm({ title: `Thông báo dành cho lớp ${c.class_name}`, message: '', target_type: 'class', target_id: c.class_name })
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all cursor-pointer"
                              title="Gửi thông báo đến lớp"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            
                            <button onClick={() => {
                              setClassForm(c)
                              setShowClassModal(true)
                            }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all cursor-pointer" title={isTemp ? "Tạo lớp chính thức" : "Chỉnh sửa lớp"}>
                              {isTemp ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            </button>

                            {!isTemp && (
                              <button onClick={() => handleDeleteClass(c.class_id, c.class_name)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all cursor-pointer" title="Xóa lớp">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })()}


        {/* 5.2 STUDENTS */}
        {activeSubTab === 'students' && (() => {
          const filteredStudents = students.filter(s => {
            const matchName = (s.full_name || '').toLowerCase().includes(studentSearch.toLowerCase());
            const cName = s.classes?.class_name || s.class_name || 'Chưa xếp lớp';
            const matchClass = studentClassFilter === 'All' || cName === studentClassFilter;
            return matchName && matchClass;
          });

          const totalStudentPages = Math.ceil(filteredStudents.length / studentPageSize);
          const paginatedStudents = filteredStudents.slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize);

          return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Quản Lý Học Sinh</h2>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="All">Tất cả lớp</option>
                  {Array.from(new Set(students.map(s => s.classes?.class_name || s.class_name).filter(Boolean))).sort().map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadAuth(`${API_URL}/api/admin/templates/students`, 'mau_import_hoc_sinh.xlsx')} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-semibold px-2 cursor-pointer">Tải file mẫu</button>
                  <button onClick={() => handleDownloadAuth(`${API_URL}/api/admin/students/export`, 'danh_sach_hoc_sinh.xlsx')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shadow-md">
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Excel</span>
                  </button>
                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={handleImportStudents}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                  {selectedStudents.length > 0 && (
                    <button
                      onClick={handleBulkDeleteStudents}
                      className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <span>- Xóa {selectedStudents.length} đã chọn</span>
                    </button>
                  )}
                <button
                  onClick={() => {
                    setStudentForm({ id: '', full_name: '', class_name: '', phone_number: '', parent_name: '', parent_phone: '', status: 'active', enrolled_subjects: [] })
                    setShowStudentModal(true)
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <span>+ Thêm học sinh</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm dark:shadow-lg overflow-x-auto">
              <table className="block lg:table w-full min-w-max text-left text-sm">
                <thead className="hidden lg:table-header-group">
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                    <th className="px-4 whitespace-nowrap pb-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer accent-purple-500"
                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                        onChange={(e) => handleSelectAllStudents(e, filteredStudents)}
                      />
                    </th>
                    <th className="px-4 whitespace-nowrap pb-3">Họ Tên</th>
                    <th className="px-4 whitespace-nowrap pb-3">Lớp học</th>
                    <th className="px-4 whitespace-nowrap pb-3 text-center">Trạng thái</th>
                    <th className="px-4 whitespace-nowrap pb-3">Môn học</th>
                    <th className="px-4 whitespace-nowrap pb-3">Số điện thoại</th>
                    <th className="px-4 whitespace-nowrap pb-3">Thông tin Phụ huynh</th>
                    <th className="px-4 whitespace-nowrap pb-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="block lg:table-row-group divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr className="block lg:table-row"><td colSpan="8" className="block lg:table-cell py-8 text-center text-slate-400">Không tìm thấy học sinh nào.</td></tr>
                  ) : paginatedStudents.map(st => {
                      const studentGrades = grades.filter(g => g.student_id === st.student_id);
                      const studentSchedules = schedules.filter(s => s.student_id === st.student_id);
                      const activeSubjects = Array.from(new Set([
                        ...(st.enrolled_subjects || []),
                        ...studentGrades.map(g => g.subjects?.subject_name || g.subject_name),
                        ...studentSchedules.map(s => s.subjects?.subject_name || s.subject_name)
                      ].filter(Boolean)));
                      return (
                    <tr key={st.student_id} className="block lg:table-row bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Chọn</span>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer accent-purple-500"
                            checked={selectedStudents.includes(st.student_id)}
                            onChange={() => handleSelectStudent(st.student_id)}
                          />
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                        <div className="flex justify-between items-center lg:items-start lg:justify-start w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Họ Tên</span>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex flex-shrink-0 items-center justify-center font-bold text-xs shadow-sm shadow-purple-500/20">
                              {st.full_name ? st.full_name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-right lg:text-left">{st.full_name}</div>
                              <div className="text-[10px] font-mono text-slate-500 text-right lg:text-left">{st.student_id ? st.student_id.split('-')[0] : ''}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Lớp</span>
                          <span>{st.classes?.class_name || st.class_name || 'Chưa xếp lớp'}</span>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Trạng thái</span>
                          {st.status === 'suspended' ? (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md">Tạm nghỉ</span>
                          ) : st.status === 'dropped' ? (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-md">Đã nghỉ</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md">Đang học</span>
                          )}
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-1">Môn học</span>
                          <div className="text-right lg:text-left w-full lg:w-auto lg:max-w-[120px] lg:truncate">
                            {activeSubjects.length > 0 ? activeSubjects.join(', ') : <span className="text-slate-400">Chưa đ.ký</span>}
                          </div>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 font-mono">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">SĐT</span>
                          <span>{st.phone_number}</span>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between items-start lg:items-start w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Phụ Huynh</span>
                          <div className="text-right lg:text-left">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">{st.parent_name || '-'}</div>
                            <div className="font-mono">{st.parent_phone || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 text-right space-x-2 pt-2 lg:pt-3.5">
                        <div className="flex justify-end items-center w-full gap-2">
                        <button
                          onClick={() => {
                            setActiveSubTab('notifications');
                            setNotifForm({ title: '', message: '', target_type: 'student_name', target_id: st.student_id });
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          title="Gửi thông báo"
                        >
                          🔔
                        </button>
                        <button
                          onClick={() => {
                            setStudentProfile(st)
                            setShowProfileModal(true)
                          }}
                          className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          title="Hồ sơ chi tiết 360"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => {
                            setStudentForm({
                              id: st.student_id,
                              full_name: st.full_name,
                              class_name: st.class_name,
                              phone_number: st.phone_number,
                              parent_name: st.parent_name, parent_phone: st.parent_phone || '',
                              status: st.status || 'active',
                              enrolled_subjects: st.enrolled_subjects || [],
                              class_ids: st.student_classes ? st.student_classes.map(sc => sc.classes?.class_id) : []
                            })
                            setShowStudentModal(true)
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st.student_id)}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Xóa
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {totalStudentPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Hiển thị {(studentPage - 1) * studentPageSize + 1} - {Math.min(studentPage * studentPageSize, filteredStudents.length)} trong số {filteredStudents.length} học sinh
                </span>
                <div className="flex space-x-2">
                  <button 
                    disabled={studentPage === 1}
                    onClick={() => setStudentPage(p => p - 1)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg">
                    {studentPage} / {totalStudentPages}
                  </span>
                  <button 
                    disabled={studentPage === totalStudentPages}
                    onClick={() => setStudentPage(p => p + 1)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
            </div>
        )})()}

        {/* 5.3 TUITION */}
        {activeSubTab === 'tuition' && (() => {
          const filteredTuition = tuitionFees.filter(fee => {
            const stu = fee.students || {};
            const searchLower = tuitionSearch.toLowerCase();
            const matchName = (stu.full_name || '').toLowerCase().includes(searchLower) || (stu.phone_number || '').toLowerCase().includes(searchLower);
            const matchClass = tuitionClassFilter === 'All' || stu.class_name === tuitionClassFilter;
            const matchStatus = tuitionStatusFilter === 'All' || fee.status === tuitionStatusFilter;
            
            let matchMonth = true;
            if (tuitionMonthFilter !== 'All') {
              const dueMonth = new Date(fee.due_date).getMonth() + 1; // 1-12
              matchMonth = dueMonth === parseInt(tuitionMonthFilter);
            }
            return matchName && matchClass && matchMonth && matchStatus;
          });
          
          const totalAmount = filteredTuition.reduce((sum, f) => sum + Number(f.amount), 0);
          const totalPaid = filteredTuition.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0);
          const totalUnpaid = filteredTuition.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + Number(f.amount), 0);

          const totalTuitionPages = Math.ceil(filteredTuition.length / tuitionPageSize);
          const paginatedTuition = filteredTuition.slice((tuitionPage - 1) * tuitionPageSize, tuitionPage * tuitionPageSize);

          return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Quản Lý Học Phí</h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setTuitionView('list')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      tuitionView === 'list'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Danh sách
                  </button>
                  <button
                    onClick={() => setTuitionView('history')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      tuitionView === 'history'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Lịch sử
                  </button>
                </div>
              </div>
              
              {tuitionView === 'list' && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm tên hoặc SĐT..."
                    value={tuitionSearch}
                    onChange={(e) => setTuitionSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={tuitionClassFilter}
                  onChange={(e) => setTuitionClassFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="All">Lớp: Tất cả</option>
                  {Array.from(new Set(students.map(s => s.class_name))).sort().map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <select
                  value={tuitionMonthFilter}
                  onChange={(e) => setTuitionMonthFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="All">Tháng: Tất cả</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>

                <select
                  value={tuitionStatusFilter}
                  onChange={(e) => setTuitionStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="All">Trạng thái: Tất cả</option>
                  <option value="paid">Đã nộp</option>
                  <option value="unpaid">Chưa nộp</option>
                </select>

                <button
                  onClick={() => {
                    setTuitionForm({
                      fee_id: '',
                      assign_mode: 'student',
                      student_id: '',
                      class_name: '',
                      subject_configs: {
                        'Toán': { active: true, months_count: 4, monthly_amount: 500000 },
                        'Lý': { active: false, months_count: 1, monthly_amount: 500000 },
                        'Hóa': { active: false, months_count: 1, monthly_amount: 500000 }
                      },
                      start_date: new Date().toISOString().split('T')[0],
                      split_by_month: true,
                      custom_title: ''
                    })
                    setShowTuitionModal(true)
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <span>+ Gán học phí</span>
                </button>
                {selectedTuitions.length > 0 && (
                  <button
                    onClick={handleBulkDeleteTuitions}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <span>- Xóa {selectedTuitions.length} đã chọn</span>
                  </button>
                )}
              </div>
              )}
            </div>
            
            {tuitionView === 'list' && (<>
            {/* Thống kê học phí */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng cộng (Theo lọc)</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{totalAmount.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><DollarSign className="w-5 h-5"/></div>
              </div>
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">Đã thanh toán</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalPaid.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 className="w-5 h-5"/></div>
              </div>
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-1">Tổng nợ</p>
                  <p className="text-xl font-black text-red-600 dark:text-red-400">{totalUnpaid.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm dark:shadow-lg overflow-x-auto">
              <table className="block lg:table w-full min-w-max text-left text-sm">
                <thead className="hidden lg:table-header-group">
                  <tr className="border-b border-slate-200 dark:border-slate-855 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                    <th className="px-4 whitespace-nowrap pb-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer accent-purple-500"
                        checked={filteredTuition.length > 0 && selectedTuitions.length === filteredTuition.length}
                        onChange={(e) => handleSelectAllTuitions(e, filteredTuition)}
                      />
                    </th>
                    <th className="px-4 whitespace-nowrap pb-3">Học sinh</th>
                    <th className="px-4 whitespace-nowrap pb-3">Tiêu đề học phí</th>
                    <th className="px-4 whitespace-nowrap pb-3">Số tiền</th>
                    <th className="px-4 whitespace-nowrap pb-3">Hạn đóng & Trạng thái</th>
                    <th className="px-4 whitespace-nowrap pb-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="block lg:table-row-group divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTuition.length === 0 ? (
                    <tr className="block lg:table-row"><td colSpan="6" className="block lg:table-cell py-8 text-center text-slate-400">Không tìm thấy khoản phí nào.</td></tr>
                  ) : paginatedTuition.map(fee => {
                    const daysLeft = Math.ceil((new Date(fee.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                    const isAlmostExpired = fee.status === 'unpaid' && daysLeft > 0 && daysLeft <= 7;
                    const isExpired = fee.status === 'unpaid' && daysLeft <= 0;

                    return (
                    <tr key={fee.fee_id} className="block lg:table-row bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-slate-650 dark:text-slate-300">
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Chọn</span>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer accent-purple-500"
                            checked={selectedTuitions.includes(fee.fee_id)}
                            onChange={() => handleSelectTuition(fee.fee_id)}
                          />
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                        <div className="flex justify-between items-center lg:items-start lg:justify-start w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học sinh</span>
                          <div className="text-right lg:text-left">
                            <div className="font-bold text-slate-900 dark:text-white">{fee.students?.full_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{fee.students?.phone_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-slate-800 dark:text-slate-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề học phí</span>
                          <span className="text-right lg:text-left w-full lg:w-auto">{fee.title}</span>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 font-bold">
                        <div className="flex justify-between items-center w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Số tiền</span>
                          <span>{Number(fee.amount).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 space-y-1">
                        <div className="flex flex-col lg:items-start items-end w-full lg:w-auto">
                          <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-1">Hạn & Trạng thái</span>
                          <div className="text-xs text-slate-550 dark:text-slate-400 font-semibold text-right lg:text-left">{new Date(fee.due_date).toLocaleDateString('vi-VN')}</div>
                          <div className="flex gap-2 items-center justify-end lg:justify-start">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {fee.status === 'paid' ? 'Đã đóng' : 'Còn nợ'}
                            </span>
                            {isAlmostExpired && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Sắp hết hạn</span>}
                            {isExpired && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-400">Đã quá hạn</span>}
                          </div>
                        </div>
                      </td>
                      <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 text-right space-x-2 pt-2 lg:pt-3.5">
                        <div className="flex justify-end items-center w-full gap-2">
                        <button
                          onClick={() => {
                            setTuitionForm({
                              fee_id: fee.fee_id,
                              student_id: fee.student_id,
                              title: fee.title,
                              amount: fee.amount,
                              due_date: new Date(fee.due_date).toISOString().split('T')[0]
                            })
                            setShowTuitionModal(true)
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Sửa
                        </button>
                        
                        {fee.status === 'unpaid' ? (
                          <button
                            onClick={() => handlePayManual(fee.fee_id)}
                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Đã thu
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpayManual(fee.fee_id)}
                            className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-450 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Hủy thu
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTuition(fee.fee_id)}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Xóa
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {totalTuitionPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Hiển thị {(tuitionPage - 1) * tuitionPageSize + 1} - {Math.min(tuitionPage * tuitionPageSize, filteredTuition.length)} trong số {filteredTuition.length} khoản phí
                </span>
                <div className="flex space-x-2">
                  <button 
                    disabled={tuitionPage === 1}
                    onClick={() => setTuitionPage(p => p - 1)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg">
                    {tuitionPage} / {totalTuitionPages}
                  </span>
                  <button 
                    disabled={tuitionPage === totalTuitionPages}
                    onClick={() => setTuitionPage(p => p + 1)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
            </>)}

            {tuitionView === 'history' && (() => {
              const filteredPaymentHistory = paymentHistory.filter(h => {
                const q = paymentSearch.toLowerCase();
                const name = (h.students?.full_name || '').toLowerCase();
                const phone = (h.students?.phone_number || '').toLowerCase();
                const matchName = name.includes(q) || phone.includes(q);
                
                const matchClass = paymentClassFilter === 'All' || h.students?.class_name === paymentClassFilter;
                
                let matchDate = true;
                if (paymentStartDate || paymentEndDate) {
                  const payDate = new Date(h.paid_at);
                  
                  if (paymentStartDate) {
                    const start = new Date(paymentStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (payDate < start) matchDate = false;
                  }
                  
                  if (paymentEndDate) {
                    const end = new Date(paymentEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (payDate > end) matchDate = false;
                  }
                }
                
                return matchName && matchClass && matchDate;
              });

              const totalPaymentAmount = filteredPaymentHistory.reduce((sum, h) => sum + Number(h.amount), 0);
              const totalPaymentPages = Math.ceil(filteredPaymentHistory.length / paymentPageSize);

              return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm md:col-span-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng tiền đã thu (Theo lọc)</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalPaymentAmount.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><DollarSign className="w-5 h-5"/></div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Tìm kiếm</label>
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Tên, SĐT..."
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Lớp học</label>
                    <select
                      value={paymentClassFilter}
                      onChange={(e) => setPaymentClassFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="All">Tất cả</option>
                      {Array.from(new Set(students.map(s => s.class_name))).sort().map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Từ ngày</label>
                    <input
                      type="date"
                      value={paymentStartDate}
                      onChange={(e) => setPaymentStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                      title="Từ ngày"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Đến ngày</label>
                    <input
                      type="date"
                      value={paymentEndDate}
                      onChange={(e) => setPaymentEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer"
                      title="Đến ngày"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học sinh</th>
                          <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lớp</th>
                          <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khoản thu</th>
                          <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số tiền</th>
                          <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời gian đóng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {filteredPaymentHistory
                          .slice((paymentPage - 1) * paymentPageSize, paymentPage * paymentPageSize)
                          .map(h => (
                            <tr key={h.payment_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{h.students?.full_name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{h.students?.phone_number}</p>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                                  {h.students?.class_name || 'N/A'}
                                </span>
                              </td>
                              <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {h.tuition_fees?.title || 'N/A'}
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                                  {Number(h.amount).toLocaleString('vi-VN')} đ
                                </span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Thành công</span>
                              </td>
                              <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center justify-between">
                                  <span>{new Date(h.paid_at).toLocaleString('vi-VN')}</span>
                                  <button onClick={() => generateInvoice(h, h.students)} className="ml-3 px-3 py-1.5 flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors font-bold text-xs" title="Tải Biên Lai PDF">
                                    <Download className="w-3 h-3" /> Tải PDF
                                  </button>
                                </div>
                              </td>
                            </tr>
                        ))}
                        {filteredPaymentHistory.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                              Không tìm thấy lịch sử thanh toán nào phù hợp
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Phân trang lịch sử */}
                  {totalPaymentPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Hiển thị {((paymentPage - 1) * paymentPageSize) + 1} - {Math.min(paymentPage * paymentPageSize, filteredPaymentHistory.length)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={paymentPage === 1}
                          onClick={() => setPaymentPage(p => p - 1)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Trước
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg">
                          {paymentPage}
                        </span>
                        <button 
                          disabled={paymentPage === totalPaymentPages}
                          onClick={() => setPaymentPage(p => p + 1)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})()}
          </div>
          )
        })()}

        {/* 5.4 GRADES */}
        {activeSubTab === 'grades' && (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Quản Lý Điểm Số</h2>

                <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl w-max">
                  <button
                    onClick={() => setActiveGradeTab('standard')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeGradeTab === 'standard' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    Điểm Định Kỳ
                  </button>
                  <button
                    onClick={() => setActiveGradeTab('assignment')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeGradeTab === 'assignment' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    Điểm Bài Tập
                  </button>
                  <button
                    onClick={() => setActiveGradeTab('appeal')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeGradeTab === 'appeal' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    Phúc Khảo
                  </button>
                </div>
              </div>
              
              {activeGradeTab === 'standard' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGradeSettingsModal(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Cấu hình trọng số điểm"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button onClick={() => handleDownloadAuth(`${API_URL}/api/admin/templates/grades`, 'mau_import_diem.xlsx')} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-semibold px-2 cursor-pointer">Tải file mẫu</button>
                  
                  <button
                    onClick={handleExportGrades}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Excel</span>
                  </button>

                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={handleImportGrades}
                      ref={fileInputRef}
                    />
                  </label>

                </div>
              )}
            </div>

            {activeGradeTab === 'standard' ? (() => {
              const derivedGrades = [];
              students.forEach(st => {
                const activeSubjects = Array.from(new Set([
                  ...(st.enrolled_subjects || []),
                  ...grades.filter(g => g.student_id === st.student_id).map(g => g.subject_name || g.subjects?.subject_name)
                ].filter(Boolean)));
                
                if (activeSubjects.length === 0) {
                  derivedGrades.push({
                    grade_id: `virtual-${st.student_id}-none`,
                    student_id: st.student_id,
                    subject_name: 'Chưa đăng ký môn',
                    grade_15m: null,
                    grade_45m: null,
                    midterm_grade: null,
                    final_grade: null,
                    students: st,
                    is_virtual: true
                  });
                } else {
                  activeSubjects.forEach(sub => {
                    const existingGrade = grades.find(g => g.student_id === st.student_id && (g.subject_name === sub || g.subjects?.subject_name === sub));
                    if (existingGrade) {
                      derivedGrades.push({ ...existingGrade, students: st });
                    } else {
                      derivedGrades.push({
                        grade_id: `virtual-${st.student_id}-${sub}`,
                        student_id: st.student_id,
                        subject_name: sub,
                        grade_15m: null,
                        grade_45m: null,
                        midterm_grade: null,
                        final_grade: null,
                        students: st,
                        is_virtual: true
                      });
                    }
                  });
                }
              });

              derivedGrades.sort((a, b) => {
                const nameA = a.students?.full_name || '';
                const nameB = b.students?.full_name || '';
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return (a.subject_name || '').localeCompare(b.subject_name || '');
              });

              const filteredDerivedGrades = derivedGrades.filter(g => {
                const matchClass = gradeClassFilter === 'All' || g.students?.class_name === gradeClassFilter;
                const matchSubject = gradeSubjectFilter === 'All' || g.subject_name === gradeSubjectFilter;
                return matchClass && matchSubject;
              });

              const totalGradePages = Math.ceil(filteredDerivedGrades.length / gradePageSize);
              const paginatedGrades = filteredDerivedGrades.slice((gradePage - 1) * gradePageSize, gradePage * gradePageSize);
              return (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4 w-full sm:w-auto">
                  <select
                    value={gradeClassFilter}
                    onChange={(e) => setGradeClassFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer shadow-sm"
                  >
                    <option value="All">Lớp: Tất cả</option>
                    {Array.from(new Set(students.map(s => s.class_name))).filter(Boolean).sort().map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <select
                    value={gradeSubjectFilter}
                    onChange={(e) => setGradeSubjectFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white cursor-pointer shadow-sm"
                  >
                    <option value="All">Môn học: Tất cả</option>
                    {Array.from(new Set(derivedGrades.map(g => g.subject_name))).filter(Boolean).sort().map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm dark:shadow-lg overflow-x-auto">
                <table className="block lg:table w-full min-w-max text-left text-sm">
                  <thead className="hidden lg:table-header-group">
                    <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                      <th className="px-4 whitespace-nowrap pb-3">Học sinh</th>
                      <th className="px-4 whitespace-nowrap pb-3">Môn học</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">15 Phút</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">1 Tiết</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">Giữa kì</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">Cuối kì</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">Tổng kết môn</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="block lg:table-row-group divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedGrades.length === 0 ? (
                      <tr className="block lg:table-row"><td colSpan="8" className="block lg:table-cell py-8 text-center text-slate-400">Không có điểm nào.</td></tr>
                    ) : paginatedGrades.map(gr => (
                      <tr key={gr.grade_id} className="block lg:table-row bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-slate-650 dark:text-slate-300">
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                          <div className="flex justify-between items-center lg:items-start lg:justify-start w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học sinh</span>
                            <div className="text-right lg:text-left">
                              <div className="font-bold text-slate-900 dark:text-white">{gr.students?.full_name}</div>
                              <div className="text-[10px] text-slate-500">{gr.students?.class_name} • {gr.students?.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Môn học</span>
                            <span>{gr.subject_name}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">15 Phút</span>
                            <span>{gr.grade_15m !== null ? gr.grade_15m : '-'}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">1 Tiết</span>
                            <span>{gr.grade_45m !== null ? gr.grade_45m : '-'}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Giữa kì</span>
                            <span>{gr.midterm_grade !== null ? gr.midterm_grade : '-'}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Cuối kì</span>
                            <span>{gr.final_grade !== null ? gr.final_grade : '-'}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Tổng kết môn</span>
                            <span>{gr.summary_grade !== null ? gr.summary_grade : '-'}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 text-right space-x-2 pt-2 lg:pt-3.5">
                          <div className="flex justify-end items-center w-full gap-2">
                          <button
                            onClick={() => {
                              setGradeForm({
                                id: gr.grade_id,
                                student_id: gr.student_id,
                                subject_name: gr.subject_name,
                                grade_15m: gr.grade_15m ?? '',
                                grade_45m: gr.grade_45m ?? '',
                                midterm_grade: gr.midterm_grade ?? '',
                                final_grade: gr.final_grade ?? ''
                              });
                              setShowGradeModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            Sửa
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalGradePages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Hiển thị {(gradePage - 1) * gradePageSize + 1} - {Math.min(gradePage * gradePageSize, filteredDerivedGrades.length)} trong số {filteredDerivedGrades.length} điểm
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      disabled={gradePage === 1}
                      onClick={() => setGradePage(p => p - 1)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg">
                      {gradePage} / {totalGradePages}
                    </span>
                    <button 
                      disabled={gradePage === totalGradePages}
                      onClick={() => setGradePage(p => p + 1)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
              </div>
            )})() : (() => {
              const totalAssignmentPages = Math.ceil(assignmentGrades.length / assignmentGradePageSize);
              const paginatedAssignmentGrades = assignmentGrades.slice((assignmentGradePage - 1) * assignmentGradePageSize, assignmentGradePage * assignmentGradePageSize);
              return (
              <div className="w-full">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm dark:shadow-lg overflow-x-auto">
                <table className="block lg:table w-full min-w-max text-left text-sm">
                  <thead className="hidden lg:table-header-group">
                    <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                      <th className="px-4 whitespace-nowrap pb-3">Học sinh</th>
                      <th className="px-4 whitespace-nowrap pb-3">Tên Bài Tập</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">Hạn nộp</th>
                      <th className="px-4 whitespace-nowrap pb-3 text-center">Điểm Bài Tập</th>
                    </tr>
                  </thead>
                  <tbody className="block lg:table-row-group divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedAssignmentGrades.length === 0 ? (
                      <tr className="block lg:table-row"><td colSpan="4" className="block lg:table-cell py-8 text-center text-slate-400">Chưa có bài tập nào.</td></tr>
                    ) : paginatedAssignmentGrades.map(gr => (
                      <tr key={gr.submission_id} className="block lg:table-row bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-slate-650 dark:text-slate-300">
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                          <div className="flex justify-between items-center lg:items-start lg:justify-start w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học sinh</span>
                            <div className="text-right lg:text-left">
                              <div className="font-bold text-slate-900 dark:text-white">{gr.students?.full_name}</div>
                              <div className="text-[10px] text-slate-500">{gr.students?.class_name} • {gr.students?.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Tên Bài Tập</span>
                            <span>{gr.assignments?.title}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center text-xs font-mono">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Hạn nộp</span>
                            <span>{new Date(gr.assignments?.deadline).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 lg:py-3.5 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-right lg:text-center font-bold text-cyan-600 dark:text-cyan-400 font-mono text-base">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Điểm Bài Tập</span>
                            <span>{gr.grade}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {assignmentGrades.length === 0 && (
                      <tr className="block lg:table-row"><td colSpan="4" className="block lg:table-cell py-8 text-center text-slate-400">Chưa có bài tập nào được chấm điểm.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalAssignmentPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Hiển thị {(assignmentGradePage - 1) * assignmentGradePageSize + 1} - {Math.min(assignmentGradePage * assignmentGradePageSize, assignmentGrades.length)} trong số {assignmentGrades.length} điểm bài tập
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      disabled={assignmentGradePage === 1}
                      onClick={() => setAssignmentGradePage(p => p - 1)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg">
                      {assignmentGradePage} / {totalAssignmentPages}
                    </span>
                    <button 
                      disabled={assignmentGradePage === totalAssignmentPages}
                      onClick={() => setAssignmentGradePage(p => p + 1)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
              </div>
            )})()}

          {activeGradeTab === 'appeal' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="block lg:table w-full text-left border-collapse min-w-max">
                  <thead className="hidden lg:table-header-group">
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">HỌC SINH</th>
                      <th className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">MÔN HỌC</th>
                      <th className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">LÝ DO PHÚC KHẢO</th>
                      <th className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs text-center">TRẠNG THÁI</th>
                      <th className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs text-center">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody className="block lg:table-row-group">
                    {gradeAppeals.map((appeal, index) => (
                      <tr key={index} className="block lg:table-row bg-white dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-b lg:border-0 border-slate-200 dark:border-slate-800/50 p-4 lg:p-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="block lg:table-cell py-2 lg:py-3 px-2 lg:px-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0">
                          <div className="flex justify-between items-start w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học Sinh</span>
                            <div className="text-right lg:text-left">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{appeal.students?.full_name}</p>
                              <p className="text-xs text-slate-500">{appeal.students?.class_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="block lg:table-cell py-2 lg:py-3 px-2 lg:px-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Môn Học</span>
                            <span>{appeal.subject_name}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell py-2 lg:py-3 px-2 lg:px-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-sm text-slate-600 dark:text-slate-400 lg:max-w-xs lg:truncate">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-1">Lý Do</span>
                            <span className="text-right lg:text-left w-full lg:w-auto break-words">{appeal.reason}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell py-2 lg:py-3 px-2 lg:px-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 pb-2 mb-2 lg:pb-0 lg:mb-0 text-center">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Trạng Thái</span>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${appeal.status === 'pending' ? 'bg-amber-100 text-amber-700' : appeal.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {appeal.status === 'pending' ? 'Chờ duyệt' : appeal.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          </div>
                        </td>
                        <td className="block lg:table-cell py-2 lg:py-3 px-2 lg:px-4 text-center">
                          <div className="flex justify-end items-center w-full lg:w-auto">
                            {appeal.status === 'pending' && (
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleUpdateAppealStatus(appeal.appeal_id, 'approved')} className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold rounded-lg cursor-pointer">Duyệt</button>
                                <button onClick={() => handleUpdateAppealStatus(appeal.appeal_id, 'rejected')} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold rounded-lg cursor-pointer">Từ chối</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {gradeAppeals.length === 0 && (
                      <tr className="block lg:table-row"><td colSpan="5" className="block lg:table-cell py-8 text-center text-slate-400">Chưa có yêu cầu phúc khảo nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        )}

        {/* 5.5 SCHEDULES */}
        {activeSubTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Quản Lý Thời Khóa Biểu</h2>
                <select 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-purple-500 shadow-sm"
                  value={scheduleSubjectFilter}
                  onChange={(e) => setScheduleSubjectFilter(e.target.value)}
                >
                  <option value="All">Tất cả môn học</option>
                  <option value="Toán">📘 Toán</option>
                  <option value="Vật Lý">📗 Vật Lý</option>
                  <option value="Hóa Học">📙 Hóa Học</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setScheduleForm({ schedule_id: '', subject_name: '', start_time: '08:00', end_time: '11:30', room_name: '', study_date: new Date().toISOString().split('T')[0], target_type: 'mixed', target_id: JSON.stringify({classes: [], phones: [], names: []}) })
                  setShowScheduleModal(true)
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
              >
                <span>+ Thêm ca học</span>
              </button>
            </div>

            <WeeklyCalendar 
              schedules={schedules.filter(s => scheduleSubjectFilter === 'All' || s.subject_name === scheduleSubjectFilter)} 
              onUpdateSchedule={handleUpdateScheduleFromDrop}
              onAttendance={handleOpenAttendanceModal}
              onEditSchedule={(sch) => {
                let mixedTargetId = JSON.stringify({ classes: [], phones: [], names: [] });
                if (sch.target_type === 'mixed') {
                  mixedTargetId = sch.target_id;
                } else if (sch.target_type === 'class') {
                  mixedTargetId = JSON.stringify({ classes: sch.target_id ? String(sch.target_id).split(',').filter(Boolean) : [], phones: [], names: [] });
                } else if (sch.target_type === 'student_phone') {
                  mixedTargetId = JSON.stringify({ classes: [], phones: sch.target_id ? String(sch.target_id).split(',').filter(Boolean) : [], names: [] });
                } else if (sch.target_type === 'student_name') {
                  mixedTargetId = JSON.stringify({ classes: [], phones: [], names: sch.target_id ? String(sch.target_id).split(',').filter(Boolean) : [] });
                }
                
                setScheduleForm({
                  schedule_id: sch.schedule_id,
                  subject_name: sch.subject_name,
                  start_time: sch.start_time ? sch.start_time.substring(0, 5) : '08:00',
                  end_time: sch.end_time ? sch.end_time.substring(0, 5) : '11:30',
                  room_name: sch.room_name,
                  study_date: sch.study_date ? sch.study_date.split('T')[0] : new Date().toISOString().split('T')[0],
                  target_type: 'mixed',
                  target_id: mixedTargetId
                })
                setShowScheduleModal(true)
              }}
              onCopyWeek={handleCopyWeek}
            />
          </div>
        )}

        {/* 5.6 ASSIGNMENTS */}
        {activeSubTab === 'assignments' && (
          <div className="space-y-6">
            {!selectedAssignForGrading ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Bài Tập Về Nhà</h2>
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <span>+ Giao bài mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {assignments.map(assign => (
                    <div key={assign.assignment_id} className="group relative bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md mb-2 tracking-wider">
                              <Users className="w-3 h-3 text-purple-500" />
                              {assign.target_type === 'class' ? 'Lớp ' : assign.target_type === 'student_phone' ? 'SĐT ' : 'Học sinh '}
                              <span className="text-purple-600 dark:text-purple-400">{assign.target_id}</span>
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{assign.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{assign.description || 'Không có mô tả chi tiết cho bài tập này.'}</p>
                        {(assign.file_url || assign.submission_folder_url || (assign.assignment_documents && assign.assignment_documents.length > 0)) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {assign.file_url && (
                              <a
                                href={assign.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-800/50 rounded-lg text-xs font-semibold transition-all duration-200"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Link tài liệu phụ</span>
                              </a>
                            )}
                            {assign.submission_folder_url && (
                              <a
                                href={assign.submission_folder_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-800/50 rounded-lg text-xs font-semibold transition-all duration-200"
                              >
                                <Inbox className="w-3.5 h-3.5" />
                                <span>Thư mục nộp bài</span>
                              </a>
                            )}
                            {assign.assignment_documents && assign.assignment_documents.map((ad, idx) => {
                              if (!ad.documents) return null;
                              return (
                                <a
                                  key={`doc-${idx}`}
                                  href={ad.documents.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/50 dark:hover:bg-purple-900/30 text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700/50 hover:border-purple-200 dark:hover:border-purple-800/50 rounded-lg text-xs font-semibold transition-all duration-200"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[160px]">{ad.documents.title}</span>
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4 text-orange-500" />
                          Hạn nộp: <span className="text-slate-800 dark:text-slate-200">{new Date(assign.deadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setAssignmentForm({
                                assignment_id: assign.assignment_id,
                                title: assign.title,
                                description: assign.description,
                                target_type: assign.target_type || 'class',
                                target_id: assign.target_id || '',
                                deadline: new Date(assign.deadline).toISOString().slice(0, 16),
                                file_url: assign.file_url || '',
                                submission_folder_url: assign.submission_folder_url || '',
                                attached_documents: assign.assignment_documents ? assign.assignment_documents.map(d => d.document_id) : []
                              })
                              setShowAssignmentModal(true)
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white font-bold rounded-lg transition-colors tooltip-trigger relative group/btn"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assign.assignment_id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/20 font-bold rounded-lg transition-colors relative group/btn"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">Xóa</span>
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedAssignForGrading(assign)
                              await fetchSubmissions(assign.assignment_id)
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Chấm Bài
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // CHẤM ĐIỂM BÀI NỘP
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedAssignForGrading(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài tập
                </button>

                <div className="bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 mb-3">
                        <CheckSquare className="w-3.5 h-3.5" /> Đang chấm điểm
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedAssignForGrading.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> Đối tượng: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedAssignForGrading.target_id}</span></span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> Hạn nộp: <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(selectedAssignForGrading.deadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span></span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#1f2833] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{submissions.filter(s => s.status === 'graded').length} / {submissions.length}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Đã chấm</div>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                        <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có học sinh nào nộp bài.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="block lg:table w-full min-w-max text-left text-sm">
                        <thead className="hidden lg:table-header-group">
                          <tr className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                            <th className="px-4 py-3 whitespace-nowrap">Học sinh</th>
                            <th className="px-4 py-3 whitespace-nowrap">Thời gian nộp</th>
                            <th className="px-4 py-3 whitespace-nowrap">Tệp đính kèm</th>
                            <th className="px-4 py-3 whitespace-nowrap">Trạng thái / Nhận xét</th>
                            <th className="px-4 py-3 whitespace-nowrap text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="block lg:table-row-group divide-y divide-slate-50 dark:divide-slate-800/50">
                          {submissions.map(sub => {
                            const isLate = sub.status === 'late'
                            const isGraded = sub.status === 'graded'

                            return (
                              <tr key={sub.submission_id} className="block lg:table-row bg-white dark:bg-[#1f2833] lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-2xl border lg:border-0 border-slate-200 dark:border-slate-800/50 p-4 lg:p-0 hover:bg-slate-50/50 dark:hover:bg-[#1f2833]/80 transition-colors group text-slate-600 dark:text-slate-300">
                                <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                                  <div className="flex justify-between items-start w-full lg:w-auto">
                                    <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học Sinh</span>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800/50">
                                        {sub.students?.full_name?.charAt(0) || '?'}
                                      </div>
                                      <div className="text-right lg:text-left">
                                        <div className="font-bold text-slate-900 dark:text-white">{sub.students?.full_name}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end lg:justify-start gap-1 mt-0.5"><Phone className="w-3 h-3" /> {sub.students?.phone_number}</div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                                  <div className="flex justify-between items-center w-full lg:w-auto">
                                    <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Thời Gian Nộp</span>
                                    <div className="text-right lg:text-left">
                                      <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded inline-block">{new Date(sub.submitted_at).toLocaleString('vi-VN')}</div>
                                      {isLate && <div className="mt-1.5"><span className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-black uppercase tracking-wider">Nộp muộn</span></div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                                  <div className="flex justify-between items-center w-full lg:w-auto">
                                    <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Tệp Đính Kèm</span>
                                    <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors">
                                      <Download className="w-3.5 h-3.5" />
                                      Tải bài
                                    </a>
                                  </div>
                                </td>
                                <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-4 border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full lg:w-auto">
                                    <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-2">Trạng Thái / Nhận Xét</span>
                                    <div className="text-right lg:text-left w-full lg:w-auto">
                                      {isGraded ? (
                                        <div className="max-w-full lg:max-w-[200px] flex flex-col items-end lg:items-start">
                                          <span className="inline-block text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md font-black border border-emerald-500/20 mb-1.5">Điểm: {sub.grade} đ</span>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 text-right lg:text-left" title={sub.feedback}>"{sub.feedback || 'Không có nhận xét'}"</p>
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md font-bold">
                                          <Clock className="w-3 h-3" /> Chưa chấm
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-4 text-center">
                                  <div className="flex justify-end items-center w-full lg:w-auto">
                                    <button
                                      onClick={() => {
                                        setGradingPayload({
                                          submission_id: sub.submission_id,
                                          grade: sub.grade || '',
                                          feedback: sub.feedback || '',
                                          subject_name: selectedAssignForGrading.title
                                        })
                                      }}
                                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                                    >
                                      {isGraded ? 'Chấm lại' : 'Chấm điểm'}
                                    </button>
                                    <button
                                      onClick={() => setEditSubmissionPayload({ submission_id: sub.submission_id, file_url: sub.file_url || '' })}
                                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                      title="Sửa link bài nộp"
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {gradingPayload.submission_id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#1a2332] border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 shadow-2xl space-y-6 transform transition-all h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <Edit3 className="w-5 h-5" />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white">Chấm Điểm Bài Làm</h4>
                        </div>
                        <button 
                          onClick={() => setGradingPayload({ submission_id: '', grade: '', feedback: '', subject_name: '' })}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSubmitGrading} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Môn học đồng bộ điểm</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <BookOpen className="w-4 h-4 text-slate-400" />
                            </div>
                            <select
                              required
                              value={gradingPayload.subject_name}
                              onChange={(e) => setGradingPayload({ ...gradingPayload, subject_name: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            >
                              <option value="">-- Chọn môn học --</option>
                              <option value="Toán">Toán</option>
                              <option value="Vật Lý">Vật Lý</option>
                              <option value="Hóa Học">Hóa Học</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm số (0 - 10)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            </div>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              required
                              value={gradingPayload.grade}
                              onChange={(e) => setGradingPayload({ ...gradingPayload, grade: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                              placeholder="Ví dụ: 8.5"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhận xét của Giáo viên</label>
                          <textarea
                            value={gradingPayload.feedback}
                            onChange={(e) => setGradingPayload({ ...gradingPayload, feedback: e.target.value })}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm h-24 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                            placeholder="Tuyệt vời! Tuy nhiên cần chú ý thêm về..."
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setGradingPayload({ submission_id: '', grade: '', feedback: '', subject_name: '' })}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            Lưu Điểm & Thông Báo
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL SỬA LINK BÀI NỘP */}
                {editSubmissionPayload.submission_id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                            <Edit3 className="w-5 h-5" />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white">Sửa Link Bài Nộp</h4>
                        </div>
                        <button
                          onClick={() => setEditSubmissionPayload({ submission_id: '', file_url: '' })}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={handleUpdateSubmissionFile} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link bài nộp mới</label>
                          <input
                            type="url"
                            required
                            value={editSubmissionPayload.file_url}
                            onChange={(e) => setEditSubmissionPayload({ ...editSubmissionPayload, file_url: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="https://drive.google.com/..."
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditSubmissionPayload({ submission_id: '', file_url: '' })}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            Cập Nhật Link
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5.7 NOTIFICATIONS */}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-3">
                  <span className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30"><Bell className="w-6 h-6" /></span>
                  Trung Tâm Thông Báo
                </h2>
                <p className="text-indigo-700/80 dark:text-indigo-300 mt-2 text-sm">Xem thông báo hệ thống hoặc gửi thông báo.</p>
              </div>
              <div className="flex gap-2 bg-white/50 dark:bg-slate-900/50 p-1 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <button
                  onClick={() => setNotifTab('inbox')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${notifTab === 'inbox' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  Hộp thư
                </button>
                <button
                  onClick={() => setNotifTab('send')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${notifTab === 'send' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  Phát thông báo
                </button>
              </div>
            </div>

            {notifTab === 'inbox' && (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2"><Inbox className="w-5 h-5 text-indigo-500" /> Thông Báo Hệ Thống</h3>
                <div className="space-y-4">
                  {notifications.filter(n => n.target_type === 'admin' || n.target_type === 'system').length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-medium">Chưa có thông báo nào.</div>
                  ) : (
                    notifications.filter(n => n.target_type === 'admin' || n.target_type === 'system').map(notif => (
                      <div key={notif.notification_id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex gap-4 shadow-sm hover:shadow-md">
                        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 h-fit">
                          <Bell className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{notif.title}</h4>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-700/50">{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {notifTab === 'send' && (
              <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl">
                  <form onSubmit={handleSendNotification} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiêu đề thông báo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Lịch nghỉ lễ kì tới"
                        value={notifForm.title}
                        onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nội dung chi tiết</label>
                      <textarea
                        required
                        placeholder="Nhập nội dung thông báo..."
                        value={notifForm.message}
                        onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm resize-none"
                      />
                    </div>

                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Phạm vi gửi (Đối tượng)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {[
                          { id: 'global', icon: '🌐', label: 'Toàn trường' },
                          { id: 'class', icon: '🏫', label: 'Theo Lớp' },
                          { id: 'student_phone', icon: '📱', label: 'Theo SĐT' },
                          { id: 'student_name', icon: '👤', label: 'Theo Tên' }
                        ].map(type => (
                          <div
                            key={type.id}
                            onClick={() => setNotifForm({ ...notifForm, target_type: type.id, target_id: '' })}
                            className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${notifForm.target_type === type.id ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500 dark:bg-indigo-900/40 dark:border-indigo-400' : 'bg-white border-slate-200 hover:border-indigo-300 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-indigo-500/50'}`}
                          >
                            <span className="text-2xl mb-1">{type.icon}</span>
                            <span className={`text-xs font-bold ${notifForm.target_type === type.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>{type.label}</span>
                          </div>
                        ))}
                      </div>

                      {notifForm.target_type === 'class' && (() => {
                        const allClasses = Array.from(new Set(students.map(s => s.class_name))).filter(Boolean).sort();
                        const selected = notifForm.target_id ? notifForm.target_id.split(',').filter(Boolean) : [];
                        return (
                          <div className="space-y-3">
                            <select
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              onChange={(e) => {
                                if (!e.target.value) return;
                                if (!selected.includes(e.target.value)) {
                                  setNotifForm({ ...notifForm, target_id: [...selected, e.target.value].join(',') });
                                }
                                e.target.value = "";
                              }}
                            >
                              <option value="">-- Chọn lớp muốn gửi --</option>
                              {allClasses.map(c => (
                                <option key={c} value={c} disabled={selected.includes(c)}>{c}</option>
                              ))}
                            </select>
                            <div className="flex flex-wrap gap-2">
                              {selected.map(cls => (
                                <span key={cls} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-sm font-medium">
                                  {cls}
                                  <button type="button" className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer" onClick={() => {
                                    setNotifForm({ ...notifForm, target_id: selected.filter(x => x !== cls).join(',') });
                                  }}>✕</button>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {notifForm.target_type === 'student_phone' && (() => {
                        const selected = notifForm.target_id ? notifForm.target_id.split(',').filter(Boolean) : [];
                        return (
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              placeholder="Nhập SĐT rồi ấn Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = e.target.value.trim();
                                  if (val && !selected.includes(val)) {
                                    setNotifForm({ ...notifForm, target_id: [...selected, val].join(',') });
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                            <div className="flex flex-wrap gap-2">
                              {selected.map(phone => {
                                const st = students.find(s => s.phone_number === phone);
                                return (
                                  <span key={phone} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg text-sm font-medium">
                                    {st ? `${st.full_name} (${phone})` : phone}
                                    <button type="button" className="hover:text-orange-900 dark:hover:text-orange-100 cursor-pointer" onClick={() => {
                                      setNotifForm({ ...notifForm, target_id: selected.filter(x => x !== phone).join(',') });
                                    }}>✕</button>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {notifForm.target_type === 'student_name' && (() => {
                        const selected = notifForm.target_id ? notifForm.target_id.split(',').filter(Boolean) : [];
                        return (
                          <div className="space-y-3 relative">
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              placeholder="Tìm Tên học sinh..."
                              id="notif_student_name_input"
                              onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                const drp = document.getElementById('notif_student_name_dropdown');
                                if (drp) drp.style.display = val ? 'block' : 'none';
                                const items = drp?.querySelectorAll('.notif-student-item') || [];
                                items.forEach(item => {
                                  if (item.textContent.toLowerCase().includes(val)) item.style.display = 'block';
                                  else item.style.display = 'none';
                                });
                              }}
                              onFocus={() => {
                                const drp = document.getElementById('notif_student_name_dropdown');
                                const val = document.getElementById('notif_student_name_input').value;
                                if (drp && val) drp.style.display = 'block';
                              }}
                            />
                            <div id="notif_student_name_dropdown" className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto hidden">
                              {students.map(st => (
                                <div
                                  key={st.student_id}
                                  className="notif-student-item px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                                  onClick={() => {
                                    if (!selected.includes(st.student_id)) {
                                      setNotifForm({ ...notifForm, target_id: [...selected, st.student_id].join(',') });
                                    }
                                    document.getElementById('notif_student_name_input').value = '';
                                    document.getElementById('notif_student_name_dropdown').style.display = 'none';
                                  }}
                                >
                                  <span className="font-bold">{st.full_name}</span> - {st.class_name} ({st.phone_number})
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selected.map(id => {
                                const st = students.find(s => s.student_id === id);
                                return (
                                  <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg text-sm font-medium">
                                    {st ? st.full_name : 'Unknown'}
                                    <button type="button" className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer" onClick={() => {
                                      setNotifForm({ ...notifForm, target_id: selected.filter(x => x !== id).join(',') });
                                    }}>✕</button>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
                    >
                      PHÁT THÔNG BÁO NGAY
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-2xl sticky top-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-200">
                    Mẹo gửi thông báo
                  </h3>
                  <ul className="space-y-4 text-sm text-slate-300">
                    <li className="flex flex-col sm:flex-row gap-3">
                      <span className="text-indigo-400">1.</span>
                      <span>Chọn <strong>Toàn trường</strong> để gửi cho tất cả học sinh đang học.</span>
                    </li>
                    <li className="flex flex-col sm:flex-row gap-3">
                      <span className="text-indigo-400">2.</span>
                      <span>Có thể chọn <strong>nhiều Lớp</strong> hoặc <strong>nhiều Số điện thoại</strong> trong một lần gửi.</span>
                    </li>
                    <li className="flex flex-col sm:flex-row gap-3">
                      <span className="text-indigo-400">3.</span>
                      <span>Bấm dấu <strong>✕</strong> trên tag màu để xóa đối tượng khỏi danh sách gửi.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

      </main>

      {/* --- ALL ADMINISTRATIVE MODALS --- */}

      {/* MODAL CRUD HỌC SINH */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-205 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">{studentForm.id ? 'Cập nhật Học sinh' : 'Thêm Học sinh mới'}</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={studentForm.full_name}
                  onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 12A1"
                  value={studentForm.class_name}
                  onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={studentForm.phone_number}
                  onChange={(e) => setStudentForm({ ...studentForm, phone_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tên phụ huynh</label>
                <input
                  type="text"
                  placeholder="Nhập tên phụ huynh"
                  value={studentForm.parent_name}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">SĐT phụ huynh</label>
                <input
                  type="tel"
                  placeholder="Nhập SĐT phụ huynh"
                  value={studentForm.parent_phone}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trạng thái học tập</label>
                <select
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                >
                  <option value="active">Đang học</option>
                  <option value="suspended">Tạm nghỉ</option>
                  <option value="dropped">Đã nghỉ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Môn học đăng ký</label>
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-lg">
                  {['Toán', 'Vật Lý', 'Hóa Học'].map(subject => (
                    <label key={subject} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        checked={studentForm.enrolled_subjects?.includes(subject)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          let newSubjects = studentForm.enrolled_subjects ? [...studentForm.enrolled_subjects] : [];
                          if (isChecked) newSubjects.push(subject);
                          else newSubjects = newSubjects.filter(s => s !== subject);
                          setStudentForm({...studentForm, enrolled_subjects: newSubjects});
                        }}
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT HỌC SINH 360 */}
      {showProfileModal && studentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-xl max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Hồ sơ Học sinh</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>
            
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-black text-xl">
                      {studentProfile.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{studentProfile.full_name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Lớp {studentProfile.class_name} • {studentProfile.phone_number}</p>
                    </div>
                  </div>
                  <div>
                    {studentProfile.status === 'suspended' ? (
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg">Tạm nghỉ</span>
                    ) : studentProfile.status === 'dropped' ? (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg">Đã nghỉ</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">Đang học</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Môn đăng ký</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {(() => {
                        const sGrades = grades.filter(g => g.student_id === studentProfile.student_id);
                        const sSchedules = schedules.filter(s => s.student_id === studentProfile.student_id);
                        const aSubjects = Array.from(new Set([
                          ...(studentProfile.enrolled_subjects || []),
                          ...sGrades.map(g => g.subject_name),
                          ...sSchedules.map(s => s.subject_name)
                        ].filter(Boolean)));
                        return aSubjects.length > 0 ? aSubjects.join(', ') : 'Chưa đăng ký';
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Phụ huynh</p>
                    <p className="font-medium text-slate-900 dark:text-white">{studentProfile.parent_name || '—'} ({studentProfile.parent_phone || '—'})</p>
                  </div>
                </div>
              </div>

              {/* Tình trạng điểm số */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Kết quả học tập gần đây</h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Môn học</th>
                        <th className="px-4 py-2 font-semibold text-center">15 phút</th>
                        <th className="px-4 py-2 font-semibold text-center">45 phút</th>
                        <th className="px-4 py-2 font-semibold text-center">Giữa kỳ</th>
                        <th className="px-4 py-2 font-semibold text-center">Cuối kỳ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {(() => {
                        const sGrades = grades.filter(g => g.student_id === studentProfile.student_id);
                        const sSchedules = schedules.filter(s => s.student_id === studentProfile.student_id);
                        const aSubjects = Array.from(new Set([
                          ...(studentProfile.enrolled_subjects || []),
                          ...sGrades.map(g => g.subject_name),
                          ...sSchedules.map(s => s.subject_name)
                        ].filter(Boolean)));

                        if (aSubjects.length === 0) {
                          return <tr><td colSpan="5" className="px-4 py-3 text-center text-slate-500">Chưa có dữ liệu môn học</td></tr>;
                        }

                        return aSubjects.map((subj, idx) => {
                          const g = sGrades.find(grade => grade.subject_name === subj) || {};
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-2 font-medium">{subj}</td>
                              <td className="px-4 py-2 text-center">{g.grade_15m ?? '-'}</td>
                              <td className="px-4 py-2 text-center">{g.grade_45m ?? '-'}</td>
                              <td className="px-4 py-2 text-center">{g.midterm_grade ?? '-'}</td>
                              <td className="px-4 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{g.final_grade ?? '-'}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL GÁN HỌC PHÍ */}
      {showTuitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Gán công nợ học phí</h3>
              <button onClick={() => setShowTuitionModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAssignTuition} className="space-y-4">

              {/* Toggle chế độ: Cá nhân / Cả lớp */}
              {!tuitionForm.fee_id && (
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTuitionForm({ ...tuitionForm, assign_mode: 'student', class_name: '' })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      tuitionForm.assign_mode === 'student'
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => setTuitionForm({ ...tuitionForm, assign_mode: 'class', student_id: '' })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      tuitionForm.assign_mode === 'class'
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Cả lớp
                  </button>
                </div>
              )}

              {/* Tìm kiếm học sinh (chế độ cá nhân) */}
              {tuitionForm.assign_mode === 'student' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Tìm &amp; chọn học sinh
                  </label>

                  {/* Hiển thị học sinh đã chọn */}
                  {tuitionForm.student_id ? (() => {
                    const sel = students.find(s => s.student_id === tuitionForm.student_id)
                    return sel ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{sel.full_name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{sel.phone_number} · {sel.class_name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setTuitionForm({ ...tuitionForm, student_id: '' }); setStudentPickerQuery(''); setShowStudentPicker(true) }}
                          className="text-xs text-red-500 hover:text-red-400 font-bold px-2 py-1 rounded"
                        >
                          Đổi
                        </button>
                      </div>
                    ) : null
                  })() : (
                    <div className="relative">
                      {/* Input tìm kiếm */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Gõ tên hoặc số điện thoại..."
                          value={studentPickerQuery}
                          onChange={(e) => { setStudentPickerQuery(e.target.value); setShowStudentPicker(true) }}
                          onFocus={() => setShowStudentPicker(true)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          autoComplete="off"
                        />
                      </div>

                      {/* Danh sách gợi ý */}
                      {showStudentPicker && (() => {
                        const filtered = students.filter(s =>
                          s.full_name.toLowerCase().includes(studentPickerQuery.toLowerCase()) ||
                          s.phone_number.includes(studentPickerQuery) ||
                          s.class_name.toLowerCase().includes(studentPickerQuery.toLowerCase())
                        ).slice(0, 6)
                        return filtered.length > 0 ? (
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            {filtered.map(s => (
                              <button
                                key={s.student_id}
                                type="button"
                                onClick={() => {
                                  const enrolled = s.enrolled_subjects || [];
                                  const isEnrolled = (name) => enrolled.some(e => String(e).toLowerCase().includes(name.toLowerCase()));
                                  const hasMatches = isEnrolled('Toán') || isEnrolled('Lý') || isEnrolled('Hóa');

                                  setTuitionForm(prev => ({
                                    ...prev,
                                    student_id: s.student_id,
                                    subject_configs: {
                                      'Toán': { ...(prev.subject_configs?.['Toán'] || {}), active: hasMatches ? isEnrolled('Toán') : true },
                                      'Lý': { ...(prev.subject_configs?.['Lý'] || {}), active: hasMatches ? (isEnrolled('Lý') || isEnrolled('Vật Lý')) : false },
                                      'Hóa': { ...(prev.subject_configs?.['Hóa'] || {}), active: hasMatches ? (isEnrolled('Hóa') || isEnrolled('Hóa Học')) : false }
                                    }
                                  }));
                                  setStudentPickerQuery('');
                                  setShowStudentPicker(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-purple-500/10 transition-colors flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{s.full_name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{s.phone_number}</p>
                                </div>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-semibold shrink-0">{s.class_name}</span>
                              </button>
                            ))}
                          </div>
                        ) : studentPickerQuery ? (
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 text-xs text-slate-400">
                            Không tìm thấy học sinh nào.
                          </div>
                        ) : null
                      })()}

                      {/* Hidden required field */}
                      <input type="hidden" value={tuitionForm.student_id} required />
                    </div>
                  )}
                </div>
              )}

              {/* Chọn lớp (chế độ cả lớp) */}
              {tuitionForm.assign_mode === 'class' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Chọn Lớp
                    <span className="ml-2 text-[10px] text-purple-500 font-bold">
                      ({students.filter(s => (s.classes?.class_name || s.class_name) === tuitionForm.class_name).length || 0} học sinh)
                    </span>
                  </label>
                  <select
                    required
                    value={tuitionForm.class_name}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, class_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white text-sm"
                  >
                    <option value="">Chọn lớp...</option>
                    {Array.from(new Set(students.map(s => s.classes?.class_name || s.class_name).filter(Boolean))).sort().map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  {tuitionForm.class_name && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      ⚠️ Học phí sẽ được gán cho tất cả {students.filter(s => (s.classes?.class_name || s.class_name) === tuitionForm.class_name).length} học sinh trong lớp này.
                    </p>
                  )}
                </div>
              )}

              {/* Cấu hình học phí 3 môn (Toán, Lý, Hóa) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                    ⚙️ Học phí 3 môn học (Toán, Lý, Hóa)
                  </label>
                  {tuitionForm.student_id && (() => {
                    const sel = students.find(s => s.student_id === tuitionForm.student_id);
                    const enrolled = sel?.enrolled_subjects || [];
                    return (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-full">
                        🔄 Đồng bộ từ HS ({enrolled.length > 0 ? enrolled.join(', ') : 'Mặc định Toán'})
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'Toán', name: 'Môn Toán', icon: '📐', defaultPrice: 500000 },
                    { id: 'Lý', name: 'Môn Vật Lý', icon: '⚡', defaultPrice: 500000 },
                    { id: 'Hóa', name: 'Môn Hóa Học', icon: '🧪', defaultPrice: 500000 }
                  ].map(subj => {
                    const cfg = tuitionForm.subject_configs?.[subj.id] || { active: false, months_count: 4, monthly_amount: subj.defaultPrice };
                    return (
                      <div key={subj.id} className={`p-3.5 rounded-2xl border transition-all space-y-3 ${cfg.active ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-400 dark:border-purple-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2.5 cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                            <input
                              type="checkbox"
                              checked={cfg.active}
                              onChange={(e) => {
                                const active = e.target.checked;
                                setTuitionForm({
                                  ...tuitionForm,
                                  subject_configs: {
                                    ...tuitionForm.subject_configs,
                                    [subj.id]: { ...cfg, active }
                                  }
                                });
                              }}
                              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                            />
                            <span>{subj.icon} {subj.name}</span>
                          </label>
                          {cfg.active && (
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                              {(cfg.months_count * cfg.monthly_amount).toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </div>

                        {cfg.active && (
                          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-purple-100 dark:border-purple-900/30">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Số tháng học</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max="36"
                                  required
                                  value={cfg.months_count}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value || 1));
                                    setTuitionForm({
                                      ...tuitionForm,
                                      subject_configs: {
                                        ...tuitionForm.subject_configs,
                                        [subj.id]: { ...cfg, months_count: val }
                                      }
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-bold"
                                />
                                <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 pointer-events-none">tháng</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Học phí / 1 tháng</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="50000"
                                  required
                                  value={cfg.monthly_amount}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value || 0);
                                    setTuitionForm({
                                      ...tuitionForm,
                                      subject_configs: {
                                        ...tuitionForm.subject_configs,
                                        [subj.id]: { ...cfg, monthly_amount: val }
                                      }
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-bold"
                                />
                                <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 pointer-events-none">đ</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Từ ngày / tháng</label>
                  <input
                    type="date"
                    required
                    value={tuitionForm.start_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tùy chọn tiêu đề (Không bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="Tùy chỉnh tiêu đề..."
                    value={tuitionForm.custom_title || ''}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, custom_title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Chế độ đóng học phí */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Hình thức gán khoản thu</label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="split_by_month"
                    checked={tuitionForm.split_by_month === true}
                    onChange={() => setTuitionForm({ ...tuitionForm, split_by_month: true })}
                    className="accent-purple-500"
                  />
                  <span>📅 Tạo riêng từng tháng (Học sinh đóng theo từng tháng)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="split_by_month"
                    checked={tuitionForm.split_by_month === false}
                    onChange={() => setTuitionForm({ ...tuitionForm, split_by_month: false })}
                    className="accent-purple-500"
                  />
                  <span>📦 Gộp thành gói đóng 1 lần</span>
                </label>
              </div>

              {/* Live Preview Thông Tin */}
              {(() => {
                const activeCfgs = Object.entries(tuitionForm.subject_configs || {}).filter(([k, v]) => v.active);
                const totalAmount = activeCfgs.reduce((sum, [k, v]) => sum + (v.months_count * v.monthly_amount), 0);
                const totalItemsCount = activeCfgs.reduce((sum, [k, v]) => sum + (tuitionForm.split_by_month ? v.months_count : 1), 0);
                return (
                  <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-1.5 text-xs text-purple-900 dark:text-purple-100">
                    <div className="font-bold flex items-center justify-between">
                      <span>💡 Tổng tiền học phí dự kiến:</span>
                      <span className="text-sm font-black text-purple-600 dark:text-purple-300">
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Đã chọn {activeCfgs.length} môn ({activeCfgs.map(([k, v]) => `${k}: ${v.months_count}T`).join(', ') || 'Chưa chọn môn'})
                      {tuitionForm.split_by_month ? ` · Tự động tạo ${totalItemsCount} khoản thu` : ` · Tạo ${totalItemsCount} gói gộp`}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTuitionModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {tuitionForm.assign_mode === 'class' ? `Gán cho cả lớp` : 'Gán khoản nợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MODAL CRUD LỊCH HỌC */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-205 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 flex flex-col">
            <div className="px-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between pb-3">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {scheduleForm.schedule_id ? 'Sửa Ca Học' : 'Thêm Ca Học'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  let mixedData = { classes: [], phones: [], names: [] };
                  try {
                    mixedData = JSON.parse(scheduleForm.target_id || '{"classes":[],"phones":[],"names":[]}');
                  } catch(e) {}
                  
                  const allClasses = Array.from(new Set(students.map(s => s.class_name))).filter(Boolean).sort();
                  const selectedClasses = mixedData.classes || [];
                  const selectedPhones = mixedData.phones || [];
                  const selectedNames = mixedData.names || [];

                  const updateMixedData = (newData) => {
                    setScheduleForm({
                      ...scheduleForm,
                      target_type: 'mixed',
                      target_id: JSON.stringify(newData)
                    });
                  };

                  return (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Lớp</label>
                        <div className="space-y-2">
                          <select
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                            onChange={(e) => {
                              if (!e.target.value) return;
                              if (!selectedClasses.includes(e.target.value)) {
                                updateMixedData({ ...mixedData, classes: [...selectedClasses, e.target.value] });
                              }
                              e.target.value = '';
                            }}
                          >
                            <option value="">-- Thêm Lớp --</option>
                            {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex flex-wrap gap-2">
                            {selectedClasses.map(cls => (
                              <span key={cls} className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs rounded-md flex items-center gap-1 border border-purple-200 dark:border-purple-800/50">
                                {cls}
                                <button type="button" onClick={() => updateMixedData({ ...mixedData, classes: selectedClasses.filter(x => x !== cls) })} className="hover:text-red-500">✕</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Học Sinh Lẻ (Tuỳ chọn)</label>
                        <div className="space-y-2 relative" id="student_mixed_search_container">
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                            placeholder="Nhập tên hoặc SĐT học sinh..."
                            id="student_mixed_input"
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase();
                              const dropdown = document.getElementById('student_mixed_dropdown');
                              if (!val) {
                                dropdown.style.display = 'none';
                                return;
                              }
                              const matches = students.filter(s => s.full_name.toLowerCase().includes(val) || (s.phone_number && s.phone_number.includes(val)));
                              if (matches.length > 0) {
                                dropdown.innerHTML = '';
                                matches.slice(0, 10).forEach(s => {
                                  const div = document.createElement('div');
                                  div.className = 'px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800/50 last:border-0';
                                  div.textContent = `${s.full_name} (${s.phone_number})`;
                                  div.onclick = () => {
                                    if (!selectedPhones.includes(s.phone_number)) {
                                      updateMixedData({ ...mixedData, phones: [...selectedPhones, s.phone_number] });
                                    }
                                    document.getElementById('student_mixed_input').value = '';
                                    dropdown.style.display = 'none';
                                  };
                                  dropdown.appendChild(div);
                                });
                                dropdown.style.display = 'block';
                              } else {
                                dropdown.innerHTML = '<div class="px-3 py-2 text-sm text-slate-400">Không tìm thấy</div>';
                                dropdown.style.display = 'block';
                              }
                            }}
                          />
                          <div id="student_mixed_dropdown" className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1f2833] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 hidden max-h-40 overflow-y-auto"></div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {selectedNames.map(name => (
                              <span key={`name_${name}`} className="px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 text-xs rounded-md flex items-center gap-1 border border-teal-200 dark:border-teal-800/50">
                                {name} (Tên cũ)
                                <button type="button" onClick={() => updateMixedData({ ...mixedData, names: selectedNames.filter(x => x !== name) })} className="hover:text-red-500">✕</button>
                              </span>
                            ))}
                            {selectedPhones.map(phone => {
                              const stu = students.find(s => s.phone_number === phone);
                              return (
                                <span key={`phone_${phone}`} className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-md flex items-center gap-1 border border-blue-200 dark:border-blue-800/50">
                                  {stu ? stu.full_name : phone}
                                  <button type="button" onClick={() => updateMixedData({ ...mixedData, phones: selectedPhones.filter(x => x !== phone) })} className="hover:text-red-500">✕</button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên môn học</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                  value={scheduleForm.subject_name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subject_name: e.target.value })}
                >
                  <option value="">-- Chọn môn học --</option>
                  <option value="Toán">Toán</option>
                  <option value="Vật Lý">Vật Lý</option>
                  <option value="Hóa Học">Hóa Học</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Phòng học</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                  value={scheduleForm.room_name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, room_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ngày học</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                    value={scheduleForm.study_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, study_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              {/* Lặp lại hàng tuần - chỉ hiện khi tạo mới */}
              {!scheduleForm.schedule_id && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleRepeatWeekly}
                      onChange={(e) => {
                        setScheduleRepeatWeekly(e.target.checked)
                        if (!e.target.checked) {
                          setScheduleRepeatUntil('');
                        }
                      }}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">🔁 Lặp lại hàng tuần (lịch cố định)</span>
                  </label>
                  {scheduleRepeatWeekly && (
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Các buổi học trong tuần</label>
                        {weeklySessions.map((session, index) => (
                          <div key={index} className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <select 
                              value={session.dayOfWeek}
                              onChange={(e) => {
                                const newSessions = [...weeklySessions];
                                newSessions[index].dayOfWeek = parseInt(e.target.value);
                                setWeeklySessions(newSessions);
                              }}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-sm"
                            >
                              <option value={1}>Thứ 2</option>
                              <option value={2}>Thứ 3</option>
                              <option value={3}>Thứ 4</option>
                              <option value={4}>Thứ 5</option>
                              <option value={5}>Thứ 6</option>
                              <option value={6}>Thứ 7</option>
                              <option value={0}>Chủ Nhật</option>
                            </select>
                            
                            <input
                              type="time"
                              value={session.start_time}
                              onChange={(e) => {
                                const newSessions = [...weeklySessions];
                                newSessions[index].start_time = e.target.value;
                                setWeeklySessions(newSessions);
                              }}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-sm w-24 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                              type="time"
                              value={session.end_time}
                              onChange={(e) => {
                                const newSessions = [...weeklySessions];
                                newSessions[index].end_time = e.target.value;
                                setWeeklySessions(newSessions);
                              }}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-sm w-24 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />

                            <input
                              type="text"
                              placeholder="Phòng học"
                              value={session.room_name}
                              onChange={(e) => {
                                const newSessions = [...weeklySessions];
                                newSessions[index].room_name = e.target.value;
                                setWeeklySessions(newSessions);
                              }}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-sm flex-1 min-w-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />

                            <button 
                              type="button"
                              onClick={() => {
                                const newSessions = [...weeklySessions];
                                newSessions.splice(index, 1);
                                setWeeklySessions(newSessions);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setWeeklySessions([...weeklySessions, { dayOfWeek: 1, start_time: scheduleForm.start_time || '08:00', end_time: scheduleForm.end_time || '09:30', room_name: scheduleForm.room_name || '' }]);
                          }}
                          className="mt-2 px-3 py-1.5 text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/40 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          + Thêm buổi học
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Lặp đến ngày</label>
                        <input
                          type="date"
                          required
                          min={scheduleForm.study_date}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                          value={scheduleRepeatUntil}
                          onChange={(e) => setScheduleRepeatUntil(e.target.value)}
                        />
                        {scheduleForm.study_date && scheduleRepeatUntil && (() => {
                          let count = 0;
                          if (weeklySessions.length > 0) {
                            let c = new Date(scheduleForm.study_date);
                            const u = new Date(scheduleRepeatUntil);
                            while (c <= u) {
                              if (weeklySessions.some(s => s.dayOfWeek === c.getDay())) count += weeklySessions.filter(s => s.dayOfWeek === c.getDay()).length;
                              c.setDate(c.getDate() + 1);
                            }
                          }
                          return (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1.5">
                              → Sẽ tạo {count} buổi học
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                {scheduleForm.schedule_id ? (
                  <button
                    type="button"
                    onClick={() => {
                      if(window.confirm('Xóa lịch học này?')) {
                        handleDeleteSchedule(scheduleForm.schedule_id);
                        setShowScheduleModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm"
                  >
                    Xóa
                  </button>
                ) : <div></div>}
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-sm cursor-pointer"
                  >
                    Lưu Lịch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐIỂM DANH */}
      {showAttendanceModal && attendanceSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-205 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-2xl max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 flex flex-col">
            <div className="px-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between pb-3">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Điểm Danh: {attendanceSchedule.subject_name || 'Ca Học'}
              </h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="block lg:table w-full text-left text-sm">
                  <thead className="hidden lg:table-header-group bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-3">Học Sinh</th>
                      <th className="px-4 py-3 text-center">Trạng Thái</th>
                      <th className="px-4 py-3">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody className="block lg:table-row-group divide-y divide-slate-100 dark:divide-slate-800">
                    {attendances.length === 0 ? (
                      <tr className="block lg:table-row"><td colSpan="3" className="block lg:table-cell text-center py-4 text-slate-400">Không có học sinh nào.</td></tr>
                    ) : attendances.map((att, index) => (
                      <tr key={att.student_id} className="block lg:table-row hover:bg-slate-50 dark:hover:bg-slate-800/30 bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent mb-4 lg:mb-0 rounded-xl border lg:border-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 transition-colors">
                        <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-3 font-semibold text-slate-900 dark:text-white border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Học Sinh</span>
                            <span>{att.full_name}</span>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-3 text-right lg:text-center border-b lg:border-0 border-slate-100 dark:border-slate-800/50 mb-2 lg:mb-0 pb-2 lg:pb-0">
                          <div className="flex justify-between items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase">Trạng Thái</span>
                            <select
                              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs py-1.5 px-2 font-bold focus:ring-purple-500 text-slate-700 dark:text-slate-300"
                              value={att.status}
                              onChange={(e) => {
                                const newAtts = [...attendances];
                                newAtts[index].status = e.target.value;
                                setAttendances(newAtts);
                              }}
                            >
                              <option value="present">✅ Có mặt</option>
                              <option value="absent">❌ Vắng mặt</option>
                              <option value="excused">⚠️ Vắng phép</option>
                            </select>
                          </div>
                        </td>
                        <td className="block lg:table-cell px-2 lg:px-4 py-2 lg:py-3">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full lg:w-auto">
                            <span className="lg:hidden text-xs font-bold text-slate-500 uppercase mb-2">Ghi Chú</span>
                            <input
                              type="text"
                              placeholder="Ghi chú..."
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs py-1.5 px-2 text-slate-700 dark:text-slate-300"
                              value={att.note || ''}
                              onChange={(e) => {
                                const newAtts = [...attendances];
                                newAtts[index].note = e.target.value;
                                setAttendances(newAtts);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-green-500/20"
                >
                  Lưu Điểm Danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GIAO BÀI TẬP */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-955 dark:text-white">{assignmentForm.assignment_id ? 'Sửa bài tập' : 'Giao bài tập mới'}</h3>
              <button onClick={() => { setShowAssignmentModal(false); setAssignmentForm({ assignment_id: '', title: '', description: '', target_type: 'class', target_id: '', deadline: '', file_url: '', submission_folder_url: '', attached_documents: [] }); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiêu đề bài tập</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài tập lớn SQL 1"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Loại Đối Tượng</label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white"
                    value={assignmentForm.target_type}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, target_type: e.target.value, target_id: '' })}
                  >
                    <option value="class">Cả lớp</option>
                    <option value="student_phone">Cá nhân (SĐT)</option>
                    <option value="student_name">Cá nhân (Tên)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    {assignmentForm.target_type === 'class' ? 'Chọn các lớp' : (assignmentForm.target_type === 'student_phone' ? 'Nhập SĐT (Enter)' : 'Tìm Tên học sinh')}
                  </label>
                  
                  {assignmentForm.target_type === 'class' && (() => {
                    const allClasses = Array.from(new Set(students.map(s => s.class_name))).filter(Boolean).sort();
                    const selected = assignmentForm.target_id ? assignmentForm.target_id.split(',').filter(Boolean) : [];
                    return (
                      <div className="space-y-2">
                        <select
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white"
                          onChange={(e) => {
                            if (!e.target.value) return;
                            if (!selected.includes(e.target.value)) {
                              setAssignmentForm({ ...assignmentForm, target_id: [...selected, e.target.value].join(',') });
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="">-- Chọn lớp --</option>
                          {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex flex-wrap gap-2">
                          {selected.map(cls => (
                            <span key={cls} className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs rounded-md flex items-center gap-1">
                              {cls}
                              <button type="button" onClick={() => setAssignmentForm({...assignmentForm, target_id: selected.filter(x => x !== cls).join(',')})} className="hover:text-red-500">✕</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {assignmentForm.target_type === 'student_phone' && (() => {
                    const selected = assignmentForm.target_id ? assignmentForm.target_id.split(',').filter(Boolean) : [];
                    return (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white"
                          placeholder="Nhập SĐT rồi ấn Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (!val) return;
                              const student = students.find(s => s.phone_number === val);
                              if (!student) {
                                alert('Không tìm thấy học sinh với SĐT này!');
                                return;
                              }
                              if (!selected.includes(val)) {
                                setAssignmentForm({ ...assignmentForm, target_id: [...selected, val].join(',') });
                              }
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {selected.map(phone => {
                            const stu = students.find(s => s.phone_number === phone);
                            return (
                              <span key={phone} className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-md flex items-center gap-1">
                                {stu ? stu.full_name : phone}
                                <button type="button" onClick={() => setAssignmentForm({...assignmentForm, target_id: selected.filter(x => x !== phone).join(',')})} className="hover:text-red-500">✕</button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {assignmentForm.target_type === 'student_name' && (() => {
                    const selected = assignmentForm.target_id ? assignmentForm.target_id.split(',').filter(Boolean) : [];
                    return (
                      <div className="space-y-2 relative">
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white"
                          placeholder="Nhập tên học sinh..."
                          id="assign_student_name_input"
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase();
                            const dropdown = document.getElementById('assign_student_name_dropdown');
                            if (!val) {
                              dropdown.style.display = 'none';
                              return;
                            }
                            const matches = students.filter(s => s.full_name.toLowerCase().includes(val));
                            if (matches.length > 0) {
                              dropdown.innerHTML = '';
                              matches.slice(0, 10).forEach(s => {
                                const div = document.createElement('div');
                                div.className = 'px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800/50 last:border-0';
                                div.textContent = `${s.full_name} (${s.phone_number})`;
                                div.onclick = () => {
                                  if (!selected.includes(s.full_name)) {
                                    setAssignmentForm({ ...assignmentForm, target_id: [...selected, s.full_name].join(',') });
                                  }
                                  document.getElementById('assign_student_name_input').value = '';
                                  dropdown.style.display = 'none';
                                };
                                dropdown.appendChild(div);
                              });
                              dropdown.style.display = 'block';
                            } else {
                              dropdown.innerHTML = '<div class="px-3 py-2 text-sm text-slate-400">Không tìm thấy</div>';
                              dropdown.style.display = 'block';
                            }
                          }}
                        />
                        <div id="assign_student_name_dropdown" className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1f2833] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 hidden max-h-40 overflow-y-auto"></div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selected.map(name => (
                            <span key={name} className="px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 text-xs rounded-md flex items-center gap-1">
                              {name}
                              <button type="button" onClick={() => setAssignmentForm({...assignmentForm, target_id: selected.filter(x => x !== name).join(',')})} className="hover:text-red-500">✕</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tài liệu đính kèm ({assignmentForm.attached_documents.length})</label>
                  {assignmentForm.attached_documents.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg min-h-[42px]">
                      {assignmentForm.attached_documents.map(docId => {
                        const doc = repoDocuments.find(d => d.document_id === docId);
                        if (!doc) return null;
                        return (
                          <div key={docId} className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md text-[11px] font-medium border border-purple-200 dark:border-purple-800/50">
                            <span className="truncate max-w-[150px]">{doc.title}</span>
                            <button 
                              type="button" 
                              onClick={(e) => { e.preventDefault(); setAssignmentForm({ ...assignmentForm, attached_documents: assignmentForm.attached_documents.filter(id => id !== docId) }); }}
                              className="text-purple-500 hover:text-purple-900 dark:hover:text-purple-100 ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic p-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      Chưa chọn tài liệu nào.
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Thêm tài liệu từ kho</label>
                    <input
                      type="text"
                      placeholder="Gõ để tìm kiếm..."
                      value={docSearchText}
                      onChange={(e) => setDocSearchText(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-md text-[10px] w-1/2 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-slate-250 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 p-1 space-y-0.5">
                    {(() => {
                      const availableDocs = repoDocuments.filter(doc => !assignmentForm.attached_documents.includes(doc.document_id));
                      const filteredDocs = availableDocs.filter(doc => 
                        doc.title?.toLowerCase().includes(docSearchText.toLowerCase()) || 
                        doc.class_name?.toLowerCase().includes(docSearchText.toLowerCase()) ||
                        doc.document_categories?.name?.toLowerCase().includes(docSearchText.toLowerCase())
                      );
                      
                      return filteredDocs.length > 0 ? filteredDocs.map(doc => (
                        <div 
                          key={doc.document_id} 
                          onClick={() => setAssignmentForm({ ...assignmentForm, attached_documents: [...assignmentForm.attached_documents, doc.document_id] })}
                          className="flex items-center justify-between p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors group"
                        >
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{doc.title}</span>
                            <div className="flex gap-1.5">
                              {doc.class_name && <span className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded-full leading-none">{doc.class_name}</span>}
                              {doc.document_categories && <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-1.5 py-0.5 rounded-full leading-none">{doc.document_categories.name}</span>}
                            </div>
                          </div>
                          <button type="button" className="text-slate-400 group-hover:text-purple-600 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] font-bold shadow-sm transition-all group-hover:border-purple-300">
                            Thêm +
                          </button>
                        </div>
                      )) : (
                        <p className="text-[11px] text-slate-500 text-center py-3">{availableDocs.length === 0 ? "Tất cả tài liệu đã được chọn." : "Không tìm thấy tài liệu phù hợp."}</p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Yêu cầu mô tả</label>
                <textarea
                  placeholder="Yêu cầu đề tài..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white h-20 placeholder-slate-450"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Hạn chót nộp bài</label>
                <input
                  type="datetime-local"
                  required
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đường dẫn tài liệu (Link bài tập)</label>
                <input
                  type="url"
                  placeholder="Ví dụ: https://docs.google.com/..."
                  value={assignmentForm.file_url || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, file_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Link thư mục nộp bài chung (Tuỳ chọn)</label>
                <input
                  type="url"
                  placeholder="Ví dụ: Link Google Drive để học sinh upload..."
                  value={assignmentForm.submission_folder_url || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, submission_folder_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{assignmentForm.assignment_id ? 'Lưu thay đổi' : 'Giao bài'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA LỚP HỌC */}
      {showClassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {classForm.class_id && !String(classForm.class_id).startsWith('temp_') ? 'Chỉnh Sửa Lớp Học' : (String(classForm.class_id).startsWith('temp_') ? 'Khởi Tạo Lớp Từ Dữ Liệu Tạm' : 'Thêm Lớp Học Mới')}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Tên lớp học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 12A1, 10C2, AnhVan_K11"
                  value={classForm.class_name}
                  onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Khối lớp</label>
                  <select
                    value={classForm.grade_level}
                    onChange={(e) => setClassForm({ ...classForm, grade_level: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Chọn khối (6-12)</option>
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={`Khối ${grade}`}>Khối {grade}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Năm học</label>
                  <input
                    type="text"
                    placeholder="2024-2025"
                    value={classForm.academic_year}
                    onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* MÔN HỌC CHÍNH (TOÁN, LÝ, HÓA) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Môn học (chọn 1, 2 hoặc cả 3 môn) *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const all3 = 'Toán, Vật Lý, Hóa Học';
                      const isAllSelected = (classForm.subject || '') === all3;
                      const nextSubs = isAllSelected ? 'Toán' : all3;
                      const count = nextSubs.split(',').length;
                      setClassForm(prev => ({
                        ...prev,
                        subject: nextSubs,
                        tuition_fee: count * 500000
                      }));
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {(classForm.subject || '') === 'Toán, Vật Lý, Hóa Học' ? 'Bỏ chọn' : 'Chọn cả 3 môn'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Toán', name: '📐 Toán' },
                    { id: 'Vật Lý', name: '⚡ Vật Lý' },
                    { id: 'Hóa Học', name: '🧪 Hóa Học' }
                  ].map(sub => {
                    const currentList = (classForm.subject || '').split(',').map(s => s.trim()).filter(Boolean);
                    const isSelected = currentList.includes(sub.id);

                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => {
                          let updated;
                          if (isSelected) {
                            updated = currentList.filter(s => s !== sub.id);
                          } else {
                            updated = [...currentList, sub.id];
                          }
                          const newSubjectStr = updated.join(', ');
                          const calculatedFee = updated.length * 500000;
                          setClassForm(prev => ({
                            ...prev,
                            subject: newSubjectStr,
                            tuition_fee: calculatedFee > 0 ? calculatedFee : prev.tuition_fee
                          }));
                        }}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HỌC PHÍ ĐỊNH KỲ (VNĐ/THÁNG) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Học phí định kỳ (VNĐ/tháng)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 500000"
                  value={classForm.tuition_fee ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                    setClassForm({ ...classForm, tuition_fee: val });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                {classForm.subject && (
                  <p className="text-[11px] text-indigo-500 font-medium pt-0.5">
                    💡 Đã chọn {(classForm.subject || '').split(',').filter(Boolean).length} môn • Dự kiến: {Number(classForm.tuition_fee || 0).toLocaleString('vi-VN')} đ/tháng
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 p-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!classForm.auto_assign_tuition}
                  onChange={(e) => setClassForm({ ...classForm, auto_assign_tuition: e.target.checked })}
                  className="rounded accent-indigo-600 w-4 h-4"
                />
                <span className="font-semibold">Tự động gán khoản nợ học phí này cho tất cả học sinh thuộc lớp</span>
              </label>


              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  {classForm.class_id && !String(classForm.class_id).startsWith('temp_') ? 'Cập Nhật Lớp' : (String(classForm.class_id).startsWith('temp_') ? 'Lưu & Khởi Tạo Lớp' : 'Tạo Lớp Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ HỌC SINH TRONG LỚP */}
      {showManageStudentsModal && managingClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Quản Lý Học Sinh: Lớp {managingClass.class_name}
                </h3>
                <p className="text-xs text-slate-500">Khối: {managingClass.grade_level || 'Chưa rõ'} • Năm học: {managingClass.academic_year || '2024-2025'}</p>
              </div>
              <button onClick={() => setShowManageStudentsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setManagingTab('enrolled')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  managingTab === 'enrolled'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Học sinh trong lớp ({students.filter(s => s.classes?.class_id === managingClass.class_id || s.class_name === managingClass.class_name || (s.student_classes && s.student_classes.some(sc => sc.classes?.class_id === managingClass.class_id))).length})
              </button>
              <button
                onClick={() => setManagingTab('add')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  managingTab === 'add'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                + Thêm học sinh vào lớp
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {managingTab === 'enrolled' ? (
                (() => {
                  const enrolled = students.filter(s => 
                    s.classes?.class_id === managingClass.class_id || 
                    s.class_name === managingClass.class_name ||
                    (s.student_classes && s.student_classes.some(sc => sc.classes?.class_id === managingClass.class_id))
                  );
                  const filtered = enrolled.filter(s => s.full_name.toLowerCase().includes(studentSearchInClass.toLowerCase()));

                  return (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Tìm tên học sinh trong lớp..."
                        value={studentSearchInClass}
                        onChange={(e) => setStudentSearchInClass(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />

                      {filtered.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                          Không có học sinh nào trong danh sách.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filtered.map(st => (
                            <div key={st.student_id} className="flex justify-between items-center py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                                  {st.full_name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white">{st.full_name}</p>
                                  <p className="text-xs text-slate-500">{st.phone_number || 'Chưa cập nhật SĐT'}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveStudentFromClass(managingClass.class_id, st.student_id, st.full_name)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa khỏi lớp</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const notEnrolled = students.filter(s => 
                    s.classes?.class_id !== managingClass.class_id && 
                    s.class_name !== managingClass.class_name &&
                    (!s.student_classes || !s.student_classes.some(sc => sc.classes?.class_id === managingClass.class_id))
                  );
                  const filtered = notEnrolled.filter(s => s.full_name.toLowerCase().includes(studentSearchInClass.toLowerCase()));

                  return (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Tìm học sinh để thêm vào lớp..."
                        value={studentSearchInClass}
                        onChange={(e) => setStudentSearchInClass(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />

                      <div className="flex justify-between items-center py-1 text-xs text-slate-500">
                        <span>Học sinh khả dụng ({filtered.length})</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold">
                          <input
                            type="checkbox"
                            checked={filtered.length > 0 && selectedStudentsToAssign.length === filtered.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudentsToAssign(filtered.map(s => s.student_id));
                              else setSelectedStudentsToAssign([]);
                            }}
                            className="rounded accent-indigo-600"
                          />
                          <span>Chọn tất cả</span>
                        </label>
                      </div>

                      {filtered.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                          Tất cả học sinh đã ở trong lớp này hoặc không tìm thấy.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filtered.map(st => {
                            const isChecked = selectedStudentsToAssign.includes(st.student_id);
                            return (
                              <div key={st.student_id} className="flex justify-between items-center py-2.5">
                                <label className="flex items-center gap-3 cursor-pointer flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) setSelectedStudentsToAssign(prev => prev.filter(id => id !== st.student_id));
                                      else setSelectedStudentsToAssign(prev => [...prev, st.student_id]);
                                    }}
                                    className="rounded accent-indigo-600"
                                  />
                                  <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{st.full_name}</p>
                                    <p className="text-xs text-slate-500">Lớp hiện tại: {st.classes?.class_name || st.class_name || 'Chưa xếp lớp'}</p>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowManageStudentsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              {managingTab === 'add' && selectedStudentsToAssign.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAssignStudentsToClass(managingClass.class_id, selectedStudentsToAssign)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm {selectedStudentsToAssign.length} học sinh vào lớp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GRADE SETTINGS MODAL */}
      {showGradeSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border-0 sm:border border-slate-100 dark:border-slate-800 rounded-none sm:rounded-3xl w-full sm:max-w-sm max-w-full p-4 sm:p-6 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Cấu hình trọng số điểm</h3>
              <button onClick={() => setShowGradeSettingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGradeSettings} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tên môn học</label>
                <select required value={gradeSettingsForm.subject_name} onChange={e => setGradeSettingsForm({...gradeSettingsForm, subject_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm">
                  <option value="">-- Chọn môn học --</option>
                  <option value="Toán">Toán</option>
                  <option value="Vật Lý">Vật Lý</option>
                  <option value="Hóa Học">Hóa Học</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trọng số 15 phút</label>
                  <input type="number" step="0.1" required value={gradeSettingsForm.weight_15m} onChange={e => setGradeSettingsForm({...gradeSettingsForm, weight_15m: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trọng số 1 tiết</label>
                  <input type="number" step="0.1" required value={gradeSettingsForm.weight_45m} onChange={e => setGradeSettingsForm({...gradeSettingsForm, weight_45m: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trọng số giữa kì</label>
                  <input type="number" step="0.1" required value={gradeSettingsForm.weight_mid} onChange={e => setGradeSettingsForm({...gradeSettingsForm, weight_mid: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trọng số cuối kì</label>
                  <input type="number" step="0.1" required value={gradeSettingsForm.weight_final} onChange={e => setGradeSettingsForm({...gradeSettingsForm, weight_final: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md">Lưu cấu hình</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// ==========================================
// 6. ĐIỀU HƯỚNG VÀ ROUTING CHÍNH
// ==========================================
