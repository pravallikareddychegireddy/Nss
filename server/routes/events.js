const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');
const User = require('../models/User');

// Get all events
router.get('/', protect, async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .populate('coordinatorId', 'name email')
      .populate('facultyInCharge', 'name email')
      .sort({ date: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('coordinatorId', 'name email')
      .populate('facultyInCharge', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', protect, authorize('admin', 'faculty'), upload.single('image'), async (req, res) => {
  try {
    const eventData = { ...req.body, coordinatorId: req.user._id };

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Upload to cloudinary using buffer
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'nss-events' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        eventData.image = uploadResult.secure_url;
      } catch (uploadError) {
        console.log('Cloudinary upload failed, continuing without image:', uploadError.message);
        // Continue without image if cloudinary fails
      }
    }

    // Create event
    const event = await Event.create(eventData);
    
    // Send email notifications to all students (non-blocking)
    try {
      const students = await User.find({ role: 'student', isActive: true });
      students.forEach(student => {
        sendEmail({
          email: student.email,
          subject: `New NSS Event: ${event.title}`,
          html: `<h2>New Event Posted</h2>
                 <p>Hi ${student.name},</p>
                 <p>A new NSS event has been posted:</p>
                 <h3>${event.title}</h3>
                 <p>${event.description}</p>
                 <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                 <p><strong>Venue:</strong> ${event.venue}</p>`
        }).catch(err => console.log('Email send failed:', err.message));
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
