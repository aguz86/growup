export interface Task {
  id: string;
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  activity: string;
  skillOrProject?: string;
  detail: string;
  category: 'rest' | 'work' | 'routine' | 'learning' | 'other';
}

export interface DaySchedule {
  dayName: string;
  tasks: Task[];
}

const commonEvening: Task[] = [
  { id: '16', startTime: '16:40', endTime: '17:00', activity: 'Arrive Home', detail: 'Istirahat sejenak.', category: 'rest' },
  { id: '17', startTime: '17:00', endTime: '17:25', activity: 'Masak & Mandi', detail: 'Kebersihan & persiapan.', category: 'routine' },
  { id: '18', startTime: '17:25', endTime: '17:50', activity: 'Rekap Finansial', detail: 'Catat pengeluaran harian.', category: 'routine' },
  { id: '19', startTime: '17:50', endTime: '18:10', activity: 'Ibadah Maghrib', detail: 'Fokus Ibadah.', category: 'routine' },
  { id: '20', startTime: '18:10', endTime: '18:35', activity: 'Airdrop Session', detail: 'Tugas harian/check-in.', category: 'work' },
  { id: '21', startTime: '18:35', endTime: '18:50', activity: 'Jeda Makan Malam', detail: 'Waktu makan malam.', category: 'rest' },
  { id: '22', startTime: '18:50', endTime: '19:00', activity: 'Ibadah Isya', detail: 'Fokus Ibadah.', category: 'routine' },
  { id: '23', startTime: '19:00', endTime: '19:50', activity: 'Kursus Marketing', detail: 'Belajar Pemasaran (Lanjutan).', category: 'learning' },
  { id: '24', startTime: '20:00', endTime: '20:30', activity: 'Programming Basic', detail: 'Penguatan logika koding.', category: 'learning' },
  { id: '25', startTime: '20:40', endTime: '21:10', activity: 'Vibecoding', detail: 'Sesi koding mengalir.', category: 'work' },
  { id: '26', startTime: '21:20', endTime: '21:50', activity: 'Eksperimen', detail: 'Eksplorasi bebas / Riset.', category: 'learning' },
  { id: '27', startTime: '21:50', endTime: '22:20', activity: 'Kursus Desain', detail: 'Canva / AI / Photoshop.', category: 'learning' },
  { id: '28', startTime: '22:30', endTime: '22:50', activity: 'YouTube Short Production', detail: 'Editing video atau thumbnail.', category: 'work' },
  { id: '29', startTime: '23:10', endTime: '23:30', activity: 'Job Reward Recehan', detail: 'Tugas mikro / airdrop.', category: 'work' },
  { id: '30', startTime: '23:30', endTime: '23:50', activity: 'Wind Down', detail: 'Persiapan tidur.', category: 'rest' },
  { id: '31', startTime: '23:50', endTime: '23:59', activity: 'Waktunya Tidur', detail: 'Sampai jumpa besok.', category: 'rest' },
];

const commonMorning: Task[] = [
  { id: '01', startTime: '05:00', endTime: '05:20', activity: 'Ibadah Subuh', detail: 'Fokus Ibadah.', category: 'routine' },
  { id: '02', startTime: '05:20', endTime: '06:15', activity: 'Tidur Lanjut', detail: 'Istirahat Tahap 2.', category: 'rest' },
  { id: '03', startTime: '06:15', endTime: '07:00', activity: 'Sarapan & Mandi', detail: 'Persiapan pagi.', category: 'routine' },
  { id: '04', startTime: '07:00', endTime: '07:50', activity: 'Perjalanan Kerja', detail: 'Menuju lokasi kerja.', category: 'routine' },
];

const weekdayTasks: Task[] = [
  ...commonMorning,
  { id: '05', startTime: '07:50', endTime: '16:30', activity: 'Jadwal Kerja Formal', detail: 'Jam operasional kantor/pekerjaan.', category: 'work' },
  ...commonEvening,
];

