const { Pool } = require("pg");
require("dotenv").config();

// Determine if we're running in production (e.g., on Render)
const isProduction = process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com'));

// Database configuration
// Try to use individual DB variables if DATABASE_URL is not set or is a placeholder
let poolConfig = {};

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('YOUR_PASSWORD')) {
  // Use DATABASE_URL if it's properly configured
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else if (process.env.DB_HOST && process.env.DB_DATABASE) {
  // Fall back to individual DB variables
  poolConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else {
  // Default to Render production database
  poolConfig = {
    connectionString: 'postgresql://remmogo_user:UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH@dpg-d7t40p8sfn5c73aiq7j0-a/remmogo',
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL successfully");
    console.log(`📊 Database: remmogo`);
    console.log(`📊 Host: dpg-d7t40p8sfn5c73aiq7j0-a`);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    console.error("💡 Check your .env file and ensure PostgreSQL is running");
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
