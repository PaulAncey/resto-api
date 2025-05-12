const { query } = require('../config/db');
const { validationResult } = require('express-validator');

const getMenu = async (req, res) => {
  try {
    const categories = await query(`
      SELECT * FROM menu_categories
      ORDER BY name
    `);

    const menuWithItems = await Promise.all(categories.map(async (category) => {
      const items = await query(`
        SELECT * FROM menu_items
        WHERE category_id = ?
        ORDER BY name
      `, [category.id]);

      return {
        ...category,
        items
      };
    }));

    res.json(menuWithItems);
  } catch (error) {
    console.error('Erreur lors de la récupération du menu:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du menu.' });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const items = await query(`
      SELECT mi.*, mc.name as category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.id = ?
    `, [itemId]);

    if (items.length === 0) {
      return res.status(404).json({ message: 'Élément du menu introuvable.' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élément du menu:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'élément du menu.' });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category_id, image_url } = req.body;

    const categories = await query('SELECT * FROM menu_categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Catégorie introuvable.' });
    }

    const result = await query(
      'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category_id, image_url]
    );

    const newItem = await query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Élément du menu ajouté avec succès',
      item: newItem[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'élément au menu:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément au menu.' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itemId = req.params.id;
    const { name, description, price, category_id, image_url } = req.body;

    const items = await query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Élément du menu introuvable.' });
    }

    if (category_id) {
      const categories = await query('SELECT * FROM menu_categories WHERE id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(404).json({ message: 'Catégorie introuvable.' });
      }
    }

    await query(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, image_url = ? WHERE id = ?',
      [name, description, price, category_id, image_url, itemId]
    );

    const updatedItem = await query('SELECT * FROM menu_items WHERE id = ?', [itemId]);

    res.json({
      message: 'Élément du menu mis à jour avec succès',
      item: updatedItem[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élément du menu:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élément du menu.' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const items = await query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Élément du menu introuvable.' });
    }

    await query('DELETE FROM menu_items WHERE id = ?', [itemId]);

    res.json({
      message: 'Élément du menu supprimé avec succès',
      id: itemId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément du menu:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'élément du menu.' });
  }
};

module.exports = {
  getMenu,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};