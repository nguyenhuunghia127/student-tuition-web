import React, { useState } from 'react';

export default function WeeklyCalendar({ schedules, onEditSchedule, onUpdateSchedule, onAttendance, onRemindClass }) {
  const getSubjectColor = (subject) => {
    switch (subject?.toLowerCase()) {
      case 'toán': return { bg: 'from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30', border: 'border-blue-500/30 dark:border-blue-400/30', text: 'text-blue-900 dark:text-blue-100', textMuted: 'text-blue-700 dark:text-blue-300' };
      case 'vật lý': return { bg: 'from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30', border: 'border-green-500/30 dark:border-green-400/30', text: 'text-green-900 dark:text-green-100', textMuted: 'text-green-700 dark:text-green-300' };
      case 'hóa học': return { bg: 'from-orange-500/20 to-amber-500/20 dark:from-orange-500/30 dark:to-amber-500/30', border: 'border-orange-500/30 dark:border-orange-400/30', text: 'text-orange-900 dark:text-orange-100', textMuted: 'text-orange-700 dark:text-orange-300' };
      default: return { bg: 'from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30', border: 'border-indigo-500/30 dark:border-indigo-400/30', text: 'text-indigo-900 dark:text-indigo-100', textMuted: 'text-indigo-700 dark:text-indigo-300' };
    }
  };

  const getFormattedTarget = (sch) => {
    if (sch.target_type === 'mixed') {
      try {
        const parsed = JSON.parse(sch.target_id);
        const parts = [
          ...(parsed.classes || []),
          ...(parsed.names || []),
          ...(parsed.phones || [])
        ];
        return parts.join(', ');
      } catch (e) {
        return sch.target_id;
      }
    }
    return sch.target_id;
  };
  const [currentDate, setCurrentDate] = useState(new Date());

  // Tìm ngày Thứ 2 của tuần hiện tại
  const getMonday = (d) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dt.setDate(diff));
  };

  const monday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 15 }).map((_, i) => i + 7); // 07:00 to 21:00

  const handlePrevWeek = () => {
    const newD = new Date(currentDate);
    newD.setDate(newD.getDate() - 7);
    setCurrentDate(newD);
  };

  const handleNextWeek = () => {
    const newD = new Date(currentDate);
    newD.setDate(newD.getDate() + 7);
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    const scheduleId = e.dataTransfer.getData('schedule_id');
    if (!scheduleId) return;

    // Calculate dropped time
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourOffset = Math.floor(y / 40);
    const newStartHour = 7 + hourOffset;
    
    // Find existing schedule
    const sch = schedules.find(s => s.schedule_id === scheduleId);
    if (!sch) return;

    // Calculate duration
    const [startH, startM] = sch.start_time.split(':').map(Number);
    const [endH, endM] = sch.end_time.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    const newStartHStr = String(newStartHour).padStart(2, '0');
    const newStartMStr = String(startM).padStart(2, '0'); // Keep same minutes for simplicity
    
    let totalEndMinutes = newStartHour * 60 + startM + durationMinutes;
    const newEndHStr = String(Math.floor(totalEndMinutes / 60)).padStart(2, '0');
    const newEndMStr = String(totalEndMinutes % 60).padStart(2, '0');

    // Convert targetDate to YYYY-MM-DD
    const tzOffset = targetDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(targetDate.getTime() - tzOffset)).toISOString().split('T')[0];

    onUpdateSchedule({
      ...sch,
      study_date: localISOTime,
      start_time: `${newStartHStr}:${newStartMStr}`,
      end_time: `${newEndHStr}:${newEndMStr}`
    });
  };

  const formatScheduleDate = (isoString) => {
    if (!isoString) return '';
    return isoString.split('T')[0]; // fallback
  };

  return (
    <div className="glass-panel overflow-hidden flex flex-col rounded-[2rem]">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevWeek} className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">&lt;</button>
          <button onClick={handleToday} className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-colors">Hôm nay</button>
          <button onClick={handleNextWeek} className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">&gt;</button>
        </div>
        <div className="font-extrabold text-slate-800 dark:text-slate-200">
          Tuần: {monday.toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Mobile List View (only on small screens) */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {weekDays.map((day, i) => {
          const dateStr = (new Date(day.getTime() - day.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          const daySchedules = schedules.filter(s => s.study_date && s.study_date.startsWith(dateStr));
          
          if (daySchedules.length === 0) return null;

          return (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                Thứ {i === 6 ? 'CN' : i + 2} - {day.getDate()}/{day.getMonth() + 1}
              </h4>
              <div className="space-y-3">
                {daySchedules.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(sch => {
                  const colors = getSubjectColor(sch.subject_name);
                  const isAttended = sch.attendances && sch.attendances.length > 0;
                  return (
                  <div 
                    key={sch.schedule_id} 
                    className={`flex flex-col gap-1 p-3 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}
                    onClick={() => onEditSchedule && onEditSchedule(sch)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${colors.text} text-sm`}>{sch.subject_name}</span>
                      <span className={`text-xs font-semibold ${colors.text} bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded`}>
                        {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className={`text-xs ${colors.textMuted}`}>
                      Phòng: {sch.room_name} | Đối tượng: {getFormattedTarget(sch)}
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemindClass && onRemindClass(sch); }}
                        className="text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                        🔔 Nhắc lớp
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAttendance && onAttendance(sch); }}
                        className={`text-xs font-bold ${isAttended ? 'bg-slate-500 hover:bg-slate-400' : 'bg-green-500 hover:bg-green-400'} text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1`}
                      >
                        {isAttended ? '✅ Đã Đ.Danh' : '✔️ Điểm danh'}
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          );
        })}
        {schedules.filter(s => {
          const ds = new Date(s.study_date);
          return ds >= monday && ds <= weekDays[6];
        }).length === 0 && (
          <div className="text-center text-slate-500 py-8">
            Không có lịch học trong tuần này
          </div>
        )}
      </div>

      {/* Desktop Calendar Grid */}
      <div className="hidden md:flex flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 min-w-[800px]">
        {/* Time Labels */}
        <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-10 border-b border-slate-200 dark:border-slate-800"></div> {/* Header space */}
          {hours.map(h => (
            <div key={h} className="h-[40px] text-[10px] text-slate-400 font-bold text-center border-b border-slate-100 dark:border-slate-800/50 relative">
              <span className="absolute -top-2.5 left-0 right-0">{h}:00</span>
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="flex flex-1">
          {weekDays.map((day, i) => {
            const dateStr = (new Date(day.getTime() - day.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const daySchedules = schedules.filter(s => s.study_date && s.study_date.startsWith(dateStr));
            
            return (
              <div key={i} className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 min-w-[120px]">
                {/* Day Header */}
                <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Thứ {i === 6 ? 'CN' : i + 2}</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{day.getDate()}/{day.getMonth() + 1}</span>
                </div>
                
                {/* Day Body (Drop Zone) */}
                <div 
                  className="relative flex-1"
                  style={{ height: `${hours.length * 40}px` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  {/* Grid Lines */}
                  {hours.map(h => (
                    <div key={h} className="h-[40px] border-b border-slate-100 dark:border-slate-800/30"></div>
                  ))}

                  {/* Events */}
                  {daySchedules.map(sch => {
                    const [sH, sM] = sch.start_time.split(':').map(Number);
                    const [eH, eM] = sch.end_time.split(':').map(Number);
                    
                    const top = (sH - 7) * 40 + (sM / 60) * 40;
                    const height = (eH - sH) * 40 + ((eM - sM) / 60) * 40;

                    const colors = getSubjectColor(sch.subject_name);
                    const isAttended = sch.attendances && sch.attendances.length > 0;

                    return (
                      <div
                        key={sch.schedule_id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('schedule_id', sch.schedule_id);
                          e.target.style.opacity = '0.5';
                        }}
                        onDragEnd={(e) => e.target.style.opacity = '1'}
                        onClick={() => onEditSchedule && onEditSchedule(sch)}
                        className={`absolute left-1 right-1 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-2 shadow-md backdrop-blur-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden group`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={`${sch.subject_name}\n${sch.start_time.substring(0, 5)} - ${sch.end_time.substring(0, 5)}\nPhòng: ${sch.room_name}`}
                      >
                        <div className={`text-[11px] font-black ${colors.text} leading-tight mb-1 truncate pr-14`}>{sch.subject_name}</div>
                        <div className={`text-[9px] font-semibold ${colors.textMuted} leading-tight`}>
                          {getFormattedTarget(sch)} | {sch.room_name} | {sch.start_time.substring(0, 5)}-{sch.end_time.substring(0, 5)}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemindClass && onRemindClass(sch); }}
                            className="bg-yellow-500 hover:bg-yellow-400 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-black shadow-md shadow-yellow-500/30 transition-all hover:scale-110"
                            title="Nhắc nhở lớp học"
                          >
                            🔔
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onAttendance && onAttendance(sch); }}
                            className={`${isAttended ? 'bg-slate-500 hover:bg-slate-400 shadow-slate-500/30' : 'bg-green-500 hover:bg-green-400 shadow-green-500/30'} text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-black shadow-md transition-all hover:scale-110`}
                            title={isAttended ? "Sửa điểm danh" : "Điểm danh"}
                          >
                            {isAttended ? '✅' : '✔️'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
