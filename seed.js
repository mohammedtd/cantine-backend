const mongoose = require('mongoose');
const Menu = require('./models/Menu');
require('dotenv').config();

const menus = [
  { 
    jour: 'Lundi', 
    plat: 'Poulet rôti', 
    dessert: 'Yaourt',
    description: 'Poulet fermier rôti au four, servi avec des haricots verts.',
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400',
  },
  { 
    jour: 'Mardi', 
    plat: 'Poisson pané', 
    dessert: 'Fruit',
    description: 'Filet de colin pané maison, accompagné de frites dorées.',
    image: 'https://images.unsplash.com/photo-1678969406337-1869bb0c0dc4?w=400',
  },
  { 
    jour: 'Mercredi', 
    plat: 'Steak haché', 
    dessert: 'Compote',
    description: 'Steak haché 100% bœuf, servi avec une purée maison.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  { 
    jour: 'Jeudi', 
    plat: 'Pâtes bolognaise', 
    dessert: 'Crème caramel',
    description: 'Pâtes fraîches avec une sauce bolognaise mijotée.',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400',
  },
  { 
    jour: 'Vendredi', 
    plat: 'Pizza', 
    dessert: 'Glace',
    description: 'Pizza margherita maison avec mozzarella fraîche.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('connecté à mongodb');
    await Menu.deleteMany(); // on vide la collection
    await Menu.insertMany(menus);
    console.log('menus insérés avec succès !');
    mongoose.connection.close();
  })
  .catch(err => console.log('erreur', err));