const User = require("../models/User");

// Signup Function
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create a new user
    const user = new User({ email, password });
    await user.save();

    return res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    return res.status(500).json({
      message: "Error creating user",
      error: err.message,
    });
  }
};

// Login Function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({
      message: "Error logging in",
      error: err.message,
    });
  }
};

module.exports = { signup, login };
