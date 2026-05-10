import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { format, subDays, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, differenceInMinutes, parse } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const { logs, schedules } = useStore();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const today = new Date();

  // Aggregate stats based on reportType
  const stats = useMemo(() => {
    let startDate: Date, endDate: Date;
    if (reportType === 'daily') {
      startDate = today;
      endDate = today;
    } else if (reportType === 'weekly') {
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      endDate = endOfWeek(today, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }

    const filteredLogs = logs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, { start: startDate, end: endDate });
    });

    let totalLateMinutes = 0;
    let checkedOnTime = 0;
    let checkedLate = 0;

    filteredLogs.forEach(log => {
      totalLateMinutes += log.lateMinutes;
      if (log.lateMinutes > 0) {
        checkedLate++;
      } else {
        checkedOnTime++;
      }
    });

    // Calculate Allocated vs Rest vs Late for the period
    // This is an estimation based on the schedule of the days in the period
    let workMins = 0;
    let restMins = 0;
    let learnMins = 0;
    let routineMins = 0;

    // Loop through days in the interval to sum up schedule
    const daysInInterval = [];
    let currentDayIter = startDate;
    while (currentDayIter <= endDate && currentDayIter <= today) { // don't count future days against stats yet
      daysInInterval.push(currentDayIter.getDay());
      currentDayIter = new Date(currentDayIter.getTime() + 24 * 60 * 60 * 1000);
    }

    daysInInterval.forEach(dayInt => {
      schedules[dayInt].tasks.forEach(t => {
        if (!t.endTime) return;
        const s = parse(t.startTime, 'HH:mm', new Date());
        let e = parse(t.endTime, 'HH:mm', new Date());
        if (e < s) e = new Date(e.getTime() + 24 * 60 * 60 * 1000); // add 1 day
        const taskMins = differenceInMinutes(e, s);

        if (t.category === 'work') workMins += taskMins;
        else if (t.category === 'rest') restMins += taskMins;
        else if (t.category === 'learning') learnMins += taskMins;
        else if (t.category === 'routine') routineMins += taskMins;
      });
    });

    return {
      totalLateMinutes,
      checkedOnTime,
      checkedLate,
      workHours: (workMins / 60).toFixed(1),
      restHours: (restMins / 60).toFixed(1),
      learnHours: (learnMins / 60).toFixed(1),
      routineHours: (routineMins / 60).toFixed(1),
      lateHours: (totalLateMinutes / 60).toFixed(1),
    };
  }, [logs, reportType, today]);

  const pieData = [
    { name: 'Kerja/Produktif', value: parseFloat(stats.workHours), color: '#3b82f6' },
    { name: 'Belajar', value: parseFloat(stats.learnHours), color: '#8b5cf6' },
    { name: 'Istirahat', value: parseFloat(stats.restHours), color: '#10b981' },
    { name: 'Rutinitas', value: parseFloat(stats.routineHours), color: '#f59e0b' },
  ];

  // Daily late history (last 7 days)
  const historyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => l.date === dateStr);
      const dayLateMins = dayLogs.reduce((acc, l) => acc + l.lateMinutes, 0);
      data.push({
        date: format(d, 'dd MMM'),
        lateMinutes: dayLateMins
      });
    }
    return data;
  }, [logs, today]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Statistik</h1>
          <p className="text-slate-500 font-medium">Evaluasi Disiplin Waktu</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'daily' ? 'Harian' : type === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
          <p className="text-red-600 font-medium text-sm">Total Telat (Menit)</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{stats.totalLateMinutes} <span className="text-lg font-medium text-red-500">m</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <p className="text-emerald-600 font-medium text-sm">Tepat Waktu (Disiplin)</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.checkedOnTime} <span className="text-lg font-medium text-emerald-500">Task</span></p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
          <p className="text-amber-600 font-medium text-sm">Check-in Telat</p>
          <p className="text-3xl font-bold text-amber-700 mt-2">{stats.checkedLate} <span className="text-lg font-medium text-amber-500">Task</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Keterlambatan (7 Hari Terakhir)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}m`} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="lateMinutes" fill="#ef4444" radius={[4, 4, 0, 0]} name="Keterlambatan (Menit)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Alokasi Waktu (Jam)</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Log Keterlambatan Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Tanggal</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Kegiatan</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Jadwal</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Check-in</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Telat</th>
              </tr>
            </thead>
            <tbody>
              {logs.filter(l => l.lateMinutes > 0)
                .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
                .slice(0, 10).map((log, i) => {
                const scheduleInfo = schedules[log.day].tasks.find(t => t.id === log.taskId);
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                    <td className="py-3 px-4 text-sm text-slate-600">{format(parseISO(log.date), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{scheduleInfo?.activity || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{log.scheduledAt}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{format(new Date(log.checkedAt), 'HH:mm')}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-red-500 text-right">{log.lateMinutes} mnt</td>
                  </tr>
                );
              })}
              {logs.filter(l => l.lateMinutes > 0).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Belum ada riwayat keterlambatan. Pertahankan disiplin!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
