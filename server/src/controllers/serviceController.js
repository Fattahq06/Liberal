const serviceModel = require("../models/serviceModel");

// Tambah data service baru (Create)
const createService = async (req, res) => {
  try {
    const serviceData = req.body;

    // [isan] validasi agar client tidak request - mengirimkan data yang tidak lengkap, seminimalnya mengirim data yang bersifat required
    if (
      !serviceData.namaCustomer ||
      !serviceData.seriHandphone ||
      !serviceData.kerusakan ||
      !serviceData.biaya
    ) {
      return res.status(400).json({
        message: "Bad Request",
        serverMessage:
          "namaCustomer, seriHandphone, kerusakan, biaya wajib diisi",
      });
    }

    // [isan] menambahkan data service dengan memanggil modelnya (sesuaikan modelnya disini : createNewService)
    const created = await serviceModel.createNewService(serviceData);

    res.status(201).json({
      message: "Nota Service Berhasil Dibuat!",
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

// Ambil semua daftar service (Read All)
const viewAllServices = async (req, res) => {
  try {
    const rowData = await serviceModel.viewAllServices();

    res.status(200).json({
      message: "Get all services successfully",
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

// Ambil satu data service berdasarkan ID (Read Single)
const viewSingleService = async (req, res) => {
  try {
    const { id } = req.params;
    const rowData = await serviceModel.viewSingleService(id);

    if (!rowData) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data service dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: "Get single service successfully",
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

// Edit/Update data service atau status (Update)
const editService = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceInput = req.body;

    const rowData = await serviceModel.editService(id, serviceInput);

    if (!rowData) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data service dengan id: ${id} tidak ditemukan atau tidak ada perubahan`,
      });
    }

    res.status(200).json({
      message: "Edit service successfully",
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

// Hapus data service (Delete)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await serviceModel.deleteService(id);

    if (!result) {
      return res.status(404).json({
        message: "Not Found",
        serverMessage: `Data service dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: `Data service dengan id: ${id} successfully deleted!`,
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
  createService,
  viewAllServices,
  viewSingleService,
  editService,
  deleteService,
};
