require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Ajoutez cette ligne

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schéma et modèle pour les switches
const switchSchema = new mongoose.Schema({
  id: Number,
  isOn: Boolean
});
const Switch = mongoose.model('Switch', switchSchema);

// Routes API
app.get('/api/switches', async (req, res) => {
  try {
    const switches = await Switch.find();
    res.json(switches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/switches/:id', async (req, res) => {
  try {
    const updatedSwitch = await Switch.findOneAndUpdate(
      { id: req.params.id },
      { isOn: req.body.isOn },
      { new: true }
    );
    res.json(updatedSwitch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Servir les fichiers statiques du build React en production
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du dossier build
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Pour toutes les autres requêtes, renvoyer l'index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Initialiser les switches si vide
async function initializeSwitches() {
  const count = await Switch.countDocuments();
  if (count === 0) {
    await Switch.insertMany([
      { id: 1, isOn: false },
      { id: 2, isOn: false },
      { id: 3, isOn: false },
      { id: 4, isOn: false }
    ]);
    console.log('Initialized switches');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeSwitches();
});