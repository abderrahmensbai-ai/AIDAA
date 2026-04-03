// ============================================================================
// PROFESSIONAL PAGE
// ============================================================================
// Dashboard for professional users to manage consultations and notes

import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

export const ProfessionalPage = (): JSX.Element => {
  // Get current user from useAuth hook
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Professional Portal</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>This is the professional portal.</p>
        <p>Professional tools:</p>
        <ul>
          <li>View assigned cases</li>
          <li>Schedule consultations</li>
          <li>Write observations and notes</li>
          <li>Review child progress</li>
          <li>Communicate with parents</li>
        </ul>
      </div>
    </div>
  );
};
