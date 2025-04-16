const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const feedbackController = require("../Controllers/feedbackController");

// Submit feedback
router.post("/course", protect, feedbackController.submitCourseFeedback);
router.post("/platform", protect, feedbackController.submitPlatformFeedback);

// Get feedback
router.get("/course/:id", feedbackController.getCourseFeedback);

module.exports = router;
