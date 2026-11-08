const jenisDokterModel = require("../models/jenisDokterModel");

// Tambah data jenis dokter baru (Create)
const createJenisDokter = async (req, res) => {
  try {
    const jenisDokterData = req.body;

    // Validasi data jenis dokter yang wajib diisi
    if (!jenisDokterData.jenisDokter) {
      return res.status(400).json({
        message: "Bad Request",
        serverMessage: "jenisDokter wajib diisi",
      });
    }

    // Menambahkan data jenis dokter dengan memanggil modelnya
    const created = await jenisDokterModel.createJenisDokter(jenisDokterData);

    res.status(201).json({
      message: "Data Jenis Dokter Berhasil Ditambahkan!",
      data: created,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
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
    console.error("Server error:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
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
    console.error("Server error:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Edit/Update data jenis dokter (Update)
const editJenisDokter = async (req, res) => {
  try {
    const { id } = req.params;
    const jenisDokterInput = req.body;

    const rowData = await jenisDokterModel.updateJenisDokter(
      id,
      jenisDokterInput,
    );

    if (!rowData || rowData.changes === 0) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data jenis dokter dengan id: ${id} tidak ditemukan atau tidak ada perubahan`,
      });
    }

    res.status(200).json({
      message: "Edit jenis dokter successfully",
      data: rowData,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Hapus data jenis dokter (Delete)
const deleteJenisDokter = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await jenisDokterModel.deleteJenisDokter(id);

    if (!result || result.changes === 0) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data jenis dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: `Data jenis dokter dengan id: ${id} successfully deleted!`,
      data: null,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

module.exports = {
  createJenisDokter,
  viewAllJenisDokter,
  viewSingleJenisDokter,
  editJenisDokter,
  deleteJenisDokter,
};
