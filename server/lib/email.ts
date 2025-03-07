import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

// Configure transporter (for development, we'll use a test account)
// In production, replace with your SMTP settings
let transporter: nodemailer.Transporter;

// Initialize email transporter
export async function initEmailTransport() {
  // For development/testing - use Ethereal (fake SMTP service)
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Email test account created:", testAccount.web);
}

// Generate verification token
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateResetToken() {
  return randomBytes(32).toString('hex');
}

export async function sendPasswordResetEmail(email: string, token: string, username: string) {
  // Configuration for a real email service
  // For development, we'll fall back to ethereal for testing if no SMTP settings are provided
  let transporter;
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Using real SMTP server
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    console.log("Using configured SMTP server for emails");
  } else {
    // Fallback to ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log("Using Ethereal for email testing (emails won't be delivered to real recipients)");
    console.log("Email preview URL will be shown in the console");
  }

  // The reset link
  const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/password-reset?token=${token}`;

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Product Scan AI" <noreply@productscanai.com>',
    to: email,
    subject: "Reset Your Password",
    text: `Hello ${username},\n\nYou requested a password reset. Please click on the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nRegards,\nProduct Scan AI Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${username},</p>
        <p>You requested a password reset. Please click on the button below to reset your password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Regards,<br>Product Scan AI Team</p>
      </div>
    `,
  });

  console.log("Password reset email sent: %s", info.messageId);
  return nodemailer.getTestMessageUrl(info);
}

export async function sendVerificationEmail(email: string, token: string, username: string): Promise<string> {
  // Construct verification URL (adjust base URL for your environment)
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const verificationUrl = `${baseUrl}/api/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: '"ProductScanAI" <noreply@productscanai.com>',
    to: email,
    subject: "Verify your email address",
    text: `Hello ${username},\n\nPlease verify your email address by clicking on the link: ${verificationUrl}\n\nThank you,\nProductScanAI Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ProductScanAI!</h2>
        <p>Hello ${username},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>Thank you,<br>ProductScanAI Team</p>
      </div>
    `,
  });

  // For testing, return the Ethereal URL where the email can be viewed
  return nodemailer.getTestMessageUrl(info) || "";
}