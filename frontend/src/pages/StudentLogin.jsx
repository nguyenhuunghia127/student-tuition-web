import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, BookOpen, Calendar, DollarSign, Award, Bell, 
  LogOut, Upload, CheckCircle2, AlertTriangle, Clock, 
  CreditCard, ExternalLink, Shield, User, Loader2, RefreshCw,
  Sun, Moon, Menu, X
} from 'lucide-react'
import { API_URL } from '../config.js'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function StudentLogin() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedStudent = localStorage.getItem('student_profile')
    if (savedStudent) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
    
    setError('')
    setLoading(true)
    try {
      let response = await fetch(`${API_URL}/api/student/profile?phone=${encodeURIComponent(phone.trim())}`)
      let resData = await response.json()
      
      if (!response.ok || !resData.success) {
        // Try parent login
        response = await fetch(`${API_URL}/api/student/parent/profile?phone=${encodeURIComponent(phone.trim())}`)
        resData = await response.json()
        
        if (!response.ok || !resData.success) {
          throw new Error('Không tìm thấy số điện thoại trong hệ thống (Học sinh/Phụ huynh)')
        }
      }

      if (resData.data.role === 'parent') {
        localStorage.setItem('parent_profile', JSON.stringify(resData.data))
        navigate('/parent/dashboard')
      } else {
        localStorage.setItem('student_profile', JSON.stringify(resData.data))
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 dark:bg-cyan-500/8 blur-[70px] animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 dark:bg-blue-600/8 blur-[70px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-400/10 dark:bg-purple-500/8 blur-[60px] animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md glass-panel rounded-[2rem] p-6 sm:p-8 transition-all duration-300 hover:border-cyan-500/30 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-4 ring-1 ring-cyan-500/20">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cổng Học Sinh</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Tra cứu thông tin học tập & học phí trực tuyến</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Số Điện Thoại Đăng Nhập
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all text-lg"
              />
            </div>
            {error && (
              <div className="mt-3 text-red-500 dark:text-red-400 text-sm flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 dark:bg-red-500/10 dark:border-red-500/20 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <span>Vào Hệ Thống</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-center gap-1.5 mx-auto"
          >
            <Shield className="w-4 h-4" />
            Đăng nhập cho Cán bộ / Admin
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. DASHBOARD HỌC SINH (5 TAB CHỨC NĂNG)
// ==========================================
