import { useState } from 'react';
import { addRecipe } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function RecipeForm({ onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    prepTime: '',
    ingredients: [{ name: '', quantity: '' }],
    steps: [''],
    photo: null,
    pdf: null,
  });

  const handleChange = (e) => {
    const value = e.target.name === 'prepTime' ? Number(e.target.value) : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleIngredientChange = (i, field, value) => {
    const updated = [...form.ingredients];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '' }] }));
  };

  const removeIngredient = (i) => {
    const updated = form.ingredients.filter((_, idx) => idx !== i);
    setForm(prev => ({ ...prev, ingredients: updated }));
  };

  const handleStepChange = (i, value) => {
    const updated = [...form.steps];
    updated[i] = value;
    setForm(prev => ({ ...prev, steps: updated }));
  };

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (i) => {
    const updated = form.steps.filter((_, idx) => idx !== i);
    setForm(prev => ({ ...prev, steps: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key of ['title', 'description', 'category', 'prepTime']) {
      formData.append(key, form[key]);
    }
    formData.append('ingredients', JSON.stringify(form.ingredients));
    formData.append('steps', JSON.stringify(form.steps));
    if (form.photo) formData.append('photo', form.photo);
    if (form.pdf) formData.append('pdf', form.pdf);

    try {
      await addRecipe(formData, user.token);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Erreur ajout recette:', err);
    }
  };

 return (
 <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center justify-center overflow-y-auto">
  <form
    onSubmit={handleSubmit}
    className="bg-white p-4 rounded-lg w-full max-w-xl max-h-[80vh] min-h-[400px] overflow-y-auto"
  >
    <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle recette</h2>
      <label className="block mb-2">Titre</label>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full border-2 border-red-500 px-3 py-2 mb-3"
        required
      />

      <label className="block mb-2">Description</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="w-full border px-3 py-2 mb-3"
        
      />

        <label className="block mb-2">Catégorie</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
          
        />

        <label className="block mb-2">Temps de préparation (min)</label>
        <input
          name="prepTime"
          type="number"
          value={form.prepTime}
          onChange={handleChange}
          className="w-full border px-3 py-2 mb-3"
          min={1}
          
        />

        <label className="block mb-1">Ingrédients</label>
        {form.ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={ing.name}
              onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
              placeholder="Nom"
              className="border px-2 py-1 w-1/2"
              
            />
            <input
              value={ing.quantity}
              onChange={(e) => handleIngredientChange(i, 'quantity', e.target.value)}
              placeholder="Quantité"
              className="border px-2 py-1 w-1/2"
              
            />
            <button type="button" onClick={() => removeIngredient(i)} className="text-red-600">❌</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="text-blue-600 mb-4">➕ Ajouter un ingrédient</button>

        <label className="block mb-1">Étapes</label>
        {form.steps.map((step, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={step}
              onChange={(e) => handleStepChange(i, e.target.value)}
              className="border px-2 py-1 w-full"
              
            />
            <button type="button" onClick={() => removeStep(i)} className="text-red-600">❌</button>
          </div>
        ))}
        <button type="button" onClick={addStep} className="text-blue-600 mb-4">➕ Ajouter une étape</button>

        <div className="mb-3">
          <label>Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm(prev => ({ ...prev, photo: e.target.files[0] }))}
            className="block mt-1"
          />
        </div>

        <div className="mb-3">
          <label>Fichier PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setForm(prev => ({ ...prev, pdf: e.target.files[0] }))}
            className="block mt-1"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Ajouter</button>
          <button type="button" onClick={onClose} className="text-gray-600">Annuler</button>
        </div>
      </form>
    </div>
  );
}
