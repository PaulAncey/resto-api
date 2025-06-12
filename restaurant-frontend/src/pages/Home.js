import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, UtensilsCrossed, Clock, Users } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Bienvenue au Restaurant
            <span className="text-green-600 block">Délices & Saveurs</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez une expérience culinaire exceptionnelle dans un cadre chaleureux. 
            Réservez votre table en quelques clics et savourez nos plats préparés avec passion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated() ? (
              <>
                <Link 
                  to="/new-reservation"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Réserver une table</span>
                </Link>
                <Link 
                  to="/menu"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Voir le menu</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
                >
                  Créer un compte
                </Link>
                <Link 
                  to="/menu"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Découvrir le menu</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Pourquoi choisir notre restaurant ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cuisine Raffinée</h3>
              <p className="text-gray-600">
                Des plats préparés avec les meilleurs ingrédients par nos chefs expérimentés. 
                Une carte qui évolue selon les saisons.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Réservation Facile</h3>
              <p className="text-gray-600">
                Réservez votre table en ligne en quelques minutes. 
                Modifiez ou annulez votre réservation facilement.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Service Attentionné</h3>
              <p className="text-gray-600">
                Notre équipe vous accueille dans un cadre chaleureux et vous accompagne 
                tout au long de votre expérience culinaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Info Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-green-600" />
                Horaires d'ouverture
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span>12h00 - 14h30, 19h00 - 22h30</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span>19h00 - 23h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span>12h00 - 15h00</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Informations pratiques
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Adresse :</strong> 123 Rue de la Gastronomie, 75001 Paris
                </p>
                <p>
                  <strong>Téléphone :</strong> 01 23 45 67 89
                </p>
                <p>
                  <strong>Email :</strong> contact@delices-saveurs.fr
                </p>
                <p className="text-sm text-gray-500">
                  Réservation recommandée, particulièrement en fin de semaine. 
                  Nous acceptons les groupes jusqu'à 12 personnes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;