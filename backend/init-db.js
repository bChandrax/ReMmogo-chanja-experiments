const { Pool } = require("pg");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🗄️  Setting up Re-Mmogo database...\n");
    
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, "database", "remmogo_database.sql");
    let sql = fs.readFileSync(sqlPath, "utf8");
    
    console.log("📄 Reading remmogo_database.sql...");
    
    // Execute the entire SQL file at once
    console.log("📝 Executing SQL statements...\n");
    await pool.query(sql);
    
    console.log("✅ Database schema created successfully!\n");
    
    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Tables created: ${tables.rows.length}`);
    tables.rows.forEach(t => console.log(`   ✓ ${t.table_name}`));
    
    // Check if seed data exists
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    console.log(`\n👥 Users in database: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count === 0) {
      console.log("\n⚠️  No users found. You can register via the app.");
    } else {
      console.log("\n📋 Sample users:");
      const users = await pool.query("SELECT email, firstname, lastname FROM users LIMIT 5");
      users.rows.forEach(u => console.log(`   - ${u.email} (${u.firstname} ${u.lastname})`));
    }
    
    console.log("\n✅ Setup complete! You can now use the app.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Setup failed:", err.message);
    if (err.detail) console.error("   Detail:", err.detail);
    if (err.hint) console.error("   Hint:", err.hint);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
