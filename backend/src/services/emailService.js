import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const isRealEmail = process.env.ENABLE_REAL_EMAIL === 'true' && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isRealEmail) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendMailWrapper = async ({ to, subject, html }) => {
  const mailClient = getTransporter();

  if (!mailClient) {
    logger.info(`[Email Service Simulation] To: ${to} | Subject: "${subject}" | Real SMTP disabled. Email logged.`);
    return { success: true, simulated: true };
  }

  try {
    const info = await mailClient.sendMail({
      from: process.env.EMAIL_FROM || '"Lapy Procare" <lapyprocare@gmail.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050B18; color: #FFFFFF; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0A1628; border: 1px solid #1E3250; border-radius: 12px; overflow: hidden; }
    .header { background: #101F35; padding: 24px; text-align: center; border-bottom: 2px solid #00AFFF; }
    .header h1 { margin: 0; color: #00D4FF; font-size: 24px; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; color: #94A3B8; font-size: 14px; }
    .content { padding: 30px; font-size: 15px; line-height: 1.6; color: #E2E8F0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #1E3250; background: #07101E; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #007BFF 0%, #00D4FF 100%); color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .badge { display: inline-block; padding: 4px 10px; background: #1E3250; color: #00D4FF; border-radius: 4px; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LAPY PROCARE</h1>
      <p>Your Technology. Our Expertise. | Vamanjoor, Mangaluru</p>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>Lapy Procare, Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028</p>
      <p>Phone / WhatsApp: +91 7666104889 | Email: lapyprocare@gmail.com</p>
    </div>
  </div>
</body>
</html>
`;

export const sendBookingConfirmationEmail = async (booking, customer) => {
  const html = baseTemplate(
    'Repair Booking Confirmed',
    `
    <p>Dear <strong>${customer.name}</strong>,</p>
    <p>Thank you for choosing Lapy Procare. Your service appointment has been scheduled successfully.</p>
    <p><strong>Tracking Ticket ID:</strong> <span class="badge">${booking.ticketId}</span></p>
    <p><strong>Device:</strong> ${booking.device.brand} ${booking.device.model} (${booking.device.deviceType})</p>
    <p><strong>Reported Issue:</strong> ${booking.problem.description}</p>
    <p><strong>Appointment:</strong> ${new Date(booking.appointment.date).toLocaleDateString()} at ${booking.appointment.timeSlot}</p>
    <p><strong>Service Type:</strong> ${booking.servicePreference}</p>
    <p>You can track the live progress of your repair at any time using your Ticket ID.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/track?ticketId=${booking.ticketId}" class="btn">Track Repair Status</a>
    `
  );
  return sendMailWrapper({
    to: customer.email,
    subject: `Repair Booking Confirmed [${booking.ticketId}] — Lapy Procare`,
    html,
  });
};

export const sendStatusUpdateEmail = async (booking, customer, newStatus, note) => {
  const html = baseTemplate(
    'Repair Status Update',
    `
    <p>Dear <strong>${customer.name}</strong>,</p>
    <p>The repair status for your device (<strong>${booking.device.brand} ${booking.device.model}</strong>) has been updated.</p>
    <p><strong>Ticket ID:</strong> <span class="badge">${booking.ticketId}</span></p>
    <p><strong>Current Status:</strong> <span style="color:#00D4FF; font-weight:bold;">${newStatus}</span></p>
    ${note ? `<p><strong>Technician Note:</strong> <em>"${note}"</em></p>` : ''}
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/track?ticketId=${booking.ticketId}" class="btn">View Live Status</a>
    `
  );
  return sendMailWrapper({
    to: customer.email,
    subject: `Repair Status: ${newStatus} [${booking.ticketId}] — Lapy Procare`,
    html,
  });
};

export const sendQuotationEmail = async (quotation, customer, ticketId) => {
  const html = baseTemplate(
    'Quotation Ready for Approval',
    `
    <p>Dear <strong>${customer.name}</strong>,</p>
    <p>Our technicians have completed diagnostic inspection on Ticket <strong>${ticketId}</strong>.</p>
    <p><strong>Quotation Number:</strong> <span class="badge">${quotation.quotationNumber}</span></p>
    <p><strong>Diagnosis:</strong> ${quotation.diagnosis}</p>
    <p><strong>Total Estimated Amount:</strong> ₹${quotation.totalAmount.toLocaleString('en-IN')}</p>
    <p>Please review and approve or reject this estimate so our engineers may proceed.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/quotations" class="btn">Review & Approve Quotation</a>
    `
  );
  return sendMailWrapper({
    to: customer.email,
    subject: `Quotation Ready: ₹${quotation.totalAmount} [${ticketId}] — Lapy Procare`,
    html,
  });
};

export const sendInvoiceEmail = async (invoice, customer) => {
  const html = baseTemplate(
    'Tax Invoice Generated',
    `
    <p>Dear <strong>${customer.name}</strong>,</p>
    <p>Your repair service has concluded. Please find the details of Invoice <strong>${invoice.invoiceNumber}</strong> below.</p>
    <p><strong>Total Amount:</strong> ₹${invoice.totalAmount.toLocaleString('en-IN')}</p>
    <p><strong>Payment Status:</strong> ${invoice.paymentStatus}</p>
    <p>You can view and download your full GST tax invoice from your portal.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/invoices" class="btn">View & Download Invoice</a>
    `
  );
  return sendMailWrapper({
    to: customer.email,
    subject: `Invoice Generated: ${invoice.invoiceNumber} — Lapy Procare`,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const html = baseTemplate(
    'Password Reset Request',
    `
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your password for your Lapy Procare account.</p>
    <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p style="margin-top:20px; font-size:12px; color:#94A3B8;">If you did not request this, you can safely ignore this email.</p>
    `
  );
  return sendMailWrapper({
    to: user.email,
    subject: 'Password Reset Request — Lapy Procare',
    html,
  });
};
