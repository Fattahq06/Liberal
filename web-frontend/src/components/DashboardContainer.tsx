import { useCallback, useEffect, useState } from "react";
import { dashboardApi, type DashboardSummary } from "../services/dashboardApi";

interface DashboardContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-pink-600 mb-3">{label}</p>
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-medium text-gray-900">
          {value ?? "-"}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

export default function DashboardContainer({
  onHeaderChange,
}: DashboardContainerProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onHeaderChange?.("Dashboard", "Insight > Dashboard");
  }, [onHeaderChange]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await dashboardApi.getSummary());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
        <h2 className="text-2xl font-medium text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Menampilkan ringkasan data pasien, dokter, dan jadwal temu
        </p>

        {error ? (
          <div className="text-center py-10">
            <p className="text-sm text-rose-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchSummary();
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Melayani"
              value={loading ? null : (summary?.pasien ?? 0)}
              unit="Pasien"
            />
            <StatCard
              label="Dokter Aktif"
              value={loading ? null : (summary?.dokterAktif ?? 0)}
              unit="Dokter"
            />
            <StatCard
              label="Pengobatan"
              value={loading ? null : (summary?.jadwalTemu ?? 0)}
              unit="Jadwal Temu"
            />
          </div>
        )}
      </div>
    </div>
  );
}
