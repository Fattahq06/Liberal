const db = require("../config/db");

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
    const query = `
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
      data.kodePasien,
      data.jenisPasien,
      data.nikPasien,
    ];
    db.run(query, params, callback);
  },

  // Edit / update data pasien
  update: (id, data, callback) => {
    const query = `
      UPDATE patients SET
        nama = ?, jenisKelamin = ?, tempatLahir = ?, tanggalLahir = ?, 
        nomorHandphone = ?, email = ?, alamat = ?, kodePasien = ?, 
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
      data.kodePasien,
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
