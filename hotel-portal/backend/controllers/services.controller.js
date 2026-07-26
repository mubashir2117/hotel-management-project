const pool = require('../config/db'); // mysql2 pool exported directly

async function getMenu(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ServiceMenuItems ORDER BY Category, ItemName');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createMenuItem(req, res) {
  const { ItemName, Category, Price, IsAvailable } = req.body;
  if (!ItemName || !Category || !Price) return res.status(400).json({ message: 'ItemName, Category and Price required' });
  try {
    const [result] = await pool.query(`
      INSERT INTO ServiceMenuItems (ItemName, Category, Price, IsAvailable, CreatedAt)
      VALUES (?, ?, ?, ?, NOW())`,
      [ItemName, Category, Price, IsAvailable !== undefined ? IsAvailable : 1]);

    const [rows] = await pool.query('SELECT * FROM ServiceMenuItems WHERE ItemId = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateMenuItem(req, res) {
  const { ItemName, Category, Price, IsAvailable } = req.body;
  try {
    await pool.query(`
      UPDATE ServiceMenuItems SET ItemName=?, Category=?, Price=?, IsAvailable=?
      WHERE ItemId=?`,
      [ItemName, Category, Price, IsAvailable !== undefined ? IsAvailable : 1, req.params.id]);
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteMenuItem(req, res) {
  try {
    await pool.query('DELETE FROM ServiceMenuItems WHERE ItemId = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAllRequests(req, res) {
  try {
    let rows;

    if (req.user.role === 'admin') {
      [rows] = await pool.query(`
        SELECT sr.*, smi.ItemName, u.Name AS GuestName, r.RoomNumber
        FROM ServiceRequests sr
        JOIN ServiceMenuItems smi ON sr.ItemId = smi.ItemId
        JOIN Guests g ON sr.GuestId = g.GuestId
        JOIN Users u ON g.UserId = u.UserId
        JOIN Bookings b ON sr.BookingId = b.BookingId
        JOIN Rooms r ON b.RoomId = r.RoomId
        ORDER BY sr.RequestedAt DESC`);
    } else {
      [rows] = await pool.query(`
        SELECT sr.*, smi.ItemName
        FROM ServiceRequests sr
        JOIN ServiceMenuItems smi ON sr.ItemId = smi.ItemId
        WHERE sr.GuestId = ?
        ORDER BY sr.RequestedAt DESC`, [req.user.guestId]);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createRequest(req, res) {
  const { BookingId, ItemId, Quantity, Notes } = req.body;
  if (!BookingId || !ItemId || !Quantity) return res.status(400).json({ message: 'BookingId, ItemId and Quantity required' });

  try {
    const guestId = req.user.guestId;

    // Verify the booking belongs to this guest and is Checked-In
    const [bookRows] = await pool.query(
      `SELECT * FROM Bookings WHERE BookingId = ? AND GuestId = ? AND Status = 'Checked-In'`,
      [BookingId, guestId]);

    if (!bookRows[0]) {
      return res.status(400).json({ message: 'No active Checked-In booking found' });
    }

    const [result] = await pool.query(`
      INSERT INTO ServiceRequests (BookingId, GuestId, ItemId, Quantity, Notes, Status, RequestedAt)
      VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
      [BookingId, guestId, ItemId, Quantity, Notes || null]);

    const [rows] = await pool.query('SELECT * FROM ServiceRequests WHERE RequestId = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateRequestStatus(req, res) {
  const { Status } = req.body;
  const valid = ['Pending', 'In Progress', 'Completed'];
  if (!valid.includes(Status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await pool.query('UPDATE ServiceRequests SET Status = ? WHERE RequestId = ?', [Status, req.params.id]);
    res.json({ message: 'Request updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, getAllRequests, createRequest, updateRequestStatus };