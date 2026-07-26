const express = require('express');
const router  = express.Router();
const contactController = require('../controllers/contact.controller');
// ^^^ Adjust this path to match your actual folder structure

// POST /api/contact/send  — Submit a new contact message
router.post('/send', contactController.submitContactMessage);

// GET /api/contact/all   — Get all messages (Admin)
router.get('/all', contactController.getAllMessages);

// PUT /api/contact/read/:id — Mark a message as read (Admin)
router.put('/read/:id', contactController.markAsRead);

module.exports = router;