const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const Recipe = require('../models/Recipe');
const protect = require('../middleware/authmiddleware');
const upload = require('../middleware/upload');
const admin = require('../middleware/admin');

// GET toutes les recettes (publiques)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'email');
    res.json(recipes);
  } catch (err) {
    console.error('GET /recipes error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET recette par ID (publique)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'email');
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });
    res.json(recipe);
  } catch (err) {
    console.error('GET /recipes/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST création recette (protégé)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, ingredients, steps, prepTime, category } = req.body;

      // Parse ingredients et steps JSON
      let parsedIngredients, parsedSteps;
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch {
        return res.status(400).json({ message: "Format d'ingrédients invalide" });
      }
      try {
        parsedSteps = JSON.parse(steps);
      } catch {
        return res.status(400).json({ message: "Format des étapes invalide" });
      }

      // Fichiers uploadés
      const photoUrl = req.files?.photo ? req.files.photo[0].filename : null;
      const pdfUrl = req.files?.pdf ? req.files.pdf[0].filename : null;

      const newRecipe = new Recipe({
        title,
        description,
        ingredients: parsedIngredients,
        steps: parsedSteps,
        prepTime,
        category,
        photoUrl,
        pdfUrl,
        author: req.user.id,
      });

      const savedRecipe = await newRecipe.save();
      res.status(201).json(savedRecipe);
    } catch (err) {
    console.error('POST /recipes error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
  }
);

// PUT modifier recette (protégé + vérification auteur)
router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('PUT /recipes/:id content-type:', req.headers['content-type']);
      console.log('PUT /recipes/:id req.body:', req.body);
      console.log('PUT /recipes/:id req.files:', req.files);

      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });

if (recipe.author.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { title, description, ingredients, steps, prepTime, category } = req.body || {};

      if (title) recipe.title = title;
      if (description) recipe.description = description;
      if (prepTime) recipe.prepTime = prepTime;
      if (category) recipe.category = category;

      if (ingredients) {
        try {
          recipe.ingredients = JSON.parse(ingredients);
        } catch {
          return res.status(400).json({ message: "Format d'ingrédients invalide" });
        }
      }

      if (steps) {
        try {
          recipe.steps = JSON.parse(steps);
        } catch {
          return res.status(400).json({ message: "Format des étapes invalide" });
        }
      }

      // Mise à jour fichiers si uploadés
      if (req.files?.photo?.[0]) {
        // Supprimer ancienne photo si existante
        if (recipe.photoUrl) {
          const oldPhotoPath = path.join(__dirname, '..', 'uploads', recipe.photoUrl);
          fs.unlink(oldPhotoPath, err => {
            if (err) console.warn('Erreur suppression ancienne photo:', err);
          });
        }
        recipe.photoUrl = req.files.photo[0].filename;
      }

      if (req.files?.pdf?.[0]) {
        // Supprimer ancien pdf si existant
        if (recipe.pdfUrl) {
          const oldPdfPath = path.join(__dirname, '..', 'uploads', recipe.pdfUrl);
          fs.unlink(oldPdfPath, err => {
            if (err) console.warn('Erreur suppression ancien pdf:', err);
          });
        }
        recipe.pdfUrl = req.files.pdf[0].filename;
      }

      await recipe.save();
      res.json(recipe);

    } catch (err) {
      console.error('PUT /recipes/:id error:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// DELETE toutes les recettes (protégé + admin)
router.delete('/all', protect, admin, async (req, res) => {
  try {
    const recipes = await Recipe.find();

    for (const recipe of recipes) {
      if (recipe.photoUrl) {
        const photoPath = path.join(__dirname, '..', 'uploads', recipe.photoUrl);
        fs.unlink(photoPath, err => {
          if (err) console.warn('Erreur suppression photo:', err);
        });
      }
      if (recipe.pdfUrl) {
        const pdfPath = path.join(__dirname, '..', 'uploads', recipe.pdfUrl);
        fs.unlink(pdfPath, err => {
          if (err) console.warn('Erreur suppression pdf:', err);
        });
      }
    }

    await Recipe.deleteMany({});
    res.json({ message: 'Toutes les recettes ont été supprimées.' });
  } catch (err) {
    console.error('DELETE /recipes/all error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE recette par ID (protégé + vérification auteur)
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });

if (recipe.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (recipe.photoUrl) {
      const photoPath = path.join(__dirname, '..', 'uploads', recipe.photoUrl);
      fs.unlink(photoPath, err => {
        if (err) console.warn('Erreur suppression photo:', err);
      });
    }

    if (recipe.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', 'uploads', recipe.pdfUrl);
      fs.unlink(pdfPath, err => {
        if (err) console.warn('Erreur suppression pdf:', err);
      });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recette supprimée' });
  } catch (err) {
    console.error('DELETE /recipes/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



// Route POST pour ajouter plusieurs recettes
router.post('/batch', protect, admin, upload.any(), async (req, res) => {
  try {
    if (!req.body.recipes) {
      return res.status(400).json({ message: "Champ 'recipes' manquant" });
    }

    const recipes = JSON.parse(req.body.recipes);

    recipes.forEach((recipe, index) => {
      const photoFile = req.files.find(f => f.fieldname === `photo_${index}`);
      const pdfFile = req.files.find(f => f.fieldname === `pdf_${index}`);

      if (photoFile) recipe.photoUrl = photoFile.filename;
      if (pdfFile) recipe.pdfUrl = pdfFile.filename;

      recipe.author = req.user.id; // lier au user admin
    });

    const insertedRecipes = await Recipe.insertMany(recipes);
    res.status(201).json({ message: `${insertedRecipes.length} recettes ajoutées`, data: insertedRecipes });
  } catch (error) {
    console.error("Erreur ajout batch recettes :", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
