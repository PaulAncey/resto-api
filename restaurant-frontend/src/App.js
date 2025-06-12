import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Menu from './pages/Menu';
import NewReservation from './pages/NewReservation';
import Reservations from './pages/Reservations';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Composant pour protéger les routes admin
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return isAdmin() ? children : <Navigate to="/" replace />;
};

// Composant pour rediriger les utilisateurs déjà connectés
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            
            {/* Routes d'authentification */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            
            {/* Routes protégées (nécessitent une authentification) */}
            <Route 
              path="/new-reservation" 
              element={
                <ProtectedRoute>
                  <NewReservation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reservations" 
              element={
                <ProtectedRoute>
                  <Reservations />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes admin */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Route par défaut - 404 */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Page introuvable</p>
                    <a 
                      href="/" 
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;