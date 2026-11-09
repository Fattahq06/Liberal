const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// ---- Rute yang dipakai frontend ----
// [POST] Tambah data dokter baru
router.post("/", doctorController.createDoctor);

// [GET] Ambil semua daftar dokter
router.get("/all", doctorController.viewAllDoctors);

// [GET] Ambil kode dokter berikutnya (untuk form tambah)
router.get("/next-code", doctorController.viewNextCode);

// [GET] Ambil satu data dokter berdasarkan ID
router.get("/single/:id", doctorController.viewSingleDoctor);

// [PUT] Edit / update data dokter
router.put("/edit/:id", doctorController.editDoctor);

// [PATCH] Ubah status dokter (aktif / non aktif)
router.patch("/status/:id", doctorController.changeDoctorStatus);

// [DELETE] Hapus data dokter
router.delete("/delete/:id", doctorController.deleteDoctor);

// ---- Alias RESTful sesuai API_GUIDELINES.md ----
router.get("/", doctorController.viewAllDoctors); // GET    /api/doctors
router.get("/:id", doctorController.viewSingleDoctor); // GET    /api/doctors/:id
router.put("/:id", doctorController.editDoctor); // PUT    /api/doctors/:id
router.patch("/:id/status", doctorController.changeDoctorStatus); // PATCH  /api/doctors/:id/status
router.delete("/:id", doctorController.deleteDoctor); // DELETE /api/doctors/:id

module.exports = router;
