const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['tree-plantation', 'blood-donation', 'cleanliness', 'awareness', 'workshop', 'other'],
    required: true 
  },
  date: { type: Date, required: true },
  endDate: Date,
  venue: { type: String, required: true },
  maxParticipants: Number,
  hours: { type: Number, required: true },
  coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyInCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  image: String,
  registrationDeadline: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
