const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // References the user making the reservation
    ref: "User",
    required: true,
  },
  room: {
    type: String, // Room name or ID
    required: true,
    trim: true,
  },
  startTime: {
    type: Date, // Start time of the reservation
    required: true,
  },
  endTime: {
    type: Date, // End time of the reservation
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets when the reservation is created
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
