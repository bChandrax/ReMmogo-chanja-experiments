const { Pool } = require("pg");
require("dotenv").config();

// Determine if we're running in production (e.g., on Render)
const isProduction = process.env.NODE_ENV === "production" && process.env.DATABASE_URL?.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL for production databases (Render, etc.)
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    // Don't exit process in development - allow retries
    if (isProduction) {
      process.exit(1);
    }
  }
};

// Helper: mimics mssql's tagged template query style
// Usage: await db.query("SELECT * FROM users WHERE id = $1", [id])
const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = { db, connectDB };
