import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import JadwalTemuForm from "./JadwalTemuForm";
import { emptyJadwalTemuForm } from "../types/jadwalTemu";
import { jadwalTemuApi } from "../services/jadwalTemuApi";
import { hariIniISO } from "../utils/patientFormat";

interface AddJadwalTemuContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

// Halaman Tambah Jadwal. Juga dibuka oleh tombol "Pasien Datang" di sidebar.
export default function AddJadwalTemuContainer({
  onHeaderChange,
}: AddJadwalTemuContainerProps) {
  const navigate = useNavigate();

  useEffect(() => {
    onHeaderChange?.(
      "Tambah Jadwal Temu",
      "Pengobatan > Jadwal Temu > Tambah",
    );
  }, [onHeaderChange]);

  // Tanggal & waktu awal = sekarang (pasien yang baru datang)
  const initialValues = useMemo(() => {
    const now = new Date();
    const jam = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return { ...emptyJadwalTemuForm, tanggalTemu: hariIniISO(), jamTemu: jam };
  }, []);

  return (
    <JadwalTemuForm
      title="Tambah Jadwal Temu"
      submitLabel="Simpan Jadwal"
      initialValues={initialValues}
      onBack={() => navigate("/jadwal-temu")}
      onSubmit={async (values) => {
        await jadwalTemuApi.create(values);
        navigate("/jadwal-temu", {
          state: {
            notice: { type: "success", text: "Jadwal temu berhasil ditambahkan." },
          },
        });
      }}
    />
  );
}
