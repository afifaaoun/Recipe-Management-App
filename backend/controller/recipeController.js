const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'email');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'email');
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, prepTime, category } = req.body;

    const photoUrl = req.files && req.files.photo ? req.files.photo[0].filename : null;
    const pdfUrl = req.files && req.files.pdf ? req.files.pdf[0].filename : null;

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
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });

    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Supprimer fichiers uploadés liés à la recette
    if (recipe.photoUrl) {
      const photoPath = path.join(__dirname, '..', 'uploads', recipe.photoUrl);
      fs.unlink(photoPath, (err) => {
        if (err) console.warn('Erreur suppression photo:', err);
      });
    }
    if (recipe.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', 'uploads', recipe.pdfUrl);
      fs.unlink(pdfPath, (err) => {
        if (err) console.warn('Erreur suppression pdf:', err);
      });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recette supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


