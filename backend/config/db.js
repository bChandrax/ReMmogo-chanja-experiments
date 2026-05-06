const { Pool } = require("pg");
require("dotenv").config();

// Database configuration - reads from .env file
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'remmogo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  ssl: false, // Disable SSL for local development
};

// Use connection string if provided
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('YOUR_PASSWORD')) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  // Disable SSL for local connections
  if (process.env.DATABASE_URL.includes('localhost')) {
    poolConfig.ssl = false;
  }
}

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL successfully");
    console.log(`📊 Database: ${process.env.DB_DATABASE || 'remmogo'}`);
    console.log(`📊 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    console.log(`📊 User: ${process.env.DB_USER || 'postgres'}`);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    console.error("💡 Check your .env file and ensure PostgreSQL is running");
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = { db, connectDB };
