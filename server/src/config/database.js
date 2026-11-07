const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Gagal Terkoneksi SQLite:", err.message);
  } else {
    console.log("✅ Terhubung ke SQLite:", dbPath);
  }
});

// Tabel services (untuk POS Service HP)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      namaCustomer TEXT NOT NULL,
      seriHandphone TEXT NOT NULL,
      kerusakan TEXT NOT NULL,
      status TEXT NOT NULL,
      biaya INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
