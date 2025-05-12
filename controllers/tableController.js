const { query } = require('../config/db');
const { validationResult } = require('express-validator');

const getTables = async (req, res) => {
  try {
    const tables = await query(`
      SELECT * FROM tables
      ORDER BY seats, name
    `);

    res.json(tables);
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tables.' });
  }
};

const addTable = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { seats, name } = req.body;

    if (![2, 4, 6].includes(seats)) {
      return res.status(400).json({ message: 'Le nombre de places doit être 2, 4 ou 6.' });
    }

    const result = await query(
      'INSERT INTO tables (seats, name) VALUES (?, ?)',
      [seats, name]
    );

    const newTable = await query('SELECT * FROM tables WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Table ajoutée avec succès',
      table: newTable[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la table:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la table.' });
  }
};

const updateTable = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tableId = req.params.id;
    const { seats, name } = req.body;

    const tables = await query('SELECT * FROM tables WHERE id = ?', [tableId]);
    if (tables.length === 0) {
      return res.status(404).json({ message: 'Table introuvable.' });
    }

    if (seats && ![2, 4, 6].includes(seats)) {
      return res.status(400).json({ message: 'Le nombre de places doit être 2, 4 ou 6.' });
    }

    await query(
      'UPDATE tables SET seats = ?, name = ? WHERE id = ?',
      [seats, name, tableId]
    );

    const updatedTable = await query('SELECT * FROM tables WHERE id = ?', [tableId]);

    res.json({
      message: 'Table mise à jour avec succès',
      table: updatedTable[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la table:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la table.' });
  }
};

const deleteTable = async (req, res) => {
  try {
    const tableId = req.params.id;

    const tables = await query('SELECT * FROM tables WHERE id = ?', [tableId]);
    if (tables.length === 0) {
      return res.status(404).json({ message: 'Table introuvable.' });
    }

    const activeReservations = await query(`
      SELECT r.* 
      FROM reservations r
      JOIN reservation_tables rt ON r.id = rt.reservation_id
      WHERE rt.table_id = ? AND r.status IN ('pending', 'confirmed')
    `, [tableId]);

    if (activeReservations.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cette table car elle est associée à des réservations actives.' 
      });
    }

    await query('DELETE FROM tables WHERE id = ?', [tableId]);

    res.json({
      message: 'Table supprimée avec succès',
      id: tableId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la table:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la table.' });
  }
};

module.exports = {
  getTables,
  addTable,
  updateTable,
  deleteTable
};