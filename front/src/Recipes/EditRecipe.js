import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { updateRecipeById } from '../services/api';

export default function EditRecipe({ recipe, onClose }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    category: recipe.category || '',
    prepTime: recipe.prepTime || '',
    ingredients: recipe.ingredients || [{ name: '', quantity: '' }],
    steps: recipe.steps || [''],
    photo: null,
    pdf: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...form.ingredients];
    newIngredients[index][field] = value;
    setForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '' }] }));
  };

  const removeIngredient = (index) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...form.steps];
    newSteps[index] = value;
    setForm(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('prepTime', form.prepTime);
    formData.append('ingredients', JSON.stringify(form.ingredients));
    formData.append('steps', JSON.stringify(form.steps));
    if (form.photo) formData.append('photo', form.photo);
    if (form.pdf) formData.append('pdf', form.pdf);

    try {
      await updateRecipeById(recipe._id, formData, user.token);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Erreur modification recette:', error);
      alert('Erreur lors de la modification');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
      >
        <h2 className="text-xl font-bold mb-4">Modifier la recette</h2>

        <label className="block mb-1">Titre</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
          required
        />

        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
          
        />

        <label className="block mb-1">Catégorie</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
        />

        <label className="block mb-1">Temps de préparation (minutes)</label>
        <input
          type="number"
          name="prepTime"
          value={form.prepTime}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
          min={0}
        />

        <label className="block mb-2 font-semibold">Ingrédients</label>
        {form.ingredients.map((ingredient, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nom"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
              className="border px-2 py-1 w-1/2"
            />
            <input
              type="text"
              placeholder="Quantité"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
              className="border px-2 py-1 w-1/2"
            />
            <button
              type="button"
              onClick={() => removeIngredient(idx)}
              className="text-red-600"
            >
              ❌
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="text-blue-600 mb-4"
        >
          ➕ Ajouter un ingrédient
        </button>

        <label className="block mb-2 font-semibold">Étapes</label>
        {form.steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(idx, e.target.value)}
              className="border px-2 py-1 w-full"
            />
            <button
              type="button"
              onClick={() => removeStep(idx)}
              className="text-red-600"
            >
              ❌
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="text-blue-600 mb-4"
        >
          ➕ Ajouter une étape
        </button>

        <label className="block mb-2">Changer la photo</label>
        <input
          type="file"
          onChange={(e) => setForm(prev => ({ ...prev, photo: e.target.files[0] }))}
          className="mb-4"
          accept="image/*"
        />

        <label className="block mb-2">Changer le PDF</label>
        <input
          type="file"
          onChange={(e) => setForm(prev => ({ ...prev, pdf: e.target.files[0] }))}
          className="mb-4"
          accept="application/pdf"
        />

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
