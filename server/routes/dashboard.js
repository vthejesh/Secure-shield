/**
 * SecureShield - Dashboard API Routes
 * Provides endpoints for the React security dashboard to fetch real-time data.
 */

const express = require('express');
const router = express.Router();
const store = require('../utils/store');

// GET /api/dashboard/stats - Overall security statistics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: store.getStats(),
  });
});

// GET /api/dashboard/attacks - Recent attack logs
router.get('/attacks', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    success: true,
    data: store.getRecentAttacks(limit),
  });
});

// GET /api/dashboard/traffic - Traffic history
router.get('/traffic', (req, res) => {
  res.json({
    success: true,
    data: store.getTrafficHistory(),
  });
});

// GET /api/dashboard/distribution - Attack type distribution
router.get('/distribution', (req, res) => {
  res.json({
    success: true,
    data: store.getAttackDistribution(),
  });
});

// GET /api/dashboard/blacklist - Get blacklisted IPs
router.get('/blacklist', (req, res) => {
  res.json({
    success: true,
    data: store.getBlacklist(),
  });
});

// POST /api/dashboard/blacklist - Add IP to blacklist
router.post('/blacklist', (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) {
    return res.status(400).json({ success: false, message: 'IP address is required' });
  }
  const result = store.addToBlacklist(ip, reason || 'Manual block');
  res.json({ success: true, data: result });
});

// DELETE /api/dashboard/blacklist/:ip - Remove IP from blacklist
router.delete('/blacklist/:ip', (req, res) => {
  const removed = store.removeFromBlacklist(req.params.ip);
  res.json({
    success: true,
    removed,
    message: removed ? `Removed ${req.params.ip} from blacklist` : 'IP was not blacklisted',
  });
});

module.exports = router;
