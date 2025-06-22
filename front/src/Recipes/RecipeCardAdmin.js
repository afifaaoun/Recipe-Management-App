// RecipeCardAdmin.js
import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { deleteRecipeById } from '../services/api';
import EditRecipe from './EditRecipe';

export default function RecipeCardAdmin({ recipe, onUpdated }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await deleteRecipeById(recipe._id, user.token);
        onUpdated(); // refresh la liste dans le parent
      } catch (err) {
        console.error('Erreur suppression recette :', err);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition relative">
        <img
          src={`http://localhost:5000/uploads/${recipe.photoUrl}`}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded cursor-pointer"
          onClick={() => setShowModal(true)}
        />
        <h3 className="text-xl font-semibold mt-2">{recipe.title}</h3>
        <p className="text-gray-600 truncate">{recipe.description}</p>

        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Détails
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
          >
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Modal détails */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-auto">
          <div className="flex justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-3 text-2xl text-gray-700 hover:text-black"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-3">{recipe.title}</h2>
              <img
                src={`http://localhost:5000/uploads/${recipe.photoUrl}`}
                alt={recipe.title}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <p><strong>Description:</strong> {recipe.description}</p>
              <p><strong>Catégorie:</strong> {recipe.category}</p>
              <p><strong>Temps de préparation:</strong> {recipe.prepTime} min</p>

              <h4 className="font-semibold mt-4 mb-1">Ingrédients :</h4>
              <ul className="list-disc ml-5 mb-3">
                {recipe.ingredients.map((item, i) => (
                  <li key={i}>{item.quantity} {item.name}</li>
                ))}
              </ul>

              <h4 className="font-semibold mt-4 mb-1">Étapes :</h4>
              <ol className="list-decimal ml-5 mb-3">
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
      <p className="text-sm text-gray-600 mb-1">Added by: {recipe.author?.email || "Inconnu"}</p>

              {recipe.pdfUrl && (
                <a
                  href={`http://localhost:5000/uploads/${recipe.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-blue-600 underline"
                >
                  Télécharger la recette (PDF)
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {showEdit && (
        <EditRecipe
          recipe={recipe}
          onClose={() => {
            setShowEdit(false);
            onUpdated(); // recharge la liste après modification
          }}
        />
      )}
    </>
  );
}
