const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// get réservations de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      utilisateurId: req.utilisateur._id 
    }).populate('menuId');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// créer une réservation
router.post('/', auth, async (req, res) => {
  try {
    const reservation = new Reservation({
      ...req.body,
      utilisateurId: req.utilisateur._id
    });
    const newReservation = await reservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// annuler une réservation
router.put('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { statut: 'annulé' },
      { new: true }
    );
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;