const express = require('express');
const router = express.Router();
const { registerOrganization, loginUser } = require('./auth.controller');
const authenticate = require('./auth.middleware');

// Public Routes
router.post('/signup', registerOrganization);
router.post('/login', loginUser);

// Protected Route
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: "Access granted! You are authenticated.",
    user: req.user
  });
});

module.exports = router;
