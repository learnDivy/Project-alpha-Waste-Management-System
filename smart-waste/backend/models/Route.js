const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeName: { type: String },
  bins: [{
    binId: String,
    location: String,
    lat: Number,
    lng: Number,
    fillLevel: Number,
    status: { type: String, enum: ['pending', 'collected'], default: 'pending' },
    collectedAt: Date
  }],
  totalDistance: { type: Number }, // in km
  estimatedTime: { type: Number }, // in minutes
  routePolyline: [[Number]], // array of [lat, lng] pairs
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  startedAt: Date,
  completedAt: Date,
  algorithm: { type: String, default: 'Nearest Neighbor TSP' }
});

module.exports = mongoose.model('Route', routeSchema);
