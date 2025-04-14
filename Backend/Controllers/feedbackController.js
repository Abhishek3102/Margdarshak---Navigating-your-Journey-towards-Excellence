const Feedback = require('../models/feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { userId, feedback } = req.body;
    // Save feedback to database
    const newFeedback = new Feedback({ userId, feedback });
    await newFeedback.save();
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};
