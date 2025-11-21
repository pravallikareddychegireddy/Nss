const Event = require('../models/Event');

// Update event statuses based on current date
const updateEventStatuses = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Mark events as completed if date has passed
    await Event.updateMany(
      {
        date: { $lt: today },
        status: { $in: ['upcoming', 'ongoing'] }
      },
      { status: 'completed' }
    );

    // Mark events as ongoing if date is today
    await Event.updateMany(
      {
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        status: 'upcoming'
      },
      { status: 'ongoing' }
    );

    console.log('Event statuses updated successfully');
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
};

// Run every hour
const startEventStatusUpdater = () => {
  // Run immediately on startup
  updateEventStatuses();
  
  // Then run every hour
  setInterval(updateEventStatuses, 60 * 60 * 1000);
};

module.exports = { updateEventStatuses, startEventStatusUpdater };
