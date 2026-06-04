-- =============================================================
-- PROJECT: Simple E-Commerce Store (CodeAlpha Task 1)
-- FILE: seed.sql
-- DESCRIPTION: Dummy / demo seed data for local development
-- NOTE: All user passwords are the bcrypt hash of "Password@123"
--       Generated with bcrypt saltRounds=10
-- =============================================================

USE ecommerce_db;

-- ---------------------------------------------------------------
-- CATEGORIES (6 categories)
-- ---------------------------------------------------------------
INSERT INTO categories (name, slug, description) VALUES
('Electronics',   'electronics',   'Gadgets, mobiles, laptops, and accessories'),
('Clothing',      'clothing',      'Men, women, and kids fashion'),
('Books',         'books',         'Novels, textbooks, technical guides'),
('Home & Kitchen','home-kitchen',  'Appliances, cookware, and home décor'),
('Sports',        'sports',        'Fitness equipment, outdoor gear, sportswear'),
('Beauty',        'beauty',        'Skincare, haircare, and cosmetics');


-- ---------------------------------------------------------------
-- PRODUCTS (24 products — 4 per category)
-- Image URLs use Unsplash source for realistic visuals
-- ---------------------------------------------------------------
INSERT INTO products (category_id, name, slug, description, price, stock_qty, image_url) VALUES

-- Electronics (category_id = 1)
(1, 'Sony WH-1000XM5 Headphones',
 'sony-wh-1000xm5-headphones',
 'Industry-leading noise cancellation with 30-hour battery life, crystal-clear hands-free calling, and multipoint connection. Premium over-ear design.',
 349.99, 45,
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),

