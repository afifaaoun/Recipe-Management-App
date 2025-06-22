import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

export default function AddManyRecipes({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([
    {
      title: '',
      description: '',
      category: '',
      prepTime: '',
      ingredients: [{ name: '', quantity: '' }],
      steps: [''],
    },
  ]);
  const [files, setFiles] = useState({});

  const handleRecipeChange = (index, field, value) => {
    const updated = [...recipes];
    updated[index][field] = value;
    setRecipes(updated);
  };

  const handleIngredientChange = (recipeIndex, i, field, value) => {
    const updated = [...recipes];
    updated[recipeIndex].ingredients[i][field] = value;
    setRecipes(updated);
  };

  const handleStepChange = (recipeIndex, i, value) => {
    const updated = [...recipes];
    updated[recipeIndex].steps[i] = value;
    setRecipes(updated);
  };

  const handleAddRecipe = () => {
    setRecipes([
      ...recipes,
      {
        title: '',
        description: '',
        category: '',
        prepTime: '',
        ingredients: [{ name: '', quantity: '' }],
        steps: [''],
      },
    ]);
  };

  const handleRemoveRecipe = (index) => {
    if (window.confirm("Supprimer cette recette ?")) {
      const updated = [...recipes];
      updated.splice(index, 1);
      setRecipes(updated);
    }
  };

  const handleFileChange = (e, fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('recipes', JSON.stringify(recipes));

    // Associer les fichiers
    recipes.forEach((_, index) => {
      if (files[`photo_${index}`]) {
        formData.append(`photo_${index}`, files[`photo_${index}`]);
      }
      if (files[`pdf_${index}`]) {
        formData.append(`pdf_${index}`, files[`pdf_${index}`]);
      }
    });

    try {
      await axios.post('http://localhost:5000/recipes/recipes/batch', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('✅ Recettes ajoutées avec succès !');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur ajout batch :', err);
      alert('❌ Échec de l’ajout');
    }
  };
const handleAddIngredient = (recipeIndex) => {
  const updated = [...recipes];
  updated[recipeIndex].ingredients.push({ name: '', quantity: '' });
  setRecipes(updated);
};

const handleAddStep = (recipeIndex) => {
  const updated = [...recipes];
  updated[recipeIndex].steps.push('');
  setRecipes(updated);
};
const handleRemoveIngredient = (recipeIndex, ingIndex) => {
  const updated = [...recipes];
  updated[recipeIndex].ingredients = updated[recipeIndex].ingredients.filter(
    (_, i) => i !== ingIndex
  );
  setRecipes(updated);
};

const handleRemoveStep = (recipeIndex, stepIndex) => {
  const updated = [...recipes];
  updated[recipeIndex].steps = updated[recipeIndex].steps.filter(
    (_, i) => i !== stepIndex
  );
  setRecipes(updated);
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-auto pt-10 pb-20">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter plusieurs recettes</h2>
          <button onClick={onClose} className="text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {recipes.map((recipe, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Recette {index + 1}</h3>
                {recipes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipe(index)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    ❌ Annuler cette recette
                  </button>
                )}
              </div>

              <input
                className="w-full border p-2 rounded mb-2"
                placeholder="Titre"
                value={recipe.title}
                onChange={(e) => handleRecipeChange(index, 'title', e.target.value)}
              />
              <textarea
                className="w-full border p-2 rounded mb-2"
                placeholder="Description"
                value={recipe.description}
                onChange={(e) => handleRecipeChange(index, 'description', e.target.value)}
              />
              <input
                className="w-full border p-2 rounded mb-2"
                placeholder="Catégorie"
                value={recipe.category}
                onChange={(e) => handleRecipeChange(index, 'category', e.target.value)}
              />
              <input
                type="number"
                className="w-full border p-2 rounded mb-2"
                placeholder="Temps de préparation (min)"
                value={recipe.prepTime}
                onChange={(e) => handleRecipeChange(index, 'prepTime', e.target.value)}
              />
{/* Ingrédients */}
<label className="block font-medium mt-2">Ingrédients</label>
{recipe.ingredients.map((ing, i) => (
  <div key={i} className="flex gap-2 mb-2 items-center">
    <input
      className="flex-1 border p-1 rounded"
      placeholder="Nom"
      value={ing.name}
      onChange={(e) => handleIngredientChange(index, i, 'name', e.target.value)}
    />
    <input
      className="w-24 border p-1 rounded"
      placeholder="Quantité"
      value={ing.quantity}
      onChange={(e) => handleIngredientChange(index, i, 'quantity', e.target.value)}
    />
    <button
      type="button"
      onClick={() => handleRemoveIngredient(index, i)}
      className="text-red-600 font-bold px-2"
      title="Supprimer cet ingrédient"
    >
      ❌
    </button>
  </div>
))}
<button
  type="button"
  onClick={() => handleAddIngredient(index)}
  className="text-blue-600 hover:underline mb-2"
>
  + Ajouter un ingrédient
</button>
{/* Étapes */}
<label className="block font-medium mt-2">Étapes</label>
{recipe.steps.map((step, i) => (
  <div key={i} className="flex gap-2 mb-2 items-start">
    <textarea
      className="flex-1 border p-2 rounded"
      placeholder={`Étape ${i + 1}`}
      value={step}
      onChange={(e) => handleStepChange(index, i, e.target.value)}
    />
    <button
      type="button"
      onClick={() => handleRemoveStep(index, i)}
      className="text-red-600 font-bold px-2"
      title="Supprimer cette étape"
    >
      ❌
    </button>

  </div>
))}
           <button
  type="button"
  onClick={() => handleAddStep(index)}
  className="text-blue-600 hover:underline mb-2"
>
  + Ajouter un step
</button>    

              <div className="mt-2">
                <label className="block font-medium">Photo :</label>
                <input
                  type="file"
                  name={`photo_${index}`}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, `photo_${index}`)}
                />
              </div>
              <div className="mt-2">
                <label className="block font-medium">PDF :</label>
                <input
                  type="file"
                  name={`pdf_${index}`}
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, `pdf_${index}`)}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4 justify-between mt-4">
            <button
              type="button"
              onClick={handleAddRecipe}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ➕ Ajouter une autre recette
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✅ Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
