const sendEmail = require('./utils/sendEmail');
require('dotenv').config();

const test = async () => {
  const recipient = process.env.MAILERSEND_SENDER || "test@example.com";
  console.log('Testing MailerSend email to:', recipient);

  try {
    const response = await sendEmail({
      to: recipient,
      subject: 'MailerSend Test Email',
      html: '<h1>Success!</h1><p>If you see this, MailerSend is correctly configured.</p>',
      text: 'Success! If you see this, MailerSend is correctly configured.'
    });
    console.log('✅ Email sent successfully!');
  } catch (err) {
    console.error('❌ Error sending test email:', err.message);
  }
};

test();
