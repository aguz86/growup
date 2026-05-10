import React, { useState } from 'react';
import { useStore } from '../store';
import { User, LogIn, LogOut, Send, Bot, ShieldAlert, Key } from 'lucide-react';

export function MemberArea() {
  const { isLoggedIn, login, logout, telegramToken, telegramChatId, setTelegramSettings } = useStore();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(telegramToken);
  const [chatId, setChatId] = useState(telegramChatId);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Password salah.');
    }
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramSettings(token, chatId);
    alert('Pengaturan Telegram berhasil disimpan.');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Area Member</h2>
          <p className="text-center text-slate-500 mb-6">Silakan masuk untuk mengubah jadwal dan pengaturan peringatan Telegram.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Masukkan password admin"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> Masuk
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">Hint: gunakan "admin123" untuk demo</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Area Member</h1>
            <p className="text-slate-500 font-medium">Hello, Admin!</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Cronjob Telegram Bot</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cron Active
          </div>
        </div>
        
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Sistem memiliki <strong>Server-side Cronjob</strong> yang akan mengecek jadwal setiap menit dan mengirimkan notifikasi otomatis ke Telegram Anda pada waktu kegiatan.
          <br/><span className="text-emerald-600 font-medium">✨ Fitur berjalan otomatis di latar belakang meskipun tab browser ditutup!</span>
        </p>

        <form onSubmit={handleSaveTelegram} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bot Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: 987654321"
            />
            <p className="text-xs text-slate-500 mt-1">Cari bot @userinfobot di Telegram untuk mengetahui Chat ID Anda.</p>
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </form>
      </div>

    </div>
  );
}
