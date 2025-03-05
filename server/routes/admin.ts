
import { Express } from "express";
import { storage } from "../storage";

// Middleware to check if user is admin
function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin role required" });
  }
  
  next();
}

export function registerAdminRoutes(app: Express) {
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get specific user by ID (admin only)
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update user role (admin only)
  app.put("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { role } = req.body;
      if (!role || (role !== "admin" && role !== "user")) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Prevent admin from demoting themselves
      if (userId === req.user!.id && role !== "admin") {
        return res.status(400).json({ message: "You cannot demote yourself" });
      }
      
      const updatedUser = await storage.updateUserProfile(userId, { role });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Delete user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "You cannot delete your own admin account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Get product statistics (admin only)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Count total users
      const totalUsers = users.length;
      
      // Count verified users
      const verifiedUsers = users.filter(user => user.isVerified === "true").length;
      
      // Get total products count
      const allProducts = await storage.getProducts();
      const totalProducts = allProducts.length;
      
      // Group products by user
      const userProductCounts: Record<number, number> = {};
      allProducts.forEach(product => {
        userProductCounts[product.userId] = (userProductCounts[product.userId] || 0) + 1;
      });
      
      // Find user with most products
      const mostActiveUserId = Object.entries(userProductCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([userId]) => parseInt(userId))[0] || null;
      
      let mostActiveUser = null;
      if (mostActiveUserId) {
        const user = await storage.getUser(mostActiveUserId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          mostActiveUser = {
            ...userWithoutPassword,
            productCount: userProductCounts[mostActiveUserId]
          };
        }
      }
      
      res.json({
        totalUsers,
        verifiedUsers,
        totalProducts,
        mostActiveUser,
        averageProductsPerUser: totalUsers > 0 ? totalProducts / totalUsers : 0
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });
}
