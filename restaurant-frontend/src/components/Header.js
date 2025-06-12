import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Calendar, UtensilsCrossed } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <UtensilsCrossed className="h-8 w-8" />
            <span>Restaurant Réservation</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/menu" 
              className="hover:text-green-200 transition-colors duration-200 flex items-center space-x-1"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Menu</span>
            </Link>

            {isAuthenticated() && (
              <>
                <Link 
                  to="/reservations" 
                  className="hover:text-green-200 transition-colors duration-200 flex items-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Mes Réservations</span>
                </Link>

                <Link 
                  to="/new-reservation" 
                  className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Réserver
                </Link>

                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="hover:text-green-200 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">
                    {user.fname} {user.lname}
                    {isAdmin() && <span className="text-green-200 ml-1">(Admin)</span>}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-green-200 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="hover:text-green-200 transition-colors duration-200"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/menu" 
              className="hover:text-green-200 transition-colors duration-200"
            >
              Menu
            </Link>
            {isAuthenticated() && (
              <>
                <Link 
                  to="/reservations" 
                  className="hover:text-green-200 transition-colors duration-200"
                >
                  Mes Réservations
                </Link>
                <Link 
                  to="/new-reservation" 
                  className="hover:text-green-200 transition-colors duration-200"
                >
                  Réserver
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="hover:text-green-200 transition-colors duration-200"
                  >
                    Administration
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;