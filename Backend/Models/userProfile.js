const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    name: String,
    email: String,
    skills: [String],
    careerGoals: String,
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
