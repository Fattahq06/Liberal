const PatientModel = require("../models/patientModel");

const patientController = {
  // [GET] Ambil semua daftar pasien
  viewAllPatients: (req, res) => {
    PatientModel.getAll((err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    });
  },

  // [GET] Ambil satu data pasien berdasarkan ID
  viewSinglePatient: (req, res) => {
    const { id } = req.params;
    PatientModel.getById(id, (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Data pasien tidak ditemukan" });
      }
      res.json({ success: true, data: row });
    });
  },

  // [POST] Tambah data pasien baru
  createPatient: (req, res) => {
    PatientModel.create(req.body, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        success: true,
        message: "Data pasien berhasil ditambahkan!",
        id: this.lastID,
      });
    });
  },

  // [PUT] Edit data pasien
  editPatient: (req, res) => {
    const { id } = req.params;
    PatientModel.update(id, req.body, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Data pasien berhasil diperbarui!" });
    });
  },

  // [DELETE] Hapus data pasien
  deletePatient: (req, res) => {
    const { id } = req.params;
    PatientModel.delete(id, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Data pasien berhasil dihapus!" });
    });
  },
};

module.exports = patientController;
