const express = require("express");
const cors = require("cors");
const serviceRoutes = require("./routes/serviceRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const jenisDokterRoutes = require("./routes/jenisdoctorRoutes");
const ruanganRoutes = require("./routes/ruanganRoutes");
const jadwalTemuRoutes = require("./routes/jadwalTemuRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute default
app.get("/", (req, res) => {
  res.json({ message: "Server Backend Express Berjalan dengan Baik!" });
});

// Daftarkan rute API dengan awalan /api
app.use("/api", serviceRoutes);

// [isan] Daftar Route Untuk Service
app.use("/api/services", serviceRoutes);

// Daftar Route Untuk Service
app.use("/api/doctors", doctorRoutes);

// [isan] Daftar Route Untuk Pasien
app.use("/api/patients", patientRoutes);

// Daftar Route Untuk Jenis Dokter
app.use("/api/jenis-dokter", jenisDokterRoutes);

// Daftar Route Untuk Ruangan, Jadwal Temu & Dashboard
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/jadwal-temu", jadwalTemuRoutes);
app.use("/api/dashboard", dashboardRoutes);

// [isan] ini handler untuk error 404 yang dicontohkan pak dosen
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

module.exports = app;
