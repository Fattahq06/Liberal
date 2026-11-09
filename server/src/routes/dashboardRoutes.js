const express = require("express");
const router = express.Router();
const db = require("../config/database");

const count = (sql) =>
  new Promise((resolve, reject) => {
    db.get(sql, [], (err, row) => (err ? reject(err) : resolve(row ? row.total : 0)));
  });

// [GET] Ringkasan angka untuk halaman Dashboard
router.get("/", async (req, res) => {
  try {
    const [pasien, dokterAktif, jadwalTemu] = await Promise.all([
      count("SELECT COUNT(*) AS total FROM patients"),
      count("SELECT COUNT(*) AS total FROM doctors WHERE status = 'aktif'"),
      count("SELECT COUNT(*) AS total FROM jadwalTemu"),
    ]);
    res.status(200).json({
      message: "Get dashboard successfully",
      data: { pasien, dokterAktif, jadwalTemu },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server Error", serverMessage: error.message });
  }
});

module.exports = router;
