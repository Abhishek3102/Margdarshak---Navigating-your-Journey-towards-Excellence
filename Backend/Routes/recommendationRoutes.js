const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const recommendationController = require("../Controllers/recommendationController");

router.get("/", recommendationController.getRecommendations);

module.exports = router;
