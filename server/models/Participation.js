const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'attended', 'absent'],
    default: 'pending' 
  },
  reportText: String,
  photos: [String],
  hoursContributed: { type: Number, default: 0 },
  feedback: String,
  submittedAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  certificateGenerated: { type: Boolean, default: false }
});

module.exports = mongoose.model('Participation', participationSchema);
