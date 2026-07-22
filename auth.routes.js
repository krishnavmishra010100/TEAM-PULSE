const express = require('express');
const router = express.Router();

// Import joinOrg alongside registerOrganization and loginUser
const { registerOrganization, loginUser, joinOrg } = require('./auth.controller');
const { authenticateToken } = require('./auth.middleware');

// Public Auth Routes
router.post('/signup-org', registerOrganization);
router.post('/signup', registerOrganization); // Supports both /signup and /signup-org
router.post('/login', loginUser);
router.post('/join-org', joinOrg); 

// Protected Route Test
router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

module.exports = router;