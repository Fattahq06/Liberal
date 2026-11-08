
const doctorModel = require("../models/doctorModel");

// Tambah data dokter baru (Create)
const createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    // Validasi data dokter yang wajib diisi
    if (
      !doctorData.nama ||
      !doctorData.jenisKelamin ||
      !doctorData.tempatLahir ||
      !doctorData.tanggalLahir ||
      !doctorData.nomorHandphone ||
      !doctorData.email ||
      !doctorData.alamat ||
      !doctorData.kodeDokter ||
      !doctorData.jenisDokter
    ) {
      return res.status(400).json({
        message: "Bad Request",
        serverMessage:
          "nama, jenisKelamin, tempatLahir, tanggalLahir, nomorHandphone, email, alamat, kodeDokter, jenisDokter wajib diisi",
      });
    }

    // Menambahkan data dokter dengan memanggil modelnya
    const created = await doctorModel.createDoctor(doctorData);

    res.status(201).json({
      message: "Data Dokter Berhasil Ditambahkan!",
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

// Ambil semua daftar dokter (Read All)
const viewAllDoctors = async (req, res) => {
  try {
    const rowData = await doctorModel.getAllDoctors();

    res.status(200).json({
      message: "Get all doctors successfully",
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

// Ambil satu data dokter berdasarkan ID (Read Single)
const viewSingleDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const rowData = await doctorModel.getDoctorById(id);

    if (!rowData) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: "Get single doctor successfully",
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

// Edit/Update data dokter (Update)
const editDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorInput = req.body;

    const rowData = await doctorModel.updateDoctor(id, doctorInput);

    if (!rowData || rowData.changes === 0) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data dokter dengan id: ${id} tidak ditemukan atau tidak ada perubahan`,
      });
    }

    res.status(200).json({
      message: "Edit doctor successfully",
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

// Hapus data dokter (Delete)
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doctorModel.deleteDoctor(id);

    if (!result || result.changes === 0) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data dokter dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: `Data dokter dengan id: ${id} successfully deleted!`,
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
  createDoctor,
  viewAllDoctors,
  viewSingleDoctor,
  editDoctor,
  deleteDoctor,
};
