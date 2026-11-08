const express = require("express");
const router = express.Router();
const jenisDokterController = require("../controllers/jenisDokterController");

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

module.exports = router;
