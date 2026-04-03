// ============================================================================
// NOTE ROUTES
// ============================================================================
// Routes for professional notes

const express = require('express');
const noteController = require('../controllers/note.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

// ============================================================================
// All note routes require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// GET /note/child/:childId
// ============================================================================
// Get all notes for a child
router.get('/child/:childId', noteController.getByChildId);

// ============================================================================
// GET /note/:id
// ============================================================================
// Get note by ID
router.get('/:id', noteController.getById);

// ============================================================================
// POST /note
// ============================================================================
// Create new note (professional only)
router.post('/', roleCheck('professional'), noteController.create);

// ============================================================================
// PUT /note/:id
// ============================================================================
// Update note (professional only)
router.put('/:id', roleCheck('professional'), noteController.update);

// ============================================================================
// DELETE /note/:id
// ============================================================================
// Delete note (professional only)
router.delete('/:id', roleCheck('professional'), noteController.deleteNote);

module.exports = router;
