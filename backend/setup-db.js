// ============================================================================
// DATABASE SETUP AND INITIALIZATION SCRIPT
// ============================================================================
// Reads the SQL schema file, creates database, tables, and inserts sample data

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================
async function setupDatabase() {
  console.log('\n=== AIDAA Database Setup ===\n');

  // Read the SQL schema file
  const schemaPath = path.join(__dirname, '../aidaa_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('ERROR: aidaa_schema.sql not found at:', schemaPath);
    process.exit(1);
  }

  const sqlScript = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    // Create connection to MySQL (without selecting database first)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true, // Allow multiple statements
    });

    console.log('[1/4] Connected to MySQL');

    // Execute the entire SQL script at once
    try {
      await connection.query(sqlScript);
      console.log('[2/4] Database schema created with all data');
    } catch (err) {
      console.error('SQL Execution Error:', err.message);
      throw err;
    }

    // Verify data exists using a fresh connection
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aidaa_db',
    });

    // Count users
    const [users] = await dbConnection.query('SELECT COUNT(*) as count FROM users');
    console.log(`[3/4] Found ${users[0].count} users in database`);

    // Check if sarah.johnson exists
    const [parentUser] = await dbConnection.query(
      'SELECT id, email, password FROM users WHERE email = ?',
      ['sarah.johnson@example.com']
    );

    if (parentUser.length > 0) {
      const user = parentUser[0];
      console.log(`[4/4] Sample parent user found:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: ${user.password ? '[HASHED]' : '[NULL - needs setup]'}`);
    } else {
      console.log('[4/4] Sample parent user NOT found');
    }

    // Get all users for reference
    const [allUsers] = await dbConnection.query('SELECT id, name, email, role FROM users');
    if (allUsers.length > 0) {
      console.log('\nAll users in database:');
      allUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
    }

    await dbConnection.end();
    await connection.end();
    console.log('\n✓ Database setup complete!\n');

  } catch (error) {
    console.error('Database Setup Error:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
