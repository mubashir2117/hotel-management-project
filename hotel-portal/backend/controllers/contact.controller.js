const pool = require('../config/db'); // mysql2 pool exported directly

// 1. Submit Contact Message (POST /api/contact/send)
exports.submitContactMessage = async (req, res) => {
  const { userId, guestName, guestEmail, subject, message } = req.body;

  // Validation
  if (!guestName || !guestEmail || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields (Name, Email, Subject, Message) are required.'
    });
  }

  try {
    await pool.query(`
      INSERT INTO ContactMessages (UserId, GuestName, GuestEmail, Subject, Message)
      VALUES (?, ?, ?, ?, ?)`,
      [userId || null, guestName, guestEmail, subject, message]);
    // IsRead defaults to 0, CreatedAt defaults to NOW() — no need to insert manually

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error occurred.',
      error: error.message
    });
  }
};

// 2. Get All Contact Messages (GET /api/contact/all) — Admin use
exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ContactMessages ORDER BY CreatedAt DESC');

    return res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Database Fetch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch messages.',
      error: error.message
    });
  }
};

// 3. Mark Message as Read (PUT /api/contact/read/:id) — Admin use
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE ContactMessages SET IsRead = 1 WHERE MessageId = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Message marked as read.'
    });

  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not update message.',
      error: error.message
    });
  }
};