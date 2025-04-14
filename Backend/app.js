const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
const userRoutes = require("./Routes/userRoutes");
const recommendationRoutes = require("./Routes/recommendationRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");

require("dotenv").config();

const app = express();

app.use(cors()); // Enable CORS
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/feedback", feedbackRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
