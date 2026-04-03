// ============================================================================
// PARENT DASHBOARD PAGE
// ============================================================================
// Dashboard for parent users to manage their children and content

import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

export const ParentDashboard = (): JSX.Element => {
  // Get current user from useAuth hook
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Parent Dashboard</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>This is the parent dashboard.</p>
        <p>Here you can:</p>
        <ul>
          <li>Manage your children</li>
          <li>Browse educational content</li>
          <li>Track your children's progress</li>
          <li>Schedule consultations with professionals</li>
        </ul>
      </div>
    </div>
  );
};
