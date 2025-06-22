const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authmiddleware');
const admin = require('../middleware/admin');
const jwt = require('jsonwebtoken');

// Génération token JWT
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Enregistrement utilisateur
router.post('/register', async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const newUser = new User({ email, password, isAdmin: isAdmin || false });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Suppression de tous les utilisateurs (admin uniquement)
router.delete('/all', protect, admin, async (req, res) => {
  try {
    // Supprimer tous les utilisateurs sauf l'utilisateur connecté
    await User.deleteMany({ _id: { $ne: req.user._id } });

    res.json({ message: 'Tous les utilisateurs (sauf vous) ont été supprimés.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// GET all users (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // ne pas renvoyer les mots de passe
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
//promote user to admin
router.patch('/:id/promote', protect, admin, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    user.isAdmin = true;
    await user.save();
    res.status(200).json({ message: 'Utilisateur promu en admin', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});
// Démotionner un admin en utilisateur normal
router.patch('/:id/demote', protect, admin, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    if (!user.isAdmin) return res.status(400).json({ message: 'Cet utilisateur n\'est pas admin' });

    // Optionnel : empêcher la démotion de soi-même 
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous démotionner vous-même' });
    }

    user.isAdmin = false;
    await user.save();
    res.status(200).json({ message: 'Utilisateur démotionné en utilisateur normal', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});
module.exports = router;
