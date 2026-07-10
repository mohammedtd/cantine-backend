const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

module.exports = async (req, res, next) => {
  try {
    // récupérer le token depuis le header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    // vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // récupérer l'utilisateur
    const utilisateur = await Utilisateur.findById(decoded.id);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};