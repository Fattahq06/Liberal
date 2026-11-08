const db = require("../config/database");

const PatientModel = {
  // Ambil semua data pasien
  getAll: (callback) => {
    const query = "SELECT * FROM patients ORDER BY id DESC";
    db.all(query, [], callback);
  },

  // Ambil satu data pasien berdasarkan ID
  getById: (id, callback) => {
    const query = "SELECT * FROM patients WHERE id = ?";
    db.get(query, [id], callback);
  },

  // Tambah data pasien baru
  create: (data, callback) => {
    const queryGetLast = "SELECT id FROM patients ORDER BY id DESC LIMIT 1";

    db.get(queryGetLast, [], (err, row) => {
      if (err) return callback(err);

      const nextId = row ? row.id + 1 : 1;
      const generatedCode = `PT-${String(nextId).padStart(4, "0")}`;

      const queryInsert = `
        INSERT INTO patients (
          nama, jenisKelamin, tempatLahir, tanggalLahir, nomorHandphone, 
          email, alamat, kodePasien, jenisPasien, nikPasien
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ];

      db.run(queryInsert, params, function (err) {
        // Kirim error (jika ada) dan ID terakhir menggunakan 'this.lastID'
        callback(err, this.lastID);
      });
    });
  },

  // Edit / update data pasien
  update: (id, data, callback) => {
    const query = `
      UPDATE patients SET
        nama = ?, jenisKelamin = ?, tempatLahir = ?, tanggalLahir = ?, 
        nomorHandphone = ?, email = ?, alamat = ?, 
        jenisPasien = ?, nikPasien = ?
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
      id,
    ];
    db.run(query, params, callback);
  },

  // Hapus data pasien
  delete: (id, callback) => {
    const query = "DELETE FROM patients WHERE id = ?";
    db.run(query, [id], callback);
  },
};

module.exports = PatientModel;
