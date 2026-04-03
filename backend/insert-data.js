// ============================================================================
// INSERT SAMPLE DATA SCRIPT
// ============================================================================
// Populates the AIDAA database with sample users, children, and content

const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function insertSampleData() {
  console.log('\n=== AIDAA Sample Data Insertion ===\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aidaa_db',
    });

    console.log('[1/5] Connected to aidaa_db');

    // Clear existing data
    await connection.query('DELETE FROM users WHERE email IN (?,?,?,?)' , [
      'admin@aidaa.com',
      'sarah.johnson@example.com',
      'michael.smith@example.com',
      'emily.brown@aidaa.com'
    ]);
    console.log('[2/5] Cleared existing test users');

    // Hash admin password: admin123
    const adminHash = '$2a$12$HouZtSvUUzWuJCO.WMwLre8ygUbqOpUmGDNyeeR0IlZvNPVAANlJ2';

    // Insert Admin user (with password hash)
    await connection.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@aidaa.com', adminHash, 'admin', 1]
    );
    console.log('[3/5] Inserted: Admin User');

    // Insert Parent users (password NULL for first-time setup - use empty string)
    await connection.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['Sarah Johnson', 'sarah.johnson@example.com', '', 'parent', 1]
    );
    console.log('       - Sarah Johnson (parent - password not set)');

    await connection.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['Michael Smith', 'michael.smith@example.com', '', 'parent', 1]
    );
    console.log('       - Michael Smith (parent - password not set)');

    // Insert Professional user (password None)
    await connection.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['Dr. Emily Brown', 'emily.brown@aidaa.com', '', 'professional', 1]
    );
    console.log('       - Dr. Emily Brown (professional - password not set)');

    // Get inserted user IDs
    const [users] = await connection.query(
      'SELECT id FROM users ORDER BY created_at ASC'
    );
    const adminId = users[0].id;
    const parentId = users[1].id;
    const professionalId = users[3].id;

    // Insert sample children
    await connection.query(
      'INSERT INTO children (parent_id, name, age) VALUES (?, ?, ?)',
      [parentId, 'Emma Johnson', 5]
    );
    console.log('[4/5] Inserted: Children for Sarah Johnson');

    await connection.query(
      'INSERT INTO children (parent_id, name, age) VALUES (?, ?, ?)',
      [parentId, 'Lucas Johnson', 7]
    );
    console.log('       - Emma Johnson (5 years old)');
    console.log('       - Lucas Johnson (7 years old)');

    // Insert sample content
    const contentData = [
      ['Alphabet Learning', 'video', 'Language', '4-6', 1, 'https://example.com/alphabet', 'Introduction to English alphabet with pronunciation'],
      ['Time Management Activity', 'activity', 'Life Skills', '6-8', 2, 'https://example.com/time-activity', 'Interactive activity to teach children about time'],
      ['Math Basics - Numbers 1-10', 'video', 'Mathematics', '4-6', 1, 'https://example.com/math-1-10', 'Learn numbers and basic counting'],
      ['Social Skills Training', 'activity', 'Social Development', '5-8', 2, 'https://example.com/social-skills', 'Activity to develop communication and sharing skills'],
      ['Science Explorer - Plants', 'video', 'Science', '6-8', 2, 'https://example.com/science-plants', 'Explore the life cycle of plants through interactive video']
    ];

    for (const content of contentData) {
      await connection.query(
        'INSERT INTO content (title, type, category, age_group, level, url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        content
      );
    }
    console.log('[5/5] Inserted: 5 sample content items');

    // Verify insertion
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [childCount] = await connection.query('SELECT COUNT(*) as count FROM children');
    const [contentCount] = await connection.query('SELECT COUNT(*) as count FROM content');

    console.log(`\n✓ Data insertion complete!`);
    console.log(`  Users: ${userCount[0].count}`);
    console.log(`  Children: ${childCount[0].count}`);
    console.log(`  Content: ${contentCount[0].count}`);

    console.log('\nTest credentials:');
    console.log('  Admin: admin@aidaa.com / admin123');
    console.log('  Parent: sarah.johnson@example.com / (no password - set on first login)');
    console.log('  Professional: emily.brown@aidaa.com / (no password - set on first login)\n');

    await connection.end();

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run insertion
insertSampleData();
