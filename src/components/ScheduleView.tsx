import React, { useState } from 'react';
import { useStore } from '../store';
import { Edit2, Plus, Trash2, Save, X, Target } from 'lucide-react';
import { Task } from '../data/schedule';

export function ScheduleView() {
  const { schedules, isLoggedIn, updateTask, addTask, deleteTask, addGoal, goals, renameSkill, deleteSkill } = useStore();
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [applyToDays, setApplyToDays] = useState<number[]>([]);
  
  const [isManagingSkills, setIsManagingSkills] = useState(false);
  const [editingSkillName, setEditingSkillName] = useState<string | null>(null);
  const [newSkillNameInput, setNewSkillNameInput] = useState('');

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalSkill, setNewGoalSkill] = useState('');

  const days = [
    { id: 1, name: 'Senin' },
    { id: 2, name: 'Selasa' },
    { id: 3, name: 'Rabu' },
    { id: 4, name: 'Kamis' },
    { id: 5, name: 'Jumat' },
    { id: 6, name: 'Sabtu' },
    { id: 0, name: 'Minggu' },
  ];

  const handleSaveEdit = () => {
    if (editingTask) {
      if (!editingTask.activity || !editingTask.startTime || !editingTask.endTime || !editingTask.category || !editingTask.skillOrProject) {
        alert("Peringatan: Nama Kegiatan, Waktu (Mulai - Selesai), Kategori, dan Skill/Projek wajib diisi!");
        return;
      }

      if (isAddingNew) {
        applyToDays.forEach(dayIndex => {
          addTask(dayIndex, { ...editingTask, id: Math.random().toString(36).substring(7) });
        });
      } else {
        updateTask(activeDay, editingTask.id, editingTask);
        // If user selected other days to copy this edit to:
        const otherDays = applyToDays.filter(d => d !== activeDay);
        otherDays.forEach(dayIndex => {
          addTask(dayIndex, { ...editingTask, id: Math.random().toString(36).substring(7) });
        });
      }
      setEditingTask(null);
      setIsAddingNew(false);
      setApplyToDays([]);
    }
  };

  const handleCreateNew = () => {
    setEditingTask({
      id: Math.random().toString(36).substring(7),
      startTime: '00:00',
      activity: '',
      detail: '',
      category: 'work'
    });
    setApplyToDays([activeDay]);
    setIsAddingNew(true);
  };

  const handleSaveSkill = () => {
    if (newGoalName.trim()) {
      addGoal(newGoalName, newGoalSkill);
      setIsAddingSkill(false);
      setNewGoalName('');
      setNewGoalSkill('');
    }
  };

  const renderTaskForm = (isNew: boolean) => {
    if (!editingTask && !isAddingNew) return null;
    
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`bg-white rounded-2xl w-full max-w-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${isNew ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between ${isNew ? 'bg-emerald-50/50 border-emerald-100' : 'bg-blue-50/50 border-blue-100'}`}>
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isNew ? 'text-emerald-800' : 'text-blue-800'}`}>
              {isNew ? <><Plus className="w-5 h-5"/> Buat Kegiatan Baru</> : <><Edit2 className="w-5 h-5"/> Edit Kegiatan</>}
            </h3>
            <button onClick={() => { setEditingTask(null); setIsAddingNew(false); }} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kegiatan <span className="text-red-500">*</span></label>
                <input type="text" value={editingTask!.activity} onChange={e => setEditingTask({...editingTask!, activity: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Belajar React, Meeting, Olahraga..." autoFocus />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu (Mulai - Selesai)</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={editingTask!.startTime} onChange={e => setEditingTask({...editingTask!, startTime: e.target.value})} className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="time" value={editingTask!.endTime || ''} onChange={e => setEditingTask({...editingTask!, endTime: e.target.value})} className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
  
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                <div className="relative">
                  <select value={editingTask!.category} onChange={e => setEditingTask({...editingTask!, category: e.target.value as any})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all bg-white">
                    <option value="work">💼 Kerja</option>
                    <option value="learning">📚 Belajar</option>
                    <option value="routine">🔄 Rutinitas</option>
                    <option value="rest">☕ Istirahat</option>
                    <option value="other">✨ Lainnya</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                </div>
              </div>
  
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill / Projek</label>
                <input type="text" value={editingTask!.skillOrProject || ''} onChange={e => setEditingTask({...editingTask!, skillOrProject: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Misal: Frontend, Skripsi... (opsional)" />
                {uniqueSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uniqueSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => setEditingTask({...editingTask!, skillOrProject: skill})}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                          editingTask!.skillOrProject === skill 
                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
  
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detail / Keterangan</label>
                <input type="text" value={editingTask!.detail} onChange={e => setEditingTask({...editingTask!, detail: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Catatan tambahan (opsional)" />
              </div>

              <div className="space-y-3 lg:col-span-3 hide-scrollbar">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terapkan Jadwal Ke Hari</label>
                  <div className="flex gap-2">
                    <button onClick={() => setApplyToDays([1,2,3,4,5,6,0])} className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Setiap Hari</button>
                    <button onClick={() => setApplyToDays([1,2,3,4,5])} className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Hari Kerja</button>
                    <button onClick={() => setApplyToDays([activeDay])} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Reset</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {days.map(d => {
                    const isSelected = applyToDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          if (isSelected) {
                            if (applyToDays.length > 1) {
                              setApplyToDays(applyToDays.filter(day => day !== d.id));
                            }
                          } else {
                            setApplyToDays([...applyToDays, d.id]);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-1 ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
  
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
            <button onClick={() => { setEditingTask(null); setIsAddingNew(false); setApplyToDays([]); }} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
            <button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Simpan Kegiatan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const taskSkills = Object.values(schedules).flatMap(day => day.tasks.map(t => t.skillOrProject));
  const goalSkills = goals.map(g => g.skillOrProject);
  const uniqueSkills = Array.from(new Set([...taskSkills, ...goalSkills].filter(s => !!s))) as string[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal Mingguan</h1>
          <p className="text-slate-500 font-medium">Ikhtisar seluruh kegiatan "GROW UP"</p>
        </div>
        {isLoggedIn && (
          <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" /> Tambah Kegiatan
            </button>
            <button
              onClick={() => setIsAddingSkill(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 px-5 py-2 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
            >
              <Target className="w-4 h-4" /> Tambah Skill/Projek Baru
            </button>
            <button
              onClick={() => setIsManagingSkills(true)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
            >
              <Edit2 className="w-4 h-4" /> Kelola Skill/Projek
            </button>
          </div>
        )}
      </div>

      {isManagingSkills && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <Edit2 className="w-5 h-5 text-slate-600"/> Kelola Skill/Projek
              </h3>
              <button 
                onClick={() => { setIsManagingSkills(false); setEditingSkillName(null); }} 
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {uniqueSkills.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Belum ada skill atau projek yang dibuat.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {uniqueSkills.map(skill => (
                    <div key={skill} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 group hover:border-slate-300 transition-colors">
                      {editingSkillName === skill ? (
                        <div className="flex w-full items-center gap-2">
                          <input
                            type="text"
                            value={newSkillNameInput}
                            onChange={(e) => setNewSkillNameInput(e.target.value)}
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (newSkillNameInput.trim() && newSkillNameInput !== skill) {
                                renameSkill(skill, newSkillNameInput.trim());
                              }
                              setEditingSkillName(null);
                            }}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                          >
                            Simpan
                          </button>
                          <button onClick={() => setEditingSkillName(null)} className="text-slate-500 px-2 hover:bg-slate-200 rounded-lg py-1.5 text-sm font-semibold">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-700">{skill}</span>
                          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingSkillName(skill);
                                setNewSkillNameInput(skill);
                              }}
                              className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus skill "${skill}" dari semua jadwal?`)) {
                                  deleteSkill(skill);
                                }
                              }}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddingSkill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600"/>
                Tambah Skill / Projek
              </h3>
              <button onClick={() => setIsAddingSkill(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Nama Target / Goal <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newGoalName} 
                  onChange={e => setNewGoalName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Misal: Menyelesaikan Course A" 
                  autoFocus 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Skill / Projek Terkait</label>
                <input 
                  type="text"
                  value={newGoalSkill} 
                  onChange={e => setNewGoalSkill(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Misal: Frontend Dev" 
                />
              </div>

              {uniqueSkills.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pilih dari yang sudah ada:</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => setNewGoalSkill(skill)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                          newGoalSkill === skill 
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsAddingSkill(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveSkill} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {days.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id)}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeDay === d.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 w-32 whitespace-nowrap">Waktu</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 w-24">Durasi</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 w-48">Kegiatan</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 w-40">Skill/Projek</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 hidden sm:table-cell w-32">Kategori</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-700 auto">Detail</th>
                {isLoggedIn && <th className="py-4 px-6 text-sm font-semibold text-slate-700 w-24 text-right">Opsi</th>}
              </tr>
            </thead>
            <tbody>
              {schedules[activeDay]?.tasks.map((task, i) => (
                  <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/50 last:border-0 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-600 whitespace-nowrap">
                      {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-700">
                      {task.startTime && task.endTime ? (() => {
                        const s = new Date(`2000-01-01T${task.startTime}`);
                        let e = new Date(`2000-01-01T${task.endTime}`);
                        if (e < s) e = new Date(`2000-01-02T${task.endTime}`);
                        const diffMins = Math.round((e.getTime() - s.getTime()) / 60000);
                        const h = Math.floor(diffMins / 60);
                        const m = diffMins % 60;
                        return h > 0 && m > 0 ? `${h}j ${m}m` : h > 0 ? `${h}j` : `${m}m`;
                      })() : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      {task.activity}
                    </td>
                    <td className="py-4 px-6 text-sm text-indigo-600 font-semibold tracking-wide uppercase text-xs">
                      {task.skillOrProject || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider
                        ${task.category === 'work' ? 'bg-blue-100 text-blue-700' :
                          task.category === 'rest' ? 'bg-emerald-100 text-emerald-700' :
                          task.category === 'learning' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }
                      `}>
                        {task.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {task.detail}
                    </td>
                    {isLoggedIn && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingTask(task); setApplyToDays([activeDay]); }} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTask(activeDay, task.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals outside the table */}
      {(editingTask || isAddingNew) && renderTaskForm(isAddingNew)}
    </div>
  );
}

