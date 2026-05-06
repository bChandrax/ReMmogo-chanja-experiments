const { Pool } = require("pg");
require("dotenv").config();

// Determine if we're running in production (e.g., on Render)
const isProduction = process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com'));

// Database configuration
let poolConfig = {};

// Use DATABASE_URL if available, otherwise use individual DB variables
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('YOUR_PASSWORD')) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else if (process.env.DB_HOST && process.env.DB_DATABASE) {
  poolConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else {
  // Fallback defaults
  poolConfig = {
    host: 'localhost',
    database: 'remmogo',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL successfully");
    console.log(`📊 Database: ${process.env.DB_DATABASE || 'remmogo'}`);
    console.log(`📊 Host: ${process.env.DB_HOST || 'localhost'}`);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    console.error("💡 Check your .env file and ensure PostgreSQL is running");
    if (isProduction) {
      process.exit(1);
    }
  }
};

const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = { db, connectDB };
