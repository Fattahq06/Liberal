const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// [POST] Tambah data dokter baru
router.post("/", doctorController.createDoctor);

// [GET] Ambil semua daftar dokter
router.get("/all", doctorController.viewAllDoctors);

// [GET] Ambil satu data dokter berdasarkan ID
router.get("/single/:id", doctorController.viewSingleDoctor);

// [PUT] Edit / update data dokter
router.put("/edit/:id", doctorController.editDoctor);

// [DELETE] Hapus data dokter
router.delete("/delete/:id", doctorController.deleteDoctor);

module.exports = router;
