import React, { useState, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// ─── STATIC HELPERS ──────────────────────────────────────────────────────────

const SUBJECT_COLORS = {
  'toán':     { bg: 'from-blue-500/25 to-cyan-500/25 dark:from-blue-500/35 dark:to-cyan-500/35',    border: 'border-blue-400/40',   text: 'text-blue-900 dark:text-blue-100',   muted: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500'   },
  'vật lý':   { bg: 'from-green-500/25 to-emerald-500/25 dark:from-green-500/35 dark:to-emerald-500/35', border: 'border-green-400/40',  text: 'text-green-900 dark:text-green-100', muted: 'text-green-700 dark:text-green-300', dot: 'bg-green-500'  },
  'hóa học':  { bg: 'from-orange-500/25 to-amber-500/25 dark:from-orange-500/35 dark:to-amber-500/35',  border: 'border-orange-400/40', text: 'text-orange-900 dark:text-orange-100', muted: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' }
};
const DEFAULT_COLOR  = { bg: 'from-indigo-500/25 to-purple-500/25 dark:from-indigo-500/35 dark:to-purple-500/35', border: 'border-indigo-400/40', text: 'text-indigo-900 dark:text-indigo-100', muted: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' };
const ATTENDED_COLOR = { bg: 'from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-600/30',  border: 'border-emerald-400/50', text: 'text-emerald-900 dark:text-emerald-100', muted: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', status: 'attended' };
const MISSED_COLOR   = { bg: 'from-red-500/20 to-rose-500/20 dark:from-red-500/25 dark:to-rose-500/25',   border: 'border-red-400/50',     text: 'text-red-900 dark:text-red-100',     muted: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500',     status: 'missed'   };

function getSubjectColor(name) {
  return SUBJECT_COLORS[name?.toLowerCase()] ?? DEFAULT_COLOR;
}

function getStatusColor(sch) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const schDate = new Date(sch.study_date); schDate.setHours(0, 0, 0, 0);
  const isPast = schDate < today;
  const isAttended = sch.attendances && sch.attendances.length > 0;
  if (isPast && isAttended) return ATTENDED_COLOR;
  if (isPast && !isAttended) return MISSED_COLOR;
  const base = getSubjectColor(sch.subject_name);
  return { ...base, status: 'upcoming' };
}

function getFormattedTarget(sch) {
  if (sch.target_type === 'mixed') {
    try {
      const p = JSON.parse(sch.target_id);
      return [...(p.classes || []), ...(p.names || []), ...(p.phones || [])].join(', ');
    } catch { return sch.target_id; }
  }
  return sch.target_id;
}

function dedup(list) {
  const seen = new Set();
  return list.filter(sch => {
    const k = `${sch.study_date}_${sch.subject_name}_${sch.start_time}_${sch.end_time}_${sch.room_name}_${getFormattedTarget(sch)}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  return dt;
}

function toDateStr(d) {
  return (new Date(d.getTime() - d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
}

function getOverlappingLayout(dayScheds) {
  const sorted = [...dayScheds].sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  const layout = new Map();
  const cols = [];
  sorted.forEach(sch => {
    const [sH, sM] = (sch.start_time || '00:00').split(':').map(Number);
    const sMin = sH * 60 + sM;
    let placed = false;
    for (let c = 0; c < cols.length; c++) {
      const last = cols[c][cols[c].length - 1];
      const [lH, lM] = (last.end_time || '00:00').split(':').map(Number);
      if (sMin >= lH * 60 + lM) { cols[c].push(sch); layout.set(sch.schedule_id, { colIndex: c }); placed = true; break; }
    }
    if (!placed) { cols.push([sch]); layout.set(sch.schedule_id, { colIndex: cols.length - 1 }); }
  });
  sorted.forEach(sch => {
    const [sH, sM] = (sch.start_time || '00:00').split(':').map(Number);
    const [eH, eM] = (sch.end_time || '00:00').split(':').map(Number);
    const sMin = sH * 60 + sM, eMin = eH * 60 + eM;
    const overlapping = sorted.filter(o => {
      const [oSH, oSM] = (o.start_time || '00:00').split(':').map(Number);
      const [oEH, oEM] = (o.end_time || '00:00').split(':').map(Number);
      return sMin < oEH * 60 + oEM && eMin > oSH * 60 + oSM;
    });
    const maxCol = Math.max(...overlapping.map(o => layout.get(o.schedule_id)?.colIndex ?? 0)) + 1;
    const cur = layout.get(sch.schedule_id);
    if (cur) cur.totalCols = maxCol;
  });
  return layout;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function WeeklyCalendar({ schedules = [], onEditSchedule, onUpdateSchedule, onAttendance, onCopyWeek }) {
  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07–21

  // ── State ──
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [viewMode, setViewMode]             = useState('week');       // 'week' | 'month'
  const [classFilter, setClassFilter]       = useState('All');
  const [notes, setNotes]                   = useState(() => { try { return JSON.parse(localStorage.getItem('schedule_notes') || '{}'); } catch { return {}; } });
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [expandedMonthDay, setExpandedMonthDay] = useState(null);
  const [copyConfirm, setCopyConfirm]       = useState(false);
  const [dragEnabled, setDragEnabled]       = useState(false);

  // ── Week / Month navigation ──
  const monday   = useMemo(() => getMonday(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; }), [monday]);

  const prevPeriod  = () => { const d = new Date(currentDate); viewMode === 'week' ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const nextPeriod  = () => { const d = new Date(currentDate); viewMode === 'week' ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1); setCurrentDate(d); };
  const goToday     = () => setCurrentDate(new Date());

  // ── Class filter ──
  const uniqueClasses = useMemo(() => {
    const cs = new Set();
    schedules.forEach(s => {
      if (s.target_type === 'mixed') { try { (JSON.parse(s.target_id).classes || []).forEach(c => cs.add(c)); } catch {} }
      else if (s.target_type === 'class' && s.target_id) { String(s.target_id).split(',').forEach(c => { if(c.trim()) cs.add(c.trim()); }); }
      else if (s.target_id) cs.add(String(s.target_id).trim());
    });
    return Array.from(cs).sort();
  }, [schedules]);

  const filtered = useMemo(() => {
    if (classFilter === 'All') return schedules;
    return schedules.filter(s => getFormattedTarget(s).includes(classFilter));
  }, [schedules, classFilter]);

  // ── Progress & remaining helpers ──
  const getProgress = useCallback((sch) => {
    const all = dedup(filtered.filter(s => s.subject_name === sch.subject_name && s.target_id === sch.target_id));
    return { total: all.length, attended: all.filter(s => s.attendances && s.attendances.length > 0).length };
  }, [filtered]);

  const getRemaining = useCallback((sch) => {
    const schDate = new Date(sch.study_date); schDate.setHours(0, 0, 0, 0);
    return dedup(filtered.filter(s => s.subject_name === sch.subject_name && s.target_id === sch.target_id && s.study_date >= sch.study_date))
      .filter(s => { const d = new Date(s.study_date); d.setHours(0, 0, 0, 0); return d >= schDate; }).length;
  }, [filtered]);

  // ── Notes ──
  const saveNote = (id, text) => {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    localStorage.setItem('schedule_notes', JSON.stringify(updated));
  };

  // ── PDF Export ──
  const handleExportPDF = () => {
    try {
      const removeTones = (str) => {
        if (!str) return '';
        return String(str)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D');
      };

      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text('BANG PHAN CONG LICH HOC', 14, 15);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      
      const label = viewMode === 'week'
        ? `Tuan: ${monday.toLocaleDateString('vi-VN')} - ${weekDays[6].toLocaleDateString('vi-VN')}`
        : `Thang: ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      doc.text(removeTones(label), 14, 22);

      const rows = [];
      if (viewMode === 'week') {
        weekDays.forEach((day, i) => {
          const ds = toDateStr(day);
          const dayScheds = dedup(filtered.filter(s => s.study_date && s.study_date.startsWith(ds)));
          dayScheds.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).forEach(sch => {
            const col = getStatusColor(sch);
            rows.push([
              `Thu ${i === 6 ? 'CN' : i + 2} (${day.getDate()}/${day.getMonth() + 1})`,
              removeTones(sch.subject_name || ''),
              `${sch.start_time?.substring(0, 5)} - ${sch.end_time?.substring(0, 5)}`,
              removeTones(sch.room_name || ''),
              removeTones(getFormattedTarget(sch)),
              col.status === 'attended' ? 'Da diem danh' : col.status === 'missed' ? 'Chua diem danh' : 'Sap toi',
              removeTones(notes[sch.schedule_id] || '')
            ]);
          });
        });

        autoTable(doc, {
          head: [['Ngay', 'Mon hoc', 'Gio hoc', 'Phong', 'Doi tuong', 'Trang thai', 'Ghi chu']],
          body: rows.length > 0 ? rows : [['—', 'Khong co lich hoc trong tuan nay', '', '', '', '', '']],
          startY: 27,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [99, 102, 241], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 255] }
        });
      } else {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthScheds = filtered.filter(s => {
          if (!s.study_date) return false;
          const d = new Date(s.study_date);
          return d.getFullYear() === year && d.getMonth() === month;
        });

        monthScheds.sort((a, b) => a.study_date.localeCompare(b.study_date) || (a.start_time || '').localeCompare(b.start_time || '')).forEach(sch => {
          const col = getStatusColor(sch);
          const d = new Date(sch.study_date);
          const dayName = d.getDay() === 0 ? 'CN' : `Thu ${d.getDay() + 1}`;
          rows.push([
            `${dayName} (${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()})`,
            removeTones(sch.subject_name || ''),
            `${sch.start_time?.substring(0, 5)} - ${sch.end_time?.substring(0, 5)}`,
            removeTones(sch.room_name || ''),
            removeTones(getFormattedTarget(sch)),
            col.status === 'attended' ? 'Da diem danh' : col.status === 'missed' ? 'Chua diem danh' : 'Sap toi'
          ]);
        });

        autoTable(doc, {
          head: [['Ngay', 'Mon hoc', 'Gio hoc', 'Phong', 'Doi tuong', 'Trang thai']],
          body: rows.length > 0 ? rows : [['—', 'Khong co lich hoc trong thang nay', '', '', '', '']],
          startY: 27,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [99, 102, 241], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 255] }
        });
      }

      const filename = viewMode === 'week' 
        ? `lich-hoc-tuan-${monday.toISOString().split('T')[0]}.pdf` 
        : `lich-hoc-thang-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
      Swal.fire('Thông báo', String('Không thể xuất PDF. Vui lòng thử lại!'), 'info');
    }
  };

  // ── Copy Week ──
  const handleCopyWeek = async () => {
    if (!onCopyWeek) return;
    const weekScheds = weekDays.flatMap(day => dedup(filtered.filter(s => s.study_date && s.study_date.startsWith(toDateStr(day)))));
    if (weekScheds.length === 0) { Swal.fire('Thông báo', String('Không có lịch học trong tuần này để sao chép!'), 'info'); return; }
    setCopyConfirm(true);
    if ((await Swal.fire({ title: 'Xác nhận', text: `Sao chép ${weekScheds.length} ca học sang tuần sau?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy' })).isConfirmed) {
      onCopyWeek(weekScheds);
    }
    setCopyConfirm(false);
  };

  // ── Drag & Drop ──
  const handleDrop = async (e, targetDay) => {
    e.preventDefault();
    if (!dragEnabled) return;

    const id = e.dataTransfer.getData('schedule_id');
    if (!id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newStartHour = 7 + Math.floor(y / 40);

    if (newStartHour < 7 || newStartHour >= 21) return;

    const sch = filtered.find(s => String(s.schedule_id) === String(id));
    if (!sch) return;

    const [sH, sM] = (sch.start_time || '00:00').split(':').map(Number);
    const [eH, eM] = (sch.end_time || '00:00').split(':').map(Number);
    const dur = (eH * 60 + eM) - (sH * 60 + sM);
    const newSMin = newStartHour * 60 + sM;
    const newEMin = newSMin + dur;
    const pad = n => String(Math.floor(n)).padStart(2, '0');

    const newDateStr = toDateStr(targetDay);
    const newStartStr = `${pad(newStartHour)}:${pad(sM)}`;
    const newEndStr = `${pad(newEMin / 60)}:${pad(newEMin % 60)}`;

    const oldDateStr = sch.study_date ? sch.study_date.split('T')[0] : '';
    const oldStartStr = sch.start_time ? sch.start_time.substring(0, 5) : '';
    const oldEndStr = sch.end_time ? sch.end_time.substring(0, 5) : '';

    // Ignore if position unchanged
    if (newDateStr === oldDateStr && newStartStr === oldStartStr) return;

    // Safety 1: Attended schedule protection
    const isAttended = sch.attendances && sch.attendances.length > 0;
    if (isAttended) {
      const confirmAttended = (await Swal.fire({
        title: 'CẢNH BÁO',
        text: `Ca học môn "${sch.subject_name}" ĐÃ CÓ DỮ LIỆU ĐIỂM DANH! Bạn có chắc chắn muốn thay đổi lịch học này không?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
      })).isConfirmed;
      if (!confirmAttended) return;
    }

    // Safety 2: Confirmation prompt with details
    const confirmMove = (await Swal.fire({
      title: 'Xác nhận di chuyển lịch học',
      html: `Môn học: <b>${sch.subject_name}</b><br/>
             Từ: <b>Ngày ${oldDateStr} (${oldStartStr} - ${oldEndStr})</b><br/>
             Sang: <b>Ngày ${newDateStr} (${newStartStr} - ${newEndStr})</b><br/><br/>
             Bạn có đồng ý thay đổi không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    })).isConfirmed;

    if (!confirmMove) return;

    onUpdateSchedule && onUpdateSchedule({
      ...sch,
      study_date: newDateStr,
      start_time: newStartStr,
      end_time: newEndStr
    });
  };

  // ─────────────────── RENDER HELPERS ──────────────────────────────────────

  const periodLabel = viewMode === 'week'
    ? `Tuần: ${monday.toLocaleDateString('vi-VN')} – ${weekDays[6].toLocaleDateString('vi-VN')}`
    : currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  // ── Shared: compact status badge ──
  const StatusBadge = ({ status }) => {
    if (status === 'attended') return <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">✓ Đã ĐD</span>;
    if (status === 'missed')   return <span className="text-[9px] bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">✗ Vắng</span>;
    return null;
  };

  // ── TOOLBAR ──────────────────────────────────────────────────────────────
  const Toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
      {/* Navigation */}
      <div className="flex items-center gap-1.5">
        <button onClick={prevPeriod}  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold text-sm transition-all">‹</button>
        <button onClick={goToday}     className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-all">Hôm nay</button>
        <button onClick={nextPeriod}  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold text-sm transition-all">›</button>
      </div>

      {/* Period label */}
      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm hidden sm:block">{periodLabel}</span>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Class filter */}
        {uniqueClasses.length > 0 && (
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none cursor-pointer">
            <option value="All">Tất cả lớp</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Week / Month toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
          {['week', 'month'].map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-2.5 py-1 text-xs font-bold rounded-[10px] transition-all ${viewMode === m ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {m === 'week' ? '📅 Tuần' : '🗓️ Tháng'}
            </button>
          ))}
        </div>

        {/* Drag Lock Safety Toggle */}
        {viewMode === 'week' && (
          <button
            type="button"
            onClick={() => setDragEnabled(prev => !prev)}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
              dragEnabled 
                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' 
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
            title={dragEnabled ? "Đang mở kéo thả (Bấm để khóa)" : "Kéo thả đang khóa (Bấm để mở kéo thả lịch)"}
          >
            <span>{dragEnabled ? '🔓 Đang bật kéo thả' : '🔒 Khóa kéo thả'}</span>
          </button>
        )}

        {/* Copy week */}
        {onCopyWeek && viewMode === 'week' && (
          <button onClick={handleCopyWeek}
            className="px-2.5 py-1.5 text-xs font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all flex items-center gap-1">
            📋 <span className="hidden sm:inline">Copy tuần</span>
          </button>
        )}

        {/* PDF Export */}
        <button onClick={handleExportPDF}
          className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1">
          📄 <span className="hidden sm:inline">Xuất PDF</span>
        </button>
      </div>
    </div>
  );

  // ── MONTH VIEW ────────────────────────────────────────────────────────────
  const MonthView = () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Start from Monday of the week containing the 1st of month
    const firstOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstOfMonth);
    const dow = startDay.getDay();
    startDay.setDate(startDay.getDate() - (dow === 0 ? 6 : dow - 1));

    const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(startDay); d.setDate(startDay.getDate() + i); return d; });
    const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map(h => (
            <div key={h} className="text-center text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase py-1">{h}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            const ds = toDateStr(day);
            const dayScheds = dedup(filtered.filter(s => s.study_date && s.study_date.startsWith(ds)));
            const inMonth = day.getMonth() === month;
            const isToday = day.getTime() === today.getTime();
            const isExp = expandedMonthDay === ds;

            return (
              <div key={idx} className="flex flex-col">
                <div
                  onClick={() => setExpandedMonthDay(isExp ? null : ds)}
                  className={`rounded-xl p-1.5 min-h-[56px] cursor-pointer transition-all border ${
                    isExp   ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-400/30' :
                    isToday ? 'border-indigo-300/70 bg-indigo-50/60 dark:bg-indigo-900/15' :
                    inMonth ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800' :
                              'border-transparent bg-transparent'
                  }`}
                >
                  {/* Date number */}
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-black mb-1 ${
                    isToday ? 'bg-indigo-500 text-white' :
                    inMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'
                  }`}>{day.getDate()}</div>

                  {/* Event dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {dayScheds.slice(0, 4).map(s => {
                      const col = getStatusColor(s);
                      return <div key={s.schedule_id} className={`w-1.5 h-1.5 rounded-full ${col.dot}`} title={s.subject_name} />;
                    })}
                    {dayScheds.length > 4 && <span className="text-[8px] text-slate-400 leading-none">+{dayScheds.length - 4}</span>}
                  </div>
                </div>

                {/* Expanded day details */}
                {isExp && dayScheds.length > 0 && (
                  <div className="mt-1 space-y-1 z-10">
                    {dayScheds.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map(sch => {
                      const col = getStatusColor(sch);
                      return (
                        <div key={sch.schedule_id}
                          onClick={() => onEditSchedule && onEditSchedule(sch)}
                          className={`text-[9px] bg-gradient-to-r ${col.bg} border ${col.border} rounded-lg p-1 cursor-pointer`}>
                          <div className={`font-bold ${col.text} truncate`}>{sch.subject_name}</div>
                          <div className={col.muted}>{sch.start_time?.substring(0,5)}–{sch.end_time?.substring(0,5)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500">Chú thích:</span>
          {[['bg-emerald-500', 'Đã điểm danh'], ['bg-red-500', 'Vắng (đã qua)'], ['bg-indigo-500', 'Sắp tới']].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── WEEK MOBILE LIST ──────────────────────────────────────────────────────
  const MobileWeekView = () => (
    <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900">
      {weekDays.map((day, i) => {
        const ds = toDateStr(day);
        const dayScheds = dedup(filtered.filter(s => s.study_date && s.study_date.startsWith(ds)));
        if (dayScheds.length === 0) return null;
        const today = new Date(); today.setHours(0,0,0,0);
        const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
        const isToday = dayStart.getTime() === today.getTime();

        return (
          <div key={i} className={`rounded-2xl p-4 shadow-sm border ${isToday ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
            <h4 className={`font-extrabold mb-3 border-b pb-2 text-sm ${isToday ? 'text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700'}`}>
              {isToday && <span className="mr-1 text-indigo-500">●</span>}
              Thứ {i === 6 ? 'CN' : i + 2} – {day.getDate()}/{day.getMonth() + 1}
            </h4>
            <div className="space-y-3">
              {dayScheds.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map(sch => {
                const colors = getStatusColor(sch);
                const isAttended = sch.attendances && sch.attendances.length > 0;
                const remaining = getRemaining(sch);
                const progress = getProgress(sch);
                const note = notes[sch.schedule_id] || '';
                const showNote = expandedNoteId === sch.schedule_id;

                return (
                  <div key={sch.schedule_id}
                    className={`flex flex-col gap-1.5 p-3 rounded-xl bg-gradient-to-r ${colors.bg} border ${colors.border} transition-all hover:shadow-md`}
                    onClick={() => onEditSchedule && onEditSchedule(sch)}>

                    {/* Row 1: subject + badges + time */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-extrabold ${colors.text} text-sm truncate`}>{sch.subject_name}</span>
                        <StatusBadge status={colors.status} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {remaining > 0 && (
                          <span className="text-[10px] font-bold bg-white/40 dark:bg-black/30 text-slate-700 dark:text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">Còn {remaining} buổi</span>
                        )}
                        <span className={`text-[11px] font-semibold ${colors.text} bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded whitespace-nowrap`}>
                          {sch.start_time?.substring(0, 5)}–{sch.end_time?.substring(0, 5)}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: room + target */}
                    <div className={`text-xs ${colors.muted}`}>
                      Phòng: <strong>{sch.room_name}</strong> &nbsp;|&nbsp; Đối tượng: {getFormattedTarget(sch)}
                    </div>

                    {/* Row 3: Progress bar */}
                    {progress.total > 0 && (
                      <div className="mt-0.5">
                        <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">
                          <span>Tiến độ môn</span>
                          <span className="font-bold">{progress.attended}/{progress.total} buổi ({Math.round(progress.attended/progress.total*100)}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/40 dark:bg-black/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress.total > 0 ? (progress.attended / progress.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Row 4: Actions */}
                    <div className="mt-1 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setExpandedNoteId(showNote ? null : sch.schedule_id)}
                        className={`text-[10px] font-bold transition-colors flex items-center gap-1 ${note ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}>
                        📝 {note ? 'Có ghi chú' : 'Ghi chú'}
                      </button>
                      <div className="flex gap-1.5">
                        <button onClick={() => onAttendance && onAttendance(sch)}
                          className={`text-xs font-bold ${isAttended ? 'bg-slate-500 hover:bg-slate-400' : 'bg-green-500 hover:bg-green-400 active:bg-green-600'} text-white px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1`}>
                          {isAttended ? '✅ Đã ĐD' : '✔️ Điểm danh'}
                        </button>
                      </div>
                    </div>

                    {/* Note input */}
                    {showNote && (
                      <div className="mt-1" onClick={e => e.stopPropagation()}>
                        <textarea
                          className="w-full text-xs p-2 bg-white/70 dark:bg-black/20 border border-white/50 dark:border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                          rows={2} placeholder="Ghi chú nhanh cho buổi học này..."
                          value={note} onChange={e => saveNote(sch.schedule_id, e.target.value)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {filtered.filter(s => { const d = new Date(s.study_date); return d >= monday && d <= weekDays[6]; }).length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <div className="text-4xl mb-3">📅</div>
          <div className="font-bold">Không có lịch học trong tuần này</div>
        </div>
      )}
    </div>
  );

  // ── WEEK DESKTOP GRID ─────────────────────────────────────────────────────
  const DesktopWeekView = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return (
      <div className="hidden md:flex flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 min-w-[800px]">
        {/* Hour labels */}
        <div className="w-14 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-10 border-b border-slate-200 dark:border-slate-800" />
          {HOURS.map(h => (
            <div key={h} className="h-[40px] text-[10px] text-slate-400 font-bold text-center border-b border-slate-100 dark:border-slate-800/50 relative">
              <span className="absolute -top-2.5 left-0 right-0 text-center">{h}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {weekDays.map((day, i) => {
            const ds = toDateStr(day);
            const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
            const isToday = dayStart.getTime() === today.getTime();
            const dayScheds = dedup(filtered.filter(s => s.study_date && s.study_date.startsWith(ds)));
            const layout = getOverlappingLayout(dayScheds);

            return (
              <div key={i} className={`flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 min-w-[110px] ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-900/60'}`}>
                {/* Day header */}
                <div className={`h-10 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center ${isToday ? 'bg-indigo-100/60 dark:bg-indigo-900/25' : 'bg-slate-50 dark:bg-slate-800/30'}`}>
                  <span className={`text-[10px] font-extrabold uppercase ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Thứ {i === 6 ? 'CN' : i + 2}</span>
                  <span className={`text-xs font-black ${isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{day.getDate()}/{day.getMonth() + 1}</span>
                </div>

                {/* Drop zone */}
                <div className="relative flex-1" style={{ height: `${HOURS.length * 40}px` }}
                  onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, day)}>
                  {/* Grid lines */}
                  {HOURS.map(h => (
                    <div key={h} className={`h-[40px] border-b ${isToday ? 'border-indigo-100/40 dark:border-indigo-900/20' : 'border-slate-100 dark:border-slate-800/30'}`} />
                  ))}

                  {/* Events */}
                  {dayScheds.map(sch => {
                    const [sH, sM] = (sch.start_time || '00:00').split(':').map(Number);
                    const [eH, eM] = (sch.end_time || '00:00').split(':').map(Number);
                    const top    = (sH - 7) * 40 + (sM / 60) * 40;
                    const height = (eH - sH) * 40 + ((eM - sM) / 60) * 40;

                    const colors = getStatusColor(sch);
                    const isAttended = sch.attendances && sch.attendances.length > 0;
                    const remaining = getRemaining(sch);
                    const progress  = getProgress(sch);
                    const note = notes[sch.schedule_id];
                    const showNote = expandedNoteId === sch.schedule_id;

                    const pos = layout.get(sch.schedule_id) || { colIndex: 0, totalCols: 1 };
                    const wPct = 100 / pos.totalCols;
                    const lPct = pos.colIndex * wPct;

                    return (
                      <div key={sch.schedule_id}
                        draggable={dragEnabled}
                        onDragStart={e => { e.dataTransfer.setData('schedule_id', sch.schedule_id); e.currentTarget.style.opacity = '0.4'; }}
                        onDragEnd={e => e.currentTarget.style.opacity = '1'}
                        onClick={() => onEditSchedule && onEditSchedule(sch)}
                        className={`absolute rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-2 shadow-md cursor-pointer hover:shadow-xl hover:z-20 transition-all overflow-hidden group`}
                        style={{ top: `${top}px`, height: `${height}px`, width: `calc(${wPct}% - 4px)`, left: `calc(${lPct}% + 2px)` }}
                        title={`${sch.subject_name}\n${sch.start_time?.substring(0,5)}–${sch.end_time?.substring(0,5)}\nPhòng: ${sch.room_name}${remaining > 0 ? `\nCòn ${remaining} buổi` : ''}${note ? `\n📝 ${note}` : ''}`}
                      >
                        {/* Subject name + remaining badge */}
                        <div className={`text-[11px] font-black ${colors.text} leading-tight mb-0.5 truncate pr-12`}>
                          {sch.subject_name}
                          {remaining > 0 && <span className="ml-1 text-[8px] font-bold bg-white/30 px-1 py-0.5 rounded-full align-middle">{remaining}</span>}
                          {colors.status === 'attended' && <span className="ml-1 text-[9px]">✓</span>}
                          {colors.status === 'missed'   && <span className="ml-1 text-[9px] text-red-400">✗</span>}
                        </div>

                        {/* Target + room + time */}
                        <div className={`text-[9px] font-semibold ${colors.muted} leading-tight`}>
                          {getFormattedTarget(sch)} | {sch.room_name} | {sch.start_time?.substring(0,5)}–{sch.end_time?.substring(0,5)}
                        </div>

                        {/* Progress bar (only if tall enough) */}
                        {height > 65 && progress.total > 0 && (
                          <div className="mt-1.5">
                            <div className="flex justify-between text-[8px] text-black/40 dark:text-white/60 mb-0.5">
                              <span>Tiến độ</span>
                              <span>{progress.attended}/{progress.total}</span>
                            </div>
                            <div className="h-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-black/30 dark:bg-white/60 rounded-full transition-all" style={{ width: `${(progress.attended / progress.total) * 100}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Note preview */}
                        {note && height > 90 && (
                          <div className={`text-[8px] ${colors.muted} mt-1 truncate`}>📝 {note}</div>
                        )}

                        {/* Note inline editor (desktop) */}
                        {showNote && (
                          <div className="mt-1" onClick={e => e.stopPropagation()}>
                            <textarea
                              autoFocus
                              className="w-full text-[9px] p-1 bg-white/70 dark:bg-black/30 border border-black/10 dark:border-white/50 rounded resize-none focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                              rows={2} placeholder="Ghi chú..."
                              value={note || ''} onChange={e => saveNote(sch.schedule_id, e.target.value)} />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setExpandedNoteId(showNote ? null : sch.schedule_id); }}
                            className="bg-amber-500 hover:bg-amber-400 text-white rounded-md w-5 h-5 flex items-center justify-center text-[10px] shadow-md transition-all hover:scale-110"
                            title="Ghi chú">📝</button>
                          <button onClick={e => { e.stopPropagation(); onAttendance && onAttendance(sch); }}
                            className={`${isAttended ? 'bg-slate-500 hover:bg-slate-400' : 'bg-green-500 hover:bg-green-400'} text-white rounded-md w-5 h-5 flex items-center justify-center text-[10px] shadow-md transition-all hover:scale-110`}
                            title={isAttended ? 'Sửa điểm danh' : 'Điểm danh'}>{isAttended ? '✅' : '✔'}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── RETURN ────────────────────────────────────────────────────────────────
  return (
    <div id="calendar-export-area" className="glass-panel overflow-hidden flex flex-col rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
      {Toolbar}
      {viewMode === 'month' ? (
        <MonthView />
      ) : (
        <>
          <MobileWeekView />
          <DesktopWeekView />
        </>
      )}
    </div>
  );
}
