const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

/** Helper: sign a JWT token */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/register ──────────────────────────────────
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    // Field validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: true, code: 'VALIDATION_ERROR',
        message: 'full_name, email, and password are required.'
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: true, code: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters.'
      });
    }

    // Duplicate email check
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        error: true, code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.'
      });
    }

    // Hash password (saltRounds = 10)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email.toLowerCase(), password_hash, phone || null, address || null]
    );

    const user  = { id: result.insertId, full_name, email: email.toLowerCase(), role: 'customer' };
    const token = signToken(user);

    return res.status(201).json({
      error: false,
      message: 'Account created successfully.',
      data: { token, user }
    });
  } catch (err) {
    console.error('[authController.register]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true, code: 'VALIDATION_ERROR',
        message: 'Email and password are required.'
      });
    }

    const [rows] = await db.query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Generic message prevents email enumeration attacks
    if (rows.length === 0) {
      return res.status(401).json({
        error: true, code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const user    = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        error: true, code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const token    = signToken(user);
    const safeUser = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };

    return res.status(200).json({
      error: false,
      message: 'Login successful.',
      data: { token, user: safeUser }
    });
  } catch (err) {
    console.error('[authController.login]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

module.exports = { register, login };
