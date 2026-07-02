const express = require('express');
const Bin = require('../models/Bin');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/bins — all bins (admin/employee)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bins = await Bin.find({ isActive: true });
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bins/full — only full bins (>=80%)
router.get('/full', authMiddleware, async (req, res) => {
  try {
    const bins = await Bin.find({ fillLevel: { $gte: 80 }, isActive: true });
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bins/stats — summary stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const total = await Bin.countDocuments({ isActive: true });
    const full = await Bin.countDocuments({ fillLevel: { $gte: 80 }, isActive: true });
    const moderate = await Bin.countDocuments({ fillLevel: { $gte: 50, $lt: 80 }, isActive: true });
    const low = await Bin.countDocuments({ fillLevel: { $lt: 50 }, isActive: true });
    const avgFill = await Bin.aggregate([{ $group: { _id: null, avg: { $avg: '$fillLevel' } } }]);
    res.json({ total, full, moderate, low, avgFill: avgFill[0]?.avg?.toFixed(1) || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bins/:id — single bin
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.id });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bins/:id — update bin (admin)
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const bin = await Bin.findOneAndUpdate(
      { binId: req.params.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    req.app.get('io')?.emit('bin_update', bin); // real-time push
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bins/:id/report — client reports bin as full
router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const bin = await Bin.findOneAndUpdate(
      { binId: req.params.id },
      { reportedFull: true, reportedAt: new Date() },
      { new: true }
    );
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    req.app.get('io')?.emit('bin_reported', { binId: req.params.id, reportedAt: new Date() });
    res.json({ message: 'Bin reported as full', bin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bins/:binId/collect — employee marks bin as collected
router.post('/:binId/collect', authMiddleware, roleMiddleware('employee', 'admin'), async (req, res) => {
  try {
    const bin = await Bin.findOneAndUpdate(
      { binId: req.params.binId },
      { fillLevel: 0, status: 'low', reportedFull: false, lastCollected: new Date() },
      { new: true }
    );
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    req.app.get('io')?.emit('bin_collected', bin);
    res.json({ message: 'Bin marked as collected', bin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
