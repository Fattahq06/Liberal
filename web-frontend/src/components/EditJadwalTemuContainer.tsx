import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JadwalTemuForm from "./JadwalTemuForm";
import { jadwalToFormValues, type JadwalTemu } from "../types/jadwalTemu";
import { jadwalTemuApi } from "../services/jadwalTemuApi";

interface EditJadwalTemuContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

export default function EditJadwalTemuContainer({
  onHeaderChange,
}: EditJadwalTemuContainerProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jadwal, setJadwal] = useState<JadwalTemu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onHeaderChange?.("Edit Jadwal Temu", "Pengobatan > Jadwal Temu > Edit");
  }, [onHeaderChange]);

  useEffect(() => {
    let cancelled = false;
    jadwalTemuApi
      .getById(Number(id))
      .then((data) => {
        if (!cancelled) setJadwal(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading || error || !jadwal) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
          {loading ? (
            "Memuat data jadwal temu..."
          ) : (
            <>
              {error ?? "Data jadwal temu tidak ditemukan"}{" "}
              <button
                type="button"
                onClick={() => navigate("/jadwal-temu")}
                className="text-pink-600 font-medium hover:underline"
              >
                Kembali ke daftar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <JadwalTemuForm
      title="Edit Jadwal Temu"
      submitLabel="Simpan Perubahan"
      initialValues={jadwalToFormValues(jadwal)}
      onBack={() => navigate("/jadwal-temu")}
      onSubmit={async (values) => {
        await jadwalTemuApi.update(jadwal.id, values);
        navigate("/jadwal-temu", {
          state: {
            notice: { type: "success", text: "Jadwal temu berhasil diperbarui." },
          },
        });
      }}
    />
  );
}
