const nodemailer = require('nodemailer');

// Hardcoded for testing - REMOVE IN PRODUCTION
const EMAIL_USER = 'vignanuniversity.nss@gmail.com';
const EMAIL_PASSWORD = 'aiykafezwraixvjd';

console.log('Email Config:', {
  user: EMAIL_USER,
  hasPassword: !!EMAIL_PASSWORD,
  passwordLength: EMAIL_PASSWORD?.length
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service directly
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `NSS Portal <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

exports.sendEventReminder = async (user, event) => {
  const html = `
    <h2>Event Reminder</h2>
    <p>Hi ${user.name},</p>
    <p>This is a reminder for the upcoming NSS event:</p>
    <h3>${event.title}</h3>
    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
    <p><strong>Venue:</strong> ${event.venue}</p>
    <p><strong>Description:</strong> ${event.description}</p>
    <p>Looking forward to your participation!</p>
  `;

  await this.sendEmail({
    email: user.email,
    subject: `Reminder: ${event.title}`,
    html
  });
};
