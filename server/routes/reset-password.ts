
import { Express } from "express";
import { storage } from "../storage";
import { generateResetToken, sendPasswordResetEmail } from "../lib/email";
import { hashPassword } from "../auth";

export function registerResetPasswordRoutes(app: Express) {
  // Request password reset
  app.post("/api/reset-password/request", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that email doesn't exist for security
        return res.status(200).json({ message: "If your email is registered, you will receive a reset link" });
      }
      
      // Generate reset token
      const resetToken = generateResetToken();
      
      // Save reset token to user record
      await storage.setPasswordResetToken(user.id, resetToken);
      
      // Send password reset email
      try {
        const emailUrl = await sendPasswordResetEmail(email, resetToken, user.username);
        console.log("Password reset email preview:", emailUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      
      res.status(200).json({ message: "If your email is registered, you will receive a reset link" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Error processing password reset request" });
    }
  });

  // Reset password with token
  app.post("/api/reset-password/reset", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      // Find user with this reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Update user's password and clear reset token
      await storage.resetPassword(user.id, hashedPassword);
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  });
}
