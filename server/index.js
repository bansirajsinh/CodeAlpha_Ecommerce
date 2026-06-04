require('dotenv').config();
const app  = require('./app');
const db   = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection before accepting requests
    const conn = await db.getConnection();
    console.log('✅  MySQL connected successfully');
    conn.release();

    app.listen(PORT, () => {
      console.log(`🚀  Server → http://localhost:${PORT}`);
      console.log(`📁  ENV    → ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
