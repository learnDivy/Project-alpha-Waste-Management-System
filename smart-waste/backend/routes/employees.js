const express = require('express');
const CheckIn = require('../models/CheckIn');
const Route = require('../models/Route');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/employees — admin gets all employees
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/checkins — admin views all check-ins
router.get('/checkins', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const checkins = await CheckIn.find(filter).populate('employee', 'name email employeeId zone').sort({ checkInTime: -1 });
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/my-route — employee gets assigned route for today
router.get('/my-route', authMiddleware, roleMiddleware('employee'), async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const route = await Route.findOne({
      assignedEmployee: req.user.id,
      date: { $gte: start, $lte: end }
    });
    if (!route) return res.status(404).json({ message: 'No route assigned for today' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/my-checkin — employee gets today's check-in
router.get('/my-checkin', authMiddleware, roleMiddleware('employee'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkin = await CheckIn.findOne({ employee: req.user.id, date: today });
    res.json(checkin || { checkInTime: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees/checkout — employee checks out
router.post('/checkout', authMiddleware, roleMiddleware('employee'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkin = await CheckIn.findOneAndUpdate(
      { employee: req.user.id, date: today, status: 'active' },
      { checkOutTime: new Date(), status: 'completed' },
      { new: true }
    );
    res.json({ message: 'Checked out successfully', checkin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
