const express = require('express');
const router = express.Router();

const { createUpdate, getOrgUpdates, updateUpdate,
  deleteUpdate} = require('./update.controller');
const { authenticateToken } = require('./auth.middleware');

// Protected: Post a status update
router.post('/', authenticateToken, createUpdate);
// Protected: Get all status updates for user's organization
router.get('/', authenticateToken, getOrgUpdates);
router.put('/:id', authenticateToken, updateUpdate);
router.delete('/:id', authenticateToken, deleteUpdate);

module.exports = router;