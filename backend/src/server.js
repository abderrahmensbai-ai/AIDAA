// ============================================================================
// SERVER STARTUP
// ============================================================================
// Entry point for the application

const app = require('./app');
require('dotenv').config();

// ============================================================================
// Get port from environment or use default
// ============================================================================
const PORT = process.env.PORT || 5000;

// ============================================================================
// Start server
// ============================================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           AIDAA Backend Server Started                          ║');
  console.log(`║           Running on: http://localhost:${PORT}${' '.repeat(Math.max(0, 30 - PORT.toString().length))}║`);
  console.log('║           Environment: ' + (process.env.NODE_ENV || 'development').toUpperCase() + ' '.repeat(Math.max(0, 37 - (process.env.NODE_ENV || 'development').length)) + '║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
});

// ============================================================================
// Handle uncaught exceptions
// ============================================================================
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
