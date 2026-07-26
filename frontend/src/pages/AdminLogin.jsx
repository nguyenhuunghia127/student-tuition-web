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

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const resJson = await response.json()
      
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || 'Lỗi đăng nhập admin')
      }

      localStorage.setItem('admin_session', JSON.stringify(resJson.data))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/10 dark:bg-purple-600/8 blur-[70px] animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/8 blur-[70px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-fuchsia-400/10 dark:bg-fuchsia-500/8 blur-[60px] animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md glass-panel rounded-[2rem] p-6 sm:p-8 transition-all duration-300 hover:border-purple-500/30 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4 ring-1 ring-purple-500/20">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Quản lý Học sinh, Học phí, Lịch học và Điểm số</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email Quản Trị</label>
            <input
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mật Khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm bg-red-500/5 dark:bg-red-500/10 p-3 rounded-lg flex items-center gap-1.5 border border-red-500/10">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Đăng Nhập</span>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-center gap-1.5 mx-auto"
          >
            Quay lại Cổng Học Sinh
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 5. GIAO DIỆN QUẢN TRỊ ADMIN (FULL CRUD & EXCEL IMPORT)
// ==========================================

// ==========================================
// THÊM: COMPONENT LỊCH TUẦN KÉO THẢ (WEEKLY CALENDAR)
// ==========================================

