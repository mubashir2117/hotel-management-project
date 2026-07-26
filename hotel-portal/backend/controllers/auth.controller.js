const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // mysql2 pool is exported directly

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE Email = ?',
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    let isMatch = false;

    // 1. Pehle Bcrypt ke zariye secure hash compare karein
    try {
      if (user.PasswordHash && user.PasswordHash.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.PasswordHash);
      }
    } catch (e) {
      isMatch = false;
    }

    // 2. Fallback: Agar hash match nahi hua, toh naye plain text 'Password' column se check karein
    if (!isMatch && user.Password) {
      isMatch = (user.Password === password);
    }

    // 3. Fallback 2: Hardcoded standard passwords backup ke liye (Testing purpose)
    if (!isMatch) {
      const commonPasswords = ['admin123', 'guest123', 'password'];
      if (commonPasswords.includes(password)) isMatch = true;
    }

    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    let guestId = null;
    if (user.Role === 'guest') {
      const [guestRows] = await pool.query(
        'SELECT GuestId FROM Guests WHERE UserId = ?',
        [user.UserId]
      );
      if (guestRows[0]) guestId = guestRows[0].GuestId;
    }

    const token = generateToken({ userId: user.UserId, role: user.Role, name: user.Name, guestId });
    res.json({ token, role: user.Role, name: user.Name, userId: user.UserId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

// ==================== REGISTER FUNCTION (UPDATED WITH PLAIN PASSWORD) ====================
async function register(req, res) {
  const { name, email, password, phone, country } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  // Password Length Check
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Phone Number Validation (11 digits only)
  if (phone) {
    const phoneClean = phone.toString().replace(/\D/g, ''); // Remove non-digits
    if (phoneClean.length !== 11) {
      return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
    }
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT UserId FROM Users WHERE Email = ?',
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 1. Password ka hash banayein
    const hash = await bcrypt.hash(password, 10);

    // 2. Insert User (Ab PasswordHash aur plain text Password dono save honge)
    const [userRes] = await pool.query(
      `INSERT INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country, CreatedAt)
       VALUES (?, ?, ?, ?, 'guest', ?, ?, NOW())`,
      [name.trim(), email.toLowerCase().trim(), hash, password, phone || null, country || null]
    );

    const userId = userRes.insertId;

    // Insert Guest Record
    const [guestRes] = await pool.query(
      `INSERT INTO Guests (UserId, LoyaltyPoints, CreatedAt)
       VALUES (?, 0, NOW())`,
      [userId]
    );

    const guestId = guestRes.insertId;

    const token = generateToken({ userId, role: 'guest', name: name.trim(), guestId });

    res.status(201).json({
      token,
      role: 'guest',
      name: name.trim(),
      userId
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT UserId, Name, Email, Role, Phone, Country FROM Users WHERE UserId = ?',
      [req.user.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { login, register, getMe };