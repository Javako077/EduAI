const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const sendEmail = async (options) => {
  if (!process.env.MAILERSEND_API_KEY) {
    throw new Error('MAILERSEND_API_KEY not configured in .env file.');
  }

  const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY.trim(),
  });

  const sentFrom = new Sender(
    process.env.MAILERSEND_SENDER || "MS_ZlS9K0@trial-7dnv9g056x2l898m.mlsender.net",
    "MindAIra Support"
  );
  
  const recipients = [new Recipient(options.to, "User")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(options.subject)
    .setHtml(options.html)
    .setText(options.text || "");

  console.log(`Attempting to send MailerSend email to ${options.to}...`);
  try {
    const response = await mailersend.email.send(emailParams);
    console.log('Email sent successfully via MailerSend');
    return response;
  } catch (err) {
    const errorMsg = err.body?.message || err.message || 'Unknown MailerSend Error';
    console.error('MailerSend Error:', errorMsg);
    if (err.body?.errors) console.error('Details:', JSON.stringify(err.body.errors));
    throw new Error(errorMsg);
  }
};

module.exports = sendEmail;
