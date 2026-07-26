import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#10B981', '#F43F5E']; // Green for Paid, Red for Unpaid

export default function RevenueChart({ data, paidAmount, unpaidAmount }) {
  const pieData = [
    { name: 'Đã thu', value: paidAmount },
    { name: 'Chưa thu', value: unpaidAmount },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-cyan-400 font-extrabold text-sm">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Bar Chart - Doanh thu theo tháng */}
      <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Biểu Đồ Doanh Thu Học Phí</h3>
        <div className="h-[300px] w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000000}M`} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">Chưa có dữ liệu doanh thu</div>
          )}
        </div>
      </div>

      {/* Pie Chart - Tỷ lệ thu học phí */}
      <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 text-center">Tỉ Lệ Thu Phí</h3>
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {paidAmount + unpaidAmount > 0 ? Math.round((paidAmount / (paidAmount + unpaidAmount)) * 100) : 0}%
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
}
