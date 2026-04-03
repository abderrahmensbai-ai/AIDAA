// ============================================================================
// AUTH CONTROLLER - auth.controller.js
// ============================================================================
// Handles all authentication workflows: login and first-time password setup
// Uses JWT for token generation and bcryptjs for password hashing
// Main flows:
//   1. Parent/Professional login: email + password → JWT token
//   2. First-time parent setup: email (no password) → user exists with NULL password
//   3. First-time password: userId + new password → hash + store → JWT token

// Import JWT library for token signing
const jwt = require('jsonwebtoken');
// Import bcryptjs for password hashing and comparison
const bcryptjs = require('bcryptjs');
// Import user model for database operations
const userModel = require('../models/user.model');

// ============================================================================
// LOGIN CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/login
// Purpose: Authenticate user with email and password
// Request body: { email, password }
// Response: 
//   Success with token: { success: true, token, user: {...} }
//   First-time password setup: { success: true, mustSetPassword: true, userId }
//   Error: { success: false, message: '...' }
const login = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Destructure email and password from request body
    const { email, password } = req.body;

    // ====================================================================
    // INPUT VALIDATION
    // ====================================================================
    // Check if email was provided
    if (!email) {
      // Return 400 (Bad Request) if email is missing
      return res.status(400).json({
        // Standard response format: success flag
        success: false,
        // User-friendly error message
        message: 'Email is required',
      });
    }

    // Check if password was provided
    if (!password) {
      // Return 400 (Bad Request) if password is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'Password is required',
      });
    }

    // ====================================================================
    // FIND USER IN DATABASE
    // ====================================================================
    // Query database for user with this email
    const user = await userModel.findByEmail(email);
    
    // Check if user exists
    if (!user) {
      // Return 401 (Unauthorized) - user not found
      return res.status(401).json({
        // Standard response format
        success: false,
        // Generic message for security (don't reveal if email exists)
        message: 'Invalid email or password',
      });
    }

    // ====================================================================
    // CHECK IF FIRST-TIME LOGIN (PASSWORD IS EMPTY OR NULL)
    // ====================================================================
    // For parent accounts created by admin, password is initially empty or NULL
    if (!user.password || user.password.trim() === '') {
      // Return 200 (OK) with flag indicating password setup needed
      return res.status(200).json({
        // Standard response format
        success: true,
        // Flag indicating user must set password first
        mustSetPassword: true,
        // User ID needed for setPassword endpoint
        userId: user.id,
        // Additional info for frontend
        message: 'Password not set. Please set your password first.',
      });
    }

    // ====================================================================
    // CHECK IF USER ACCOUNT IS ACTIVE
    // ====================================================================
    // Admin can deactivate accounts (is_active = 0)
    if (!user.is_active) {
      // Return 403 (Forbidden) - account is disabled
      return res.status(403).json({
        // Standard response format
        success: false,
        // Message explaining account is inactive
        message: 'Account is inactive. Contact administrator.',
      });
    }

    // ====================================================================
    // VERIFY PASSWORD WITH BCRYPT
    // ====================================================================
    // Compare provided password with stored bcrypt hash
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    
    // Check if password matches
    if (!isPasswordValid) {
      // Return 401 (Unauthorized) - password incorrect
      return res.status(401).json({
        // Standard response format
        success: false,
        // Generic message for security
        message: 'Invalid email or password',
      });
    }

    // ====================================================================
    // GENERATE JWT TOKEN
    // ====================================================================
    // Create JWT payload with non-sensitive user information
    // Payload includes: id, name, email, role
    const token = jwt.sign(
      // JWT payload object (stored in token and decoded on verification)
      {
        // User ID for database lookups
        id: user.id,
        // User's full name
        name: user.name,
        // User's email address
        email: user.email,
        // User's role: 'admin', 'parent', or 'professional'
        role: user.role,
      },
      // Secret key for signing (should be strong, from environment)
      process.env.JWT_SECRET,
      // Token expiration time from environment (e.g., '7d')
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================
    // Return 200 (OK) with token and user info
    res.status(200).json({
      // Standard response format
      success: true,
      // Message confirming successful login
      message: 'Login successful',
      // Response data object containing token and user info
      data: {
        // JWT token for Authorization header in future requests
        token,
        // User information for frontend
        user: {
          // User ID
          id: user.id,
          // User's full name
          name: user.name,
          // User's email
          email: user.email,
          // User's role for authorization
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Login error:', error);
    // Return 500 (Internal Server Error) with error details
    res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message
      message: 'Login failed',
      // Error details (only in development)
      error: error.message,
    });
  }
};

// ============================================================================
// SET PASSWORD CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/set-password
// Purpose: Set password for first-time user (parent with NULL password)
// Request body: { userId, password }
// Response: { success: true, token, user: {...} } or error
// Flow: Parent receives email → clicks link → this endpoint → password hashed → JWT returned
const setPassword = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Destructure userId and password from request body
    const { userId, password } = req.body;

    // ====================================================================
    // INPUT VALIDATION
    // ====================================================================
    // Check if userId was provided
    if (!userId) {
      // Return 400 (Bad Request) if userId is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'User ID is required',
      });
    }

    // Check if password was provided
    if (!password) {
      // Return 400 (Bad Request) if password is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'Password is required',
      });
    }

    // ====================================================================
    // VALIDATE PASSWORD STRENGTH
    // ====================================================================
    // Check minimum password length (OWASP recommendation: at least 8)
    // We use 6 as minimum for flexibility, but can be increased
    if (password.length < 6) {
      // Return 400 (Bad Request) if password is too short
      return res.status(400).json({
        // Standard response format
        success: false,
        // Message explaining password requirement
        message: 'Password must be at least 6 characters long',
      });
    }

    // ====================================================================
    // FIND USER IN DATABASE
    // ====================================================================
    // Query database for user with this ID
    const user = await userModel.findById(userId);
    
    // Check if user exists
    if (!user) {
      // Return 404 (Not Found) if user doesn't exist
      return res.status(404).json({
        // Standard response format
        success: false,
        // Message indicating user not found
        message: 'User not found',
      });
    }

    // ====================================================================
    // CHECK IF PASSWORD ALREADY SET
    // ====================================================================
    // Ensure user doesn't already have a password
    // (prevent overwriting existing password without proper verification)
    if (user.password) {
      // Return 400 (Bad Request) if password already set
      return res.status(400).json({
        // Standard response format
        success: false,
        // Message explaining password already exists
        message: 'Password already set. Use login endpoint instead.',
      });
    }

    // ====================================================================
    // HASH PASSWORD WITH BCRYPT
    // ====================================================================
    // Number of salt rounds (iterations) for bcrypt hashing
    // Higher = slower (more secure), lower = faster
    // 12 rounds provides strong security and reasonable performance
    const saltRounds = 12;
    
    // Generate bcrypt hash from plaintext password
    // bcryptjs.hash is async and CPU-intensive (computationally expensive)
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // ====================================================================
    // UPDATE USER PASSWORD IN DATABASE
    // ====================================================================
    // Call model function to store hashed password
    const updateSuccess = await userModel.setUserPassword(userId, hashedPassword);
    
    // Check if password update was successful
    if (!updateSuccess) {
      // Return 500 (Internal Server Error) if update failed
      return res.status(500).json({
        // Standard response format
        success: false,
        // Message indicating database operation failed
        message: 'Failed to set password',
      });
    }

    // ====================================================================
    // GENERATE JWT TOKEN
    // ====================================================================
    // Create JWT payload with non-sensitive user information
    const token = jwt.sign(
      // JWT payload object
      {
        // User ID for database lookups
        id: user.id,
        // User's full name
        name: user.name,
        // User's email address
        email: user.email,
        // User's role: 'admin', 'parent', or 'professional'
        role: user.role,
      },
      // Secret key for signing (from environment)
      process.env.JWT_SECRET,
      // Token expiration time (from environment)
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================
    // Return 200 (OK) with new token and user info
    res.status(200).json({
      // Standard response format
      success: true,
      // Message confirming password was set successfully
      message: 'Password set successfully',
      // Response data object containing token and user info
      data: {
        // JWT token for Authorization header in future requests
        token,
        // User information for frontend
        user: {
          // User ID
          id: user.id,
          // User's full name
          name: user.name,
          // User's email
          email: user.email,
          // User's role for authorization
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Set password error:', error);
    // Return 500 (Internal Server Error) with error details
    res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message
      message: 'Failed to set password',
      // Error details (only in development)
      error: error.message,
    });
  }
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export authentication controller functions
module.exports = {
  // User login with email and password
  login,
  // First-time password setup for new users
  setPassword,
};
