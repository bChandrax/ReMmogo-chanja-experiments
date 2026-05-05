const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, nationalID } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "First name, last name, email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (firstname, lastname, email, phonenumber, passwordhash, nationalid)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING userid, firstname, lastname, email`,
      [firstName, lastName, email, phoneNumber || null, hashedPassword, nationalID || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      token,
      user: { id: user.userid, firstName: user.firstname, lastName: user.lastname, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    console.log('🔐 Login attempt for:', email);
    
    const result = await db.query("SELECT * FROM users WHERE email = $1 AND isactive = true", [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log('✅ User found, checking password...');
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log('✅ Password matched, generating token...');
    
    // Check JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured!');
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const token = jwt.sign({ id: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    console.log('✅ Login successful for:', email);
    
    res.json({
      token,
      user: { id: user.userid, firstName: user.firstname, lastName: user.lastname, email: user.email },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT userid, firstname, lastname, email, phonenumber, nationalid, createdat FROM users WHERE userid = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
