import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/api';
import { Calendar, Clock, Users, Phone, MessageSquare, Edit, X, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger vos réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await reservationService.cancelReservation(reservationId);
      await loadReservations(); // Reload the list
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation de la réservation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadReservations}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-green-600 px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              Mes Réservations
            </h1>
            <p className="text-green-100 mt-2">
              Gérez vos réservations en cours et passées
            </p>
          </div>

          <div className="p-6">
            <Link
              to="/new-reservation"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle réservation
            </Link>
          </div>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucune réservation
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore de réservation. Créez votre première réservation dès maintenant !
            </p>
            <Link
              to="/new-reservation"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer une réservation
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Header with status */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {reservation.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Réservation #{reservation.id}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>

                  {/* Reservation details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">Date :</span>
                        <span className="ml-2">{formatDate(reservation.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">Heure :</span>
                        <span className="ml-2">{formatTime(reservation.time)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">Personnes :</span>
                        <span className="ml-2">{reservation.number_of_people}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">Téléphone :</span>
                        <span className="ml-2">{reservation.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {reservation.note && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start text-gray-600">
                        <MessageSquare className="h-5 w-5 mr-3 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Note :</span>
                          <p className="mt-1">{reservation.note}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tables assigned */}
                  {reservation.tables && reservation.tables.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start text-gray-600">
                        <div className="w-5 h-5 mr-3 mt-0.5">
                          <div className="w-5 h-5 bg-green-600 rounded"></div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Tables attribuées :</span>
                          <p className="mt-1 text-green-700">
                            {reservation.tables.map(table => `${table.name} (${table.seats} places)`).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {reservation.status === 'pending' && (
                      <>
                        <Link
                          to={`/edit-reservation/${reservation.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </button>
                      </>
                    )}
                    
                    {reservation.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </button>
                    )}

                    {reservation.status === 'cancelled' && (
                      <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                        Réservation annulée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;