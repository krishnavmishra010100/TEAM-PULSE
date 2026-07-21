const express = require('express');
const router = express.Router();
const { registerOrganization, loginUser } = require('./auth.controller');
// 1️⃣ Fix: Destructure 'authenticateToken' matching the export name
const { authenticateToken } = require('./auth.middleware');

// Public Routes
router.post('/signup', registerOrganization);
router.post('/login', loginUser);

// Protected Route
// 2️⃣ Fix: Use 'authenticateToken' here
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    message: "Access granted! You are authenticated.",
    user: req.user
  });
});

module.exports = router;