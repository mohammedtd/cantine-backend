const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/Utilisateur');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// get solde et infos utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);
    const reservations = await Reservation.find({ 
      utilisateurId: req.utilisateur._id 
    }).populate('menuId').sort({ date: -1 });

    res.json({
      nom: utilisateur.nom,
      classe: utilisateur.classe,
      solde: utilisateur.solde,
      historique: reservations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// recharger le solde
router.post('/recharger', auth, async (req, res) => {
  try {
    const { montant } = req.body;
    
    if (!montant || montant <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.utilisateur._id,
      { $inc: { solde: montant } },
      { new: true }
    );

    res.json({ solde: utilisateur.solde });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// déduire le montant après paiement
router.post('/paiement', auth, async (req, res) => {
  try {
    const { montant } = req.body;

    const utilisateur = await Utilisateur.findById(req.utilisateur._id);
    
    if (utilisateur.solde < montant) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    const updated = await Utilisateur.findByIdAndUpdate(
      req.utilisateur._id,
      { $inc: { solde: -montant } },
      { new: true }
    );

    res.json({ solde: updated.solde });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;