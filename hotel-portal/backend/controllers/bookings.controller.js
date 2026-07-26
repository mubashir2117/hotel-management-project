const pool = require('../config/db'); // mysql2 pool exported directly

async function getAllBookings(req, res) {
  try {
    let rows;

    if (req.user.role === 'admin') {
      [rows] = await pool.query(`
        SELECT b.*, u.Name AS GuestName, u.Email AS GuestEmail,
               r.RoomNumber, r.RoomType
        FROM Bookings b
        JOIN Guests g ON b.GuestId = g.GuestId
        JOIN Users u ON g.UserId = u.UserId
        JOIN Rooms r ON b.RoomId = r.RoomId
        ORDER BY b.CreatedAt DESC`);
    } else {
      // Guest sees only their own
      [rows] = await pool.query(`
        SELECT b.*, r.RoomNumber, r.RoomType
        FROM Bookings b
        JOIN Rooms r ON b.RoomId = r.RoomId
        WHERE b.GuestId = ?
        ORDER BY b.CreatedAt DESC`, [req.user.guestId]);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getBookingStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM Bookings WHERE DATE(CheckInDate) = CURDATE() AND Status = 'Confirmed') AS todayCheckins,
        (SELECT COUNT(*) FROM Bookings WHERE DATE(CheckOutDate) = CURDATE() AND Status = 'Checked-In') AS todayCheckouts,
        (SELECT IFNULL(SUM(TotalPrice),0) FROM Bookings
         WHERE MONTH(CreatedAt) = MONTH(NOW()) AND YEAR(CreatedAt) = YEAR(NOW())
         AND Status NOT IN ('Cancelled')) AS monthlyRevenue
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getBookingById(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, r.RoomNumber, r.RoomType, u.Name AS GuestName
      FROM Bookings b
      JOIN Rooms r ON b.RoomId = r.RoomId
      JOIN Guests g ON b.GuestId = g.GuestId
      JOIN Users u ON g.UserId = u.UserId
      WHERE b.BookingId = ?`, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ message: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createBooking(req, res) {
  const { RoomId, CheckInDate, CheckOutDate } = req.body;
  if (!RoomId || !CheckInDate || !CheckOutDate) return res.status(400).json({ message: 'RoomId, CheckInDate and CheckOutDate required' });

  const checkin = new Date(CheckInDate);
  const checkout = new Date(CheckOutDate);
  if (checkout <= checkin) return res.status(400).json({ message: 'Check-out must be after check-in' });
  const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

  try {
    // Check room exists and is available
    const [roomRows] = await pool.query('SELECT * FROM Rooms WHERE RoomId = ?', [RoomId]);
    const room = roomRows[0];
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.Status !== 'Available') return res.status(400).json({ message: 'Room is not available' });

    // Check no conflicting bookings
    const [conflictRows] = await pool.query(`
      SELECT COUNT(*) AS cnt FROM Bookings
      WHERE RoomId = ?
      AND Status NOT IN ('Cancelled','Checked-Out')
      AND CheckInDate < ? AND CheckOutDate > ?`,
      [RoomId, CheckOutDate, CheckInDate]);
    if (conflictRows[0].cnt > 0) return res.status(400).json({ message: 'Room already booked for those dates' });

    // Get effective price (apply seasonal pricing if any)
    const today = new Date().toISOString().split('T')[0];
    const [pricingRows] = await pool.query(`
      SELECT PriceMultiplier FROM SeasonalPricing
      WHERE (RoomType IS NULL OR RoomType = ?)
      AND ? BETWEEN StartDate AND EndDate
      ORDER BY PricingId DESC LIMIT 1`,
      [room.RoomType, today]);
    const multiplier = pricingRows[0] ? parseFloat(pricingRows[0].PriceMultiplier) : 1;
    const pricePerNight = parseFloat(room.BasePricePerNight) * multiplier;
    const totalPrice = pricePerNight * nights;

    // Get guestId
    const guestId = req.user.guestId;
    if (!guestId) return res.status(400).json({ message: 'Guest profile not found' });

    // Create booking
    const [bookRes] = await pool.query(`
      INSERT INTO Bookings (GuestId, RoomId, CheckInDate, CheckOutDate, Nights, TotalPrice, Status, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
      [guestId, RoomId, CheckInDate, CheckOutDate, nights, totalPrice]);

    // Update room to Reserved
    await pool.query("UPDATE Rooms SET Status = 'Reserved' WHERE RoomId = ?", [RoomId]);

    // Fetch the newly created booking to return it
    const [newBookingRows] = await pool.query('SELECT * FROM Bookings WHERE BookingId = ?', [bookRes.insertId]);

    res.status(201).json(newBookingRows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateBookingStatus(req, res) {
  const { Status } = req.body;
  const validStatuses = ['Pending','Confirmed','Checked-In','Checked-Out','Cancelled'];
  if (!validStatuses.includes(Status)) return res.status(400).json({ message: 'Invalid status' });

  try {
    // Get booking to find roomId
    const [bookRows] = await pool.query('SELECT * FROM Bookings WHERE BookingId = ?', [req.params.id]);
    const booking = bookRows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update booking status
    await pool.query('UPDATE Bookings SET Status = ? WHERE BookingId = ?', [Status, req.params.id]);

    // Update room status based on booking status change
    let roomStatus = null;
    if (Status === 'Checked-In') roomStatus = 'Occupied';
    else if (Status === 'Checked-Out') roomStatus = 'Available';
    else if (Status === 'Cancelled') roomStatus = 'Available';
    else if (Status === 'Confirmed') roomStatus = 'Reserved';

    if (roomStatus) {
      await pool.query('UPDATE Rooms SET Status = ? WHERE RoomId = ?', [roomStatus, booking.RoomId]);
    }

    res.json({ message: 'Booking status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function cancelBooking(req, res) {
  try {
    const guestId = req.user.guestId;

    const [bookRows] = await pool.query('SELECT * FROM Bookings WHERE BookingId = ?', [req.params.id]);
    const booking = bookRows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Guests can only cancel their own bookings
    if (req.user.role === 'guest' && booking.GuestId !== guestId) {
      return res.status(403).json({ message: 'Not your booking' });
    }

    if (!['Pending','Confirmed'].includes(booking.Status)) {
      return res.status(400).json({ message: 'Only Pending or Confirmed bookings can be cancelled' });
    }

    await pool.query("UPDATE Bookings SET Status = 'Cancelled' WHERE BookingId = ?", [req.params.id]);
    await pool.query("UPDATE Rooms SET Status = 'Available' WHERE RoomId = ?", [booking.RoomId]);

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAllBookings, getBookingStats, getBookingById, createBooking, updateBookingStatus, cancelBooking };