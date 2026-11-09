const jenisDokterModel = require("../models/jenisdoctorModel");

const STATUS_VALID = ["aktif", "non aktif"];

// Bersihkan & validasi input. Mengembalikan { data, errors }
function sanitize(body = {}) {
  const jenisDokter =
    typeof body.jenisDokter === "string"
      ? body.jenisDokter.trim().replace(/\s+/g, " ")
      : "";
  const status =
    typeof body.status === "string" && body.status.trim()
      ? body.status.trim().toLowerCase()
      : "aktif";

  const errors = {};
  if (!jenisDokter) errors.jenisDokter = "Nama jenis dokter wajib diisi";
  else if (jenisDokter.length > 100)
    errors.jenisDokter = "Nama jenis dokter maksimal 100 karakter";
  if (!STATUS_VALID.includes(status))
    errors.status = "Status harus 'aktif' atau 'non aktif'";

  return { data: { jenisDokter, status }, errors };
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
    serverMessage: "Jenis dokter dengan nama tersebut sudah ada",
    errors: { jenisDokter: "Jenis dokter dengan nama tersebut sudah ada" },
  });

const serverError = (res, error) => {
  console.error("Server error:", error);
  res
    .status(500)
    .json({ message: "Server Error", serverMessage: error.message });
};

// Tambah data jenis dokter baru (Create)
const createJenisDokter = async (req, res) => {
  try {
    const { data, errors } = sanitize(req.body);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    if (await jenisDokterModel.findByName(data.jenisDokter))
      return duplicate(res);

    const created = await jenisDokterModel.createJenisDokter(data);
    res.status(201).json({
      message: "Data Jenis Dokter Berhasil Ditambahkan!",
      data: created,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// Ambil semua daftar jenis dokter (Read All)
const viewAllJenisDokter = async (req, res) => {
  try {
    const rowData = await jenisDokterModel.getAllJenisDokter();
    res.status(200).json({
      message: "Get all jenis dokter successfully",
      data: rowData,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// Ambil satu data jenis dokter berdasarkan ID (Read Single)
const viewSingleJenisDokter = async (req, res) => {
  try {
    const { id } = req.params;
    const rowData = await jenisDokterModel.getJenisDokterById(id);

    if (!rowData) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data jenis dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: "Get single jenis dokter successfully",
      data: rowData,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// Edit/Update data jenis dokter (Update)
const editJenisDokter = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, errors } = sanitize(req.body);
    if (Object.keys(errors).length > 0) return badRequest(res, errors);

    if (await jenisDokterModel.findByName(data.jenisDokter, Number(id) || 0))
      return duplicate(res);

    const rowData = await jenisDokterModel.updateJenisDokter(id, data);
    if (!rowData) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data jenis dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: "Edit jenis dokter successfully",
      data: rowData,
    });
  } catch (error) {
    serverError(res, error);
  }
};

// Hapus data jenis dokter (Delete)
const deleteJenisDokter = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await jenisDokterModel.getJenisDokterById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data jenis dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    // Jangan hapus kalau masih dipakai dokter (kalau dihapus, data dokter jadi yatim)
    const used = await jenisDokterModel.countDoctorsUsing(id);
    if (used > 0) {
      return res.status(409).json({
        message: "Conflict",
        serverMessage: `Jenis dokter masih dipakai oleh ${used} dokter, tidak dapat dihapus. Nonaktifkan saja bila tidak ingin dipakai lagi.`,
      });
    }

    await jenisDokterModel.deleteJenisDokter(id);
    res.status(200).json({
      message: `Data jenis dokter dengan id: ${id} successfully deleted!`,
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  createJenisDokter,
  viewAllJenisDokter,
  viewSingleJenisDokter,
  editJenisDokter,
  deleteJenisDokter,
};
