import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { Calendar, Users, CheckCircle, Clock, X, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    today: 0
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAllReservations();
      setReservations(data);
      calculateStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger les réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservationsData) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: reservationsData.length,
      pending: reservationsData.filter(r => r.status === 'pending').length,
      confirmed: reservationsData.filter(r => r.status === 'confirmed').length,
      today: reservationsData.filter(r => r.date === today).length
    };
    
    setStats(stats);
  };

  const handleValidateReservation = async (reservationId) => {
    try {
      await reservationService.validateReservation(reservationId);
      await loadReservations();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation de la réservation');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await reservationService.cancelReservation(reservationId);
      await loadReservations();
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
    return format(date, 'dd/MM/yyyy');
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-green-600 px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Administration
            </h1>
            <p className="text-green-100 mt-2">
              Gestion des réservations du restaurant
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Confirmées</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Toutes les réservations</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {reservations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune réservation pour le moment
              </div>
            ) : (
              reservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{reservation.name}</h3>
                        {getStatusBadge(reservation.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Date:</strong> {formatDate(reservation.date)} à {formatTime(reservation.time)}
                        </div>
                        <div>
                          <strong>Personnes:</strong> {reservation.number_of_people}
                        </div>
                        <div>
                          <strong>Téléphone:</strong> {reservation.phone}
                        </div>
                      </div>

                      {reservation.note && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Note:</strong> {reservation.note}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex space-x-2">
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleValidateReservation(reservation.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Valider
                        </button>
                      )}
                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;