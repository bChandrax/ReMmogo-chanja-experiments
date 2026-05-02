const { sql } = require("../config/db");
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
    const checkUser = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql.query`
      INSERT INTO Users (FirstName, LastName, Email, PhoneNumber, PasswordHash, NationalID)
      OUTPUT INSERTED.UserID, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email
      VALUES (${firstName}, ${lastName}, ${email}, ${phoneNumber || null}, ${hashedPassword}, ${nationalID || null})
    `;

    const user = result.recordset[0];
    const token = jwt.sign({ id: user.UserID, email: user.Email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: { id: user.UserID, firstName: user.FirstName, lastName: user.LastName, email: user.Email } });
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
    const result = await sql.query`SELECT * FROM Users WHERE Email = ${email} AND IsActive = 1`;
    const user = result.recordset[0];

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.UserID, email: user.Email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user.UserID, firstName: user.FirstName, lastName: user.LastName, email: user.Email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT UserID, FirstName, LastName, Email, PhoneNumber, NationalID, CreatedAt
      FROM Users WHERE UserID = ${req.user.id}
    `;
    if (result.recordset.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};