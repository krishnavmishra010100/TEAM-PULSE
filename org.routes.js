const express = require('express');
const router = express.Router();
const { getMembers, inviteMember } = require('./org.controller');
const { authenticateToken, requireRole } = require('./auth.middleware');

// Protected: Any logged-in member can view org members
router.get('/members', authenticateToken, getMembers);

// Protected: Only admins can invite new members
router.post('/invite', authenticateToken, requireRole('admin'), inviteMember);

module.exports = router;