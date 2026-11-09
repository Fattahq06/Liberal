const db = require("../config/database");

const PatientModel = {
  // Ambil semua data pasien (terbaru di atas)
  getAll: (callback) => {
    db.all("SELECT * FROM patients ORDER BY id DESC", [], callback);
  },

  // Ambil satu data pasien berdasarkan ID
  getById: (id, callback) => {
    db.get("SELECT * FROM patients WHERE id = ?", [id], callback);
  },

  // Tambah data pasien baru. Kode pasien (PT-0001, dst) dibuat otomatis
  // dari nomor kode terbesar yang ada, jadi tidak bentrok walau ada data dihapus.
  create: (data, callback) => {
    const queryMax = `
      SELECT COALESCE(MAX(CAST(SUBSTR(kodePasien, 4) AS INTEGER)), 0) AS maxNo
      FROM patients
    `;

    db.get(queryMax, [], (err, row) => {
      if (err) return callback(err);

      const generatedCode = `PT-${String((row ? row.maxNo : 0) + 1).padStart(4, "0")}`;

      const queryInsert = `
        INSERT INTO patients (
          nama, jenisKelamin, tempatLahir, tanggalLahir, nomorHandphone,
          email, alamat, kodePasien, jenisPasien, nikPasien, faskes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        data.nama,
        data.jenisKelamin,
        data.tempatLahir,
        data.tanggalLahir,
        data.nomorHandphone,
        data.email,
        data.alamat,
        generatedCode,
        data.jenisPasien,
        data.nikPasien,
        data.faskes,
      ];

      db.run(queryInsert, params, function (insertErr) {
        if (insertErr) return callback(insertErr);
        callback(null, { id: this.lastID, kodePasien: generatedCode });
      });
    });
  },

  // Edit / update data pasien (kode pasien tidak bisa diubah)
  update: (id, data, callback) => {
    const query = `
      UPDATE patients SET
        nama = ?, jenisKelamin = ?, tempatLahir = ?, tanggalLahir = ?,
        nomorHandphone = ?, email = ?, alamat = ?,
        jenisPasien = ?, nikPasien = ?, faskes = ?
      WHERE id = ?
    `;
    const params = [
      data.nama,
      data.jenisKelamin,
      data.tempatLahir,
      data.tanggalLahir,
      data.nomorHandphone,
      data.email,
      data.alamat,
      data.jenisPasien,
      data.nikPasien,
      data.faskes,
      id,
    ];
    db.run(query, params, function (err) {
      // this.changes = jumlah baris yang cocok (0 berarti ID tidak ada)
      callback(err, this ? this.changes : 0);
    });
  },

  // Hapus data pasien beserta jadwal temu miliknya (sesuai ON DELETE CASCADE)
  delete: (id, callback) => {
    db.run("DELETE FROM jadwalTemu WHERE patientId = ?", [id], (err) => {
      if (err) return callback(err);
      db.run("DELETE FROM patients WHERE id = ?", [id], function (delErr) {
        callback(delErr, this ? this.changes : 0);
      });
    });
  },
};

module.exports = PatientModel;
