const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'bookings.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    hourly_rate REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id)
  );
`);

// Insert sample courts if table is empty
const courtCount = db.prepare('SELECT COUNT(*) as count FROM courts').get();
if (courtCount.count === 0) {
  const insertCourt = db.prepare('INSERT INTO courts (name, type, hourly_rate) VALUES (?, ?, ?)');
  
  insertCourt.run('Court A', 'Tennis', 25.00);
  insertCourt.run('Court B', 'Tennis', 25.00);
  insertCourt.run('Court C', 'Basketball', 30.00);
  insertCourt.run('Court D', 'Badminton', 20.00);
  insertCourt.run('Court E', 'Squash', 22.00);
  
  console.log('Sample courts added to database');
}

module.exports = db;
