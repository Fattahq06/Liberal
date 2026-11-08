const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// [POST] Tambah data pasien baru
router.post("/", patientController.createPatient);

// [GET] Ambil semua daftar pasien
router.get("/all", patientController.viewAllPatients);

// [GET] Ambil satu data pasien berdasarkan ID
router.get("/single/:id", patientController.viewSinglePatient);

// [PUT] Edit / update data pasien
router.put("/edit/:id", patientController.editPatient);

// [DELETE] Hapus data pasien
router.delete("/delete/:id", patientController.deletePatient);

module.exports = router;