const saturdayTasks: Task[] = [
  ...commonMorning,
  { id: '05', startTime: '07:50', endTime: '13:30', activity: 'Jadwal Kerja Formal', detail: 'Jam operasional kantor (Sabtu).', category: 'work' },
  { id: '11', startTime: '13:40', endTime: '14:40', activity: 'Cuci Baju & Mandi', detail: 'Kebersihan rumah.', category: 'routine' },
  { id: '12', startTime: '14:40', endTime: '15:30', activity: 'Santai + Ashar', detail: 'Istirahat sore.', category: 'rest' },
  { id: '13', startTime: '15:30', endTime: '16:00', activity: 'Shutterstock', detail: 'Upload aset visual.', category: 'work' },
  { id: '14', startTime: '16:10', endTime: '16:30', activity: 'Job Receh/Promosi', detail: 'Promosi proyek.', category: 'work' },
  ...commonEvening,
];

const sundayTasks: Task[] = [
  { id: 's01', startTime: '00:10', endTime: '01:00', activity: 'Aktivitas Jam Santai', detail: 'Waktu bebas/relaksasi.', category: 'rest' },
  { id: 's02', startTime: '01:00', endTime: '01:15', activity: 'Stop Waktunya Tidur', detail: 'Persiapan tidur.', category: 'rest' },
  { id: 's03', startTime: '01:15', endTime: '05:00', activity: 'Tidur', detail: 'Istirahat dini hari.', category: 'rest' },
  { id: 's04', startTime: '05:00', endTime: '05:20', activity: 'Ibadah Subuh', detail: 'Fokus Ibadah.', category: 'routine' },
  { id: 's05', startTime: '05:20', endTime: '08:30', activity: 'Lanjut Tidur', detail: 'Istirahat pagi hari Minggu.', category: 'rest' },
  { id: 's06', startTime: '08:30', endTime: '09:10', activity: 'Jam Santai', detail: 'Waktu luang/relaksasi.', category: 'rest' },
  { id: 's07', startTime: '09:10', endTime: '09:50', activity: 'Mandi & Cuci/Service Motor', detail: 'Perawatan kendaraan & kebersihan diri.', category: 'routine' },
  { id: 's08', startTime: '10:00', endTime: '10:50', activity: 'Vibecoding Jargonpayment', detail: 'Pengembangan proyek.', category: 'work' },
  { id: 's09', startTime: '11:00', endTime: '11:20', activity: 'Posting Etalase/Jargonpay', detail: 'Update konten.', category: 'work' },
  { id: 's10', startTime: '12:30', endTime: '13:10', activity: 'Programming Session', detail: 'Latihan koding.', category: 'learning' },
  { id: 's11', startTime: '13:10', endTime: '13:30', activity: 'SGB / Virtual Assistant', detail: 'Tugas VA.', category: 'work' },
  { id: 's12', startTime: '13:40', endTime: '14:40', activity: 'DevOps Session', detail: 'Maintenance server.', category: 'work' },
  { id: 's13', startTime: '14:40', endTime: '15:30', activity: 'Break / Ashar', detail: 'Istirahat.', category: 'rest' },
  { id: 's14', startTime: '15:30', endTime: '16:00', activity: 'YouTube / FBRPO', detail: 'Riset konten.', category: 'work' },
  { id: 's15', startTime: '16:10', endTime: '16:30', activity: 'Airdrop Minggu', detail: 'Check-in mingguan.', category: 'work' },
  ...commonEvening,
];

// Javascript getDay() returns 0 for Sunday
export const schedules: Record<number, DaySchedule> = {
  0: { dayName: 'Minggu', tasks: sundayTasks },
  1: { dayName: 'Senin', tasks: weekdayTasks },
  2: { dayName: 'Selasa', tasks: weekdayTasks },
  3: { dayName: 'Rabu', tasks: weekdayTasks },
  4: { dayName: 'Kamis', tasks: weekdayTasks },
  5: { dayName: 'Jumat', tasks: weekdayTasks },
  6: { dayName: 'Sabtu', tasks: saturdayTasks },
};
