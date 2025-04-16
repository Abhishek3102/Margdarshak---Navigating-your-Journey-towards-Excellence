const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const authController = require("../Controllers/authController");
const resourceController = require("../Controllers/resourceController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getCurrentUser);
// Example usage in routes
router.get(
  "/admin-only",
  protect,
  authorize("admin"),
  adminController.getAdminData
);
router.get(
  "/user-resources",
  protect,
  authorize("user", "admin"),
  resourceController.getUserResources
);

module.exports = router;
