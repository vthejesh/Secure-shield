/**
 * SecureShield - Sample Protected API Routes
 * These simulate a real application's API endpoints that the WAF protects.
 */

const express = require('express');
const router = express.Router();

// GET /api/users - Sample users endpoint
router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Alice Johnson', role: 'Admin' },
      { id: 2, name: 'Bob Smith', role: 'User' },
      { id: 3, name: 'Charlie Brown', role: 'Moderator' },
    ],
  });
});

// POST /api/login - Sample login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  // Simulated auth (WAF would have already blocked any injection attempts)
  if (username === 'admin' && password === 'securepass123') {
    return res.json({ success: true, token: 'mock-jwt-token-xyz', user: { username, role: 'admin' } });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// GET /api/data - Sample data endpoint with query params
router.get('/data', (req, res) => {
  res.json({
    success: true,
    data: {
      records: 1250,
      lastUpdated: new Date().toISOString(),
      status: 'healthy',
    },
  });
});

// GET /api/search - Sample search (common SQLi target)
router.get('/search', (req, res) => {
  const { q } = req.query;
  res.json({
    success: true,
    query: q || '',
    results: [
      { id: 1, title: 'Security Best Practices', category: 'Guide' },
      { id: 2, title: 'OWASP Top 10 Overview', category: 'Reference' },
    ],
  });
});

// POST /api/comment - Sample comment endpoint (common XSS target)
router.post('/comment', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Comment text required' });
  }
  res.json({
    success: true,
    comment: { id: Date.now(), text, author: 'Anonymous', createdAt: new Date().toISOString() },
  });
});

// GET /api/file - Sample file download (common path traversal target)
router.get('/file', (req, res) => {
  const { name } = req.query;
  res.json({
    success: true,
    file: { name: name || 'report.pdf', size: '2.4MB', downloadUrl: '/downloads/report.pdf' },
  });
});

module.exports = router;
