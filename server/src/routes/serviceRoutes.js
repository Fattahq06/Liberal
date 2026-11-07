const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

// [POST] Tambah transaksi service baru
router.post("/", serviceController.createService);

// [GET] Ambil semua daftar service
router.get("/all", serviceController.viewAllServices);

// [GE Ambil satu data service berdasarkan ID
router.get("/single/:id", serviceController.viewSingleService);

// [PUT] Edit / update data atau status service
router.put("/edit/:id", serviceController.editService);

// [DELETE] Hapus data service
router.delete("/delete/:id", serviceController.deleteService);

module.exports = router;
