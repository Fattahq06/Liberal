import { useState, useEffect } from "react";
import ServiceForm from "./components/serviceForm";
import ServiceTable, { type ServiceItem } from "./components/ServiceTable";

function App() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fungsi untuk mengambil data dari backend
  const fetchServices = () => {
    setLoading(true);
    fetch("http://localhost:3000/api/services/all")
      .then((res) => res.json())
      .then((data) => {
        const dataArray = Array.isArray(data) ? data : data.data || [];
        setServices(dataArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal koneksi ke server:", err);
        setServices([]);
        setLoading(false);
      });
  };

  // Ambil data saat halaman pertama kali dimuat
  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>Sistem Manajemen Servis HP (POS)</h1>
      <p style={{ color: "#666" }}>
        Dr. Gadget - Kelola data servis handphone customer dengan mudah.
      </p>
      <hr style={{ marginBottom: "20px" }} />

      {/* Komponen Form Input di atas */}
      <ServiceForm onSuccess={fetchServices} />

      <h2 style={{ marginTop: "30px" }}>Daftar Servis Masuk</h2>
      {/* Komponen Tabel Data di bawah */}
      <ServiceTable services={services} loading={loading} />
    </div>
  );
}

export default App;
