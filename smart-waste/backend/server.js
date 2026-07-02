require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const binRoutes = require('./routes/bins');
const routeRoutes = require('./routes/route');
const complaintRoutes = require('./routes/complaints');
const employeeRoutes = require('./routes/employees');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/employees', employeeRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io — real-time events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (room) => socket.join(room));

  // Simulate live fill-level updates every 30 seconds
  const simInterval = setInterval(async () => {
    try {
      const Bin = require('./models/Bin');
      const bins = await Bin.find({ isActive: true });
      const updates = [];
      for (const bin of bins) {
        // Simulate gradual fill increase
        const areaRates = { 'Market': 0.5, 'Railway Station': 0.8, 'School': 0.2, 'Residential': 0.3, 'Park': 0.1 };
        const rate = areaRates[bin.area] || 0.3;
        const newLevel = Math.min(100, bin.fillLevel + (Math.random() * rate));
        if (newLevel !== bin.fillLevel) {
          bin.fillLevel = parseFloat(newLevel.toFixed(1));
          await bin.save();
          updates.push({ binId: bin.binId, fillLevel: bin.fillLevel, status: bin.status });
          // Trigger alert if just crossed 80%
          if (bin.fillLevel >= 80 && newLevel < 80) {
            io.emit('bin_alert', { binId: bin.binId, location: bin.location, fillLevel: bin.fillLevel });
          }
        }
      }
      if (updates.length > 0) io.emit('fill_levels_update', updates);
    } catch (e) { /* ignore */ }
  }, 30000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(simInterval);
  });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartwaste';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    // Still start server for demo without DB
    server.listen(PORT, () => console.log(`🚀 Server running (no DB) on http://localhost:${PORT}`));
  });

module.exports = { app, io };
