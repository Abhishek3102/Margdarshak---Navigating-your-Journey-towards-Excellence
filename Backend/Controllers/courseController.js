const Course = require("../Models/course");
const User = require("../Models/user");

/**
 * @desc    Get all courses with filters and search
 * @route   GET /api/courses
 * @access  Public
 */
exports.getAllCourses = async (req, res) => {
  try {
    const { search, category, difficulty } = req.query;

    let courses;

    // If search term provided, use fuzzy search
    if (search) {
      courses = await Course.fuzzySearch(search);
    } else {
      // Build filter query
      let query = {};
      if (category && category !== "All Categories") {
        query.category = category;
      }
      if (difficulty && difficulty !== "All Levels") {
        query.difficulty = difficulty;
      }

      courses = await Course.find(query);
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course details",
    });
  }
};

/**
 * @desc    Enroll user in course
 * @route   POST /api/courses/:id/enroll
 * @access  Private
 */
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check if user is already enrolled
    if (course.enrolledUsers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "Already enrolled in this course",
      });
    }

    // Add user to enrolled users
    course.enrolledUsers.push(req.user.id);
    course.students += 1;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      data: course,
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to enroll in course",
    });
  }
};

/**
 * @desc    Get user's enrolled courses
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledUsers: req.user.id,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch enrolled courses",
    });
  }
};
