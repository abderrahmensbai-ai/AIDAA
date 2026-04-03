// ============================================================================
// ROLE CHECK MIDDLEWARE - roleCheck.js
// ============================================================================
// Role-based access control middleware factory
// Purpose: Create middleware to verify user has required role(s)
// Usage: roleCheck('admin') or roleCheck('parent', 'professional')
// Returns: Middleware function that checks req.user.role against allowed roles
// Must be used AFTER auth middleware (which sets req.user)

// ============================================================================
// ROLE CHECK FACTORY FUNCTION
// ============================================================================
// Function: roleCheck(...roles)
// Purpose: Factory function that creates a middleware with specific roles
// Parameters: ...roles (spread operator) - allowed roles as arguments
//   Example: roleCheck('admin') - only admins allowed
//   Example: roleCheck('parent', 'professional') - parents or professionals
// Returns: Middleware function that performs the actual role check
// Pattern: Higher-order function (function returning a function)
const roleCheck = (...allowedRoles) => {
  // ====================================================================
  // RETURN MIDDLEWARE FUNCTION
  // ====================================================================
  // Return the actual middleware function that Express will call
  // This function has access to allowedRoles via closure (captured from parent scope)
  return (req, res, next) => {
    // Wrap in try-catch for error handling
    try {
      // ================================================================
      // CHECK IF USER IS AUTHENTICATED (req.user EXISTS)
      // ================================================================
      // Verify that auth middleware ran and set req.user
      // If auth middleware didn't run, req.user will be undefined
      if (!req.user) {
        // Return 401 (Unauthorized) if user info is missing
        return res.status(401).json({
          // Standard response format
          success: false,
          // Message indicating user needs to authenticate first
          message: 'User not authenticated',
        });
      }

      // ================================================================
      // CHECK IF USER'S ROLE IS IN ALLOWED ROLES
      // ================================================================
      // Use Array.includes() to check if req.user.role is in allowedRoles
      // req.user.role: 'admin', 'parent', or 'professional'
      // allowedRoles: array passed to roleCheck() factory function
      if (!allowedRoles.includes(req.user.role)) {
        // Return 403 (Forbidden) if user's role is not allowed
        return res.status(403).json({
          // Standard response format
          success: false,
          // Message explaining required roles (useful for debugging)
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        });
      }

      // ================================================================
      // ROLE CHECK PASSED
      // ================================================================
      // User is authenticated and has required role
      // Call next() to pass control to route handler
      next();
    } catch (error) {
      // ================================================================
      // ERROR HANDLING
      // ================================================================
      // Catch any unexpected errors during role checking
      // Return 500 (Internal Server Error) with error details
      return res.status(500).json({
        // Standard response format
        success: false,
        // Message indicating an unexpected error occurred
        message: 'Error checking role',
        // Error details for debugging
        error: error.message,
      });
    }
  };
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export the roleCheck factory function
// Usage in routes: router.post('/admin', roleCheck('admin'), handler)
module.exports = roleCheck;
