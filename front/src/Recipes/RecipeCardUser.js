import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { deleteRecipeById } from '../services/api';
import EditRecipe from './EditRecipe';

export default function RecipeCardUser({ recipe, onDeleted, onUpdated }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isOwner = user && (
    recipe.author === user._id || recipe.author?._id === user._id
  );

  const handleDelete = async () => {
    if (window.confirm('Confirmer la suppression ?')) {
      await deleteRecipeById(recipe._id, user.token);
      onDeleted(recipe._id);
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
        <h3 className="text-xl font-semibold mt-2 flex items-center gap-2">
          {recipe.title}
          {isOwner && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Ma recette
            </span>
          )}
        </h3>
        <p className="text-gray-600 truncate">{recipe.description}</p>

        {isOwner && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Modal détails recette */}
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
                {recipe.ingredients.map((item, index) => (
                  <li key={index}>{item.quantity} {item.name}</li>
                ))}
              </ul>

              <h4 className="font-semibold mt-4 mb-1">Étapes :</h4>
              <ol className="list-decimal ml-5 mb-3">
                {recipe.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

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

              <div className="flex justify-end mt-4 gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition recette */}
      {showEdit && (
        <EditRecipe
          recipe={recipe}
          onClose={() => setShowEdit(false)}
          onUpdated={() => {
            setShowEdit(false);
            setShowModal(false);
            if (onUpdated) onUpdated();
          }}
        />
      )}
    </>
  );
}
