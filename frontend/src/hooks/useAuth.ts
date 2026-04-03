// ============================================================================
// USE AUTH HOOK
// ============================================================================
// Custom React hook for accessing authentication state and functions
// Initializes from localStorage to persist auth across page refreshes

import { useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types';
import * as authService from '../services/auth.service';

// ============================================================================
// USE AUTH HOOK INTERFACE
// ============================================================================
// Type definition for what useAuth returns
interface UseAuthReturn {
  // Currently authenticated user (null if not logged in)
  user: User | null;
  // JWT token for API requests (null if not logged in)
  token: string | null;
  // Whether user is authenticated
  isAuthenticated: boolean;
  // Login function with email and password
  login: (email: string, password: string) => Promise<LoginResponse>;
  // Set password for first-time users
  setPassword: (userId: number, password: string) => Promise<User>;
  // Logout function
  logout: () => void;
  // Loading state (true while login/setPassword is in progress)
  isLoading: boolean;
}

// ============================================================================
// USE AUTH HOOK
// ============================================================================
// Main hook for authentication throughout the app
export const useAuth = (): UseAuthReturn => {
  // State to store currently authenticated user
  const [user, setUser] = useState<User | null>(null);

  // State to store JWT token
  const [token, setToken] = useState<string | null>(null);

  // State to track if authentication operations are in progress
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ========================================================================
  // INITIALIZE AUTH STATE FROM LOCALSTORAGE (RUNS ONCE ON MOUNT)
  // ========================================================================
  // This effect runs once when component mounts to restore auth from storage
  useEffect(() => {
    // Get user and token from localStorage
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getCurrentToken();

    // Update state with stored values
    if (storedUser) {
      setUser(storedUser);
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // Empty dependency array = run only on mount

  // ========================================================================
  // LOGIN FUNCTION
  // ========================================================================
  // Handles login request and updates auth state
  const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
    // Set loading state to indicate operation is in progress
    setIsLoading(true);
    console.log('[useAuth] handleLogin called with email:', email);

    try {
      // Call auth service login function
      const response = await authService.login(email, password);
      console.log('[useAuth] authService.login returned:', response);

      // If first-time login (no password set), don't update state yet
      // User will set password first
      if (response.mustSetPassword) {
        console.log('[useAuth] First-time login detected');
        return response;
      }

      // For successful login with existing password:
      // Extract token and user from response
      if ('data' in response && response.data.token && response.data.user) {
        console.log('[useAuth] Login successful, updating state:', {
          token: response.data.token.substring(0, 20) + '...',
          user: response.data.user,
        });
        
        // Update token state
        setToken(response.data.token);

        // Update user state
        setUser(response.data.user);
        
        console.log('[useAuth] State updated, returning response');
      } else {
        console.warn('[useAuth] Login response missing data:', response);
      }

      // Return response for caller to handle
      console.log('[useAuth] handleLogin returning successfully');
      return response;
    } catch (loginError) {
      console.error('[useAuth] handleLogin error:', loginError);
      throw loginError;
    } finally {
      // Always clear loading state, whether success or error
      console.log('[useAuth] handleLogin finally block, setting isLoading to false');
      setIsLoading(false);
    }
  };

  // ========================================================================
  // SET PASSWORD FUNCTION
  // ========================================================================
  // Sets password for first-time users
  const handleSetPassword = async (userId: number, password: string): Promise<User> => {
    // Set loading state to indicate operation is in progress
    setIsLoading(true);

    try {
      // Call auth service setPassword function
      const user = await authService.setPassword(userId, password);

      // Update user state with returned user object
      setUser(user);

      // Update token state from localStorage (was set by service)
      const token = authService.getCurrentToken();
      if (token) {
        setToken(token);
      }

      // Return user for caller to handle
      return user;
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  };

  // ========================================================================
  // LOGOUT FUNCTION
  // ========================================================================
  // Clears auth state and localStorage
  const handleLogout = (): void => {
    // Call auth service logout to clear localStorage
    authService.logout();

    // Clear user state
    setUser(null);

    // Clear token state
    setToken(null);
  };

  // ========================================================================
  // RETURN HOOK VALUES
  // ========================================================================
  // Return all auth state and functions for components to use
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login: handleLogin,
    setPassword: handleSetPassword,
    logout: handleLogout,
    isLoading,
  };
};
