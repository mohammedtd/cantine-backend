const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  menuId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Menu', 
    required: true 
  },
  utilisateurId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur', 
    required: true 
  },
  date: { type: Date, default: Date.now },
  statut: { 
    type: String, 
    enum: ['confirmé', 'annulé'], 
    default: 'confirmé' 
  },
});

module.exports = mongoose.model('Reservation', reservationSchema);