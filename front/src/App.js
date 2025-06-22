import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Sign/Login';
import Register from './Sign/Register';
import Logout from './Sign/Logout';
import DashUser from './Dashboard/DashUser';
import DashAdmin from './Dashboard/DashAdmin';
import { useAuth } from './services/AuthContext';
import ProtectedRoute from './services/ProtectedRoutes';
import './App.css'
export default function App() {
  const { user, isAdmin } = useAuth();

  return (
      <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images(1).jpg)', backgroundColor: 'rgba(255,255,255,0.7)', backgroundBlendMode: 'overlay' }}
    >
    <Routes>
      <Route path="/" element={<Navigate to={user ? (isAdmin ? '/admin' : '/user') : '/login'} />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />

      {/* User Dashboard */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute>
            <DashUser />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute adminOnly={true}>
            <DashAdmin />
          </ProtectedRoute>
        }
      />
    </Routes>
    </div>
  );
}
