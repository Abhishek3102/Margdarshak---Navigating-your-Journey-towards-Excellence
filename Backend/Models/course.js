const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: String,
    prerequisites: [String],
});

module.exports = mongoose.model('Course', courseSchema);
