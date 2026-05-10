import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parse, differenceInMinutes } from 'date-fns';
import { schedules as defaultSchedules, DaySchedule, Task } from './data/schedule';

export interface CheckLog {
  taskId: string;
  day: number;
  date: string; // YYYY-MM-DD
  checkedAt: string; // ISO string
  scheduledAt: string; // HH:mm
  lateMinutes: number; // positive if late, 0 if on time or early
}

export interface Goal {
  id: string;
  name: string;
  progress: number;
  skillOrProject?: string;
}

interface AppState {
  logs: CheckLog[];
  notificationEnabled: boolean;
  schedules: Record<number, DaySchedule>;
  isLoggedIn: boolean;
  telegramToken: string;
  telegramChatId: string;
  goals: Goal[];
  
  // Actions
  addLog: (log: Omit<CheckLog, 'lateMinutes' | 'date'>) => void;
  removeLog: (taskId: string, day: number, date: string) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  getLogsForDate: (dateStr: string) => CheckLog[];
  clearLogs: () => void;
  
  // Auth & Settings
  login: (password: string) => boolean;
  logout: () => void;
  setTelegramSettings: (token: string, chatId: string) => void;
  
  // Schedule Editing
  updateTask: (day: number, taskId: string, updatedTask: Partial<Task>) => void;
  addTask: (day: number, task: Task) => void;
  deleteTask: (day: number, taskId: string) => void;

  // Goals
  addGoal: (name: string, skillOrProject?: string) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Skills
  renameSkill: (oldSkill: string, newSkill: string) => void;
  deleteSkill: (skill: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      logs: [],
      notificationEnabled: false,
      schedules: defaultSchedules,
      isLoggedIn: false,
      telegramToken: '',
      telegramChatId: '',
      goals: [
        { id: '1', name: 'Resolusi Karir 2024', progress: 25, skillOrProject: 'Programming Basic' },
        { id: '2', name: 'Belajar Coding (Frontend)', progress: 60, skillOrProject: 'Vibecoding' }
      ],
      
      addLog: (logInput) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        
        const now = new Date(logInput.checkedAt);
        const scheduledTimeStr = logInput.scheduledAt;
        const scheduledTime = parse(scheduledTimeStr, 'HH:mm', now);
        
        let lateMinutes = differenceInMinutes(now, scheduledTime);
        if (lateMinutes <= 2) {
          lateMinutes = 0;
        }

        const newLog: CheckLog = {
          ...logInput,
          date: todayStr,
          lateMinutes: lateMinutes > 0 ? lateMinutes : 0,
        };

        set((state) => {
          const filtered = state.logs.filter(
            (l) => !(l.taskId === newLog.taskId && l.date === newLog.date)
          );
          return { logs: [...filtered, newLog] };
        });
      },
      removeLog: (taskId, day, date) => {
        set((state) => ({
          logs: state.logs.filter(
            (l) => !(l.taskId === taskId && l.date === date)
          ),
        }));
      },
      setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),
      getLogsForDate: (dateStr) => {
        return get().logs.filter((l) => l.date === dateStr);
      },
      clearLogs: () => set({ logs: [] }),
      
      login: (password) => {
        if (password === 'admin123') {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isLoggedIn: false }),
      setTelegramSettings: (token, chatId) => set({ telegramToken: token, telegramChatId: chatId }),
      
      updateTask: (day, taskId, updatedTask) => set((state) => {
        const daySchedule = state.schedules[day];
        if (!daySchedule) return state;
        
        const updatedTasks = daySchedule.tasks.map(t => 
          t.id === taskId ? { ...t, ...updatedTask } : t
        );
        
        return {
          schedules: {
            ...state.schedules,
            [day]: { ...daySchedule, tasks: updatedTasks }
          }
        };
      }),
      addTask: (day, task) => set((state) => {
        const daySchedule = state.schedules[day];
        if (!daySchedule) return state;
        
        const updatedTasks = [...daySchedule.tasks, task].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
        
        return {
          schedules: {
            ...state.schedules,
            [day]: { ...daySchedule, tasks: updatedTasks }
          }
        };
      }),
      deleteTask: (day, taskId) => set((state) => {
        const daySchedule = state.schedules[day];
        if (!daySchedule) return state;
        
        const updatedTasks = daySchedule.tasks.filter(t => t.id !== taskId);
        
        return {
          schedules: {
            ...state.schedules,
            [day]: { ...daySchedule, tasks: updatedTasks }
          }
        };
      }),

      addGoal: (name, skillOrProject) => set((state) => ({
        goals: [...state.goals, { id: Math.random().toString(36).substring(7), name, progress: 0, skillOrProject }]
      })),
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      renameSkill: (oldSkill, newSkill) => set((state) => {
        const newSchedules = { ...state.schedules };
        Object.keys(newSchedules).forEach(day => {
          const dNumber = Number(day);
          newSchedules[dNumber].tasks = newSchedules[dNumber].tasks.map(t => 
            t.skillOrProject === oldSkill ? { ...t, skillOrProject: newSkill } : t
          );
        });
        const newGoals = state.goals.map(g => 
          g.skillOrProject === oldSkill ? { ...g, skillOrProject: newSkill } : g
        );
        return { schedules: newSchedules, goals: newGoals };
      }),

      deleteSkill: (skill) => set((state) => {
        const newSchedules = { ...state.schedules };
        Object.keys(newSchedules).forEach(day => {
          const dNumber = Number(day);
          newSchedules[dNumber].tasks = newSchedules[dNumber].tasks.map(t => 
            t.skillOrProject === skill ? { ...t, skillOrProject: undefined } : t
          );
        });
        const newGoals = state.goals.map(g => 
          g.skillOrProject === skill ? { ...g, skillOrProject: undefined } : g
        );
        return { schedules: newSchedules, goals: newGoals };
      })
    }),
    {
      name: 'grow-run-storage',
    }
  )
);

if (typeof window !== 'undefined') {
  useStore.subscribe((state) => {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    }).catch(() => {});
  });
}
