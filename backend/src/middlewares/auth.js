// ============================================================================
// AUTH MIDDLEWARE - auth.js
// ============================================================================
// JWT token verification middleware
// Purpose: Validate JWT token from Authorization header, attach user info to request
// Usage: Add to protected routes with app.use(auth) or router.use(auth)
// Expected header: "Authorization: Bearer <jwt_token>"
// On success: Sets req.user = { id, name, email, role }
// On failure: Returns 401 Unauthorized error

// Import JWT library for token verification
const jwt = require('jsonwebtoken');

// ============================================================================
// AUTH MIDDLEWARE FUNCTION
// ============================================================================
// Function: auth(req, res, next)
// Purpose: Middleware to verify JWT token and attach user to request
// Parameters:
//   - req: Express request object
//   - res: Express response object
//   - next: Express next() function to pass control to next middleware
// Returns: void (calls next() on success or sends error response)
const auth = (req, res, next) => {
  // Wrap in try-catch for error handling
  try {
    // ====================================================================
    // EXTRACT AUTHORIZATION HEADER
    // ====================================================================
    // Get Authorization header from request headers
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // ====================================================================
    // VALIDATE AUTHORIZATION HEADER EXISTS AND HAS CORRECT FORMAT
    // ====================================================================
    // Check if Authorization header is present
    if (!authHeader) {
      // Return 401 (Unauthorized) if header is missing
      return res.status(401).json({
        // Standard response format: success flag
        success: false,
        // Error message explaining missing token
        message: 'No token provided',
      });
    }

    // Check if header starts with "Bearer " (case-sensitive)
    if (!authHeader.startsWith('Bearer ')) {
      // Return 401 (Unauthorized) if format is incorrect
      return res.status(401).json({
        // Standard response format
        success: false,
        // Error message explaining invalid format
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
    }

    // ====================================================================
    // EXTRACT TOKEN FROM HEADER
    // ====================================================================
    // Remove "Bearer " prefix (7 characters) to get the actual token
    // "Bearer " is 7 chars: B-e-a-r-e-r-[space]
    const token = authHeader.slice(7);

    // ====================================================================
    // VERIFY JWT TOKEN
    // ====================================================================
    // Verify token signature and expiration using JWT secret
    // If token is valid, decoded will contain the payload
    // If token is invalid/expired, jwt.verify will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ====================================================================
    // ATTACH DECODED USER TO REQUEST OBJECT
    // ====================================================================
    // Set req.user to the decoded JWT payload
    // Payload contains: { id, name, email, role }
    // This makes user info available to route handlers and next middlewares
    req.user = decoded;

    // ====================================================================
    // CALL NEXT MIDDLEWARE
    // ====================================================================
    // Pass control to next middleware or route handler
    next();
  } catch (error) {
    // ====================================================================
    // ERROR HANDLING
    // ====================================================================
    // Catch any errors from token verification (invalid, expired, malformed)
    // Common errors:
    //   - JsonWebTokenError: token is malformed or signature is invalid
    //   - TokenExpiredError: token has expired
    //   - NotBeforeError: token used before valid
    
    // Return 401 (Unauthorized) with error details
    return res.status(401).json({
      // Standard response format
      success: false,
      // User-friendly error message
      message: 'Invalid or expired token',
      // Error details (type of JWT error)
      error: error.message,
    });
  }
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export the middleware function for use in route files
module.exports = auth;
