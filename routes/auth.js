const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');

// inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, classe } = req.body;
    
    // vérifier si l'email existe déjà
    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const motDePasseHashe = await bcrypt.hash(motDePasse, 10);
    const utilisateur = new Utilisateur({ nom, email, motDePasse: motDePasseHashe, classe });
    await utilisateur.save();

    const token = jwt.sign(
      { id: utilisateur._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        classe: utilisateur.classe,
        solde: utilisateur.solde,
        role: utilisateur.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// connexion
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!valide) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: utilisateur._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        classe: utilisateur.classe,
        solde: utilisateur.solde,
        role: utilisateur.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;