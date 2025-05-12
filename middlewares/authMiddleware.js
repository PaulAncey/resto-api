const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token invalide ou expiré.' });
      }

      const users = await query('SELECT id, email, role FROM users WHERE id = ?', [decoded.userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }

      req.user = users[0];
      next();
    });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur lors de l\'authentification.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};