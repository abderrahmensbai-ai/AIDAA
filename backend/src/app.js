// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================
// Main application configuration, middleware setup, and route mounting

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ============================================================================
// Import routes
// ============================================================================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const childRoutes = require('./routes/child.routes');
const contentRoutes = require('./routes/content.routes');
const activityLogRoutes = require('./routes/activityLog.routes');
const noteRoutes = require('./routes/note.routes');
const teleconsultRoutes = require('./routes/teleconsult.routes');
const adminRoutes = require('./routes/admin.routes');

// ============================================================================
// Import middlewares
// ============================================================================
const errorHandler = require('./middlewares/errorHandler');

// ============================================================================
// Create Express app
// ============================================================================
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// JSON middleware
app.use(express.json());

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/child', childRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/note', noteRoutes);
app.use('/api/teleconsult', teleconsultRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================================
// 404 Error Handler
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================================================
// Global Error Handler (MUST be last middleware)
// ============================================================================
app.use(errorHandler);

module.exports = app;
