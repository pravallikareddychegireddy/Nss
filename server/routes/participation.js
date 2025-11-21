const express = require('express');
const router = express.Router();
const Participation = require('../models/Participation');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');

// Get all participations (admin/faculty)
router.get('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { eventId, status } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;

    const participations = await Participation.find(filter)
      .populate('eventId', 'title date venue')
      .populate('studentId', 'name email rollNumber department')
      .sort({ submittedAt: -1 });
    
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's own participations
router.get('/my-participations', protect, async (req, res) => {
  try {
    const participations = await Participation.find({ studentId: req.user._id })
      .populate('eventId', 'title date venue hours status')
      .sort({ submittedAt: -1 });
    
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if student is registered for an event
router.get('/check/:eventId', protect, authorize('student'), async (req, res) => {
  try {
    const participation = await Participation.findOne({
      eventId: req.params.eventId,
      studentId: req.user._id
    });
    
    if (!participation) {
      return res.status(404).json({ message: 'Not registered' });
    }
    
    res.json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for event
router.post('/register', protect, authorize('student'), async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Check if event is completed or cancelled
    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot register for ${event.status} events` });
    }

    const existingParticipation = await Participation.findOne({
      eventId,
      studentId: req.user._id
    });

    if (existingParticipation) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const participation = await Participation.create({
      eventId,
      studentId: req.user._id,
      status: 'pending'
    });

    res.status(201).json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attended for past event (for students who attended but didn't register)
router.post('/mark-attended', protect, authorize('student'), async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate >= today) {
      return res.status(400).json({ message: 'Can only mark attendance for past events' });
    }

    const existingParticipation = await Participation.findOne({
      eventId,
      studentId: req.user._id
    });

    if (existingParticipation) {
      return res.status(400).json({ message: 'Already marked for this event' });
    }

    const participation = await Participation.create({
      eventId,
      studentId: req.user._id,
      status: 'pending'
    });

    res.status(201).json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel registration
router.delete('/cancel/:eventId', protect, authorize('student'), async (req, res) => {
  try {
    const participation = await Participation.findOne({
      eventId: req.params.eventId,
      studentId: req.user._id
    }).populate('eventId');

    if (!participation) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if event has already passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(participation.eventId.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(400).json({ message: 'Cannot cancel registration for past events' });
    }

    // Only allow cancellation if status is pending
    if (participation.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel - participation already processed' });
    }

    await Participation.findByIdAndDelete(participation._id);

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit participation report
router.post('/submit-report/:id', protect, authorize('student'), upload.array('photos', 5), async (req, res) => {
  try {
    const { reportText, feedback } = req.body;
    const participation = await Participation.findById(req.params.id).populate('eventId');

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if event has occurred (date has passed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(participation.eventId.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate >= today) {
      return res.status(400).json({ message: 'Cannot submit report before event date' });
    }

    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'nss-reports' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(file.buffer);
          });
          photoUrls.push(result.secure_url);
        } catch (uploadError) {
          console.log('Photo upload failed:', uploadError.message);
          // Continue without this photo
        }
      }
    }

    participation.reportText = reportText;
    participation.feedback = feedback;
    participation.photos = photoUrls;
    participation.status = 'attended';
    await participation.save();

    res.json(participation);
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject participation
router.put('/approve/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { status, hoursContributed } = req.body;
    
    console.log('Approve/Reject request:', { id: req.params.id, status, hoursContributed });

    const participation = await Participation.findById(req.params.id)
      .populate('studentId')
      .populate('eventId');

    if (!participation) {
      console.log('Participation not found:', req.params.id);
      return res.status(404).json({ message: 'Participation not found' });
    }

    console.log('Found participation:', participation._id, 'Current status:', participation.status);

    participation.status = status;
    participation.approvedBy = req.user._id;
    participation.approvedAt = Date.now();

    if (status === 'approved' && hoursContributed) {
      const hours = Number(hoursContributed);
      participation.hoursContributed = hours;
      
      // Update student's total hours
      const student = await User.findById(participation.studentId._id);
      if (student) {
        student.totalHours = (student.totalHours || 0) + hours;
        await student.save();
        console.log('Updated student hours:', student.name, student.totalHours);
      }
    }

    await participation.save();
    console.log('Participation updated successfully');

    // Send email notification (non-blocking)
    try {
      await sendEmail({
        email: participation.studentId.email,
        subject: `Participation ${status} - ${participation.eventId.title}`,
        html: `<h2>Participation Update</h2>
               <p>Hi ${participation.studentId.name},</p>
               <p>Your participation in <strong>${participation.eventId.title}</strong> has been ${status}.</p>
               ${status === 'approved' ? `<p>Hours contributed: ${hoursContributed}</p>` : ''}`
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    res.json(participation);
  } catch (error) {
    console.error('Approve/Reject error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
