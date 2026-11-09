const express = require("express");
const cors = require("cors");

// Import rute service kamu (sesuaikan nama file rutenya jika berbeda, misal: serviceRoutes)
const patientsRoutes = require("./src/routes/patientRoutes");
const jenisDokterRoutes = require("./src/routes/jenisdoctorRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const ruanganRoutes = require("./src/routes/ruanganRoutes");
const jadwalTemuRoutes = require("./src/routes/jadwalTemuRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

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

// Pendaftaran Routes Patients
app.use("/api/patients", patientsRoutes);

// Pendaftaran Routes Jenis Dokter
app.use("/api/jenis-dokter", jenisDokterRoutes);

// Pendaftaran Routes Dokter
app.use("/api/doctors", doctorRoutes);

// Pendaftaran Routes Ruangan, Jadwal Temu & Dashboard
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/jadwal-temu", jadwalTemuRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 Handler (Opsional tapi bagus buat jaga-jaga kalau salah ketik URL)
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// Menyalakan Mesin Server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
});
