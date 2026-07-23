const express = require('express');
const router = express.Router();

// Controllers
const { 
  getMembers, 
  inviteMember, 
  updateMemberRole, 
  removeMember 
} = require('./org.controller');

// Middlewares
const authMiddleware = require('./auth.middleware');
const roleMiddleware = require('./roleMiddleware');

// Handle both named and default export patterns smoothly
const authenticateToken = authMiddleware.authenticateToken || authMiddleware;
const requireAdmin = roleMiddleware.requireAdmin || roleMiddleware;

// Protect all org management routes with token authentication
router.use(authenticateToken);

// --- Routes ---
// Fetch Team Members (Supports both /team and /members)
router.get('/team', requireAdmin, getMembers);
router.get('/members', requireAdmin, getMembers);

// Invite/Add User to Org
router.post('/invite', requireAdmin, inviteMember);

// Change Member Role
router.put('/team/:userId/role', requireAdmin, updateMemberRole);

// Remove Member from Org
router.delete('/team/:userId', requireAdmin, removeMember);

module.exports = router;