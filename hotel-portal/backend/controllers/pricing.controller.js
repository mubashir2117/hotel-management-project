const pool = require('../config/db'); // mysql2 pool exported directly

async function getAllPricing(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM SeasonalPricing ORDER BY StartDate DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getEffectivePrice(req, res) {
  const { date, roomType } = req.query;
  try {
    const effectiveDate = date || new Date().toISOString().split('T')[0];
    let query = `SELECT PriceMultiplier FROM SeasonalPricing WHERE ? BETWEEN StartDate AND EndDate`;
    const params = [effectiveDate];

    if (roomType) {
      query += ' AND (RoomType IS NULL OR RoomType = ?)';
      params.push(roomType);
    }
    query += ' ORDER BY PricingId DESC LIMIT 1';

    const [rows] = await pool.query(query, params);
    res.json({ multiplier: rows[0] ? parseFloat(rows[0].PriceMultiplier) : 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createPricing(req, res) {
  const { SeasonName, StartDate, EndDate, RoomType, PriceMultiplier } = req.body;
  if (!SeasonName || !StartDate || !EndDate || !PriceMultiplier) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }
  try {
    const [result] = await pool.query(`
      INSERT INTO SeasonalPricing (SeasonName, StartDate, EndDate, RoomType, PriceMultiplier, CreatedAt)
      VALUES (?, ?, ?, ?, ?, NOW())`,
      [SeasonName, StartDate, EndDate, RoomType || null, PriceMultiplier]);

    const [rows] = await pool.query('SELECT * FROM SeasonalPricing WHERE PricingId = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updatePricing(req, res) {
  const { SeasonName, StartDate, EndDate, RoomType, PriceMultiplier } = req.body;
  try {
    await pool.query(`
      UPDATE SeasonalPricing SET SeasonName=?, StartDate=?, EndDate=?,
      RoomType=?, PriceMultiplier=? WHERE PricingId=?`,
      [SeasonName, StartDate, EndDate, RoomType || null, PriceMultiplier, req.params.id]);
    res.json({ message: 'Pricing rule updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deletePricing(req, res) {
  try {
    await pool.query('DELETE FROM SeasonalPricing WHERE PricingId = ?', [req.params.id]);
    res.json({ message: 'Pricing rule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAllPricing, getEffectivePrice, createPricing, updatePricing, deletePricing };