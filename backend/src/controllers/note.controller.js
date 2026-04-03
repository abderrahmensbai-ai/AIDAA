// ============================================================================
// NOTE CONTROLLER
// ============================================================================
// Handles professional notes about children's progress

const noteModel = require('../models/note.model');
const childModel = require('../models/child.model');

// ============================================================================
// Get all notes for a child
// ============================================================================
// GET /note/child/:childId
const getByChildId = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child exists
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check permissions: parent owns child or user is professional/admin
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const notes = await noteModel.getByChildId(childId);

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes',
      error: error.message,
    });
  }
};

// ============================================================================
// Create new note (professional only)
// ============================================================================
// POST /note
// Body: { childId, content }
const create = async (req, res) => {
  try {
    const { childId, content } = req.body;
    const professionalId = req.user.id;

    // Validate input
    if (!childId || !content) {
      return res.status(400).json({
        success: false,
        message: 'childId and content are required',
      });
    }

    // Verify child exists
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    const noteId = await noteModel.create(professionalId, childId, content);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: {
        id: noteId,
        professional_id: professionalId,
        child_id: childId,
        content,
      },
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message,
    });
  }
};

// ============================================================================
// Get note by ID
// ============================================================================
// GET /note/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await noteModel.getById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check permissions
    const child = await childModel.getById(note.child_id);
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note retrieved successfully',
      data: note,
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get note',
      error: error.message,
    });
  }
};

// ============================================================================
// Update note (professional only)
// ============================================================================
// PUT /note/:id
// Body: { content }
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Verify note exists and professional owns it
    const note = await noteModel.getById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.professional_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await noteModel.update(id, content);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { id, content },
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message,
    });
  }
};

// ============================================================================
// Delete note (professional only)
// ============================================================================
// DELETE /note/:id
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify note exists and professional owns it
    const note = await noteModel.getById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.professional_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await noteModel.deleteNote(id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message,
    });
  }
};

module.exports = {
  getByChildId,
  create,
  getById,
  update,
  deleteNote,
};
