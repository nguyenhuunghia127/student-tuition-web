import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, BookOpen, Calendar, DollarSign, Award, Bell, 
  LogOut, Upload, CheckCircle2, AlertTriangle, Clock, 
  CreditCard, ExternalLink, Shield, User, Loader2, RefreshCw,
  Sun, Moon, Menu, X, FolderOpen, Link as LinkIcon, MessageSquare, CheckSquare
} from 'lucide-react'
import { API_URL } from '../config.js'
import WeeklyCalendar from '../components/WeeklyCalendar.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function StudentDashboard() {
  const [student, setStudent] = useState(null)
  const [data, setData] = useState({
    tuitionFees: [],
    paymentHistory: [],
    schedules: [],
    grades: [],
    assignments: [],
    submissions: [],
    notifications: []
  })
  
  const [activeTab, setActiveTab] = useState('tuition')
  const [loading, setLoading] = useState(true)
  const [submittingFile, setSubmittingFile] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionLink, setSubmissionLink] = useState('')
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('')
  const [submitErrorMsg, setSubmitErrorMsg] = useState('')
  const [payFee, setPayFee] = useState(null);
  const [loadingFeeId, setLoadingFeeId] = useState(null);

  const [showAppealModal, setShowAppealModal] = useState(false)
  const [appealForm, setAppealForm] = useState({ subject_name: '', reference_type: '', reference_id: '', reason: '' })
  const [submittingAppeal, setSubmittingAppeal] = useState(false)

  const handleOpenAppeal = (type, id, subject) => {
    setAppealForm({ subject_name: subject, reference_type: type, reference_id: id, reason: '' })
    setShowAppealModal(true)
  }

  const handleSubmitAppeal = async (e) => {
    e.preventDefault()
    if (!appealForm.reason.trim()) return;
    setSubmittingAppeal(true)
    try {
      const response = await fetch(`${API_URL}/api/student/grade-appeals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          ...appealForm
        })
      })
      const resJson = await response.json()
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || 'Lỗi gửi yêu cầu phúc khảo')
      }
      alert('Gửi yêu cầu phúc khảo thành công. Vui lòng chờ admin duyệt.')
      setShowAppealModal(false)
      fetchDashboardData(student)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmittingAppeal(false)
    }
  }

  const handleOpenQRModal = async (fee) => {
    try {
      setLoadingFeeId(fee.fee_id);
      const response = await fetch(`${API_URL}/api/payment/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_id: fee.fee_id,
          student_id: student.student_id,
          amount: fee.amount,
          title: fee.title
        })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Lỗi tạo mã VietQR');
      setPayFee({ ...fee, qrData: resData.data });
    } catch (err) {
      alert('Lỗi tạo mã QR thanh toán: ' + err.message);
    } finally {
      setLoadingFeeId(null);
    }
  };

  const handleConfirmPayment = async (fee) => {
    setSubmittingPayment(true);
    try {
      const response = await fetch(`${API_URL}/api/payment/confirm-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          fee_id: fee.fee_id,
          amount: fee.amount
        })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Lỗi xác nhận thanh toán');
      alert('Xác nhận thanh toán học phí qua VietQR thành công!');
      setPayFee(null);
      fetchDashboardData(student);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };


  const navigate = useNavigate()

  useEffect(() => {
    const savedStudent = localStorage.getItem('student_profile')
    if (!savedStudent) {
      navigate('/')
      return
    }
    const profile = JSON.parse(savedStudent)
    setStudent(profile)
    fetchDashboardData(profile)
  }, [navigate])

  async function fetchDashboardData(profile) {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/student/dashboard?student_id=${profile.student_id}`)
      if (!response.ok) throw new Error('Không thể lấy dữ liệu')
      const resJson = await response.json()
      if (resJson.success) {
        setData(resJson.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('student_profile')
    navigate('/')
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    if (!submissionLink.trim() && !selectedAssignment?.submission_folder_url) {
      setSubmitErrorMsg('Vui lòng nhập đường dẫn bài làm')
      return
    }

    setSubmittingFile(true)
    setSubmitErrorMsg('')
    setSubmitSuccessMsg('')

    try {
      const response = await fetch(`${API_URL}/api/student/assignments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          assignment_id: selectedAssignment.assignment_id,
          file_url: submissionLink.trim() || 'Nộp qua thư mục chung'
        })
      })
      const resJson = await response.json()
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || 'Lỗi khi nộp bài')
      }

      setSubmitSuccessMsg('Đã nộp bài thành công!')
      setSubmissionLink('')
      
      await fetchDashboardData(student)
      setTimeout(() => {
        setSelectedAssignment(null)
        setSubmitSuccessMsg('')
      }, 1500)
    } catch (err) {
      setSubmitErrorMsg(err.message)
    } finally {
      setSubmittingFile(false)
    }
  }

  if (loading && !student) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    )
  }

  const getGPA = () => {
    if (!data.grades || data.grades.length === 0) return { gpa: 'N/A', classification: 'N/A' }
    let sum = 0
    let count = 0
    data.grades.forEach(g => {
      if (g.summary_grade !== null) {
        sum += parseFloat(g.summary_grade)
        count++
      }
    })
    if (count === 0) return { gpa: 'N/A', classification: 'N/A' }
    const gpa = parseFloat((sum / count).toFixed(2))
    
    let classification = 'Trung bình'
    if (gpa >= 9.0) classification = 'Xuất sắc 🎉'
    else if (gpa >= 8.0) classification = 'Giỏi 🌟'
    else if (gpa >= 6.5) classification = 'Khá 👍'
    
    return { gpa, classification }
  }

  const { gpa, classification } = getGPA()

  const getDeadlineText = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date()
    if (diff < 0) return { text: 'Đã quá hạn', isOverdue: true }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return { text: `Còn ${days} ngày ${hours % 24} giờ`, isOverdue: false }
    return { text: `Còn ${hours} giờ`, isOverdue: false }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-[#c5c6c7] pb-12 transition-colors duration-300">
      
      {/* Floating Header */}
      <header className="sticky top-4 z-40 mx-4 sm:mx-6 lg:mx-8 glass-panel rounded-2xl px-6 py-3 flex items-center justify-between mb-8 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-tight">Học Đường Trực Tuyến</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cổng tra cứu học sinh</p>
          </div>
        </div>

        {student && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="text-right hidden sm:block pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-sm font-bold text-slate-900 dark:text-white">{student.full_name}</div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400">Lớp {student.class_name || 'Chưa xếp lớp'}</div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Banner Học sinh */}
        {student && (
          <div className="bg-gradient-to-r from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-[#1f2833] dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-cyan-500/3 rounded-full blur-[40px]"></div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">Hồ Sơ Học Sinh</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-3">{student.full_name}</h1>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span><strong>SĐT:</strong> {student.phone_number || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span><strong>Lớp:</strong> {student.class_name || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span><strong>Môn học:</strong> {Array.isArray(student.enrolled_subjects) && student.enrolled_subjects.length > 0 ? student.enrolled_subjects.join(', ') : 'Chưa đăng ký'}</span>
                </div>
                {student.parent_name && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span><strong>Phụ huynh:</strong> {student.parent_name} {student.parent_phone ? `- ${student.parent_phone}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 glass-card rounded-2xl p-4 sm:p-5">
              <div className="text-center px-4 border-r border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Điểm TB (GPA)</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{gpa}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Xếp Loại</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{classification}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex overflow-x-auto space-x-2 glass-card p-1.5 rounded-2xl mb-8 scrollbar-none">
          {[
            { id: 'tuition', label: 'Học Phí & Giao Dịch', icon: DollarSign },
            { id: 'schedule', label: 'Thời Khóa Biểu', icon: Calendar },
            { id: 'grades', label: 'Bảng Điểm', icon: Award },
            { id: 'assignments', label: 'Bài Tập Về Nhà', icon: BookOpen },
            { id: 'notifications', label: 'Thông Báo Mới', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const countBadge = tab.id === 'notifications' 
              ? data.notifications.length 
              : tab.id === 'assignments' 
                ? data.assignments.filter(a => !data.submissions.some(s => s.assignment_id === a.assignment_id)).length
                : 0

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {countBadge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-slate-950 text-cyan-400' : 'bg-red-500 text-white animate-pulse'}`}>
                    {countBadge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab view area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <p className="text-sm text-slate-450">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="transition-all duration-300">
            
            {/* 2.1 TAB HỌC PHÍ */}
            {activeTab === 'tuition' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Dư nợ */}
                <div className="lg:col-span-1 space-y-6">
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase">
                      <DollarSign className="w-4 h-4 text-cyan-500" />
                      <span>Học phí cần thanh toán</span>
                    </div>

                    {data.tuitionFees.filter(f => f.status === 'unpaid').length === 0 ? (
                      <div className="mt-6">
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0 VND</div>
                        <p className="text-emerald-600 dark:text-emerald-400 mt-3 text-sm font-bold flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Bạn đã hoàn thành mọi học phí!</span>
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        <div className="space-y-3 pt-2">
                          {data.tuitionFees.filter(f => f.status === 'unpaid').map(fee => {
                            const isOverdue = new Date(fee.due_date) < new Date();
                            return (
                            <div key={fee.fee_id} className={`p-4 bg-slate-50 dark:bg-slate-950/80 border ${isOverdue ? 'border-red-200 dark:border-red-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-2xl flex flex-col gap-3`}>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{fee.title}</h4>
                                <p className={`text-xs font-semibold mt-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                  {isOverdue ? 'Quá hạn: ' : 'Hạn đóng: '}{new Date(fee.due_date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-300">{Number(fee.amount).toLocaleString('vi-VN')} đ</span>
                                <button
                                  onClick={() => handleOpenQRModal(fee)}
                                  disabled={loadingFeeId === fee.fee_id}
                                  className={`px-4 py-2 ${isOverdue ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'} font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50`}
                                >
                                  {loadingFeeId === fee.fee_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                                  <span>{loadingFeeId === fee.fee_id ? 'Đang tạo...' : 'Mã VietQR'}</span>
                                </button>
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lịch sử đóng tiền */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-500" />
                    <span>Lịch sử đóng tiền học phí</span>
                  </h3>
                  
                  {data.paymentHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                      Chưa có lịch sử thanh toán nào được ghi nhận.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="overflow-x-auto w-full"><table className="min-w-max w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-250 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                            <th className="px-4 whitespace-nowrap pb-3">Ngày thanh toán</th>
                            <th className="px-4 whitespace-nowrap pb-3">Khoản thu</th>
                            <th className="px-4 whitespace-nowrap pb-3">Số tiền</th>
                            <th className="px-4 whitespace-nowrap pb-3">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {data.paymentHistory.map(history => (
                            <tr key={history.payment_id} className="text-slate-600 dark:text-slate-300">
                              <td className="px-4 whitespace-nowrap py-3.5 text-xs font-mono">{new Date(history.paid_at).toLocaleString('vi-VN')}</td>
                              <td className="px-4 whitespace-nowrap py-3.5 font-bold text-slate-900 dark:text-white">{history.tuition_fees?.title || 'Khoản thu cũ'}</td>
                              <td className="px-4 whitespace-nowrap py-3.5">{Number(history.amount).toLocaleString('vi-VN')} VND</td>
                              <td className="px-4 whitespace-nowrap py-3.5 flex items-center gap-3">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${history.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                  {history.status === 'pending' ? 'Chờ duyệt' : 'Thành công'}
                                </span>
                                {history.status !== 'pending' && (
                                  <button onClick={() => generateInvoice(history, data.student)} className="text-[10px] flex items-center gap-1 font-bold text-cyan-600 hover:text-cyan-800 cursor-pointer">
                                    <Download className="w-3 h-3" /> Tải PDF
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2.2 TAB THỜI KHÓA BIỂU */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-500" />
                    <span>Lịch Học & Phòng Học</span>
                  </h3>
                </div>

                <WeeklyCalendar 
                  schedules={data.schedules} 
                  onUpdateSchedule={null} 
                  onEditSchedule={null} 
                />

                <div className="glass-card rounded-3xl p-6 relative overflow-hidden mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                      <span>Lịch Sử Điểm Danh</span>
                    </h3>
                  </div>
                  
                  {data.attendances && data.attendances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl">Ngày Học</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Môn / Lớp</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng Thái</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-xl">Ghi Chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.attendances.sort((a,b) => new Date(b.schedules?.study_date || 0) - new Date(a.schedules?.study_date || 0)).map((att, idx) => (
                            <tr key={att.attendance_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                {att.schedules?.study_date ? new Date(att.schedules.study_date).toLocaleDateString('vi-VN') : '-'}
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                <div className="font-bold text-slate-900 dark:text-white">{att.schedules?.subject_name || '-'}</div>
                                <div className="text-xs text-slate-500">{att.schedules?.class_name || '-'}</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {att.is_present ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                    <X className="w-3.5 h-3.5" /> Vắng mặt
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                {att.note || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                      Chưa có dữ liệu điểm danh nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2.3 TAB BẢNG ĐIỂM */}
            {activeTab === 'grades' && (
              <div className="space-y-6">
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>Kết Quả Định Kỳ (Trên Lớp)</span>
                    </h3>
                  </div>

                  {data.grades.length === 0 ? (
                    <div className="text-center py-16 text-slate-450 dark:text-slate-500">
                      Bảng điểm định kỳ của bạn hiện tại trống.
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-max w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-250 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                            <th className="px-4 whitespace-nowrap pb-3 pl-4">Tên môn học</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">15 Phút</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">1 Tiết</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">Giữa kì</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">Cuối kì</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center pr-4">Tổng kết môn</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {data.grades.map(grade => {
                            const isExcellent = grade.summary_grade >= 8.5
                            return (
                              <tr key={grade.grade_id} className="text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                                <td className="px-4 whitespace-nowrap py-4 pl-4 font-bold text-slate-900 dark:text-white">{grade.subject_name}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-center font-mono">{grade.grade_15m !== null ? grade.grade_15m : '-'}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-center font-mono">{grade.grade_45m !== null ? grade.grade_45m : '-'}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-center font-mono">{grade.midterm_grade !== null ? grade.midterm_grade : '-'}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-center font-mono">{grade.final_grade !== null ? grade.final_grade : '-'}</td>
                                <td className={`py-4 text-center font-bold font-mono pr-4 ${isExcellent ? 'text-purple-600 dark:text-purple-400 text-base' : 'text-slate-900 dark:text-slate-200'}`}>
                                  {grade.summary_grade !== null ? grade.summary_grade : '-'}
                                  {grade.summary_grade !== null && (
                                    <button onClick={() => handleOpenAppeal('grade', grade.grade_id, grade.subject_name)} className="ml-3 px-2 py-1 text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg cursor-pointer" title="Phúc khảo điểm">Phúc khảo</button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>Kết Quả Bài Tập Về Nhà</span>
                    </h3>
                  </div>

                  {data.submissions.filter(s => s.status === 'graded').length === 0 ? (
                    <div className="text-center py-16 text-slate-450 dark:text-slate-500">
                      Chưa có bài tập nào được chấm điểm.
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-max w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-250 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                            <th className="px-4 whitespace-nowrap pb-3 pl-4">Tên bài tập</th>
                            <th className="px-4 whitespace-nowrap pb-3">Hạn nộp</th>
                            <th className="px-4 whitespace-nowrap pb-3">Ngày nộp</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">Nhận xét</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center pr-4">Điểm</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {data.submissions.filter(s => s.status === 'graded').sort((a,b) => new Date(b.submitted_at) - new Date(a.submitted_at)).map(sub => {
                            const assign = data.assignments.find(a => a.assignment_id === sub.assignment_id);
                            const isExcellent = sub.grade >= 8.5;
                            return (
                              <tr key={sub.submission_id} className="text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                                <td className="px-4 whitespace-nowrap py-4 pl-4 font-bold text-slate-900 dark:text-white">{assign ? assign.title : 'Bài tập không xác định'}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-xs font-mono">{assign ? new Date(assign.deadline).toLocaleDateString('vi-VN') : '-'}</td>
                                <td className="px-4 whitespace-nowrap py-4 text-xs font-mono">{new Date(sub.submitted_at).toLocaleString('vi-VN')}</td>
                                <td className="px-4 py-4 text-center max-w-xs truncate" title={sub.feedback}>{sub.feedback || '-'}</td>
                                <td className={`py-4 text-center font-bold font-mono pr-4 ${isExcellent ? 'text-emerald-600 dark:text-emerald-400 text-base' : 'text-slate-900 dark:text-slate-200'}`}>
                                  {sub.grade}
                                  <button onClick={() => handleOpenAppeal('assignment', sub.submission_id, assign ? assign.title : 'Bài tập')} className="ml-3 px-2 py-1 text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg cursor-pointer" title="Phúc khảo điểm bài tập">Phúc khảo</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Lịch sử phúc khảo */}
                {data.gradeAppeals && data.gradeAppeals.length > 0 && (
                  <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-amber-500" />
                        <span>Lịch Sử Phúc Khảo</span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-max w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-250 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase text-left">
                            <th className="px-4 whitespace-nowrap pb-3 pl-4">Môn học / Bài tập</th>
                            <th className="px-4 whitespace-nowrap pb-3">Lý do</th>
                            <th className="px-4 whitespace-nowrap pb-3">Ngày gửi</th>
                            <th className="px-4 whitespace-nowrap pb-3 text-center">Trạng thái</th>
                            <th className="px-4 whitespace-nowrap pb-3 pr-4">Phản hồi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {data.gradeAppeals.map(appeal => (
                            <tr key={appeal.appeal_id} className="text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                              <td className="px-4 whitespace-nowrap py-4 pl-4 font-bold text-slate-900 dark:text-white">{appeal.subject_name}</td>
                              <td className="px-4 py-4 max-w-xs truncate" title={appeal.reason}>{appeal.reason}</td>
                              <td className="px-4 whitespace-nowrap py-4 text-xs font-mono">{new Date(appeal.created_at).toLocaleDateString('vi-VN')}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${appeal.status === 'pending' ? 'bg-amber-100 text-amber-700' : appeal.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {appeal.status === 'pending' ? 'Đang chờ duyệt' : appeal.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                </span>
                              </td>
                              <td className="px-4 py-4 pr-4 max-w-xs truncate text-xs font-medium text-slate-500 dark:text-slate-400" title={appeal.admin_response || ''}>
                                {appeal.admin_response ? appeal.admin_response : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2.4 TAB BÀI TẬP VỀ NHÀ */}
            {activeTab === 'assignments' && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-500" />
                  <span>Danh Sách Bài Tập Về Nhà</span>
                </h3>

                {data.assignments.length === 0 ? (
                  <div className="text-center py-16 text-slate-450 dark:text-slate-500">
                    Bạn hiện tại không có bài tập nào được giao.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.assignments.map(assign => {
                      const submission = data.submissions.find(s => s.assignment_id === assign.assignment_id)
                      const dInfo = getDeadlineText(assign.deadline)

                      return (
                        <div key={assign.assignment_id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{assign.title}</h4>
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {assign.target_type === 'class' ? 'Lớp ' : assign.target_type === 'student_phone' ? 'SĐT ' : 'HS '}{assign.target_id}
                              </span>
                            </div>
                            {assign.description && <p className="text-xs text-slate-500 dark:text-slate-400">{assign.description}</p>}
                            {assign.file_url && (
                              <a 
                                href={assign.file_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline pt-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Xem chi tiết bài tập</span>
                              </a>
                            )}
                            {assign.assignment_documents && assign.assignment_documents.length > 0 && (
                              <div className="pt-3 pb-1 flex flex-col gap-1.5 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Tài liệu tham khảo đính kèm:</span>
                                {assign.assignment_documents.map((ad, idx) => {
                                  if (!ad.documents) return null;
                                  return (
                                    <a
                                      key={idx}
                                      href={ad.documents.file_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[200px] sm:max-w-[300px]">{ad.documents.title}</span>
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-6">
                            <div className="space-y-1 text-right">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Hạn nộp bài</p>
                              <p className="text-xs text-slate-800 dark:text-slate-300 font-bold">{new Date(assign.deadline).toLocaleString('vi-VN')}</p>
                              <p className={`text-[10px] font-extrabold flex items-center justify-end gap-1 ${dInfo.isOverdue ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {!submission && (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    <span>{dInfo.text}</span>
                                  </>
                                )}
                              </p>
                            </div>

                            {submission ? (
                              <div className="p-3 glass-card border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Đã nộp bài</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Lúc {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                                {submission.status === 'graded' ? (
                                  <div className="pl-3 border-l border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-bold">Điểm</p>
                                    <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{submission.grade}</p>
                                  </div>
                                ) : (
                                  <div className="pl-3 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold">Chờ chấm</span>
                                    {!dInfo.isOverdue && (
                                      <button
                                        onClick={() => setSelectedAssignment(assign)}
                                        className="text-[10px] text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold hover:underline"
                                      >
                                        Nộp lại
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedAssignment(assign)}
                                className="px-5 py-3 bg-cyan-500 hover:bg-cyan-455 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                              >
                                Nộp Bài Làm
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            
            {/* 2.6 TAB XIN NGHỈ PHÉP */}
            {activeTab === 'leaves' && (
              <StudentLeaveRequests data={data} onLeaveSubmit={() => fetchDashboardData(data.student)} />
            )}

            {/* 2.5 TAB THÔNG BÁO */}
            {activeTab === 'notifications' && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  <span>Bảng Tin & Cảnh Báo Khẩn</span>
                </h3>

                {data.notifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-450 dark:text-slate-500">
                    Hiện tại bạn không có thông báo nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.notifications.map(notif => {
                      const isTargeted = notif.target_type === 'student' || notif.target_type === 'targeted' || (notif.target_id && notif.target_id.startsWith('student:'))
                      return (
                        <div 
                          key={notif.notification_id} 
                          className={`p-5 rounded-2xl border transition-all ${
                            isTargeted 
                              ? 'bg-red-500/5 border-red-550/20 text-red-950 dark:text-red-100 animate-[pulse_2s_infinite]' 
                              : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isTargeted ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-850 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {isTargeted ? 'Cá nhân' : 'Chung'}
                                </span>
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{notif.title}</h4>
                              </div>
                              <p className="text-sm leading-relaxed">{notif.message}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap pt-1">
                              {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* MODAL NỘP BÀI */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 rounded-3xl w-full sm:max-w-lg max-w-full p-6 shadow-2xl space-y-6 transform transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Nộp bài: {selectedAssignment.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-6">
              {selectedAssignment.submission_folder_url ? (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                    <p className="text-sm text-indigo-900 dark:text-indigo-200 font-bold leading-relaxed relative z-10">
                      Bài tập này yêu cầu nộp file trực tiếp vào thư mục chung của lớp.
                    </p>
                    <a 
                      href={selectedAssignment.submission_folder_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg relative z-10"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Mở thư mục nộp bài
                    </a>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold italic">
                      * Sau khi đã tải file lên thư mục thành công, hãy ấn <b>Xác nhận đã nộp</b> bên dưới. Hoặc dán link cá nhân dự phòng:
                    </p>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        placeholder="Link bài làm cá nhân (Google Drive, Docs...)"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Đường dẫn bài làm (Google Drive, Github...)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LinkIcon className="w-4 h-4 text-cyan-500" />
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>
              )}

              {submitErrorMsg && (
                <div className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 font-semibold animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{submitErrorMsg}</span>
                </div>
              )}

              {submitSuccessMsg && (
                <div className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 font-semibold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingFile}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submittingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedAssignment.submission_folder_url ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />)}
                  <span>{submittingFile ? 'Đang xử lý...' : (selectedAssignment.submission_folder_url ? 'Xác nhận đã nộp' : 'Gửi bài nộp')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THANH TOÁN QR */}
      {payFee && payFee.qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2833] border border-slate-200 dark:border-slate-800 rounded-3xl w-full sm:max-w-md max-w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-left">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white font-sans">Quét mã thanh toán VietQR</h3>
              <button onClick={() => setPayFee(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-inner border border-slate-200">
              <img 
                src={payFee.qrData.qrImageUrl} 
                alt="Mã QR thanh toán VietQR" 
                className="w-56 h-56 mx-auto object-contain"
              />
            </div>

            <div className="text-left space-y-2 text-sm text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold text-slate-900 dark:text-white">{payFee.qrData.bankId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{payFee.qrData.accountNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold text-slate-900 dark:text-white">{payFee.qrData.accountName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Số tiền đóng:</span>
                <span className="font-extrabold text-red-500 dark:text-red-400 text-base">{Number(payFee.qrData.amount).toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Nội dung CK:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{payFee.qrData.transferContent}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(payFee.qrData.transferContent);
                      alert('Đã sao chép nội dung chuyển khoản!');
                    }}
                    className="text-[10px] px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer hover:bg-cyan-400"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-left text-xs text-amber-700 dark:text-amber-300 leading-relaxed flex gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
              <span>Quét mã qua ứng dụng ngân hàng hoặc Momo. Nhấn <b>Xác nhận đã chuyển</b> sau khi hoàn tất giao dịch.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayFee(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => handleConfirmPayment(payFee)}
                disabled={submittingPayment}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Xác nhận đã chuyển</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showAppealModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Yêu cầu phúc khảo điểm</h3>
              <button onClick={() => setShowAppealModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAppeal} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Môn học / Bài tập</label>
                <input readOnly value={appealForm.subject_name} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-semibold cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lý do phúc khảo (Chi tiết)</label>
                <textarea required rows="4" placeholder="Em thấy điểm số chưa đúng ở phần..." value={appealForm.reason} onChange={e => setAppealForm({...appealForm, reason: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-955 dark:text-white text-sm placeholder-slate-400" />
              </div>
              
              <div className="flex justify-end gap-2.5 pt-3">
                <button type="button" onClick={() => setShowAppealModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:text-slate-900 cursor-pointer">Hủy</button>
                <button type="submit" disabled={submittingAppeal} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 disabled:opacity-50 shadow-md">
                  {submittingAppeal ? 'Đang gửi...' : 'Gửi đơn phúc khảo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 4. ĐĂNG NHẬP ADMIN
// ==========================================
