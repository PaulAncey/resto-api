import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationService } from '../services/api';
import { Calendar, Clock, Users, Phone, User, MessageSquare, Save } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const EditReservation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    number_of_people: 2,
    date: '',
    time: '',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [originalReservation, setOriginalReservation] = useState(null);

  // Générer les créneaux horaires disponibles
  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  // Générer les dates disponibles (30 prochains jours)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE d MMMM yyyy', { locale: fr })
    };
  });

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      // On récupère toutes les réservations de l'utilisateur et on trouve celle qui correspond
      const reservations = await reservationService.getMyReservations();
      const reservation = reservations.find(r => r.id === parseInt(id));
      
      if (!reservation) {
        setError('Réservation introuvable ou accès non autorisé.');
        return;
      }

      if (reservation.status !== 'pending') {
        setError('Seules les réservations en attente peuvent être modifiées.');
        return;
      }

      setOriginalReservation(reservation);
      setFormData({
        name: reservation.name,
        phone: reservation.phone,
        number_of_people: reservation.number_of_people,
        date: reservation.date,
        time: reservation.time.slice(0, 5), // Remove seconds
        note: reservation.note || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la réservation:', error);
      setError('Impossible de charger la réservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (!formData.date) {
      setError('La date est requise');
      return false;
    }
    if (!formData.time) {
      setError('L\'heure est requise');
      return false;
    }
    if (formData.number_of_people < 1 || formData.number_of_people > 12) {
      setError('Le nombre de personnes doit être entre 1 et 12');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');

    try {
      await reservationService.updateReservation(id, formData);
      navigate('/reservations', { 
        state: { message: 'Réservation modifiée avec succès !' }
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la réservation:', error);
      setError(error.response?.data?.message || 'Erreur lors de la modification de la réservation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la réservation...</p>
        </div>
      </div>
    );
  }

  if (error && !originalReservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/reservations')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Retour aux réservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              Modifier la réservation
            </h1>
            <p className="text-blue-100 mt-2">
              Réservation #{originalReservation?.id} - {originalReservation?.name}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nom de la réservation
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nom de famille ou nom de l'événement"
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>

              {/* Nombre de personnes */}
              <div>
                <label htmlFor="number_of_people" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-2" />
                  Nombre de personnes
                </label>
                <select
                  id="number_of_people"
                  name="number_of_people"
                  value={formData.number_of_people}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} personne{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date et heure */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date
                  </label>
                  <select
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Choisir une date</option>
                    {availableDates.map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Heure
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Choisir une heure</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Note (optionnel)
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Demandes particulières, allergies, occasion spéciale..."
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Modification en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Sauvegarder les modifications
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/reservations')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservation;