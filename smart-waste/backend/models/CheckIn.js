const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeId: { type: String },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  routeId: { type: String },
  binsCollected: { type: Number, default: 0 },
  totalBinsAssigned: { type: Number, default: 0 },
  date: { type: String }, // YYYY-MM-DD
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  notes: { type: String }
});

module.exports = mongoose.model('CheckIn', checkInSchema);
