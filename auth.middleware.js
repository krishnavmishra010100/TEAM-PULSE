const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
exports.authenticateToken = (req, res, next) => {
  // Read Authorization header (Express auto-lowercases header names)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Access token missing.' });
  }

  const secret = process.env.JWT_SECRET || 'your_fallback_secret_key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach { id, role, organizationId } to req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to enforce specific user roles (e.g., requireRole('ADMIN'))
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        message: 'Forbidden: User role not found in request token.' 
      });
    }

    // Convert both to uppercase to prevent case mismatches ('ADMIN' vs 'admin')
    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to perform this action.' 
      });
    }

    next();
  };
};