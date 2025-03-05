
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

// Send verification email
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
