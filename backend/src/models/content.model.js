// ============================================================================
// CONTENT MODEL
// ============================================================================
// Plain async functions for content database operations

const { query } = require('../config/db');

// ============================================================================
// Get all content with optional filters
// ============================================================================
const getAll = async (filters = {}) => {
  let sql = 'SELECT * FROM content WHERE 1=1';
  const params = [];

  // Filter by type (video or activity)
  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  // Filter by category
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  // Filter by age group
  if (filters.age_group) {
    sql += ' AND age_group = ?';
    params.push(filters.age_group);
  }

  // Filter by level
  if (filters.level) {
    sql += ' AND level = ?';
    params.push(filters.level);
  }

  sql += ' ORDER BY created_at DESC';

  return await query(sql, params);
};

// ============================================================================
// Get content by ID
// ============================================================================
const getById = async (contentId) => {
  const results = await query(
    'SELECT * FROM content WHERE id = ?',
    [contentId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Create new content
// ============================================================================
const create = async (title, type, category, age_group, level, url, description) => {
  const results = await query(
    'INSERT INTO content (title, type, category, age_group, level, url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, type, category, age_group, level, url, description]
  );
  return results.insertId;
};

// ============================================================================
// Update content
// ============================================================================
const update = async (contentId, title, type, category, age_group, level, url, description) => {
  const results = await query(
    'UPDATE content SET title = ?, type = ?, category = ?, age_group = ?, level = ?, url = ?, description = ? WHERE id = ?',
    [title, type, category, age_group, level, url, description, contentId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete content
// ============================================================================
const deleteContent = async (contentId) => {
  const results = await query(
    'DELETE FROM content WHERE id = ?',
    [contentId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteContent,
};
