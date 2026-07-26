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

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [parent, setParent] = useState(null)
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
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const [payFee, setPayFee] = useState(null);
  const [loadingFeeId, setLoadingFeeId] = useState(null);



  const handleOpenQRModal = async (fee) => {
    try {
      setLoadingFeeId(fee.fee_id);
      const response = await fetch(`${API_URL}/api/payment/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_id: fee.fee_id,
          parent_id: parent.parent_id,
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
          parent_id: parent.parent_id,
          fee_id: fee.fee_id,
          amount: fee.amount
        })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Lỗi xác nhận thanh toán');
      alert('Xác nhận thanh toán học phí qua VietQR thành công!');
      setPayFee(null);
      fetchDashboardData(parent);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const fetchDashboardData = async (profile) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/student/parent/dashboard?parent_phone=${encodeURIComponent(profile.parent_phone)}`)
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

  useEffect(() => {
    const savedParent = localStorage.getItem('parent_profile')
    if (!savedParent) {
      navigate('/')
      return
    }
    const profile = JSON.parse(savedParent)
    setParent(profile)
    fetchDashboardData(profile)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('parent_profile')
    navigate('/')
  }

  if (loading && !parent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    )
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

        {parent && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="text-right hidden sm:block pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-sm font-bold text-slate-900 dark:text-white">{parent.parent_name || 'Phụ Huynh'}</div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400">Tài khoản Phụ Huynh</div>
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
        {parent && (
          <div className="bg-gradient-to-r from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-[#1f2833] dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-cyan-500/3 rounded-full blur-[40px]"></div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">Hồ Sơ Phụ Huynh</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-3">{parent.parent_name || 'Phụ Huynh'}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm flex items-center gap-2">
                <User className="w-4 h-4" /> 
                <span>SĐT: <span className="font-mono">{parent.parent_phone}</span></span>
              </p>
              
              <div className="mt-4 space-y-3">
                {data.students && data.students.map((stu, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white">{stu.full_name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 mt-1">
                      <span><strong>Lớp:</strong> {stu.class_name || 'Chưa cập nhật'}</span>
                      <span><strong>Môn:</strong> {stu.enrolled_subjects?.join(', ') || 'Chưa đăng ký'}</span>
                      <span><strong>Trạng thái:</strong> <span className={stu.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>{stu.status === 'active' ? 'Đang học' : 'Nghỉ học'}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 glass-card rounded-2xl p-4 sm:p-5">
              <div className="text-center px-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Tổng số học sinh</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{data.students?.length || 0}</p>
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
            { id: 'notifications', label: 'Thông Báo Mới', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const countBadge = tab.id === 'notifications' 
              ? data.notifications.length 
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
                              <td className="px-4 whitespace-nowrap py-3.5">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  Thành công
                                </span>
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


    </div>
  )
}

// ==========================================
// 4. ĐĂNG NHẬP ADMIN
// ==========================================
