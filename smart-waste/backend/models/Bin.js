const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  area: { type: String, enum: ['Market', 'Railway Station', 'School', 'Residential', 'Park'], required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  fillLevel: { type: Number, min: 0, max: 100, default: 0 }, // percentage
  capacity: { type: Number, default: 100 }, // liters
  status: { type: String, enum: ['low', 'moderate', 'full', 'overflow'], default: 'low' },
  lastCollected: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  reportedFull: { type: Boolean, default: false },
  reportedAt: { type: Date }
});

// Auto-set status based on fill level
binSchema.pre('save', function (next) {
  if (this.fillLevel >= 100) this.status = 'overflow';
  else if (this.fillLevel >= 80) this.status = 'full';
  else if (this.fillLevel >= 50) this.status = 'moderate';
  else this.status = 'low';
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Bin', binSchema);
