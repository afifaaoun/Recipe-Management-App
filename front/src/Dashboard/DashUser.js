import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllRecipes } from '../services/api';
import RecipeForm from '../Recipes/RecipeForm';
import RecipeCard from '../Recipes/RecipeCardUser'; // composant personnalisé
import EditRecipe from '../Recipes/EditRecipe';

export default function DashUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const fetchRecipes = async () => {
    try {
      const all = await getAllRecipes();
      const userId = user?._id;

      // Afficher TOUTES les recettes, mais permettre d’éditer/supprimer seulement celles de l’utilisateur
      setRecipes(all);
    } catch (err) {
      console.error("Erreur lors du chargement des recettes", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchRecipes();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDelete = (id) => {
    setRecipes((prev) => prev.filter((r) => r._id !== id));
    if (selectedRecipe?._id === id) {
      setSelectedRecipe(null);
    }
  };

  const handleUpdated = () => {
    fetchRecipes();
    setSelectedRecipe(null);
    setShowEdit(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bienvenue, {user?.email}</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {/* Bouton Ajouter */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Nouvelle Recette
        </button>
      </div>

      {/* Affichage recettes */}
      {recipes.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">Aucune recette trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              currentUserId={user._id}
              onClickTitle={() => setSelectedRecipe(recipe)}
              onDeleted={handleDelete}
              onEditRequest={(r) => {
                setSelectedRecipe(r);
                setShowEdit(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal ajout */}
      {showAdd && (
        <RecipeForm
          onClose={() => {
            setShowAdd(false);
            fetchRecipes();
          }}
        />
      )}

      {/* Modal détails */}
      {selectedRecipe && !showEdit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-600 hover:text-black"
              onClick={() => setSelectedRecipe(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-3">{selectedRecipe.title}</h2>
            <img
              src={`http://localhost:5000/uploads/${selectedRecipe.photoUrl}`}
              alt={selectedRecipe.title}
              className="w-full h-60 object-cover rounded mb-4"
            />
            <p><strong>Description :</strong> {selectedRecipe.description}</p>
            <p><strong>Catégorie :</strong> {selectedRecipe.category}</p>
            <p><strong>Temps de préparation :</strong> {selectedRecipe.prepTime} min</p>

            <h4 className="font-semibold mt-4 mb-1">Ingrédients :</h4>
            <ul className="list-disc ml-5 mb-3">
              {selectedRecipe.ingredients.map((item, i) => (
                <li key={i}>{item.quantity} {item.name}</li>
              ))}
            </ul>

            <h4 className="font-semibold mt-4 mb-1">Étapes :</h4>
            <ol className="list-decimal ml-5 mb-3">
              {selectedRecipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            {selectedRecipe.pdfUrl && (
              <a
                href={`http://localhost:5000/uploads/${selectedRecipe.pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 underline"
              >
                Télécharger la recette (PDF)
              </a>
            )}

            {/* Affiche bouton modifier si c’est sa recette */}
            {selectedRecipe.user === user._id || selectedRecipe.author?._id === user._id ? (
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowEdit(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Modifier
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal modification */}
      {showEdit && selectedRecipe && (
        <EditRecipe
          recipe={selectedRecipe}
          onClose={handleUpdated}
        />
      )}
    </div>
  );
}
