const { query } = require('../config/db');
const { validationResult } = require('express-validator');

const getAllReservations = async (req, res) => {
  try {
    const reservations = await query(`
      SELECT r.*, u.email, u.fname AS user_fname, u.lname AS user_lname
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.date, r.time
    `);

    for (let reservation of reservations) {
      const tables = await query(`
        SELECT t.* 
        FROM tables t
        JOIN reservation_tables rt ON t.id = rt.table_id
        WHERE rt.reservation_id = ?
      `, [reservation.id]);

      reservation.tables = tables;
    }

    res.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await query(`
      SELECT * FROM reservations
      WHERE user_id = ?
      ORDER BY date, time
    `, [userId]);

    for (let reservation of reservations) {
      const tables = await query(`
        SELECT t.* 
        FROM tables t
        JOIN reservation_tables rt ON t.id = rt.table_id
        WHERE rt.reservation_id = ?
      `, [reservation.id]);

      reservation.tables = tables;
    }

    res.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
  }
};

const checkTableAvailability = async (date, time, numberOfPeople) => {
  try {
    const reservedTables = await query(`
      SELECT rt.table_id
      FROM reservation_tables rt
      JOIN reservations r ON rt.reservation_id = r.id
      WHERE r.date = ? AND r.time = ? AND r.status IN ('pending', 'confirmed')
    `, [date, time]);
    
    const reservedTableIds = reservedTables.map(t => t.table_id);
    
    let availableTables;
    if (reservedTableIds.length > 0) {
      availableTables = await query(`
        SELECT * FROM tables
        WHERE id NOT IN (?)
        ORDER BY seats
      `, [reservedTableIds]);
    } else {
      availableTables = await query(`
        SELECT * FROM tables
        ORDER BY seats
      `);
    }
    
    let remainingSeats = numberOfPeople;
    let selectedTables = [];
    
    const exactTable = availableTables.find(t => t.seats === numberOfPeople);
    if (exactTable) {
      return {
        available: true,
        tables: [exactTable]
      };
    }
    
    const sortedTables = [...availableTables].sort((a, b) => b.seats - a.seats);
    
    for (const table of sortedTables) {
      if (remainingSeats > 0) {
        selectedTables.push(table);
        remainingSeats -= table.seats;
      }
    }
    
    if (remainingSeats <= 0) {
      return {
        available: true,
        tables: selectedTables
      };
    } else {
      return {
        available: false,
        message: `Impossible de trouver assez de tables pour ${numberOfPeople} personnes.`
      };
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
    throw error;
  }
};

const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, phone, number_of_people, date, time, note } = req.body;

    const availability = await checkTableAvailability(date, time, number_of_people);
    
    if (!availability.available) {
      return res.status(400).json({ message: availability.message });
    }

    const result = await query(
      'INSERT INTO reservations (user_id, name, phone, number_of_people, date, time, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone, number_of_people, date, time, note, 'pending']
    );

    const reservationId = result.insertId;

    for (const table of availability.tables) {
      await query(
        'INSERT INTO reservation_tables (reservation_id, table_id) VALUES (?, ?)',
        [reservationId, table.id]
      );
    }

    const newReservation = await query('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    const tables = await query(`
      SELECT t.* 
      FROM tables t
      JOIN reservation_tables rt ON t.id = rt.table_id
      WHERE rt.reservation_id = ?
    `, [reservationId]);

    newReservation[0].tables = tables;

    res.status(201).json({
      message: 'Réservation créée avec succès',
      reservation: newReservation[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation.' });
  }
};

const updateReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservationId = req.params.id;
    const userId = req.user.id;
    const { name, phone, number_of_people, date, time, note } = req.body;

    let reservation;
    if (req.user.role === 'admin') {
      reservation = await query('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    } else {
      reservation = await query('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [reservationId, userId]);
    }

    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Réservation introuvable ou accès non autorisé.' });
    }

    if (reservation[0].status !== 'pending') {
      return res.status(400).json({ message: 'Seules les réservations en attente peuvent être modifiées.' });
    }

    await query('DELETE FROM reservation_tables WHERE reservation_id = ?', [reservationId]);

    const availability = await checkTableAvailability(date, time, number_of_people);
    
    if (!availability.available) {
      return res.status(400).json({ message: availability.message });
    }

    await query(
      'UPDATE reservations SET name = ?, phone = ?, number_of_people = ?, date = ?, time = ?, note = ? WHERE id = ?',
      [name, phone, number_of_people, date, time, note, reservationId]
    );

    for (const table of availability.tables) {
      await query(
        'INSERT INTO reservation_tables (reservation_id, table_id) VALUES (?, ?)',
        [reservationId, table.id]
      );
    }

    const updatedReservation = await query('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    const tables = await query(`
      SELECT t.* 
      FROM tables t
      JOIN reservation_tables rt ON t.id = rt.table_id
      WHERE rt.reservation_id = ?
    `, [reservationId]);

    updatedReservation[0].tables = tables;

    res.json({
      message: 'Réservation mise à jour avec succès',
      reservation: updatedReservation[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation.' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;

    let reservation;
    if (req.user.role === 'admin') {
      reservation = await query('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    } else {
      reservation = await query('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [reservationId, userId]);
    }

    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Réservation introuvable ou accès non autorisé.' });
    }

    await query(
      'UPDATE reservations SET status = ? WHERE id = ?',
      ['cancelled', reservationId]
    );

    res.json({
      message: 'Réservation annulée avec succès',
      id: reservationId
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de la réservation.' });
  }
};

const validateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await query('SELECT * FROM reservations WHERE id = ?', [reservationId]);

    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }

    if (reservation[0].status === 'confirmed') {
      return res.status(400).json({ message: 'Cette réservation est déjà confirmée.' });
    }

    if (reservation[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de confirmer une réservation annulée.' });
    }

    await query(
      'UPDATE reservations SET status = ? WHERE id = ?',
      ['confirmed', reservationId]
    );

    res.json({
      message: 'Réservation confirmée avec succès',
      id: reservationId
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation de la réservation:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation de la réservation.' });
  }
};

module.exports = {
  getAllReservations,
  getUserReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  validateReservation
};