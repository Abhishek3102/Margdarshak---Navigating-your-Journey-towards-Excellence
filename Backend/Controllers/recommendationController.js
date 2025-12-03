const { PythonShell } = require("python-shell");
const path = require("path");
const Course = require("../Models/course");

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/recommendations
 * @access  Private/Public
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    let recommendedCourseIds = [];

    // If user is logged in and has enrolled courses, use Python script
    if (userId) {
      // Get one of the user's enrolled courses to base recommendations on
      // For simplicity, we'll take the last enrolled course
      const userCourses = await Course.find({ enrolledUsers: userId }).sort({ _id: -1 }).limit(1);
      
      if (userCourses.length > 0) {
        const lastCourseId = userCourses[0]._id.toString();

        const options = {
          mode: "json",
          pythonPath: "python", // Ensure python is in PATH
          scriptPath: path.join(__dirname, "../scripts"),
          args: [lastCourseId],
        };

        try {
            const results = await PythonShell.run("recommendation_engine.py", options);
            if (results && results.length > 0) {
                recommendedCourseIds = results[0];
            }
        } catch (pyError) {
            console.error("Python script error:", pyError);
            // Fallback to basic logic if python fails
        }
      }
    }

    let recommendations = [];
    if (recommendedCourseIds.length > 0) {
        recommendations = await Course.find({ _id: { $in: recommendedCourseIds } });
    }

    // Fallback: If no recommendations (or not logged in), get popular courses
    if (recommendations.length < 3) {
      const popularCourses = await Course.find(
        userId ? { enrolledUsers: { $ne: userId } } : {}
      )
        .sort({ students: -1 })
        .limit(5 - recommendations.length);

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
