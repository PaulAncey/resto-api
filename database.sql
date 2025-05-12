CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

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
);

CREATE TABLE IF NOT EXISTS tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seats INT NOT NULL,
  name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

CREATE TABLE IF NOT EXISTS reservation_tables (
  reservation_id INT NOT NULL,
  table_id INT NOT NULL,
  PRIMARY KEY (reservation_id, table_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);


INSERT INTO tables (seats, name) VALUES
(2, 'Table 1'), (2, 'Table 2'), (2, 'Table 3'),
(4, 'Table 4'), (4, 'Table 5'), (4, 'Table 6'),
(6, 'Table 7'), (6, 'Table 8');

INSERT INTO menu_categories (name) VALUES
('Entrées'), ('Plats'), ('Desserts'), ('Boissons');

INSERT INTO users (email, password_hash, fname, lname, phone, role) VALUES
('admin@restaurant.com', '$2a$10$B3xC2YQrQaM8QkWV9y0hj.YRls73IQnt0AcHmw5DgnIlTY0QxvR7u', 'Admin', 'Restaurant', '0123456789', 'admin');

INSERT INTO users (email, password_hash, fname, lname, phone) VALUES
('client@example.com', '$2a$10$yzfVMg5Uyzi4VDltLEF7f.iGzdm0tRNBudyjn5sS3SOy9PfWRj.UG', 'Jean', 'Dupont', '0987654321');

INSERT INTO menu_items (name, description, price, category_id) VALUES
('Salade César', 'Laitue romaine, croûtons, parmesan, poulet grillé et sauce César maison', 12.50, 1),
('Soupe à l\'oignon', 'Soupe à l\'oignon gratinée au fromage', 8.90, 1),
('Foie gras maison', 'Foie gras de canard mi-cuit, chutney de figues et pain brioché', 18.50, 1),

('Entrecôte grillée', 'Entrecôte de bœuf 300g, frites maison et sauce au poivre', 24.90, 2),
('Risotto aux champignons', 'Risotto crémeux aux champignons de saison et parmesan', 18.50, 2),
('Filet de bar', 'Filet de bar grillé, légumes de saison et sauce vierge', 22.90, 2),

('Tiramisu', 'Tiramisu traditionnel au café et amaretto', 8.50, 3),
('Crème brûlée', 'Crème brûlée à la vanille de Madagascar', 7.90, 3),
('Fondant au chocolat', 'Fondant au chocolat noir, cœur coulant et glace vanille', 9.50, 3),

('Eau minérale (50cl)', 'Eau plate ou gazeuse', 3.50, 4),
('Soda', 'Coca-Cola, Fanta, Sprite', 4.50, 4),
('Vin rouge (verre)', 'Demandez notre sélection', 6.50, 4);