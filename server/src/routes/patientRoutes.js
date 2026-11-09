const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// ---- Rute yang dipakai frontend ----
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

// ---- Alias RESTful sesuai API_GUIDELINES.md ----
router.get("/", patientController.viewAllPatients); // GET    /api/patients
router.get("/:id", patientController.viewSinglePatient); // GET    /api/patients/:id
router.put("/:id", patientController.editPatient); // PUT    /api/patients/:id
router.delete("/:id", patientController.deletePatient); // DELETE /api/patients/:id

module.exports = router;
