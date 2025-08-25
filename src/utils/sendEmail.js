import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      'Missing email credentials: EMAIL_USER or EMAIL_PASS is not set'
    );
  }

  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify SMTP connection
  await new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
        reject(error);
      } else {
        console.log('SMTP Server is ready to take messages');
        resolve(success);
      }
    });
  });

  // Send email
  const info = await transporter.sendMail({
    from: `"DevTinder" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log('Email sent:', info.messageId);
  return info;
};

export default sendEmail;
