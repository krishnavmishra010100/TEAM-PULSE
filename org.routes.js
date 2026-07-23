const express = require('express');
const router = express.Router();

// 1. Imports
const orgController = require('./org.controller');
const authMiddleware = require('./auth.middleware');
const roleMiddleware = require('./roleMiddleware');

// Destructure imports safely
const getMembers = orgController.getMembers;
const inviteMember = orgController.inviteMember;
const updateMemberRole = orgController.updateMemberRole;
const removeMember = orgController.removeMember;

const authenticateToken = authMiddleware.authenticateToken || authMiddleware;
const requireAdmin = roleMiddleware.requireAdmin || roleMiddleware;

// 2. Debug logs to locate any undefined import
console.log('--- Checking Imports in org.routes.js ---');
console.log('getMembers:', typeof getMembers);
console.log('inviteMember:', typeof inviteMember);
console.log('updateMemberRole:', typeof updateMemberRole);
console.log('removeMember:', typeof removeMember);
console.log('authenticateToken:', typeof authenticateToken);
console.log('requireAdmin:', typeof requireAdmin);
console.log('-----------------------------------------');

// 3. Register Routes safely
if (typeof authenticateToken === 'function' && typeof requireAdmin === 'function') {
  if (typeof getMembers === 'function') {
    router.get('/team', authenticateToken, requireAdmin, getMembers);
    router.get('/members', authenticateToken, requireAdmin, getMembers);
  }
  
  if (typeof inviteMember === 'function') {
    router.post('/invite', authenticateToken, requireAdmin, inviteMember);
  }

  if (typeof updateMemberRole === 'function') {
    router.put('/team/:userId/role', authenticateToken, requireAdmin, updateMemberRole);
  }

  if (typeof removeMember === 'function') {
    router.delete('/team/:userId', authenticateToken, requireAdmin, removeMember);
  }
} else {
  console.error('CRITICAL: authenticateToken or requireAdmin middleware is missing/not a function!');
}

module.exports = router;