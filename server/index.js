/**
 * SecureShield - Main Server Entry Point
 * Express API Gateway with integrated WAF, rate limiting, and security dashboard API.
 * 
 * Architecture:
 *   Client Request → WAF Middleware → Rate Limiter → Blacklist Check → Route Handler
 *                         ↓ (if malicious)
 *                    403 Blocked + Attack Logged
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const wafMiddleware = require('./middleware/waf');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// ----- Core Middleware -----
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: false, // Allow dashboard to load
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// ----- Dashboard API (exempt from WAF to prevent self-blocking) -----
app.use('/api/dashboard', dashboardRoutes);

// ----- Health Check (exempt from WAF) -----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'SecureShield API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ----- WAF Middleware (applied to all other routes) -----
app.use(wafMiddleware);

// ----- Protected API Routes -----
app.use('/api', apiRoutes);

// ----- Catch-all for undefined routes -----
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    hint: 'Available endpoints: /api/users, /api/login, /api/search, /api/data, /api/comment, /api/file',
  });
});

// ----- Error Handler -----
app.use((err, req, res, next) => {
  console.error('[SecureShield Error]', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   🛡️  SecureShield API Gateway & WAF                  ║
  ║                                                      ║
  ║   Server:     http://localhost:${PORT}                 ║
  ║   Dashboard:  http://localhost:5173                  ║
  ║   Health:     http://localhost:${PORT}/api/health      ║
  ║                                                      ║
  ║   WAF Engine:  ✅ Active                              ║
  ║   Rate Limit:  ✅ 30 req/min per IP                   ║
  ║   Blacklist:   ✅ Enabled                             ║
  ║   Detection:   SQLi | XSS | Path Traversal | CmdInj ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
