const doctorModel = require("../models/doctorModel");
const jenisDokterModel = require("../models/jenisdoctorModel");

const JENIS_KELAMIN = ["Pria", "Wanita"];
const STATUS_VALID = ["aktif", "non aktif"];

// ---------- Validasi & pembersihan input ----------
function sanitize(body = {}) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const opt = (v) => str(v) || null; // kolom opsional: kosong -> null

  return {
    nama: str(body.nama),
    jenisKelamin: str(body.jenisKelamin),
    tempatLahir: str(body.tempatLahir),
    tanggalLahir: str(body.tanggalLahir),
    nomorHandphone: str(body.nomorHandphone).replace(/[\s-]/g, ""),
    email: str(body.email),
    alamat: str(body.alamat),
    jenisDokterId: Number(body.jenisDokterId),
    spesialisasi: opt(body.spesialisasi),
    subspesialisasi: opt(body.subspesialisasi),
    specialClinicalInterest: opt(body.specialClinicalInterest),
    specializedServiceLine: opt(body.specializedServiceLine),
  };
}

function validate(d) {
  const errors = {};

  if (!d.nama) errors.nama = "Nama wajib diisi";
  if (!JENIS_KELAMIN.includes(d.jenisKelamin))
    errors.jenisKelamin = "Jenis kelamin harus Pria atau Wanita";
  if (!d.tempatLahir) errors.tempatLahir = "Tempat lahir wajib diisi";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggalLahir) || isNaN(Date.parse(d.tanggalLahir))) {
    errors.tanggalLahir = "Tanggal lahir tidak valid";
  } else if (new Date(d.tanggalLahir) > new Date()) {
    errors.tanggalLahir = "Tanggal lahir tidak boleh di masa depan";
  }

  if (!/^\+?\d{8,15}$/.test(d.nomorHandphone))
    errors.nomorHandphone = "Nomor handphone harus 8-15 digit angka";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    errors.email = "Format email tidak valid";
  if (!d.alamat) errors.alamat = "Alamat wajib diisi";
  if (!Number.isInteger(d.jenisDokterId) || d.jenisDokterId <= 0)
    errors.jenisDokterId = "Jenis dokter wajib dipilih";

  for (const key of [
    "spesialisasi",
    "subspesialisasi",
    "specialClinicalInterest",
    "specializedServiceLine",
  ]) {
    if (d[key] && d[key].length > 200) errors[key] = "Maksimal 200 karakter";
  }

  return errors;
}

// Aturan relasi: hanya jenis dokter AKTIF yang boleh dipakai.
// Saat edit, dokter boleh tetap memakai jenis dokter lamanya walau sudah non aktif.
async function checkJenisDokter(jenisDokterId, currentJenisDokterId = null) {
  const jenis = await jenisDokterModel.getJenisDokterById(jenisDokterId);
  if (!jenis) return "Jenis dokter tidak ditemukan";
  if (jenis.status !== "aktif" && jenis.id !== currentJenisDokterId)
    return "Jenis dokter tidak aktif, pilih jenis dokter yang aktif";
  return null;
}

const badRequest = (res, errors) =>
  res.status(400).json({
    message: "Bad Request",
    serverMessage: Object.values(errors)[0],
    errors,
  });

const notFound = (res, id) =>
  res.status(404).json({
    message: "Not Found",
    serverMessage: `Data dokter dengan id: ${id} tidak ditemukan`,
  });

const serverError = (res, error) => {
  console.error("Server error:", error);
  if (/UNIQUE constraint failed/i.test(error.message)) {
    return res.status(409).json({
      message: "Conflict",
      serverMessage: "Data bentrok dengan data yang sudah ada, silakan coba lagi",
    });
  }
  res.status(500).json({ message: "Server Error", serverMessage: error.message });
};

// Tambah data dokter baru (Create)
const createDoctor = async (req, res) => {
  try {
    const data = sanitize(req.body);
    const errors = validate(data);
    if (!errors.jenisDokterId) {
      const msg = await checkJenisDokter(data.jenisDokterId);
      if (msg) errors.jenisDokterId = msg;
    }
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    const created = await doctorModel.createDoctor(data);
    res.status(201).json({
      message: "Data Dokter Berhasil Ditambahkan!",
      data: created,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// Ambil semua daftar dokter (Read All)
const viewAllDoctors = async (req, res) => {
  try {
    const rowData = await doctorModel.getAllDoctors();
    res.status(200).json({ message: "Get all doctors successfully", data: rowData });
  } catch (error) {
    serverError(res, error);
  }
};

// Ambil kode dokter berikutnya (untuk ditampilkan di form tambah)
const viewNextCode = async (req, res) => {
  try {
    const kodeDokter = await doctorModel.getNextCode();
    res.status(200).json({ message: "Next doctor code", data: { kodeDokter } });
  } catch (error) {
    serverError(res, error);
  }
};

// Ambil satu data dokter berdasarkan ID (Read Single)
const viewSingleDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const rowData = await doctorModel.getDoctorById(id);
    if (!rowData) return notFound(res, id);
    res.status(200).json({ message: "Get single doctor successfully", data: rowData });
  } catch (error) {
    serverError(res, error);
  }
};

// Edit/Update data dokter (Update)
const editDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await doctorModel.getDoctorById(id);
    if (!existing) return notFound(res, id);

    const data = sanitize(req.body);
    const errors = validate(data);
    if (!errors.jenisDokterId) {
      const msg = await checkJenisDokter(data.jenisDokterId, existing.jenisDokterId);
      if (msg) errors.jenisDokterId = msg;
    }
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    const rowData = await doctorModel.updateDoctor(id, data);
    if (!rowData) return notFound(res, id);
    res.status(200).json({ message: "Edit doctor successfully", data: rowData });
  } catch (error) {
    serverError(res, error);
  }
};

// Ubah status dokter: aktif <-> non aktif
const changeDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status =
      typeof req.body?.status === "string" ? req.body.status.trim().toLowerCase() : "";
    if (!STATUS_VALID.includes(status)) {
      return badRequest(res, { status: "Status harus 'aktif' atau 'non aktif'" });
    }

    const rowData = await doctorModel.updateStatus(id, status);
    if (!rowData) return notFound(res, id);
    res.status(200).json({ message: "Status dokter berhasil diubah", data: rowData });
  } catch (error) {
    serverError(res, error);
  }
};

// Hapus data dokter (Delete)
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await doctorModel.deleteDoctor(id);
    if (!deleted) return notFound(res, id);
    res.status(200).json({
      message: `Data dokter dengan id: ${id} successfully deleted!`,
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  createDoctor,
  viewAllDoctors,
  viewNextCode,
  viewSingleDoctor,
  editDoctor,
  changeDoctorStatus,
  deleteDoctor,
};
