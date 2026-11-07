const express = require("express");
const cors = require("cors");

// Import rute service kamu (sesuaikan nama file rutenya jika berbeda, misal: serviceRoutes)
const serviceRoutes = require("./src/routes/serviceRoutes");

const app = express();
const PORT = 3000; // Bisa juga pakai process.env.PORT || 5000 sesuai kenyamananmu

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route (Sapaan utama saat server dibuka)
app.get("/", (req, res) => {
  res.json({ message: "Server REST API SQLite berjalan 🚀" });
});

// Pendaftaran Routes Utama
app.use("/api/services", serviceRoutes);

// 404 Handler (Opsional tapi bagus buat jaga-jaga kalau salah ketik URL)
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// Menyalakan Mesin Server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
});
