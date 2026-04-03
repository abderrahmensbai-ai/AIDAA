// ============================================================================
// USER CONTROLLER - user.controller.js
// ============================================================================
// Handles user-related operations: creation, listing
// All endpoints require authentication and admin role

// Import bcryptjs for password hashing
const bcryptjs = require('bcryptjs');
// Import user model for database operations
const userModel = require('../models/user.model');

// ============================================================================
// EMAIL VALIDATION REGEX
// ============================================================================
// Simple email validation regex pattern
// Matches: something@something.something
// Note: For production, use a more robust email validation library
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// ROLES ENUM
// ============================================================================
// Valid user roles in the system
const VALID_ROLES = ['admin', 'parent', 'professional'];

// ============================================================================
// CREATE USER
// ============================================================================
// Endpoint: POST /api/users
// Access: Admin only (protected by auth + roleCheck('admin') middlewares)
// Purpose: Create a new user account with email and password
//
// Request body:
// {
//   "name": "Sara Ben Ali",
//   "email": "sara@example.com",
//   "password": "secret123",
//   "role": "parent"
// }
//
// Response (201 on success):
// {
//   "success": true,
//   "message": "User created successfully",
//   "data": {
//     "id": 5,
//     "name": "Sara Ben Ali",
//     "email": "sara@example.com",
//     "role": "parent",
//     "is_active": 1
//   }
// }
//
// Response (400 on validation error):
// {
//   "success": false,
//   "message": "Validation error message"
// }
//
// Response (409 if email exists):
// {
//   "success": false,
//   "message": "Email already exists"
// }
//
// Response (500 on server error):
// {
//   "success": false,
//   "message": "Failed to create user"
// }
const createUser = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Destructure request body
    const { name, email, password, role } = req.body;

    // ====================================================================
    // INPUT VALIDATION
    // ====================================================================

    // Validate name is provided and not empty
    if (!name || !name.trim()) {
      // Return 400 (Bad Request) if name is missing or empty
      return res.status(400).json({
        success: false,
        message: 'Name is required and cannot be empty',
      });
    }

    // Validate name is not too long (max 100 characters)
    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be less than 100 characters',
      });
    }

    // Validate email is provided
    if (!email || !email.trim()) {
      // Return 400 (Bad Request) if email is missing
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Validate email format using regex
    if (!EMAIL_REGEX.test(email.trim())) {
      // Return 400 (Bad Request) if email format is invalid
      return res.status(400).json({
        success: false,
        message: 'Email format is invalid',
      });
    }

    // Validate password is provided
    if (!password || !password.trim()) {
      // Return 400 (Bad Request) if password is missing
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Validate password is minimum 6 characters
    if (password.length < 6) {
      // Return 400 (Bad Request) if password is too short
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate role is provided
    if (!role) {
      // Return 400 (Bad Request) if role is missing
      return res.status(400).json({
        success: false,
        message: 'Role is required',
      });
    }

    // Validate role is one of the allowed values
    if (!VALID_ROLES.includes(role)) {
      // Return 400 (Bad Request) if role is invalid
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
      });
    }

    // ====================================================================
    // CHECK IF EMAIL ALREADY EXISTS
    // ====================================================================

    // Query database for existing user with same email
    const existingUser = await userModel.findByEmail(email.toLowerCase());

    // If user found, email already exists in database
    if (existingUser) {
      // Return 409 (Conflict) if email already exists
      return res.status(409).json({
        success: false,
        message: 'Email already exists in the system',
      });
    }

    // ====================================================================
    // HASH PASSWORD WITH BCRYPTJS
    // ====================================================================

    // Number of salt rounds for bcrypt hashing
    // Higher rounds = more secure but slower
    // 12 rounds provides strong security with reasonable performance
    const saltRounds = 12;

    // Hash the password asynchronously using bcryptjs
    // This is computationally expensive (intentional for security)
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    console.log('[user.controller] Password hashed with', saltRounds, 'salt rounds');

    // ====================================================================
    // INSERT USER INTO DATABASE
    // ====================================================================

    // Call user model createUserWithPassword function with hashed password
    const newUser = await userModel.createUserWithPassword(
      // User object with all required fields
      {
        // User's full name (trimmed to remove extra spaces)
        name: name.trim(),
        // User's email (converted to lowercase for consistency)
        email: email.toLowerCase(),
        // Bcrypt hashed password (NOT plaintext)
        hashedPassword,
        // User role: admin, parent, or professional
        role,
      }
    );

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================

    // Log successful user creation
    console.log('[user.controller] User created successfully:', newUser.id, newUser.email);

    // Return 201 (Created) with newly created user data
    return res.status(201).json({
      // Standard response format
      success: true,
      // User-friendly message
      message: 'User created successfully',
      // Response data: newly created user object (WITHOUT password for security)
      data: newUser,
    });

    // Note: The newUser object returned by model should NOT include password field
  } catch (error) {
    // Catch any unexpected errors
    console.error('[user.controller] Error in createUser:', error);

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message (don't expose internal details to client)
      message: 'Failed to create user',
      // Error details (only in development, remove in production)
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================================================
// GET ALL USERS
// ============================================================================
// Endpoint: GET /api/users
// Access: Admin only (protected by auth + roleCheck('admin') middlewares)
// Purpose: Retrieve all users in the system
//
// Query parameters (optional):
// - role: filter by role ('admin', 'parent', 'professional')
// - is_active: filter by active status (1 or 0)
//
// Response (200 on success):
// {
//   "success": true,
//   "message": "Users retrieved successfully",
//   "data": [
//     {
//       "id": 1,
//       "name": "Admin User",
//       "email": "admin@aidaa.com",
//       "role": "admin",
//       "is_active": 1
//     },
//     {
//       "id": 2,
//       "name": "Sara Ben Ali",
//       "email": "sara@example.com",
//       "role": "parent",
//       "is_active": 1
//     }
//   ]
// }
//
// Response (500 on error):
// {
//   "success": false,
//   "message": "Failed to retrieve users"
// }
const getAllUsers = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Retrieve all users from database
    const users = await userModel.getAllUsers();

    // ====================================================================
    // OPTIONAL: FILTER RESULTS BY QUERY PARAMETERS
    // ====================================================================
    // Note: For better performance, filtering should be done in the model/SQL query
    // This is a simple example filtering in the application layer

    let filteredUsers = users;

    // If role filter is provided in query params
    if (req.query.role) {
      // Filter users by role
      filteredUsers = filteredUsers.filter(user => user.role === req.query.role);
    }

    // If is_active filter is provided in query params
    if (req.query.is_active !== undefined) {
      // Convert string to number and filter by active status
      const isActive = req.query.is_active === '1' || req.query.is_active === 'true' ? 1 : 0;
      filteredUsers = filteredUsers.filter(user => user.is_active === isActive);
    }

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================

    // Log successful retrieval
    console.log('[user.controller] Retrieved', filteredUsers.length, 'users');

    // Return 200 (OK) with users array
    return res.status(200).json({
      // Standard response format
      success: true,
      // User-friendly message
      message: 'Users retrieved successfully',
      // Response data: array of user objects (without password fields)
      data: filteredUsers,
      // Additional metadata
      count: filteredUsers.length,
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('[user.controller] Error in getAllUsers:', error);

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message
      message: 'Failed to retrieve users',
      // Error details (only in development)
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export all user controller functions
module.exports = {
  // Create new user endpoint
  createUser,
  // Get all users endpoint
  getAllUsers,
};
