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

  // [isan] ini data jenis dokter
  db.run(
    `
    CREATE TABLE IF NOT EXISTS jenis_dokter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis_dokter TEXT NOT NULL,
      status TEXT CHECK(status IN ('aktif', 'non aktif')) NOT NULL DEFAULT 'aktif'
    )
  `,
    () => {
      // Masukkan data default (seed) jika tabel baru dibuat / kosong
      db.get("SELECT COUNT(*) AS count FROM jenis_dokter", (err, row) => {
        if (!err && row.count === 0) {
          const defaultData = [
            ["Dokter Umum", "aktif"],
            ["Dokter Gigi", "aktif"],
            ["Dokter Spesialis Anak", "aktif"],
            ["Dokter Spesialis Penyakit Dalam", "aktif"],
            ["Dokter Spesialis Kandungan (Sp.OG)", "aktif"],
            ["Dokter Spesialis Kulit & Kelamin", "aktif"],
            ["Dokter Spesialis Mata", "aktif"],
            ["Dokter Spesialis THT-KL", "aktif"],
            ["Dokter Spesialis Saraf", "aktif"],
            ["Dokter Spesialis Bedah", "aktif"],
            ["Dokter Spesialis Jiwa (Psikiater)", "aktif"],
            ["Dokter Estetika / Kecantikan", "aktif"],
          ];

          const stmt = db.prepare(
            "INSERT INTO jenis_dokter (jenis_dokter, status) VALUES (?, ?)",
          );
          defaultData.forEach((item) => {
            stmt.run(item[0], item[1]);
          });
          stmt.finalize();
          console.log("✅ Data default jenis_dokter berhasil dimasukkan.");
        }
      });
    },
  );

  // [isan] ini tabel data dokter
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      jenisKelamin TEXT NOT NULL,
      tempatLahir TEXT NOT NULL,
      tanggalLahir TEXT NOT NULL,
      nomorHandphone TEXT NOT NULL,
      email TEXT NOT NULL,
      alamat TEXT NOT NULL,
      kodeDokter TEXT NOT NULL UNIQUE,
      jenisDokter TEXT NOT NULL,
      spesialisasi TEXT,
      subspesialisasi TEXT,
      specialClinicalInterest TEXT,
      specializedServiceLine TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
