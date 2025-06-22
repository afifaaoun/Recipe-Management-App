import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // supprime token + user dans le contexte/localStorage
    navigate('/login');
  }, [logout, navigate]);

  return null; // rien à afficher
}
