// const reservations = []; // Replace with a real database

// const getReservations = (req, res) => {
//   res.status(200).json(reservations);
// };

// const createReservation = (req, res) => {
//   const { room, startTime, endTime } = req.body;

//   const newReservation = { id: Date.now(), room, startTime, endTime };
//   reservations.push(newReservation);
//   res.status(201).json(newReservation);
// };

// const deleteReservation = (req, res) => {
//   const { id } = req.params;

//   const index = reservations.findIndex((res) => res.id === parseInt(id));
//   if (index !== -1) {
//     reservations.splice(index, 1);
//     return res.status(200).json({ message: "Reservation deleted" });
//   }
//   res.status(404).json({ message: "Reservation not found" });
// };

// module.exports = { getReservations, createReservation, deleteReservation };

const Reservation = require("../models/Reservation");

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("userId", "name email");
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reservations", error: err.message });
  }
};

// Create a new reservation
const createReservation = async (req, res) => {
  try {
    const { userId, room, startTime, endTime } = req.body;

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Start time must be before end time." });
    }

    const reservation = new Reservation({
      userId,
      room,
      startTime,
      endTime,
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Error creating reservation", error: err.message });
  }
};

// Delete a reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Reservation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.status(200).json({ message: "Reservation deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reservation", error: err.message });
  }
};

module.exports = { getReservations, createReservation, deleteReservation };
