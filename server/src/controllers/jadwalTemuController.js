const model = require("../models/jadwalTemuModel");

const STATUS_VALID = ["menunggu", "selesai", "batal"];

function sanitize(body = {}) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  return {
    doctorId: Number(body.doctorId) || 0,
    patientId: Number(body.patientId) || 0,
    ruanganId: Number(body.ruanganId) || 0,
    tanggalTemu: str(body.tanggalTemu),
    jamTemu: str(body.jamTemu),
    keluhan: str(body.keluhan),
  };
}

// existing = data jadwal lama saat edit (dokter/ruangan yang sudah nonaktif tetap boleh dipertahankan)
async function validate(d, existing) {
  const errors = {};

  const doctor = d.doctorId ? await model.getDoctor(d.doctorId) : null;
  if (!doctor) errors.doctorId = "Dokter wajib dipilih";
  else if (doctor.status !== "aktif" && existing?.doctorId !== d.doctorId)
    errors.doctorId = "Dokter yang dipilih tidak aktif";

  if (!d.patientId || !(await model.getPatient(d.patientId)))
    errors.patientId = "Pasien wajib dipilih";

  const ruangan = d.ruanganId ? await model.getRuangan(d.ruanganId) : null;
  if (!ruangan) errors.ruanganId = "Ruangan wajib dipilih";
  else if (ruangan.status !== "aktif" && existing?.ruanganId !== d.ruanganId)
    errors.ruanganId = "Ruangan yang dipilih tidak aktif";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggalTemu) || isNaN(Date.parse(d.tanggalTemu)))
    errors.tanggalTemu = "Tanggal tidak valid";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.jamTemu))
    errors.jamTemu = "Waktu tidak valid (format JJ:MM)";
  if (!d.keluhan) errors.keluhan = "Keluhan wajib diisi";
  else if (d.keluhan.length > 255) errors.keluhan = "Keluhan maksimal 255 karakter";

  return errors;
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
    serverMessage: `Data jadwal temu dengan id: ${id} tidak ditemukan`,
  });

const serverError = (res, error) => {
  console.error("Server error:", error);
  res.status(500).json({ message: "Server Error", serverMessage: error.message });
};

const createJadwal = async (req, res) => {
  try {
    const data = sanitize(req.body);
    const errors = await validate(data);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    const created = await model.createJadwal(data);
    res.status(201).json({ message: "Jadwal Temu Berhasil Ditambahkan!", data: created });
  } catch (error) {
    serverError(res, error);
  }
};

const viewAllJadwal = async (req, res) => {
  try {
    const patientId = Number(req.query.patientId) || 0;
    const rows = await model.getAllJadwal(patientId || undefined);
    res.status(200).json({ message: "Get all jadwal temu successfully", data: rows });
  } catch (error) {
    serverError(res, error);
  }
};

const viewSingleJadwal = async (req, res) => {
  try {
    const row = await model.getJadwalById(req.params.id);
    if (!row) return notFound(res, req.params.id);
    res.status(200).json({ message: "Get single jadwal temu successfully", data: row });
  } catch (error) {
    serverError(res, error);
  }
};

const editJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await model.getJadwalById(id);
    if (!existing) return notFound(res, id);

    const data = sanitize(req.body);
    const errors = await validate(data, existing);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    const row = await model.updateJadwal(id, data);
    res.status(200).json({ message: "Edit jadwal temu successfully", data: row });
  } catch (error) {
    serverError(res, error);
  }
};

const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = typeof req.body?.status === "string" ? req.body.status.trim().toLowerCase() : "";
    if (!STATUS_VALID.includes(status)) {
      return badRequest(res, { status: "Status harus 'menunggu', 'selesai', atau 'batal'" });
    }
    const row = await model.updateStatus(id, status);
    if (!row) return notFound(res, id);
    res.status(200).json({ message: "Status jadwal temu berhasil diubah", data: row });
  } catch (error) {
    serverError(res, error);
  }
};

const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await model.deleteJadwal(id))) return notFound(res, id);
    res.status(200).json({
      message: `Data jadwal temu dengan id: ${id} successfully deleted!`,
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  createJadwal,
  viewAllJadwal,
  viewSingleJadwal,
  editJadwal,
  changeStatus,
  deleteJadwal,
};
