const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  jour: { type: String, required: true },
  plat: { type: String, required: true },
  dessert: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model('Menu', menuSchema);