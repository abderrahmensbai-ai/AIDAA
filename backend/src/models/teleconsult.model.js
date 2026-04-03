// ============================================================================
// TELECONSULTATION MODEL
// ============================================================================
// Plain async functions for teleconsultation database operations

const { query } = require('../config/db');

// ============================================================================
// Get all teleconsultations for a user (parent or professional)
// ============================================================================
const getByUserId = async (userId, userRole) => {
  let sql;
  let params = [userId];

  if (userRole === 'parent') {
    sql = `SELECT t.*, u.name as professional_name, u.email as professional_email
           FROM teleconsultations t
           JOIN users u ON t.professional_id = u.id
           WHERE t.parent_id = ?
           ORDER BY t.date_time DESC`;
  } else if (userRole === 'professional') {
    sql = `SELECT t.*, u.name as parent_name, u.email as parent_email
           FROM teleconsultations t
           JOIN users u ON t.parent_id = u.id
           WHERE t.professional_id = ?
           ORDER BY t.date_time DESC`;
  } else {
    return [];
  }

  return await query(sql, params);
};

// ============================================================================
// Create new teleconsultation
// ============================================================================
const create = async (parentId, professionalId, date_time, meeting_link = null, notes = null) => {
  const results = await query(
    'INSERT INTO teleconsultations (parent_id, professional_id, date_time, meeting_link, notes) VALUES (?, ?, ?, ?, ?)',
    [parentId, professionalId, date_time, meeting_link, notes]
  );
  return results.insertId;
};

// ============================================================================
// Get teleconsultation by ID
// ============================================================================
const getById = async (consultationId) => {
  const results = await query(
    `SELECT t.*, p.name as parent_name, pr.name as professional_name
     FROM teleconsultations t
     JOIN users p ON t.parent_id = p.id
     JOIN users pr ON t.professional_id = pr.id
     WHERE t.id = ?`,
    [consultationId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Update teleconsultation
// ============================================================================
const update = async (consultationId, date_time, meeting_link, notes) => {
  const results = await query(
    'UPDATE teleconsultations SET date_time = ?, meeting_link = ?, notes = ? WHERE id = ?',
    [date_time, meeting_link, notes, consultationId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete teleconsultation
// ============================================================================
const deleteConsultation = async (consultationId) => {
  const results = await query(
    'DELETE FROM teleconsultations WHERE id = ?',
    [consultationId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getByUserId,
  create,
  getById,
  update,
  deleteConsultation,
};
