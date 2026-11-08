export interface ServiceItem {
  id: number;
  namaCustomer: string;
  seriHandphone: string;
  kerusakan: string;
  status: string;
  biaya: number;
  tanggal: string;
}

interface ServiceTableProps {
  services: ServiceItem[];
  loading: boolean;
}

export default function ServiceTable({ services, loading }: ServiceTableProps) {
  if (loading) {
    return <p>Memuat data servis...</p>;
  }

  if (!Array.isArray(services) || services.length === 0) {
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          borderRadius: "5px",
          marginTop: "10px",
        }}
      >
        <p style={{ margin: 0, color: "#856404" }}>
          ⚠️ Belum ada data servis di database.
        </p>
      </div>
    );
  }

  return (
    <table
      border={1}
      cellPadding={10}
      style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px" }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th>ID</th>
          <th>Nama Customer</th>
          <th>Seri HP</th>
          <th>Kerusakan</th>
          <th>Status</th>
          <th>Biaya</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {services.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.namaCustomer}</td>
            <td>{item.seriHandphone}</td>
            <td>{item.kerusakan}</td>
            <td>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: "white",
                  backgroundColor:
                    item.status === "Selesai"
                      ? "#28a745"
                      : item.status === "Proses"
                        ? "#ffc107"
                        : "#dc3545",
                }}
              >
                {item.status}
              </span>
            </td>
            <td>Rp {item.biaya ? item.biaya.toLocaleString() : 0}</td>
            <td>{item.tanggal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
