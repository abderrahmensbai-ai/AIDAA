// ============================================================================
// FIX SCHEMA - ADD MISSING is_active COLUMN
// ============================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aidaa_db',
    });

    console.log('Checking users table schema...');

    // Check if is_active column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active' 
       AND TABLE_SCHEMA = 'aidaa_db'`
    );

    if (columns.length === 0) {
      console.log('Adding is_active column...');
      await connection.query(
        `ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role`
      );
      console.log('✓ Column added successfully');
    } else {
      console.log('✓ Column already exists');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixSchema();
