import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StudentLogin from './pages/StudentLogin.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import ParentDashboard from './pages/ParentDashboard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import './index.css'

// Khởi chạy mặc định cấu hình Theme trên root
const applyInitialTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
  }
}
applyInitialTheme()

const AdminRoute = ({ children }) => {
  const adminSession = localStorage.getItem('admin_session');
  if (!adminSession) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const studentProfile = localStorage.getItem('student_profile');
  if (!studentProfile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ParentRoute = ({ children }) => {
  const parentProfile = localStorage.getItem('parent_profile');
  if (!parentProfile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route 
          path="/dashboard" 
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          } 
        />
        <Route 
          path="/parent/dashboard" 
          element={
            <ParentRoute>
              <ParentDashboard />
            </ParentRoute>
          } 
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
