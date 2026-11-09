const express = require("express");
const router = express.Router();
const ruanganController = require("../controllers/ruanganController");

// ---- Rute yang dipakai frontend ----
router.post("/", ruanganController.createRuangan);
router.get("/all", ruanganController.viewAllRuangan);
router.get("/single/:id", ruanganController.viewSingleRuangan);
router.put("/edit/:id", ruanganController.editRuangan);
router.delete("/delete/:id", ruanganController.deleteRuangan);

// ---- Alias RESTful sesuai API_GUIDELINES.md ----
router.get("/", ruanganController.viewAllRuangan);
router.get("/:id", ruanganController.viewSingleRuangan);
router.put("/:id", ruanganController.editRuangan);
router.delete("/:id", ruanganController.deleteRuangan);

module.exports = router;
