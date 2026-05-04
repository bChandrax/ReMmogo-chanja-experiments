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
    const result = await db.query("SELECT * FROM users WHERE email = $1 AND isactive = true", [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user.userid, firstName: user.firstname, lastName: user.lastname, email: user.email },
    });
  } catch (err) {
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
