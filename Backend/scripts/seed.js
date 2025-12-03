const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../Models/user");
const Course = require("../Models/course");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  try {
    await User.collection.dropIndexes();
    await Course.collection.dropIndexes();
    console.log("Dropped all indexes...");
  } catch (e) {
    console.log("Error dropping indexes:", e.message);
  }
  console.log("Data cleared...");

  // Create Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = new User({
      name: faker.person.fullName(),
      email: `user${i}_${faker.internet.email()}`,
      password: "password123", // Will be hashed by pre-save hook
      role: i === 0 ? "admin" : "user", // First user is admin
    });
    users.push(await user.save());
  }
  console.log("Users created...");

  // Create Courses
  const courses = [];
  const categories = ["Web Development", "Data Science", "Machine Learning", "Design", "Marketing"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  for (let i = 0; i < 20; i++) {
    const title = faker.company.catchPhrase();
    const course = new Course({
      title: title,
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(categories),
      difficulty: faker.helpers.arrayElement(difficulties),
      tags: faker.word.words(5).split(" "),
      prerequisites: [faker.word.words(2)],
      rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      duration: faker.number.int({ min: 4, max: 24 }),
      students: faker.number.int({ min: 0, max: 1000 }),
    });
    courses.push(await course.save());
  }
  console.log("Courses created...");

  process.exit();
};

seedData();
