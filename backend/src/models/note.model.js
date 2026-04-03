// ============================================================================
// NOTE MODEL
// ============================================================================
// Plain async functions for professional notes database operations

const { query } = require('../config/db');

// ============================================================================
// Get all notes for a child
// ============================================================================
const getByChildId = async (childId) => {
  return await query(
    `SELECT n.*, u.name as professional_name
     FROM notes n
     JOIN users u ON n.professional_id = u.id
     WHERE n.child_id = ?
     ORDER BY n.date DESC`,
    [childId]
  );
};

// ============================================================================
// Create new note
// ============================================================================
const create = async (professionalId, childId, content) => {
  const results = await query(
    'INSERT INTO notes (professional_id, child_id, content) VALUES (?, ?, ?)',
    [professionalId, childId, content]
  );
  return results.insertId;
};

// ============================================================================
// Get note by ID
// ============================================================================
const getById = async (noteId) => {
  const results = await query(
    `SELECT n.*, u.name as professional_name
     FROM notes n
     JOIN users u ON n.professional_id = u.id
     WHERE n.id = ?`,
    [noteId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Update note content
// ============================================================================
const update = async (noteId, content) => {
  const results = await query(
    'UPDATE notes SET content = ?, date = NOW() WHERE id = ?',
    [content, noteId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete note
// ============================================================================
const deleteNote = async (noteId) => {
  const results = await query(
    'DELETE FROM notes WHERE id = ?',
    [noteId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getByChildId,
  create,
  getById,
  update,
  deleteNote,
};
