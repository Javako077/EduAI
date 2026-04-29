const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'futureedu_default_secret_key';
const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const trimmedEmail = email?.trim();
    const trimmedMobile = mobile?.trim();

    if (!trimmedEmail && !trimmedMobile) {
      return res.status(400).json({ message: 'Please provide either an email or a mobile number' });
    }
    
    // Check if user already exists with either email or mobile
    const existing = await User.findOne({
      $or: [
        ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
        ...(trimmedMobile ? [{ mobile: trimmedMobile }] : [])
      ]
    });

    if (existing)
      return res.status(400).json({ message: 'Email or Mobile number already registered' });
      
    const user = await User.create({ 
      name, 
      email: trimmedEmail || undefined, 
      mobile: trimmedMobile || undefined, 
      password 
    });
    res.status(201).json({ 
      token: sign(user._id), 
      name: user.name, 
      contact: user.email || user.mobile 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const contact = req.body.contact?.trim();
    const { password } = req.body;
    const user = await User.findOne({ $or: [{ email: contact }, { mobile: contact }] });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), name: user.name, contact: user.email || user.mobile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, preferredLanguage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, preferredLanguage },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const crypto = require('crypto');

// ... (existing routes)

router.post('/forgot-password', async (req, res) => {
  try {
    const contact = req.body.contact?.trim();
    if (!contact) return res.status(400).json({ message: 'Email or Mobile number is required' });
    const user = await User.findOne({ $or: [{ email: contact }, { mobile: contact }] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 600000; // 10 minutes
    await user.save();
    
    // Log OTP for debugging (Remove in production!)
    console.log(`[DEBUG] OTP for ${contact}: ${otp}`);
    
    // Send real email if it's an email address
    if (contact.includes('@')) {
      try {
        await sendEmail({
          to: contact,
          subject: 'MindAIra - Password Reset OTP',
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
              <h2 style="color: #4f46e5;">MindAIra Password Reset</h2>
              <p>You requested to reset your password. Use the 6-digit code below to verify your identity:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; margin: 20px 0;">${otp}</div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
          `
        });
        console.log(`OTP Email sent to: ${contact}`);
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr.message);
        return res.status(500).json({ 
          message: 'Failed to send OTP email. Please check server logs.', 
          error: emailErr.message 
        });
      }
    }

    // OTP simulation removed for privacy. OTP is now only sent via email/SMS.

    res.json({ message: 'OTP sent successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const contact = req.body.contact?.trim();
    const { otp } = req.body;
    const user = await User.findOne({
      $or: [{ email: contact }, { mobile: contact }],
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const contact = req.body.contact?.trim();
    const { otp, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: contact }, { mobile: contact }],
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP session' });

    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
