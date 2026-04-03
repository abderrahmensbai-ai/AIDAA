// ============================================================================
// ACTIVITY LOG MODEL
// ============================================================================
// Plain async functions for activity log database operations

const { query } = require('../config/db');

// ============================================================================
// Get all activity logs for a child
// ============================================================================
const getByChildId = async (childId) => {
  return await query(
    `SELECT al.*, c.title as content_title, c.type as content_type 
     FROM activity_logs al
     JOIN content c ON al.content_id = c.id
     WHERE al.child_id = ?
     ORDER BY al.date DESC`,
    [childId]
  );
};

// ============================================================================
// Create new activity log
// ============================================================================
const create = async (childId, contentId, status = 'started') => {
  const results = await query(
    'INSERT INTO activity_logs (child_id, content_id, status) VALUES (?, ?, ?)',
    [childId, contentId, status]
  );
  return results.insertId;
};

// ============================================================================
// Get activity log by ID
// ============================================================================
const getById = async (logId) => {
  const results = await query(
    'SELECT * FROM activity_logs WHERE id = ?',
    [logId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Update activity log status (e.g., started -> completed)
// ============================================================================
const updateStatus = async (logId, status) => {
  const results = await query(
    'UPDATE activity_logs SET status = ?, date = NOW() WHERE id = ?',
    [status, logId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getByChildId,
  create,
  getById,
  updateStatus,
};
