const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: String,
  difficulty: String,
  prerequisites: [String],
  enrolledUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // weeks
    default: 8,
  },
  students: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add fuzzy search to title and description fields
courseSchema.plugin(mongoose_fuzzy_searching, {
  fields: ["title", "description", "category"],
});

module.exports = mongoose.model("Course", courseSchema);
