const serviceOrders = require("../../data");

// 1. Ambil semua data service
const getAllServices = (req, res) => {
  res.json(serviceOrders);
};

// 2. Tambah data service baru
const createService = (req, res) => {
  const { namaCustomer, seriHandphone, kerusakan, biaya } = req.body;

  const newOrder = {
    id: `SRV-00${serviceOrders.length + 1}`,
    namaCustomer,
    seriHandphone,
    kerusakan,
    status: "Masuk",
    biaya: Number(biaya),
    tanggal: new Date().toISOString().split("T")[0],
  };

  serviceOrders.push(newOrder);
  res
    .status(201)
    .json({ message: "Nota Service Berhasil Dibuat!", data: newOrder });
};

// 3. Update status service
const updateServiceStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = serviceOrders.find((item) => item.id === id);
  if (!order) {
    return res.status(404).json({ message: "Data service tidak ditemukan" });
  }

  if (status) order.status = status;
  res.json({ message: "Status service berhasil diperbarui", data: order });
};

module.exports = {
  getAllServices,
  createService,
  updateServiceStatus,
};
