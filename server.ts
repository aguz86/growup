import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'server-data.json');

let bot: TelegramBot | null = null;
let currentToken = '';

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function initBot(token: string) {
  if (token && token !== currentToken) {
    if (bot) {
      bot.stopPolling();
    }
    try {
      bot = new TelegramBot(token, { polling: false });
      currentToken = token;
    } catch (e) {
      console.error("Failed to init Telegram bot", e);
    }
  }
}

// Check every minute
cron.schedule('* * * * *', () => {
  const data = loadData();
  if (!data?.state?.notificationEnabled || !data?.state?.telegramToken || !data?.state?.telegramChatId) {
    return;
  }
  
  initBot(data.state.telegramToken);
  
  const now = new Date();
  const currentDay = now.getDay();
  const scheduleDay = data.state.schedules[currentDay];
  if (!scheduleDay || !scheduleDay.tasks) return;
  
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMin = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMin}`;
  
  for (const task of scheduleDay.tasks) {
    if (task.startTime === currentTime && bot) {
      bot.sendMessage(data.state.telegramChatId, `🔔 *Pengingat Kegiatan!*\n\n[ ${task.startTime} ] ${task.activity}\n\nPersiapkan dirimu!`, { parse_mode: 'Markdown' })
        .catch(err => console.error("Telegram send error:", err));
    }
  }
});

app.post('/api/sync', (req, res) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(req.body));
  res.json({ status: 'ok' });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
