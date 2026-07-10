const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  classe: { type: String, default: '3ème A' },
  solde: { type: Number, default: 0 },
  role: { type: String, enum: ['eleve', 'admin'], default: 'eleve' },
});

// comparer le mot de passe
utilisateurSchema.methods.comparerMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);