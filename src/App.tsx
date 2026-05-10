import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { Reports } from './components/Reports';
import { MemberArea } from './components/MemberArea';
import { useNotifications } from './hooks/useNotifications';
import { LayoutDashboard, Calendar, BarChart3, UserCog } from 'lucide-react';

export default function App() {
  useNotifications();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'reports' | 'member'>('dashboard');

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-20 text-slate-800 font-sans">
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard />} 
          label="Hari Ini" 
        />
        <NavButton 
          active={activeTab === 'schedule'} 
          onClick={() => setActiveTab('schedule')} 
          icon={<Calendar />} 
          label="Jadwal" 
        />
        <NavButton 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
          icon={<BarChart3 />} 
          label="Laporan" 
        />
        <NavButton 
          active={activeTab === 'member'} 
          onClick={() => setActiveTab('member')} 
          icon={<UserCog />} 
          label="Member" 
        />
      </nav>

      {/* Desktop Sidebar Nav */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-8 z-50">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
          G
        </div>
        <div className="flex flex-col gap-4">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard />} 
            label="Hari Ini" 
          />
          <NavButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
            icon={<Calendar />} 
            label="Jadwal" 
          />
          <NavButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
            icon={<BarChart3 />} 
            label="Laporan" 
          />
          <NavButton 
            active={activeTab === 'member'} 
            onClick={() => setActiveTab('member')} 
            icon={<UserCog />} 
            label="Member" 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'member' && <MemberArea />}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
        active 
          ? 'text-blue-600 bg-blue-50/50 shadow-sm' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
      title={label}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-[10px] font-semibold tracking-wider md:hidden uppercase">{label}</span>
    </button>
  );
}

