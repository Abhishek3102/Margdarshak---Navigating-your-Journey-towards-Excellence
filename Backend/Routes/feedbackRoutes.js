const express = require('express');
const router = express.Router();
const feedbackController = require('../Controllers/feedbackController');

router.post('/', feedbackController.submitFeedback);

module.exports = router;
