import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Search, Loader2 } from 'lucide-react';
import { API_URL } from '../config.js';

export default function AdminLeaveRequests({ session }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/leave-requests`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setRequests(resData.data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Bạn chắc chắn muốn ${status === 'approved' ? 'chấp thuận' : 'từ chối'} đơn này?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status })
      });
      const resData = await response.json();
      if (resData.success) {
        fetchRequests();
      } else {
        alert(resData.message);
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.students?.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-500" />
          <span>Quản lý Đơn Xin Nghỉ Phép</span>
        </h3>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên học sinh, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học sinh / Lớp</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày xin nghỉ</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lý do</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày nộp</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" /></td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Không có đơn xin phép nào</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.request_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{req.students?.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{req.students?.class_name || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(req.leave_date).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(req.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(req.request_id, 'approved')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button onClick={() => handleUpdateStatus(req.request_id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-lg flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {req.status === 'approved' ? <><CheckCircle2 className="w-3 h-3"/> Đã duyệt</> : <><XCircle className="w-3 h-3"/> Đã từ chối</>}
                        </span>
                      )}
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
}
