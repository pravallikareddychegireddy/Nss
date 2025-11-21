const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  rollNumber: { type: String, sparse: true },
  department: String,
  year: String,
  phone: String,
  totalHours: { type: Number, default: 0 },
  teamRole: { type: String, enum: ['coordinator', 'volunteer', 'core-team', 'member', ''], default: '' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  eventReminders: { type: Boolean, default: true },
  // Final Certificate Management
  isEligibleForFinalCertificate: { type: Boolean, default: false },
  finalCertificateGenerated: { type: Boolean, default: false },
  finalCertificateGeneratedAt: Date,
  finalCertificateGeneratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performanceRating: { type: String, enum: ['excellent', 'good', 'satisfactory', ''], default: '' },
  adminRemarks: String,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