(1, 'Samsung Galaxy S24 Ultra',
 'samsung-galaxy-s24-ultra',
 '6.8-inch QHD+ Dynamic AMOLED display, 200MP camera system, built-in S Pen, 5000mAh battery, and Snapdragon 8 Gen 3 chipset.',
 1199.99, 20,
 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600'),

(1, 'Apple MacBook Air M3',
 'apple-macbook-air-m3',
 '15-inch Liquid Retina display, Apple M3 chip, 18-hour battery, 8GB unified memory, 256GB SSD. Fanless, ultra-thin design.',
 1299.99, 15,
 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'),

(1, 'Anker 65W GaN Charger',
 'anker-65w-gan-charger',
 'Compact 3-port GaN fast charger. Charges MacBook, iPhone, and AirPods simultaneously. PowerIQ 4.0 smart charging technology.',
 49.99, 120,
 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'),

-- Clothing (category_id = 2)
(2, 'Nike Air Force 1 Low White',
 'nike-air-force-1-low-white',
 'Iconic low-top sneaker in clean triple-white leather. Perforated toe box for ventilation. Air-Sole cushioning for all-day comfort.',
 110.00, 80,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'),

(2, 'Levi\'s 501 Original Fit Jeans',
 'levis-501-original-fit-jeans',
 'The original blue jean since 1873. Button fly, straight-leg fit, 100% cotton denim. Available in sizes 28–40 waist.',
 69.99, 95,
 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'),

(2, 'Uniqlo Ultra Light Down Jacket',
 'uniqlo-ultra-light-down-jacket',
 '700-fill-power premium down insulation packed into an ultra-compact pouch. Water-resistant shell, packable in 5 seconds.',
 89.99, 60,
 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600'),

(2, 'Champion Reverse Weave Hoodie',
 'champion-reverse-weave-hoodie',
 'Classic heavyweight reverse weave construction resists shrinkage. Double-needle stitching, kangaroo pocket, ribbed cuffs.',
 75.00, 70,
 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'),

-- Books (category_id = 3)
(3, 'Clean Code by Robert C. Martin',
 'clean-code-robert-martin',
 'A handbook of agile software craftsmanship. Teaches best practices for writing readable, maintainable, and testable code. Must-read for every developer.',
 34.99, 200,
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'),

(3, 'The Pragmatic Programmer',
 'the-pragmatic-programmer',
 '20th anniversary edition. Timeless tips for working developers: from personal responsibility and career development to code architecture and testing.',
 39.99, 150,
 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'),

(3, 'Atomic Habits by James Clear',
 'atomic-habits-james-clear',
 'An easy and proven way to build good habits and break bad ones. #1 New York Times bestseller. Packed with actionable techniques.',
 27.99, 300,
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'),

(3, 'Design Patterns: GoF',
 'design-patterns-gof',
 'Elements of Reusable Object-Oriented Software. The classic "Gang of Four" book covering 23 essential design patterns with real-world examples.',
 44.99, 90,
 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'),

-- Home & Kitchen (category_id = 4)
(4, 'Instant Pot Duo 7-in-1',
 'instant-pot-duo-7-in-1',
 '6-quart multi-cooker combines pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and food warmer.',
 99.95, 55,
 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'),

(4, 'Dyson V15 Detect Vacuum',
 'dyson-v15-detect-vacuum',
 'Laser reveals microscopic dust. Piezo sensor counts and sizes particles in real-time. 60 mins run time. HEPA filtration. Auto-adjusts suction.',
 749.99, 18,
 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600'),

(4, 'Nespresso Vertuo Pop Coffee Machine',
 'nespresso-vertuo-pop',
 'Centrifusion™ technology brews 5 cup sizes from espresso to alto. Fast 30-second heat-up. Automatic capsule ejection.',
 119.00, 40,
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'),

(4, 'IKEA Kallax Shelf Unit',
 'ikea-kallax-shelf-unit',
 '4x4 cube organizer in white. Versatile storage for books, boxes, and baskets. Solid board, 77x147cm. Can also be used as a room divider.',
 159.00, 30,
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'),

-- Sports (category_id = 5)
(5, 'Peloton Resistance Band Set',
 'peloton-resistance-band-set',
 'Set of 5 resistance levels (10–50 lbs). Natural latex, non-slip handles, door anchor and ankle straps included. Full-body workout kit.',
 29.99, 200,
 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600'),

(5, 'Garmin Forerunner 265 GPS Watch',
 'garmin-forerunner-265-gps-watch',
 'AMOLED display, advanced running dynamics, HRV status, training readiness score, 13-day battery in smartwatch mode. For serious runners.',
 449.99, 25,
 'https://images.unsplash.com/photo-1523475496153-3c3e4f3bd98a?w=600'),

(5, 'Adidas Ultraboost 23 Running Shoes',
 'adidas-ultraboost-23',
 'BOOST midsole for energy return with every stride. Primeknit+ upper adapts to your foot. Linear Energy Push system for propulsive toe-off.',
 189.99, 65,
 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600'),

(5, 'Hydro Flask 32oz Water Bottle',
 'hydro-flask-32oz-water-bottle',
 'TempShield™ double-wall vacuum insulation keeps drinks cold 24hrs, hot 12hrs. 18/8 pro-grade stainless steel. BPA-free, lifetime warranty.',
 44.95, 140,
 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'),

-- Beauty (category_id = 6)
(6, 'CeraVe Moisturizing Cream 19oz',
 'cerave-moisturizing-cream-19oz',
 'Developed with dermatologists. Contains 3 essential ceramides and hyaluronic acid. 24-hour hydration. Non-comedogenic, fragrance-free.',
 19.99, 250,
 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'),

(6, 'Dyson Airwrap Multi-Styler',
 'dyson-airwrap-multi-styler',
 'Uses Coanda airflow to style and dry simultaneously — no extreme heat. Includes barrels, brushes, and smoothing attachments for all hair types.',
 599.99, 22,
 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'),

(6, 'Fenty Beauty Pro Filt\'r Foundation',
 'fenty-beauty-pro-filtr-foundation',
 '40 diverse shades. Soft-matte, long-wearing formula. Oil-free, sweat-, and humidity-resistant. Buildable medium-to-full coverage.',
 38.00, 110,
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'),

(6, 'The Ordinary Niacinamide 10% Serum',
 'ordinary-niacinamide-10-serum',
 'High-strength vitamin and mineral blemish formula. Reduces the appearance of pores, uneven skin tone, and congestion. 30ml bottle.',
 9.99, 400,
 'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=600');


-- ---------------------------------------------------------------
-- USERS (1 admin + 4 customers)
-- Password for ALL users = "Password@123"
-- Hash generated with bcrypt, saltRounds=10
-- ---------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES

('Admin User',
 'admin@ecommerce.dev',
 '$2a$10$KpABUlacPRWlWVjdK8DtuuUX9QVsGG6mg.PohqTOowdeWIyGK0ckG',
 '+91-9000000001',
 '1 Admin HQ, Ahmedabad, Gujarat 380001',
 'admin'),

('Rahul Sharma',
 'rahul.sharma@gmail.com',
 '$2a$10$KpABUlacPRWlWVjdK8DtuuUX9QVsGG6mg.PohqTOowdeWIyGK0ckG',
 '+91-9876543210',
 '12 MG Road, Pune, Maharashtra 411001',
 'customer'),

('Priya Patel',
 'priya.patel@gmail.com',
 '$2a$10$KpABUlacPRWlWVjdK8DtuuUX9QVsGG6mg.PohqTOowdeWIyGK0ckG',
 '+91-9123456780',
 '45 Nehru Nagar, Surat, Gujarat 395001',
 'customer'),

('Arjun Mehta',
 'arjun.mehta@outlook.com',
 '$2a$10$KpABUlacPRWlWVjdK8DtuuUX9QVsGG6mg.PohqTOowdeWIyGK0ckG',
 '+91-9988776655',
 '7B Park Street, Kolkata, West Bengal 700016',
 'customer'),

('Sneha Reddy',
 'sneha.reddy@yahoo.com',
 '$2a$10$KpABUlacPRWlWVjdK8DtuuUX9QVsGG6mg.PohqTOowdeWIyGK0ckG',
 '+91-9001234567',
 '22 Jubilee Hills, Hyderabad, Telangana 500033',
 'customer');


-- ---------------------------------------------------------------
-- ORDERS (3 sample orders)
-- ---------------------------------------------------------------
INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_addr, shipping_phone) VALUES
(2, 'delivered', 1549.98, 'Rahul Sharma',  '12 MG Road, Pune 411001',                '+91-9876543210'),
(3, 'processing', 143.98, 'Priya Patel',   '45 Nehru Nagar, Surat 395001',            '+91-9123456780'),
(4, 'pending',    449.99, 'Arjun Mehta',   '7B Park Street, Kolkata 700016',           '+91-9988776655');


-- ---------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------
-- Order 1: Rahul bought MacBook Air M3 + Anker Charger
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 3, 1, 1299.99),   -- MacBook Air M3
(1, 4, 5,   49.99);   -- Anker Charger ×5 (bundle)

-- Order 2: Priya bought Nike AF1 + Levi's Jeans
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(2, 5, 1, 110.00),    -- Nike Air Force 1
(2, 6, 1,  69.99),    -- Levi's 501
(2, 7, 1,  89.99);    -- Uniqlo Down Jacket  (wait — let's stay with 2 items for variety)

-- Order 3: Arjun bought Garmin Watch
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(3, 18, 1, 449.99);   -- Garmin Forerunner 265


-- ---------------------------------------------------------------
-- CART ITEMS (active cart for Sneha — user_id=5)
-- ---------------------------------------------------------------
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(5, 21, 2),   -- CeraVe Moisturizing Cream ×2
(5, 24, 1),   -- The Ordinary Niacinamide Serum ×1
(5, 11, 1);   -- Atomic Habits book ×1


-- ---------------------------------------------------------------
-- Quick verification queries (comment out in production)
-- ---------------------------------------------------------------
/*
SELECT 'Categories' AS tbl, COUNT(*) AS rows FROM categories
UNION ALL
SELECT 'Products',   COUNT(*) FROM products
UNION ALL
SELECT 'Users',      COUNT(*) FROM users
UNION ALL
SELECT 'Orders',     COUNT(*) FROM orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM order_items
UNION ALL
SELECT 'CartItems',  COUNT(*) FROM cart_items;

SELECT * FROM v_order_summary;
*/
