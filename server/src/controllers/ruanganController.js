const ruanganModel = require("../models/ruanganModel");

const STATUS_VALID = ["aktif", "non aktif"];

function sanitize(body = {}) {
  const namaRuangan =
    typeof body.namaRuangan === "string"
      ? body.namaRuangan.trim().replace(/\s+/g, " ")
      : "";
  const status =
    typeof body.status === "string" && body.status.trim()
      ? body.status.trim().toLowerCase()
      : "aktif";

  const errors = {};
  if (!namaRuangan) errors.namaRuangan = "Nama ruangan wajib diisi";
  else if (namaRuangan.length > 100)
    errors.namaRuangan = "Nama ruangan maksimal 100 karakter";
  if (!STATUS_VALID.includes(status))
    errors.status = "Status harus 'aktif' atau 'non aktif'";

  return { data: { namaRuangan, status }, errors };
}

const badRequest = (res, errors) =>
  res.status(400).json({
    message: "Bad Request",
    serverMessage: Object.values(errors)[0],
    errors,
  });

const duplicate = (res) =>
  res.status(409).json({
    message: "Conflict",
    serverMessage: "Ruangan dengan nama tersebut sudah ada",
    errors: { namaRuangan: "Ruangan dengan nama tersebut sudah ada" },
  });

const notFound = (res, id) =>
  res.status(404).json({
    message: "Not Found",
    serverMessage: `Data ruangan dengan id: ${id} tidak ditemukan`,
  });

const serverError = (res, error) => {
  console.error("Server error:", error);
  res.status(500).json({ message: "Server Error", serverMessage: error.message });
};

const createRuangan = async (req, res) => {
  try {
    const { data, errors } = sanitize(req.body);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);
    if (await ruanganModel.findByName(data.namaRuangan)) return duplicate(res);

    const created = await ruanganModel.createRuangan(data);
    res
      .status(201)
      .json({ message: "Data Ruangan Berhasil Ditambahkan!", data: created });
  } catch (error) {
    serverError(res, error);
  }
};

const viewAllRuangan = async (req, res) => {
  try {
    const rows = await ruanganModel.getAllRuangan();
    res.status(200).json({ message: "Get all ruangan successfully", data: rows });
  } catch (error) {
    serverError(res, error);
  }
};

const viewSingleRuangan = async (req, res) => {
  try {
    const row = await ruanganModel.getRuanganById(req.params.id);
    if (!row) return notFound(res, req.params.id);
    res.status(200).json({ message: "Get single ruangan successfully", data: row });
  } catch (error) {
    serverError(res, error);
  }
};

const editRuangan = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, errors } = sanitize(req.body);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);
    if (await ruanganModel.findByName(data.namaRuangan, Number(id) || 0))
      return duplicate(res);

    const row = await ruanganModel.updateRuangan(id, data);
    if (!row) return notFound(res, id);
    res.status(200).json({ message: "Edit ruangan successfully", data: row });
  } catch (error) {
    serverError(res, error);
  }
};

const deleteRuangan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await ruanganModel.getRuanganById(id))) return notFound(res, id);

    // Jangan hapus kalau masih dipakai jadwal temu
    const used = await ruanganModel.countJadwalUsing(id);
    if (used > 0) {
      return res.status(409).json({
        message: "Conflict",
        serverMessage: `Ruangan masih dipakai oleh ${used} jadwal temu, tidak dapat dihapus. Nonaktifkan saja bila tidak ingin dipakai lagi.`,
      });
    }

    await ruanganModel.deleteRuangan(id);
    res.status(200).json({
      message: `Data ruangan dengan id: ${id} successfully deleted!`,
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  createRuangan,
  viewAllRuangan,
  viewSingleRuangan,
  editRuangan,
  deleteRuangan,
};
