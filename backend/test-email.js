const nodemailer = require('nodemailer');
require('dotenv').config();

const test = async () => {
  console.log('Testing email with:', process.env.EMAIL_USER);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Connection verified!');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'If you see this, email is working.'
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('EAUTH')) {
      console.log('TIP: Check your App Password. Make sure 2FA is enabled.');
    }
  }
};

test();
