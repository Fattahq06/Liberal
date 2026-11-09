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

  // [isan] Tabel data pasien
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      jenisKelamin TEXT NOT NULL,
      tempatLahir TEXT NOT NULL,
      tanggalLahir TEXT NOT NULL,
      nomorHandphone TEXT NOT NULL,
      email TEXT NOT NULL,
      alamat TEXT NOT NULL,
      kodePasien TEXT NOT NULL UNIQUE,
      jenisPasien TEXT CHECK(jenisPasien IN ('Umum', 'BPJS')) NOT NULL DEFAULT 'Umum',
      nikPasien TEXT NOT NULL UNIQUE,
      faskes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // [pasien] Migrasi: tambah kolom faskes (khusus pasien BPJS) bila belum ada
  db.all("PRAGMA table_info(patients)", (err, cols) => {
    if (!err && Array.isArray(cols) && !cols.some((c) => c.name === "faskes")) {
      db.run("ALTER TABLE patients ADD COLUMN faskes TEXT", (alterErr) => {
        if (alterErr) {
          console.error("❌ Gagal menambah kolom faskes:", alterErr.message);
        } else {
          console.log("✅ Kolom faskes ditambahkan ke tabel patients.");
        }
      });
    }
  });

  // [isan] Nama tabel dan kolom diubah jadi jenisDokter
  db.run(
    `
    CREATE TABLE IF NOT EXISTS jenisDokter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenisDokter TEXT NOT NULL,
      status TEXT CHECK(status IN ('aktif', 'non aktif')) NOT NULL DEFAULT 'aktif'
    )
  `,
    () => {
      // Masukkan data default (seed) jika tabel baru dibuat / kosong
      db.get("SELECT COUNT(*) AS count FROM jenisDokter", (err, row) => {
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
            "INSERT INTO jenisDokter (jenisDokter, status) VALUES (?, ?)",
          );
          defaultData.forEach((item) => {
            stmt.run(item[0], item[1]);
          });
          stmt.finalize();
          console.log("✅ Data default jenisDokter berhasil dimasukkan.");
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
      jenisDokterId INTEGER NOT NULL,
      spesialisasi TEXT,
      subspesialisasi TEXT,
      specialClinicalInterest TEXT,
      specializedServiceLine TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jenisDokterId) REFERENCES jenisDokter(id)
    )
  `);

  // [isan] ini tabel data jadwal temu / appointment
  db.run(`
    CREATE TABLE IF NOT EXISTS jadwalTemu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL,
      patientId INTEGER NOT NULL,
      tanggalTemu TEXT NOT NULL,
      jamTemu TEXT NOT NULL,
      keluhan TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      catatanDokter TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
