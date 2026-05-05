const { Pool } = require("pg");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function setupMessaging() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("💬 Setting up messaging system...\n");
    
    const sqlPath = path.join(__dirname, "database", "messages.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    console.log("📄 Reading messages.sql...");
    await pool.query(sql);
    
    console.log("✅ Messaging system created successfully!\n");
    
    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%message%'
      ORDER BY table_name
    `);
    
    console.log(`📊 Message tables created: ${tables.rows.length}`);
    tables.rows.forEach(t => console.log(`   ✓ ${t.table_name}`));
    
    // Check conversations
    const convos = await pool.query("SELECT COUNT(*) FROM conversations");
    console.log(`\n💬 Conversations: ${convos.rows[0].count}`);
    
    // Check messages
    const messages = await pool.query("SELECT COUNT(*) FROM messages");
    console.log(`📝 Messages: ${messages.rows[0].count}`);
    
    console.log("\n✅ Messaging system ready!\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Setup failed:", err.message);
    if (err.detail) console.error("   Detail:", err.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupMessaging();
