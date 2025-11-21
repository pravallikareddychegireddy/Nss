const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Participation = require('../models/Participation');
const { protect, authorize } = require('../middleware/auth');

// Get all students (admin/faculty)
router.get('/students', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { teamRole } = req.query;
    const filter = { role: 'student' };
    if (teamRole) filter.teamRole = teamRole;

    const students = await User.find(filter)
      .select('-password')
      .sort({ totalHours: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student profile with participation history
router.get('/student/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const participations = await Participation.find({ studentId: req.params.id })
      .populate('eventId', 'title date venue hours')
      .sort({ submittedAt: -1 });

    res.json({ student, participations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, department, year } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, year },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update team role (admin only)
router.put('/:id/team-role', protect, authorize('admin'), async (req, res) => {
  try {
    const { teamRole } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { teamRole },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
