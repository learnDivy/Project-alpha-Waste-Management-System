const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CheckIn = require('../models/CheckIn');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'smartwaste_secret_2024';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Auto check-in for employees
    if (user.role === 'employee') {
      const today = new Date().toISOString().split('T')[0];
      const existing = await CheckIn.findOne({ employee: user._id, date: today });
      if (!existing) {
        await CheckIn.create({
          employee: user._id,
          employeeName: user.name,
          employeeId: user.employeeId,
          date: today
        });
      }
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, zone: user.zone, employeeId: user.employeeId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, zone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const user = await User.create({ name, email, password, role: role || 'client', zone });
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
