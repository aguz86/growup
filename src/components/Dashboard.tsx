import React, { useState } from 'react';
import { useStore } from '../store';
import { Task } from '../data/schedule';
import { format, parse, isAfter, isBefore } from 'date-fns';
import { CheckCircle, Circle, Clock, Bell, BellOff, Info } from 'lucide-react';
import { GoalsWidget } from './GoalsWidget';

export function Dashboard() {
  const { logs, addLog, removeLog, notificationEnabled, setNotificationEnabled, schedules } = useStore();
  const today = new Date();
  const [now, setNow] = useState(new Date());
  const notifiedTasksRef = React.useRef<Set<string>>(new Set());
  const [activePopup, setActivePopup] = React.useState<Task | null>(null);

  const currentDay = today.getDay();
  const scheduleDay = schedules[currentDay];
  const dateStr = format(today, 'yyyy-MM-dd');

  React.useEffect(() => {
    // Menggunakan Web Worker agar timer tetap berjalan presisi meskipun tab di-minimize / background
    const workerCode = `
      let timer;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          timer = setInterval(() => {
            self.postMessage('tick');
          }, 1000);
        } else if (e.data === 'stop') {
          clearInterval(timer);
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = () => {
      const currentTime = new Date();
      setNow(currentTime);
      
      const currentHMs = format(currentTime, 'HH:mm');
      
      scheduleDay?.tasks.forEach(task => {
        const notifKey = task.id + '-' + dateStr;
        if (task.startTime === currentHMs && !notifiedTasksRef.current.has(notifKey)) {
          notifiedTasksRef.current.add(notifKey);
          
          setActivePopup(task);

          const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
          audio.play().catch(() => {});

          if (notificationEnabled && "Notification" in window && Notification.permission === 'granted') {
             new Notification('Waktunya Kegiatan Baru!', { body: `${task.activity} Dimulai Pukul ${task.startTime}` });
          }
        }
      });
    };

    worker.postMessage('start');

    return () => {
      worker.postMessage('stop');
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [scheduleDay, dateStr, notificationEnabled]);

  const todayLogs = logs.filter(l => l.date === dateStr);

  const handleCheck = (task: Task) => {
    const isChecked = todayLogs.some(l => l.taskId === task.id);
    if (isChecked) {
      removeLog(task.id, currentDay, dateStr);
    } else {
      addLog({
        taskId: task.id,
        day: currentDay,
        scheduledAt: task.startTime,
        checkedAt: new Date().toISOString(),
      });
    }
  };

  const toggleNotification = async () => {
    if (!notificationEnabled) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
      } else {
        alert('Izin notifikasi ditolak oleh browser.');
      }
    } else {
      setNotificationEnabled(false);
    }
  };

  const isCurrentTask = (task: Task) => {
    const start = parse(task.startTime, 'HH:mm', now);
    const end = task.endTime ? parse(task.endTime, 'HH:mm', now) : parse('23:59', 'HH:mm', now);
    if (isBefore(end, start)) { 
      return isAfter(now, start) || isBefore(now, end);
    }
    return isAfter(now, start) && isBefore(now, end);
  };

  const renderTimer = (checkedAt: string) => {
    const start = new Date(checkedAt).getTime();
    const elapsed = Math.max(0, now.getTime() - start);
    
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    
    return (
      <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold w-fit animate-in fade-in">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>{h > 0 ? `${h}j ` : ''}{m}m {s}s berjalan</span>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal Hari Ini</h1>
          <p className="text-slate-500 font-medium">{format(today, 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <button
          onClick={toggleNotification}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            notificationEnabled
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {notificationEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          <span className="hidden sm:inline font-medium">
            {notificationEnabled ? 'Notifikasi Aktif' : 'Notifikasi Off'}
          </span>
        </button>
      </div>
      
      <GoalsWidget />

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
        <Info className="w-6 h-6 shrink-0 text-blue-600" />
        <p className="text-sm">
          <strong>Aturan Disiplin:</strong> Checklist kegiatan harus dilakukan tepat waktu (toleransi telat 1-2 menit dari jadwal). Lebih dari itu akan tercatat sebagai keterlambatan di Laporan.
        </p>
      </div>

      <div className="space-y-4">
        {scheduleDay?.tasks.map((task) => {
          const log = todayLogs.find(l => l.taskId === task.id);
          const isChecked = !!log;
          const current = isCurrentTask(task);

          return (
            <div
              key={task.id}
              onClick={() => handleCheck(task)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                current
                  ? 'border-blue-400 bg-blue-50/50 shadow-md ring-1 ring-blue-400'
                  : isChecked
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-200 bg-white hover:border-blue-300 shadow-sm hover:shadow'
              }`}
            >
              <div
                className="mt-1 shrink-0 rounded-full flex items-center justify-center"
              >
                {isChecked ? (
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                ) : (
                  <Circle className="w-7 h-7 text-slate-300" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className={`font-semibold text-lg ${isChecked ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {task.activity}
                    </h3>
                    {task.skillOrProject && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-bold uppercase tracking-wider">
                        {task.skillOrProject}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{task.startTime} {task.endTime ? `- ${task.endTime}` : ''}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-1">{task.detail}</p>
                
                {isChecked && log && renderTimer(log.checkedAt)}

                {isChecked && log && log.lateMinutes > 0 && (
                  <p className="text-xs font-semibold text-red-500 mt-2 bg-red-50 px-2 py-1 rounded inline-block">
                    Terlambat check-in {log.lateMinutes} menit
                  </p>
                )}
                {isChecked && log.lateMinutes === 0 && (
                  <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2 py-1 rounded inline-block">
                    Tepat Waktu / Disiplin
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in p-4">
           <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto border-2 border-emerald-400">
              <div className="flex justify-center mb-4">
                 <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                    <Bell className="w-6 h-6 text-emerald-600" />
                 </div>
              </div>
              <h2 className="text-lg font-bold text-center text-slate-800 mb-2">Waktunya Kegiatan!</h2>
              <p className="text-center text-slate-600 mb-5 font-medium border-y py-2.5 bg-slate-50 border-slate-100">
                 {activePopup.activity}
              </p>
              <div className="flex flex-col gap-2.5">
                 <button onClick={() => { setActivePopup(null); handleCheck(activePopup); }} className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                    Check-in Sekarang
                 </button>
                 <button onClick={() => setActivePopup(null)} className="w-full bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                    Tutup Peringatan
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
