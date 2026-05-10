import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { differenceInMinutes, parse } from 'date-fns';

const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  } catch (error) {
    console.error('Task Notification Telegram sent error:', error);
  }
};

export function useNotifications() {
  const notificationEnabled = useStore((state) => state.notificationEnabled);
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!notificationEnabled) return;

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          useStore.getState().setNotificationEnabled(true);
        } else {
          useStore.getState().setNotificationEnabled(false);
        }
      });
    }

    const interval = setInterval(() => {
      const state = useStore.getState();
      const schedules = state.schedules;
      const teleToken = state.telegramToken;
      const teleChatId = state.telegramChatId;
      
      const now = new Date();
      const currentDay = now.getDay();
      const schedule = schedules[currentDay];
      
      schedule?.tasks.forEach(task => {
        const startTime = parse(task.startTime, 'HH:mm', now);
        const minsToStart = differenceInMinutes(startTime, now);
        
        // Notify 5 minutes before start
        if (minsToStart > 0 && minsToStart <= 5 && !notifiedTasks.current.has(`${task.id}-start-warn`)) {
          if (Notification.permission === 'granted') {
            new Notification('Persiapan Aktivitas!', {
              body: `${task.activity} akan dimulai dalam ${minsToStart} menit.`,
              icon: '/vite.svg'
            });
          }
          sendTelegramMessage(teleToken, teleChatId, `⏳ *Persiapan Aktivitas!*\n\n${task.activity} akan dimulai dalam *${minsToStart} menit*. (${task.startTime})`);
          notifiedTasks.current.add(`${task.id}-start-warn`);
        }

        // Notify at start
        if (minsToStart === 0 && !notifiedTasks.current.has(`${task.id}-start`)) {
          if (Notification.permission === 'granted') {
            new Notification('Mulai Aktivitas!', {
              body: `Waktunya untuk: ${task.activity}. Segera check-in!`,
              icon: '/vite.svg'
            });
          }
          sendTelegramMessage(teleToken, teleChatId, `🚀 *Mulai Aktivitas!*\n\nWaktunya untuk: *${task.activity}*.\nMohon segera check-in di aplikasi agar tidak tercatat telat!`);
          notifiedTasks.current.add(`${task.id}-start`);
        }

        // Notify at end (if endTime exists)
        if (task.endTime) {
          const endTime = parse(task.endTime, 'HH:mm', now);
          const minsToEnd = differenceInMinutes(endTime, now);
          
          if (minsToEnd === 0 && !notifiedTasks.current.has(`${task.id}-end`)) {
            if (Notification.permission === 'granted') {
              new Notification('Waktu Jeda/Selesai!', {
                body: `Aktivitas ${task.activity} telah selesai.`,
                icon: '/vite.svg'
              });
            }
            sendTelegramMessage(teleToken, teleChatId, `🏁 *Aktivitas Selesai!*\n\nAktivitas *${task.activity}* telah selesai/jeda.`);
            notifiedTasks.current.add(`${task.id}-end`);
          }
        }
      });
      
      // Clear yesterday's notifications at midnight (ish)
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedTasks.current.clear();
      }

    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [notificationEnabled]);
}
