const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const { authorize } = require("../Middleware/authMiddleware");
const adminController = require("../Controllers/adminController");
const resourceController = require("../Controllers/resourceController");

console.log("adminController:", adminController);
console.log("resourceController:", resourceController);

// const { getAdminData } = require("../Middleware/authMiddleware");
const userController = require("../Controllers/userController");
console.log("userController:", userController);
const router = express.Router();

// Updated route to use userId
// Specific routes first
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
router.get("/resources", resourceController.getAllResources);
router.get("/resources/:id", resourceController.getResourceById);
router.post("/resources", resourceController.createResource);
router.put("/resources/:id", resourceController.updateResource);
router.delete("/resources/:id", resourceController.deleteResource);

// Put userId routes at the end to prevent conflict
router.get("/:userId", userController.getUserProfile);
router.put("/:userId", userController.updateUserProfile);

module.exports = router;
