const PatientModel = require("../models/patientModel");

// ---------- Validasi & pembersihan input ----------
const JENIS_KELAMIN = ["Pria", "Wanita"];
const JENIS_PASIEN = ["Umum", "BPJS"];

function sanitizePatient(body = {}) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const jenisPasien = str(body.jenisPasien) || "Umum";

  return {
    nama: str(body.nama),
    jenisKelamin: str(body.jenisKelamin),
    tempatLahir: str(body.tempatLahir),
    tanggalLahir: str(body.tanggalLahir),
    nomorHandphone: str(body.nomorHandphone).replace(/[\s-]/g, ""),
    email: str(body.email),
    alamat: str(body.alamat),
    jenisPasien,
    nikPasien: str(body.nikPasien).replace(/\s/g, ""),
    // Faskes hanya berlaku untuk pasien BPJS
    faskes: jenisPasien === "BPJS" ? str(body.faskes) || null : null,
  };
}

function validatePatient(d) {
  const errors = {};

  if (!d.nama) errors.nama = "Nama wajib diisi";
  if (!JENIS_KELAMIN.includes(d.jenisKelamin))
    errors.jenisKelamin = "Jenis kelamin harus Pria atau Wanita";
  if (!d.tempatLahir) errors.tempatLahir = "Tempat lahir wajib diisi";

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(d.tanggalLahir) ||
    isNaN(Date.parse(d.tanggalLahir))
  ) {
    errors.tanggalLahir = "Tanggal lahir tidak valid";
  } else if (new Date(d.tanggalLahir) > new Date()) {
    errors.tanggalLahir = "Tanggal lahir tidak boleh di masa depan";
  }

  if (!/^\+?\d{8,15}$/.test(d.nomorHandphone))
    errors.nomorHandphone = "Nomor handphone harus 8-15 digit angka";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    errors.email = "Format email tidak valid";
  if (!d.alamat) errors.alamat = "Alamat wajib diisi";
  if (!JENIS_PASIEN.includes(d.jenisPasien))
    errors.jenisPasien = "Jenis pasien harus Umum atau BPJS";
  if (!/^\d{16}$/.test(d.nikPasien))
    errors.nikPasien = "NIK harus 16 digit angka";

  return errors;
}

// Ubah error database jadi pesan yang mudah dibaca
function handleDbError(err, res) {
  if (err && /UNIQUE constraint failed/i.test(err.message)) {
    if (/nikPasien/.test(err.message)) {
      return res.status(409).json({
        success: false,
        message: "NIK sudah terdaftar pada pasien lain",
        errors: { nikPasien: "NIK sudah terdaftar pada pasien lain" },
      });
    }
    return res.status(409).json({
      success: false,
      message: "Data bentrok dengan data yang sudah ada, silakan coba lagi",
    });
  }
  console.error("ERROR PASIEN:", err.message);
  return res.status(500).json({ success: false, message: err.message });
}

const notFound = (res) =>
  res
    .status(404)
    .json({ success: false, message: "Data pasien tidak ditemukan" });

const patientController = {
  // [GET] Ambil semua daftar pasien
  viewAllPatients: (req, res) => {
    PatientModel.getAll((err, rows) => {
      if (err) return handleDbError(err, res);
      res.json({ success: true, data: rows });
    });
  },

  // [GET] Ambil satu data pasien berdasarkan ID
  viewSinglePatient: (req, res) => {
    PatientModel.getById(req.params.id, (err, row) => {
      if (err) return handleDbError(err, res);
      if (!row) return notFound(res);
      res.json({ success: true, data: row });
    });
  },

  // [POST] Tambah data pasien baru
  createPatient: (req, res) => {
    const data = sanitizePatient(req.body);
    const errors = validatePatient(data);
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Data pasien tidak valid", errors });
    }

    PatientModel.create(data, (err, created) => {
      if (err) return handleDbError(err, res);
      res.status(201).json({
        success: true,
        message: "Data pasien berhasil ditambahkan!",
        id: created.id,
        kodePasien: created.kodePasien,
      });
    });
  },

  // [PUT] Edit data pasien
  editPatient: (req, res) => {
    const data = sanitizePatient(req.body);
    const errors = validatePatient(data);
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Data pasien tidak valid", errors });
    }

    PatientModel.update(req.params.id, data, (err, changes) => {
      if (err) return handleDbError(err, res);
      if (!changes) return notFound(res);
      res.json({ success: true, message: "Data pasien berhasil diperbarui!" });
    });
  },

  // [DELETE] Hapus data pasien
  deletePatient: (req, res) => {
    PatientModel.delete(req.params.id, (err, changes) => {
      if (err) return handleDbError(err, res);
      if (!changes) return notFound(res);
      res.json({ success: true, message: "Data pasien berhasil dihapus!" });
    });
  },
};

module.exports = patientController;
