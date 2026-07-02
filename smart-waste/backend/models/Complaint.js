const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String },
  type: { type: String, enum: ['bin_full', 'illegal_dumping', 'bin_damage', 'other'], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { lat: Number, lng: Number },
  photo: { type: String }, // base64 or URL
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: { type: String, default: 'Anonymous' },
  reporterContact: { type: String },
  binId: { type: String }, // optional, if reporting a specific bin
  status: { type: String, enum: ['open', 'in-review', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function (next) {
  if (!this.complaintId) {
    this.complaintId = 'CMP-' + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
