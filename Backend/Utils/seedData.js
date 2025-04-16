const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Course = require("../Models/course");
const User = require("../Models/user");
const Feedback = require("../Models/feedback");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Categories and difficulties
const categories = [
  "Development",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

// Generate random course
const generateCourse = () => {
  const category = faker.helpers.arrayElement(categories);
  const difficulty = faker.helpers.arrayElement(difficulties);
  const students = faker.number.int({ min: 50, max: 2000 });

  return {
    title: faker.lorem.words({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    category,
    difficulty,
    prerequisites: Array.from(
      { length: faker.number.int({ min: 0, max: 3 }) },
      () => faker.lorem.words(2)
    ),
    enrolledUsers: [],
    rating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
    duration: faker.number.int({ min: 4, max: 12 }),
    students,
  };
};

// Seed courses
const seedCourses = async (count) => {
  try {
    // Clear existing courses
    await Course.deleteMany({});
    console.log("Cleared existing courses");

    // Create new courses
    const courses = Array.from({ length: count }, generateCourse);
    await Course.insertMany(courses);

    console.log(`${count} courses seeded successfully`);
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
};

// Run the seeding operations
const seedAll = async () => {
  try {
    await seedCourses(15);
    console.log("All data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

// Execute seeding
seedAll();
