// Create missing tables
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'aidaa_db',
  });

  const tables = [
    // Children table
    `CREATE TABLE IF NOT EXISTS children (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      age INT,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Content table
    `CREATE TABLE IF NOT EXISTS content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      type ENUM('video','activity') NOT NULL,
      category VARCHAR(100),
      age_group VARCHAR(50),
      level INT DEFAULT 1,
      url TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Activity logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      child_id INT NOT NULL,
      content_id INT NOT NULL,
      status ENUM('started','completed') DEFAULT 'started',
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Notes table
    `CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      professional_id INT NOT NULL,
      child_id INT NOT NULL,
      content TEXT NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (professional_id) REFERENCES users(id),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Teleconsultations table
    `CREATE TABLE IF NOT EXISTS teleconsultations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT NOT NULL,
      professional_id INT NOT NULL,
      date_time DATETIME NOT NULL,
      meeting_link VARCHAR(500),
      notes TEXT,
      FOREIGN KEY (parent_id) REFERENCES users(id),
      FOREIGN KEY (professional_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id)`,
    `CREATE INDEX IF NOT EXISTS idx_activity_logs_child_id ON activity_logs(child_id)`,
    `CREATE INDEX IF NOT EXISTS idx_activity_logs_content_id ON activity_logs(content_id)`,
    `CREATE INDEX IF NOT EXISTS idx_notes_professional_id ON notes(professional_id)`,
    `CREATE INDEX IF NOT EXISTS idx_notes_child_id ON notes(child_id)`,
    `CREATE INDEX IF NOT EXISTS idx_teleconsultations_parent_id ON teleconsultations(parent_id)`,
    `CREATE INDEX IF NOT EXISTS idx_teleconsultations_professional_id ON teleconsultations(professional_id)`,
  ];

  for (const table of tables) {
    try {
      await connection.query(table);
      console.log('✓ Created:', table.split('CREATE')[1].split('(')[0].trim());
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  await connection.end();
  console.log('\n✓ All tables created!\n');
}

createTables();
