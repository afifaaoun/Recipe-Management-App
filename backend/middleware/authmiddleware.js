const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }
  } else {
    return res.status(401).json({ message: 'Pas de token, accès refusé' });
  }
}

module.exports = protect;
