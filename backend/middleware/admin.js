// middleware/admin.js
const User = require('../models/User');

function admin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, admin uniquement' });
  }
}

module.exports = admin;
