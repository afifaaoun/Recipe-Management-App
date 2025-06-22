import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { loginUser } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser(email, password);
      login(data);
      navigate(data.isAdmin ? '/admin' : '/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>   
      </div>
  );
}
