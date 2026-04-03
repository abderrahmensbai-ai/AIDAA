// ============================================================================
// ADMIN PANEL PAGE
// ============================================================================
// Dashboard for admin users to manage the system

import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

export const AdminPanel = (): JSX.Element => {
  // Get current user from useAuth hook
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Panel</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>This is the admin panel.</p>
        <p>Admin capabilities:</p>
        <ul>
          <li>Manage user accounts</li>
          <li>Create and edit educational content</li>
          <li>Monitor system activity</li>
          <li>Manage professional accounts</li>
          <li>Generate reports</li>
        </ul>
      </div>
    </div>
  );
};
