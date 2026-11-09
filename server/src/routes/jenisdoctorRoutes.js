const express = require("express");
const router = express.Router();
const jenisDokterController = require("../controllers/jenisdoctorController");

// ---- Rute yang dipakai frontend ----
// [POST] Tambah data jenis dokter baru
router.post("/", jenisDokterController.createJenisDokter);

// [GET] Ambil semua daftar jenis dokter
router.get("/all", jenisDokterController.viewAllJenisDokter);

// [GET] Ambil satu data jenis dokter berdasarkan ID
router.get("/single/:id", jenisDokterController.viewSingleJenisDokter);

// [PUT] Edit / update data jenis dokter
router.put("/edit/:id", jenisDokterController.editJenisDokter);

// [DELETE] Hapus data jenis dokter
router.delete("/delete/:id", jenisDokterController.deleteJenisDokter);

// ---- Alias RESTful sesuai API_GUIDELINES.md ----
router.get("/", jenisDokterController.viewAllJenisDokter); // GET    /api/jenis-dokter
router.get("/:id", jenisDokterController.viewSingleJenisDokter); // GET    /api/jenis-dokter/:id
router.put("/:id", jenisDokterController.editJenisDokter); // PUT    /api/jenis-dokter/:id
router.delete("/:id", jenisDokterController.deleteJenisDokter); // DELETE /api/jenis-dokter/:id

module.exports = router;
