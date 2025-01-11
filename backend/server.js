const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://david:1234@database.nyuhy.mongodb.net/ubb_reservations?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected to Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reservations", require("./routes/reservations"));

// Root Route
app.get("/", (req, res) => {
  res.send("UBB Reservation Backend is Running!");
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "An internal server error occurred" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
