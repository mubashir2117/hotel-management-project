const pool = require('../config/db'); // mysql2 pool exported directly

// 1. GET ALL GUESTS
async function getAllGuests(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT g.GuestId, u.UserId, u.Name, u.Email, u.Phone, u.Country,
             g.LoyaltyPoints, g.CreatedAt,
             (SELECT COUNT(*) FROM Bookings b WHERE b.GuestId = g.GuestId) AS TotalBookings
      FROM Guests g
      JOIN Users u ON g.UserId = u.UserId
      ORDER BY g.CreatedAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 2. GET GUEST BY ID
async function getGuestById(req, res) {
  try {
    const [guestRows] = await pool.query(`
      SELECT g.GuestId, u.UserId, u.Name, u.Email, u.Phone, u.Country, g.LoyaltyPoints, g.CreatedAt
      FROM Guests g JOIN Users u ON g.UserId = u.UserId WHERE g.GuestId = ?`, [req.params.id]);
    if (!guestRows[0]) return res.status(404).json({ message: 'Guest not found' });

    const [bookingRows] = await pool.query(`
      SELECT b.*, r.RoomNumber, r.RoomType FROM Bookings b
      JOIN Rooms r ON b.RoomId = r.RoomId
      WHERE b.GuestId = ? ORDER BY b.CreatedAt DESC`, [req.params.id]);

    res.json({ ...guestRows[0], bookings: bookingRows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 3. UPDATE GUEST PROFILE (Admin Action)
async function updateGuestProfile(req, res) {
  const { userId } = req.params;
  const { name, phone, country } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    await pool.query(`
      UPDATE Users
      SET Name = ?, Phone = ?, Country = ?
      WHERE UserId = ?`,
      [name.trim(), phone || null, country || null, userId]);

    res.json({ message: 'Guest profile updated successfully' });
  } catch (err) {
    console.error('Update guest error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

// 4. DELETE GUEST USER & ALL RELATED DATA (Safe with Transaction)
async function deleteGuestUser(req, res) {
  const { userId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Pehle GuestId dhoondein is UserId ke against
    const [guestRows] = await connection.query('SELECT GuestId FROM Guests WHERE UserId = ?', [userId]);

    if (guestRows.length > 0) {
      const guestId = guestRows[0].GuestId;

      // B. Pehle Bookings table se is guest ke saare records udaayein (FOREIGN KEY CRASH SE BACHNE KE LIYE)
      await connection.query('DELETE FROM Bookings WHERE GuestId = ?', [guestId]);

      // C. Phir Guests table se row udaayein
      await connection.query('DELETE FROM Guests WHERE GuestId = ?', [guestId]);
    }

    // D. Aakhir mein Users main table se record delete karein
    await connection.query('DELETE FROM Users WHERE UserId = ?', [userId]);

    // Agar sab sahi chala toh saari tabdeeliyan save (Commit) kar dein
    await connection.commit();
    res.json({ message: 'Guest and all related booking history deleted successfully!' });

  } catch (err) {
    // Agar koi bhi galti ho toh poori query wapas roll-back kar dein taaki data corrupt na ho
    await connection.rollback();
    console.error('Delete guest transaction error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllGuests,
  getGuestById,
  updateGuestProfile,
  deleteGuestUser
};