const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const courseController = require("../Controllers/courseController");

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// Protected routes
router.get("/user/enrolled", protect, courseController.getEnrolledCourses);
router.post("/:id/enroll", protect, courseController.enrollCourse);

module.exports = router;
