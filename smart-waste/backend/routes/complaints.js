const express = require('express');
const Complaint = require('../models/Complaint');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// POST /api/complaints — client submits complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, description, location, coordinates, binId, reporterName, reporterContact, photo } = req.body;
    const complaint = await Complaint.create({
      type, description, location, coordinates, binId,
      reporterName: reporterName || req.user.name || 'Anonymous',
      reporterContact,
      reportedBy: req.user.id,
      photo,
      priority: type === 'bin_full' ? 'medium' : type === 'illegal_dumping' ? 'high' : 'low'
    });
    req.app.get('io')?.emit('new_complaint', { complaintId: complaint.complaintId, type, location });
    res.status(201).json({ message: 'Complaint submitted successfully', complaintId: complaint.complaintId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints — admin gets all complaints
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/my — client views own complaints
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/complaints/:id — admin updates complaint status
router.patch('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { status, adminNotes, priority } = req.body;
    const update = { status, adminNotes, priority };
    if (status === 'resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
