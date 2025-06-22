import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import {
  getAllRecipes,
  getAllUsers,
  deleteUserById,
  deleteAllRecipes,
  promoteUserToAdmin,
  demoteAdminToUser,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import RecipeCardAdmin from '../Recipes/RecipeCardAdmin';
import RecipeForm from '../Recipes/RecipeForm';
import AddManyRecipes from '../Recipes/AddManyRecipes';

export default function DashAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
const [showAddMany, setShowAddMany] = useState(false);

  const fetchData = async () => {
    try {
      const recipeData = await getAllRecipes();
      const userData = await getAllUsers(user.token);
      setRecipes(recipeData);
      setUsers(userData);
    } catch (err) {
      console.error('Erreur chargement données :', err);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = async (id, email, isAdmin) => {
    if (isAdmin) {
      alert(`❌ Impossible de supprimer l'admin : ${email}`);
      return;
    }
    if (window.confirm(`Supprimer l'utilisateur ${email} ?`)) {
      try {
        await deleteUserById(id, user.token);
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } catch (err) {
        console.error('Erreur suppression utilisateur', err);
      }
    }
  };

  const handlePromoteUser = async (id, email) => {
    if (window.confirm(`Promouvoir ${email} en admin ?`)) {
      try {
        await promoteUserToAdmin(id, user.token);
        alert(`✅ ${email} est maintenant admin`);
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isAdmin: true } : u))
        );
      } catch (err) {
        console.error('Erreur promotion admin', err);
      }
    }
  };

  const handleDemoteUser = async (id, email) => {
    if (window.confirm(`Retirer le rôle admin de ${email} ?`)) {
      try {
        await demoteAdminToUser(id, user.token);
        alert(`✅ ${email} n'est plus admin`);
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isAdmin: false } : u))
        );
      } catch (err) {
        console.error('Erreur démotion admin', err);
      }
    }
  };

  const handleDeleteAllRecipes = async () => {
    if (window.confirm('Supprimer toutes les recettes ?')) {
      try {
        await deleteAllRecipes(user.token);
        setRecipes([]);
        alert('✅ Toutes les recettes ont été supprimées.');
      } catch (err) {
        console.error('Erreur suppression toutes recettes', err);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableau de bord admin</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {/* Actions globales */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Nouvelle Recette
        </button>
        <button
  onClick={() => setShowAddMany(true)}
  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-2"
>
  + Ajouter plusieurs recettes
</button>

        <button
          onClick={handleDeleteAllRecipes}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          🧹 Supprimer toutes les recettes
        </button>
      </div>

      {/* Liste utilisateurs */}
      <h3 className="text-xl font-semibold mb-3">👥 Liste des utilisateurs</h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Rôle</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.isAdmin ? 'admin' : 'user'}</td>
                <td className="py-2 px-4 space-x-2">
                  {!u.isAdmin && (
                    <button
                      onClick={() => handlePromoteUser(u._id, u.email)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Promouvoir admin
                    </button>
                  )}
                  {u.isAdmin && u._id !== user._id && (
                    <button
                      onClick={() => handleDemoteUser(u._id, u.email)}
                      className="bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Annuler promotion
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(u._id, u.email, u.isAdmin)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Liste recettes */}
      <h3 className="text-xl font-semibold mb-3">📋 Toutes les recettes</h3>
      {recipes.length === 0 ? (
        <p className="text-gray-500">Aucune recette trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCardAdmin
              key={recipe._id}
              recipe={recipe}
              onUpdated={fetchData}
            />
          ))}
        </div>
      )}

      {/* Modal ajout recette */}
      {showAdd && (
        <RecipeForm
          onClose={() => {
            setShowAdd(false);
            fetchData();
          }}
        />
      )}
      {showAddMany && (
  <AddManyRecipes
    onClose={() => setShowAddMany(false)}
    onSuccess={fetchData}
  />
)}

    </div>
  );
}
