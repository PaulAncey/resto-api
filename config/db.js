const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'restaurant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données établie avec succès');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Vérifiez vos identifiants MySQL dans le fichier .env');
      console.error('Si vous n\'avez pas de mot de passe MySQL, utilisez DB_PASSWORD=');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('La base de données n\'existe pas. Créez-la avec:');
      console.error('mysql -u root -p');
      console.error('CREATE DATABASE restaurant_db;');
    }
    return false;
  }
};

const executeQuery = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error.message);
    console.error('SQL:', sql);
    console.error('Paramètres:', JSON.stringify(params));
    throw error;
  }
};

const createDatabaseIfNotExists = async () => {
  try {
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'restaurant_db'}`);
    console.log(`Base de données '${process.env.DB_NAME || 'restaurant_db'}' vérifiée/créée`);
    
    await tempPool.end();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de la base de données:', error.message);
    return false;
  }
};

const initializeTables = async () => {
  try {
    const [tables] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = 'users'
    `, [process.env.DB_NAME || 'restaurant_db']);
    
    if (tables.length === 0) {
      console.log('Les tables n\'existent pas, initialisation en cours...');
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          fname VARCHAR(100) NOT NULL,
          lname VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role ENUM('admin', 'client') DEFAULT 'client',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS tables (
          id INT AUTO_INCREMENT PRIMARY KEY,
          seats INT NOT NULL,
          name VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS reservations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          number_of_people INT NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          note TEXT,
          status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS reservation_tables (
          reservation_id INT NOT NULL,
          table_id INT NOT NULL,
          PRIMARY KEY (reservation_id, table_id),
          FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
          FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
        )
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS menu_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          category_id INT NOT NULL,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
        )
      `);
      
      console.log('Tables créées avec succès');
      
      await insertInitialData();
    } else {
      console.log('Les tables existent déjà dans la base de données');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tables:', error.message);
    return false;
  }
};

const insertInitialData = async () => {
  try {
    const users = await executeQuery('SELECT * FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log('Insertion des données initiales...');
      
      const bcrypt = require('bcryptjs');
      
      const adminSalt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('Admin123!', adminSalt);
      
      const clientSalt = await bcrypt.genSalt(10);
      const clientPassword = await bcrypt.hash('Client123!', clientSalt);
      
      await executeQuery(
        'INSERT INTO users (email, password_hash, fname, lname, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@restaurant.com', adminPassword, 'Admin', 'Restaurant', '0123456789', 'admin']
      );
      
      await executeQuery(
        'INSERT INTO users (email, password_hash, fname, lname, phone) VALUES (?, ?, ?, ?, ?)',
        ['client@example.com', clientPassword, 'Jean', 'Dupont', '0987654321']
      );
      
      await executeQuery('INSERT INTO tables (seats, name) VALUES (2, "Table 1"), (2, "Table 2"), (4, "Table 4"), (4, "Table 5"), (6, "Table 6")');
      
      await executeQuery('INSERT INTO menu_categories (name) VALUES ("Entrées"), ("Plats"), ("Desserts"), ("Boissons")');
      
      const categories = await executeQuery('SELECT id FROM menu_categories');
      
      if (categories.length >= 4) {
        await executeQuery(
          'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
          ['Salade César', 'Laitue romaine, croûtons, parmesan, poulet grillé et sauce César maison', 12.50, categories[0].id]
        );
        
        await executeQuery(
          'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
          ['Entrecôte grillée', 'Entrecôte de bœuf 300g, frites maison et sauce au poivre', 24.90, categories[1].id]
        );
        
        await executeQuery(
          'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
          ['Tiramisu', 'Tiramisu traditionnel au café et amaretto', 8.50, categories[2].id]
        );
        
        await executeQuery(
          'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
          ['Eau minérale (50cl)', 'Eau plate ou gazeuse', 3.50, categories[3].id]
        );
      }
      
      console.log('Données initiales insérées avec succès');
    } else {
      console.log('Des données existent déjà dans la base de données');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données initiales:', error.message);
    return false;
  }
};

const initializeDatabase = async () => {
  try {
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      return false;
    }
    
    const connected = await testConnection();
    if (!connected) {
      return false;
    }
    
    const tablesInitialized = await initializeTables();
    if (!tablesInitialized) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query: executeQuery,
  testConnection,
  initializeDatabase
};