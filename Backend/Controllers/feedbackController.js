const Feedback = require("../Models/feedback");
const Course = require("../Models/course");

/**
 * @desc    Submit course feedback
 * @route   POST /api/feedback/course
 * @access  Private
 */
exports.submitCourseFeedback = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    if (!courseId || !rating) {
      return res.status(400).json({
        success: false,
        error: "Course ID and rating are required",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check if user is enrolled
    if (!course.enrolledUsers.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: "You must be enrolled in the course to leave feedback",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId: req.user.id,
      courseId,
      type: "course",
      rating,
      comment: comment || "",
    });

    // Update course rating
    const courseFeedbacks = await Feedback.find({ courseId, type: "course" });
    const avgRating =
      courseFeedbacks.reduce((sum, item) => sum + item.rating, 0) /
      courseFeedbacks.length;

    course.rating = avgRating;
    await course.save();

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Submit course feedback error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit feedback",
    });
  }
};

/**
 * @desc    Submit platform feedback
 * @route   POST /api/feedback/platform
 * @access  Private
 */
exports.submitPlatformFeedback = async (req, res) => {
  try {
    const { rating, navigation, suggestions } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        error: "Rating is required",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId: req.user.id,
      type: "platform",
      rating,
      navigation: navigation || null,
      suggestions: suggestions || "",
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Submit platform feedback error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit platform feedback",
    });
  }
};

/**
 * @desc    Get feedback for a course
 * @route   GET /api/feedback/course/:id
 * @access  Public
 */
exports.getCourseFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      courseId: req.params.id,
      type: "course",
    }).populate("userId", "name");

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error("Get course feedback error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course feedback",
    });
  }
};
