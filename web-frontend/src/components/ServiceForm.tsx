import { useState, type SyntheticEvent } from "react";

interface ServiceFormProps {
  onSuccess: () => void;
}

export default function ServiceForm({ onSuccess }: ServiceFormProps) {
  const [namaCustomer, setNamaCustomer] = useState("");
  const [seriHandphone, setSeriHandphone] = useState("");
  const [kerusakan, setKerusakan] = useState("");
  const [status, setStatus] = useState("Proses");
  const [biaya, setBiaya] = useState<number | "">("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      namaCustomer,
      seriHandphone,
      kerusakan,
      status,
      biaya: Number(biaya) || 0,
      tanggal,
    };

    try {
      const response = await fetch("http://localhost:3000/api/services/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Data servis berhasil ditambahkan!");
        // Reset form
        setNamaCustomer("");
        setSeriHandphone("");
        setKerusakan("");
        setBiaya("");
        setStatus("Proses");
        // Refresh daftar tabel di halaman utama
        onSuccess();
      } else {
        alert("Gagal menyimpan data servis.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #ddd",
      }}
    >
      <h2>Input Data Servis Baru</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "10px", maxWidth: "500px" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Nama Customer:
          </label>
          <input
            type="text"
            required
            value={namaCustomer}
            onChange={(e) => setNamaCustomer(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Seri Handphone:
          </label>
          <input
            type="text"
            required
            value={seriHandphone}
            onChange={(e) => setSeriHandphone(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Kerusakan:
          </label>
          <input
            type="text"
            required
            value={kerusakan}
            onChange={(e) => setKerusakan(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Status:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            <option value="Proses">Proses</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Biaya (Rp):
          </label>
          <input
            type="number"
            required
            value={biaya}
            onChange={(e) =>
              setBiaya(e.target.value === "" ? "" : Number(e.target.value))
            }
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Tanggal:
          </label>
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {submitting ? "Menyimpan..." : "Simpan Data Servis"}
        </button>
      </form>
    </div>
  );
}
