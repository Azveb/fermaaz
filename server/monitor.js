const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

// 4000 portunda server yaradırıq
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected for monitoring:', socket.id);
  
  // Sistem məlumatlarını hər 2 saniyədən bir göndəririk
  const sysInfoInterval = setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    
    // Bəsit CPU load hesablama
    const sysInfo = {
      cpuLoad: Math.round(os.loadavg()[0] * 100) / 100,
      totalMemMB: Math.round(totalMem / 1024 / 1024),
      freeMemMB: Math.round(freeMem / 1024 / 1024),
      uptimeHours: Math.round(os.uptime() / 3600 * 10) / 10
    };
    
    socket.emit('sysinfo', sysInfo);
  }, 2000);

  socket.on('disconnect', () => {
    clearInterval(sysInfoInterval);
    console.log('Client disconnected:', socket.id);
  });
});

// Windows-da process loglarını tutmaq üçün
// Biz burada sadəcə demo olaraq bəzi loglar yarada bilərik, və ya `.next/` cache dəyişikliklərini izləyə bilərik
setInterval(() => {
  const time = new Date().toISOString();
  io.emit('log', `[${time}] System health check OK.`);
}, 5000);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Live Monitoring Server running on port ${PORT}`);
});
