const express = require('express');
const userController = require('../Controllers/userController');
const router = express.Router();

// Updated route to use userId
router.get('/:userId', userController.getUserProfile);
router.put('/:userId', userController.updateUserProfile);

module.exports = router;
