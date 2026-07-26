const pool = require('../config/db'); // mysql2 pool exported directly

const VALID_STATUSES = ['Available', 'Occupied', 'Under Maintenance', 'Reserved'];
const VALID_TYPES = ['Single', 'Double', 'Suite', 'Deluxe'];

async function getAllRooms(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM Rooms ORDER BY RoomNumber');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getRoomStatus(req, res) {
  try {
    const [rows] = await pool.query('SELECT RoomId, RoomNumber, RoomType, Status FROM Rooms ORDER BY RoomNumber');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAvailableRooms(req, res) {
  const { checkin, checkout, type, maxprice } = req.query;
  if (!checkin || !checkout) return res.status(400).json({ message: 'checkin and checkout dates required' });

  try {
    let query = `
      SELECT r.*,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM SeasonalPricing sp
            WHERE (sp.RoomType IS NULL OR sp.RoomType = r.RoomType)
            AND CURDATE() BETWEEN sp.StartDate AND sp.EndDate
          )
          THEN r.BasePricePerNight * (
            SELECT PriceMultiplier FROM SeasonalPricing sp2
            WHERE (sp2.RoomType IS NULL OR sp2.RoomType = r.RoomType)
            AND CURDATE() BETWEEN sp2.StartDate AND sp2.EndDate
            ORDER BY sp2.PricingId DESC LIMIT 1
          )
          ELSE r.BasePricePerNight
        END AS EffectivePrice
      FROM Rooms r
      WHERE r.Status = 'Available'
      AND r.RoomId NOT IN (
        SELECT b.RoomId FROM Bookings b
        WHERE b.Status NOT IN ('Cancelled','Checked-Out')
        AND b.CheckInDate < ?
        AND b.CheckOutDate > ?
      )`;

    const params = [checkout, checkin];

    if (type) {
      query += ' AND r.RoomType = ?';
      params.push(type);
    }
    if (maxprice) {
      query += ' AND r.BasePricePerNight <= ?';
      params.push(parseFloat(maxprice));
    }

    query += ' ORDER BY r.BasePricePerNight ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getRoomById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM Rooms WHERE RoomId = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Room not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createRoom(req, res) {
  const { RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description, Amenities } = req.body;
  if (!RoomNumber || !RoomType || !Floor || !Capacity || !BasePricePerNight) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  if (!VALID_TYPES.includes(RoomType)) return res.status(400).json({ message: 'Invalid room type' });

  try {
    const [result] = await pool.query(`
      INSERT INTO Rooms (RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description, Amenities, Status, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Available', NOW())`,
      [RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description || null, Amenities || null]);

    const [rows] = await pool.query('SELECT * FROM Rooms WHERE RoomId = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('duplicate')) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: err.message });
  }
}

async function updateRoom(req, res) {
  const { RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description, Amenities } = req.body;
  try {
    await pool.query(`
      UPDATE Rooms SET RoomNumber=?, RoomType=?, Floor=?,
      Capacity=?, BasePricePerNight=?, Description=?, Amenities=?
      WHERE RoomId=?`,
      [RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description || null, Amenities || null, req.params.id]);
    res.json({ message: 'Room updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateRoomStatus(req, res) {
  const { Status } = req.body;
  if (!VALID_STATUSES.includes(Status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await pool.query('UPDATE Rooms SET Status = ? WHERE RoomId = ?', [Status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteRoom(req, res) {
  try {
    await pool.query('DELETE FROM Rooms WHERE RoomId = ?', [req.params.id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAllRooms, getRoomStatus, getAvailableRooms, getRoomById, createRoom, updateRoom, updateRoomStatus, deleteRoom };