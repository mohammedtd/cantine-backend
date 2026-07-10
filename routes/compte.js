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

// modifier les infos du profil
router.put('/update', auth, async (req, res) => {
  try {
    const { nom, email, classe } = req.body;

    if (!nom || !email || !classe) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    
    // vérifier si l'email existe déjà pour un autre utilisateur
    if (email !== req.utilisateur.email) {
      const existe = await Utilisateur.findOne({ email });
      if (existe) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const updated = await Utilisateur.findByIdAndUpdate(
      req.utilisateur._id,
      { nom, email, classe },
      { new: true }
    );

    res.json({
      id: updated._id,
      nom: updated.nom,
      email: updated.email,
      classe: updated.classe,
      solde: updated.solde,
      role: updated.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;