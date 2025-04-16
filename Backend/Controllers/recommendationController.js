const Course = require("../Models/course");
const User = require("../Models/user");
const { faker } = require("@faker-js/faker");

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/recommendations
 * @access  Private/Public
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    let recommendations = [];

    // If user is logged in, try to get personalized recommendations
    if (userId) {
      // Find user's enrolled courses
      const userCourses = await Course.find({ enrolledUsers: userId });

      // Get categories user is interested in
      const userCategories = [
        ...new Set(userCourses.map((course) => course.category)),
      ];

      if (userCategories.length) {
        // Find courses in same categories that user isn't enrolled in
        recommendations = await Course.find({
          category: { $in: userCategories },
          enrolledUsers: { $ne: userId },
        }).limit(3);
      }
    }

    // If no personalized recommendations or not logged in, get popular courses
    if (recommendations.length < 3) {
      const popularCourses = await Course.find(
        userId ? { enrolledUsers: { $ne: userId } } : {}
      )
        .sort({ students: -1 })
        .limit(3 - recommendations.length);

      recommendations = [...recommendations, ...popularCourses];
    }

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching recommendations",
    });
  }
};
