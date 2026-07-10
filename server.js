const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://cantine-app-blue.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// connexion mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('connecté à mongodb'))
  .catch(err => console.log('erreur connexion', err));

// routes
app.use('/api/menus', require('./routes/menus'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/compte', require('./routes/compte'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`serveur lancé sur le port ${PORT}`));