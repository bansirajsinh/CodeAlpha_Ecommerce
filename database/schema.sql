-- =============================================================
-- PROJECT: Simple E-Commerce Store (CodeAlpha Task 1)
-- FILE: schema.sql
-- DESCRIPTION: Full MySQL database schema definition
-- AUTHOR: Bansirajsinh | CodeAlpha Internship
-- =============================================================
-- Drop database and recreate cleanly (dev only)
DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;
-- =============================================================
-- TABLE: users
-- Stores registered customer accounts
-- =============================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE = InnoDB;
-- =============================================================
-- TABLE: categories
-- Product categories / taxonomy (e.g. Electronics, Clothing)
-- =============================================================
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categories_slug (slug)
) ENGINE = InnoDB;
-- =============================================================
-- TABLE: products
-- Core product inventory catalogue
-- =============================================================
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_qty INT UNSIGNED NOT NULL DEFAULT 0,
    image_url VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE
    SET NULL ON UPDATE CASCADE,
        INDEX idx_products_category (category_id),
        INDEX idx_products_slug (slug),
        INDEX idx_products_active (is_active),
        INDEX idx_products_price (price)
) ENGINE = InnoDB;
-- =============================================================
-- TABLE: orders
-- Parent order record — one row per checkout session
-- =============================================================
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_name VARCHAR(100) DEFAULT NULL,
    shipping_addr TEXT DEFAULT NULL,
    shipping_phone VARCHAR(20) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date (created_at)
) ENGINE = InnoDB;
-- =============================================================
-- TABLE: order_items
-- Line items for each order — maps products to orders
-- =============================================================
CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    -- price snapshot at time of order
    subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
) ENGINE = InnoDB;
-- =============================================================
-- TABLE: cart_items
-- Persisted server-side cart (user session cart)
-- =============================================================
CREATE TABLE cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cart_user_product (user_id, product_id),
    -- one row per product per user
    CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;
-- =============================================================
-- VIEW: v_order_summary
-- Convenience view for admin / order history screens
-- =============================================================
CREATE VIEW v_order_summary AS
SELECT o.id AS order_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    o.status,
    o.total_amount,
    o.created_at AS ordered_at,
    COUNT(oi.id) AS total_items
FROM orders o
    JOIN users u ON u.id = o.user_id
    JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id,
    u.full_name,
    u.email,
    o.status,
    o.total_amount,
    o.created_at;
-- =============================================================
-- STORED PROCEDURE: sp_place_order
-- Atomic order placement — inserts order, line items,
-- deducts stock, clears cart in one transaction.
-- =============================================================
DELIMITER $$
CREATE PROCEDURE sp_place_order (
    IN p_user_id INT UNSIGNED,
    IN p_ship_name VARCHAR(100),
    IN p_ship_addr TEXT,
    IN p_ship_phone VARCHAR(20),
    OUT p_order_id INT UNSIGNED,
    OUT p_message VARCHAR(200)
) BEGIN
DECLARE v_total DECIMAL(12, 2) DEFAULT 0;
DECLARE v_item_id INT UNSIGNED;
DECLARE v_qty INT UNSIGNED;
DECLARE v_stock INT UNSIGNED;
DECLARE v_price DECIMAL(10, 2);
DECLARE done INT DEFAULT FALSE;
DECLARE cur CURSOR FOR
SELECT ci.product_id,
    ci.quantity,
    p.price,
    p.stock_qty
FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = p_user_id;
DECLARE CONTINUE HANDLER FOR NOT FOUND
SET done = TRUE;
DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK;
SET p_order_id = NULL;
SET p_message = 'Transaction failed — order rolled back.';
END;
START TRANSACTION;
-- Validate cart is not empty
IF (
    SELECT COUNT(*)
    FROM cart_items
    WHERE user_id = p_user_id
) = 0 THEN ROLLBACK;
SET p_order_id = NULL;
SET p_message = 'Cart is empty.';
ELSE -- Create parent order row
INSERT INTO orders (
        user_id,
        status,
        total_amount,
        shipping_name,
        shipping_addr,
        shipping_phone
    )
VALUES (
        p_user_id,
        'pending',
        0,
        p_ship_name,
        p_ship_addr,
        p_ship_phone
    );
SET p_order_id = LAST_INSERT_ID();
-- Iterate cart items
OPEN cur;
read_loop: LOOP FETCH cur INTO v_item_id,
v_qty,
v_price,
v_stock;
IF done THEN LEAVE read_loop;
END IF;
-- Stock check
IF v_stock < v_qty THEN ROLLBACK;
SET p_order_id = NULL;
SET p_message = CONCAT('Insufficient stock for product id: ', v_item_id);
LEAVE read_loop;
END IF;
-- Insert order line item
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (p_order_id, v_item_id, v_qty, v_price);
-- Deduct stock
UPDATE products
SET stock_qty = stock_qty - v_qty
WHERE id = v_item_id;
-- Accumulate total
SET v_total = v_total + (v_qty * v_price);
END LOOP;
CLOSE cur;
-- Update order total
UPDATE orders
SET total_amount = v_total
WHERE id = p_order_id;
-- Clear cart
DELETE FROM cart_items
WHERE user_id = p_user_id;
COMMIT;
SET p_message = 'Order placed successfully.';
END IF;
END $$
DELIMITER ;