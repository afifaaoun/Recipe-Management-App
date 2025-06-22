const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [{ name: String, quantity: String }],
  steps: [String],
  prepTime: Number, // en minutes
  category: String,
  photoUrl: String,
  pdfUrl: String,       
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
