const Course = require('../Models/course');

exports.getRecommendations = async (userId) => {
    // Placeholder for recommendation logic
    // For simplicity, we're returning all courses. Implement your AI logic here.
    return Course.find();
};
