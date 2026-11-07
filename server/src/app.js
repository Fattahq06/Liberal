const express = require("express");
const cors = require("cors");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rute default
app.get("/", (req, res) => {
  res.send("Server Backend Express Berjalan dengan Baik!");
});

// Daftarkan rute API dengan awalan /api
app.use("/api", serviceRoutes);

module.exports = app;
