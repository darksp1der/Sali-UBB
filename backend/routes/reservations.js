const express = require("express");
const {
  getReservations,
  createReservation,
  deleteReservation,
} = require("../controllers/reservationController");
const router = express.Router();

router.get("/", getReservations);
router.post("/", createReservation);
router.delete("/:id", deleteReservation);

module.exports = router;
