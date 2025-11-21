const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../config/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Sending verification code to:', email);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated verification code:', verificationCode);
    
    try {
      await sendEmail({
        email,
        subject: 'NSS Portal - Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6600 0%, #138808 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">NSS Portal</h1>
              <p style="color: white; margin: 5px 0;">Vignan University, Guntur</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Email Verification</h2>
              <p style="color: #666; font-size: 16px;">Your verification code is:</p>
              <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #FF6600; font-size: 36px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
              </div>
              <p style="color: #666;">This code will expire in 10 minutes.</p>
              <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="background: #333; padding: 15px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">NSS - Not Me, But You</p>
            </div>
          </div>
        `
      });
      
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success with code for development
      return res.json({ 
        message: 'Email service unavailable. Use this code for testing',
        code: verificationCode,
        expires,
        emailError: emailError.message
      });
    }

    res.json({ 
      message: 'Verification code sent to your email',
      code: verificationCode, // In production, don't send this
      expires 
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Failed to send verification email', error: error.message });
  }
});

// Register with verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, year, phone, verificationCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // For now, we'll skip strict verification in development
    // In production, you should verify the code matches what was sent

    const user = await User.create({
      name, email, password, role, rollNumber, department, year, phone,
      isEmailVerified: true, // Set to true after verification
      eventReminders: true
    });

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to NSS Portal - Vignan University',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6600 0%, #138808 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to NSS Portal!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${user.name},</h2>
              <p style="color: #666; font-size: 16px;">Your account has been successfully created.</p>
              <p style="color: #666;"><strong>Role:</strong> ${user.role}</p>
              <p style="color: #666;">You can now login and start participating in NSS activities.</p>
              <p style="color: #666; margin-top: 20px;"><em>"Not Me, But You"</em></p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.log('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      department: user.department,
      year: user.year,
      phone: user.phone,
      totalHours: user.totalHours,
      teamRole: user.teamRole,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user with updated data
router.get('/me', protect, async (req, res) => {
  try {
    // Fetch fresh user data from database to get latest totalHours
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create test admin user (for development only)
router.post('/create-test-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      return res.json({ message: 'Test admin already exists', email: 'admin@test.com' });
    }

    const testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      eventReminders: true
    });

    res.json({ 
      message: 'Test admin created successfully',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
