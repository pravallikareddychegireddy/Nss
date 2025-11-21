const Event = require('../models/Event');
const Participation = require('../models/Participation');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// Send event reminders for upcoming events (1 day before)
const sendEventReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find events happening tomorrow
    const upcomingEvents = await Event.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['upcoming', 'ongoing'] }
    }).populate('coordinatorId', 'name email');

    console.log(`Found ${upcomingEvents.length} events for tomorrow`);

    for (const event of upcomingEvents) {
      // Get all registered participants
      const participations = await Participation.find({
        eventId: event._id,
        status: 'pending'
      }).populate('studentId', 'name email eventReminders');

      console.log(`Sending reminders for event: ${event.title} to ${participations.length} students`);

      // Send reminder to each participant
      for (const participation of participations) {
        if (participation.studentId && participation.studentId.eventReminders) {
          try {
            await sendEmail({
              email: participation.studentId.email,
              subject: `Reminder: NSS Event Tomorrow - ${event.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #FF6600 0%, #138808 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Event Reminder</h1>
                    <p style="color: white; margin: 5px 0;">NSS - Vignan University</p>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #FF6600;">Tomorrow's Event</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
                      <p style="color: #666;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p style="color: #666;"><strong>📍 Venue:</strong> ${event.venue}</p>
                      <p style="color: #666;"><strong>⏰ Duration:</strong> ${event.hours} hours</p>
                      <p style="color: #666;"><strong>📋 Category:</strong> ${event.category}</p>
                    </div>
                    <p style="color: #666;">Dear ${participation.studentId.name},</p>
                    <p style="color: #666;">This is a friendly reminder that you are registered for the above NSS event happening tomorrow.</p>
                    <p style="color: #666;">Please be present at the venue on time. Your participation matters!</p>
                    <p style="color: #138808; font-weight: bold; margin-top: 20px;">"Not Me, But You"</p>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">NSS Portal - Vignan University, Guntur</p>
                  </div>
                </div>
              `
            });
            console.log(`Reminder sent to ${participation.studentId.email}`);
          } catch (emailError) {
            console.error(`Failed to send reminder to ${participation.studentId.email}:`, emailError.message);
          }
        }
      }
    }

    console.log('Event reminders sent successfully');
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
};

// Start reminder scheduler (runs daily at 9 AM)
const startReminderScheduler = () => {
  // Run immediately on startup
  sendEventReminders();

  // Then run every day at 9 AM
  const scheduleDaily = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);

    // If 9 AM has passed today, schedule for tomorrow
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilScheduled = scheduledTime - now;

    setTimeout(() => {
      sendEventReminders();
      // Schedule next run (24 hours later)
      setInterval(sendEventReminders, 24 * 60 * 60 * 1000);
    }, timeUntilScheduled);
  };

  scheduleDaily();
  console.log('Event reminder scheduler started');
};

module.exports = { sendEventReminders, startReminderScheduler };
