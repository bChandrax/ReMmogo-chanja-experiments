const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};

// Helper: mimics mssql's tagged template query style
// Usage: await db.query("SELECT * FROM users WHERE id = $1", [id])
const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = { db, connectDB };
