const express = require("express");
const router = express.Router();
const c = require("../controllers/jadwalTemuController");

// ---- Rute yang dipakai frontend ----
router.post("/", c.createJadwal);
router.get("/all", c.viewAllJadwal); // opsional: ?patientId=1
router.get("/single/:id", c.viewSingleJadwal);
router.put("/edit/:id", c.editJadwal);
router.patch("/status/:id", c.changeStatus);
router.delete("/delete/:id", c.deleteJadwal);

// ---- Alias RESTful sesuai API_GUIDELINES.md ----
router.get("/", c.viewAllJadwal);
router.get("/:id", c.viewSingleJadwal);
router.put("/:id", c.editJadwal);
router.patch("/:id/status", c.changeStatus);
router.delete("/:id", c.deleteJadwal);

module.exports = router;
