const jwt = require('jsonwebtoken');

/**
 * authMiddleware — verifies the JWT in the Authorization header.
 * Attaches decoded payload as req.user = { id, email, role }.
 * Returns 401 if the token is missing, malformed, or expired.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error  : true,
      message: 'Access denied. No token provided.',
      code   : 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error  : true,
      message: expired ? 'Session expired. Please login again.' : 'Invalid token.',
      code   : expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }
};

/**
 * isAdmin — secondary middleware that validates if the user is an admin.
 * Assumes authMiddleware has run and populated req.user.
 * Returns 403 Forbidden if the user is not an admin.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error  : true,
      message: 'Access denied. Administrator privileges required.',
      code   : 'FORBIDDEN'
    });
  }
  next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.isAdmin = isAdmin;
