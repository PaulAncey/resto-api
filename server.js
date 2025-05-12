const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/db');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de réservation du restaurant!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne correctement!' });
});

app.use('/api', authRoutes);
app.use('/api', reservationRoutes);
app.use('/api', menuRoutes);
app.use('/api', tableRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.message);
  res.status(500).json({
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');
    const dbInitialized = await initializeDatabase();
    
    if (dbInitialized) {
      console.log('Base de données initialisée avec succès');
      
      app.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
        console.log(`Documentation API: http://localhost:${PORT}/api/docs`);
        console.log(`Compte admin: admin@restaurant.com / Admin123!`);
        console.log(`Compte client: client@example.com / Client123!`);
      });
    } else {
      console.error('Échec de l\'initialisation de la base de données. Le serveur ne démarrera pas.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erreur inattendue lors du démarrage:', error);
    process.exit(1);
  }
})();

app.get('/api/docs', (req, res) => {
  res.json({
    title: 'API de Réservation de Restaurant',
    version: '1.0.0',
    description: 'Documentation des routes de l\'API',
    auth: {
      signup: 'POST /api/signup - Créer un compte utilisateur',
      login: 'POST /api/login - Connexion et obtention d\'un token JWT',
      profile: 'GET /api/profile - Récupérer son profil (auth requise)'
    },
    reservations: {
      getAll: 'GET /api/reservations - Récupérer toutes les réservations (admin)',
      getMine: 'GET /api/my-reservations - Récupérer ses réservations (auth requise)',
      create: 'POST /api/reservations - Créer une réservation (auth requise)',
      update: 'PUT /api/reservations/:id - Modifier une réservation (auth requise)',
      delete: 'DELETE /api/reservations/:id - Annuler une réservation (auth requise)',
      validate: 'PATCH /api/reservations/:id/validate - Valider une réservation (admin)'
    },
    menu: {
      getAll: 'GET /api/menu - Récupérer tout le menu (public)',
      getItem: 'GET /api/menu/:id - Récupérer un plat (public)',
      create: 'POST /api/menu - Ajouter un plat au menu (admin)',
      update: 'PUT /api/menu/:id - Modifier un plat (admin)',
      delete: 'DELETE /api/menu/:id - Supprimer un plat (admin)'
    },
    tables: {
      getAll: 'GET /api/tables - Récupérer toutes les tables (admin)',
      create: 'POST /api/tables - Ajouter une table (admin)',
      update: 'PUT /api/tables/:id - Modifier une table (admin)',
      delete: 'DELETE /api/tables/:id - Supprimer une table (admin)'
    }
  });
});

module.exports = app;