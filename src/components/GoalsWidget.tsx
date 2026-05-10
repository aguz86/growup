import React, { useState } from 'react';
import { useStore, Goal } from '../store';
import { Target, Pencil, Trash2, Check, X, Plus } from 'lucide-react';

export function GoalsWidget() {
  const { goals, addGoal, updateGoal, deleteGoal, isLoggedIn } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editSkill, setEditSkill] = useState<string>('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSkill, setNewSkill] = useState<string>('');

  const handleEdit = (goal: Goal) => {
    if (!isLoggedIn) return;
    setEditingId(goal.id);
    setEditName(goal.name);
    setEditProgress(goal.progress);
    setEditSkill(goal.skillOrProject || '');
  };

  const saveEdit = () => {
    if (editingId) {
      updateGoal(editingId, { name: editName, progress: editProgress, skillOrProject: editSkill });
      setEditingId(null);
    }
  };

  const handleAdd = () => {
    if (newName.trim()) {
      addGoal(newName, newSkill);
      setNewName('');
      setNewSkill('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Target & Goals</h2>
        </div>
        {isLoggedIn && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Goal Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border border-slate-100 p-4 rounded-xl relative group hover:border-indigo-200 transition-colors bg-slate-50/50">
            {editingId === goal.id ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Nama Target"
                  />
                  <input 
                    type="text"
                    value={editSkill} 
                    onChange={e => setEditSkill(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Skill / Projek (opsional)"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-sm font-bold text-slate-700 w-12 text-right">{editProgress}%</span>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={saveEdit} className="p-1 px-3 bg-emerald-500 text-white rounded text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Simpan</button>
                  <button onClick={() => setEditingId(null)} className="p-1 px-3 bg-slate-200 text-slate-700 rounded text-sm font-medium flex items-center gap-1"><X className="w-4 h-4"/> Batal</button>
                  <button onClick={() => { deleteGoal(goal.id); setEditingId(null); }} className="p-1 text-red-500 ml-auto"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ) : (
              <>
                {isLoggedIn && (
                  <button 
                    onClick={() => handleEdit(goal)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <div className="flex justify-between items-start mb-2 pr-6">
                  <div>
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{goal.name}</h3>
                    {goal.skillOrProject && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-500 tracking-wider">
                        {goal.skillOrProject}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-sm shrink-0">{goal.progress}%</span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="border border-indigo-200 bg-indigo-50/30 p-4 rounded-xl">
             <div className="flex flex-col sm:flex-row gap-2 mb-3">
               <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nama target/goals baru"
                  autoFocus
                />
                <input 
                  type="text"
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none sm:w-1/3"
                  placeholder="Skill / Projek"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={handleAdd} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Tambah</button>
                <button onClick={() => { setIsAdding(false); setNewName(''); }} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-medium flex items-center gap-1"><X className="w-4 h-4"/> Batal</button>
              </div>
          </div>
        )}

        {goals.length === 0 && !isAdding && (
          <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            Belum ada target yang dibuat. {isLoggedIn ? 'Klik "Goal Baru" untuk memulai.' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
