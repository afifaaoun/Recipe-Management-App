import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api'; // on crée ça dans api.js
import { Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await registerUser(email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="password"
          value={password}
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="password"
          value={confirmPassword}
          placeholder="Confirmer le mot de passe"
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          S'inscrire
        </button>
      </form>

      <p className="mt-4 text-center">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Connectez-vous ici
        </Link>
      </p>
    </div>
  );
}
