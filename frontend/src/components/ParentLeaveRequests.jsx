import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Loader2, Plus, Send } from 'lucide-react';
import { API_URL } from '../config.js';
import Swal from 'sweetalert2';

export default function ParentLeaveRequests({ data, onLeaveSubmit }) {
  const [showForm, setShowForm] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(data.students?.[0]?.student_id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveDate || !reason || !selectedStudentId) {
      Swal.fire('Thông báo', String('Vui lòng điền đủ thông tin và chọn học sinh'), 'info');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/student/leave-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudentId,
          leave_date: leaveDate,
          reason
        })
      });
      const resData = await response.json();
      if (resData.success) {
        Swal.fire({ title: 'Thành công!', text: String('Nộp đơn xin phép thành công!'), icon: 'success', timer: 2000, showConfirmButton: false });
        setShowForm(false);
        setLeaveDate('');
        setReason('');
        if (onLeaveSubmit) onLeaveSubmit();
      } else {
        Swal.fire('Thông báo', String(resData.message), 'info');
      }
    } catch (error) {
      Swal.fire('Lỗi', String('Lỗi khi nộp đơn xin phép'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentName = (studentId) => {
    const student = data.students?.find(s => s.student_id === studentId);
    return student ? student.full_name : 'Học sinh ẩn';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-500" />
          <span>Lịch sử Xin Nghỉ Phép</span>
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          {showForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Hủy' : 'Viết đơn xin phép'}</span>
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Gửi Đơn Xin Phép Mới</h4>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Chọn học sinh</label>
              <select
                required
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500"
              >
                {data.students?.map(stu => (
                  <option key={stu.student_id} value={stu.student_id}>
                    {stu.full_name} {stu.class_name ? `(${stu.class_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ngày xin nghỉ</label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={e => setLeaveDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Lý do</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ví dụ: Về quê có việc gia đình..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-900 font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Gửi Đơn</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học sinh</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày xin nghỉ</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lý do</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ngày nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {(!data.leaveRequests || data.leaveRequests.length === 0) ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Bạn chưa có đơn xin phép nào</td>
                </tr>
              ) : (
                data.leaveRequests.map(req => (
                  <tr key={req.request_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {getStudentName(req.student_id)}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {new Date(req.leave_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="p-4">
                      {req.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3" /> Đang chờ duyệt
                        </span>
                      ) : req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" /> Từ chối
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500 text-right">
                      {new Date(req.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
