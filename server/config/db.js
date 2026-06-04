const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL connection pool using mysql2/promise.
 * Pool size of 10 is suitable for small-to-medium load.
 * All queries use parameterized placeholders (?) — SQL injection safe.
 */
const pool = mysql.createPool({
  host              : process.env.DB_HOST     || 'localhost',
  port              : parseInt(process.env.DB_PORT || '3306'),
  user              : process.env.DB_USER     || 'root',
  password          : process.env.DB_PASSWORD || '',
  database          : process.env.DB_NAME     || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
  charset           : 'utf8mb4',
  timezone          : '+00:00'
});

module.exports = pool;
