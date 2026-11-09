import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Pencil,
  Ban,
  Check,
  Trash2,
  IdCard,
  PackageOpen,
} from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import NoticeBanner, { type Notice } from "./NoticeBanner";
import Pagination from "./Pagination";
import {
  labelStatusJadwal,
  type JadwalTemu,
  type StatusJadwal,
} from "../types/jadwalTemu";
import { jadwalTemuApi } from "../services/jadwalTemuApi";
import { asText, downloadCsv } from "../utils/downloadCsv";
import { formatTanggal, getInisial, hariIniISO } from "../utils/patientFormat";

type StatusFilter = "semua" | StatusJadwal;

interface JadwalTemuContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

const STATUS_STYLE: Record<StatusJadwal, { badge: string; dot: string }> = {
  selesai: { badge: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  menunggu: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  batal: { badge: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
};

const BULAN_SINGKAT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/** "2026-11-07" -> "7 Nov 2026" */
function tanggalSingkat(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "-";
  return `${d} ${BULAN_SINGKAT[m - 1]} ${y}`;
}

export default function JadwalTemuContainer({
  onHeaderChange,
}: JadwalTemuContainerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<JadwalTemu[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [ruanganFilter, setRuanganFilter] = useState("semua"); // "semua" atau id ruangan
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState<JadwalTemu | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setItems(await jadwalTemuApi.getAll());
      setLoadError(null);
    } catch (err) {
      setItems([]);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    onHeaderChange?.("Jadwal Temu", "Pengobatan > Jadwal Temu");
  }, [onHeaderChange]);

  // Notifikasi dari halaman Tambah / Edit (dikirim lewat state navigasi)
  useEffect(() => {
    const incoming = (location.state as { notice?: Notice } | null)?.notice;
    if (incoming) {
      setNotice(incoming);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  // Notifikasi hilang sendiri setelah beberapa detik
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Tutup popover filter saat klik di luarnya
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  // Pilihan filter ruangan diambil dari jadwal yang ada
  const ruanganOptions = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((j) => {
      if (j.ruanganId) map.set(j.ruanganId, j.namaRuangan ?? "-");
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  // ---------- Pencarian, filter & pagination ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (j) =>
        (statusFilter === "semua" || j.status === statusFilter) &&
        (ruanganFilter === "semua" || String(j.ruanganId) === ruanganFilter) &&
        (!q ||
          (j.namaDokter ?? "").toLowerCase().includes(q) ||
          (j.namaPasien ?? "").toLowerCase().includes(q) ||
          (j.kodeRekamMedis ?? "").toLowerCase().includes(q) ||
          j.keluhan.toLowerCase().includes(q)),
    );
  }, [items, search, statusFilter, ruanganFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeFilterCount =
    (statusFilter !== "semua" ? 1 : 0) + (ruanganFilter !== "semua" ? 1 : 0);

  // ---------- Aksi ----------
  const changeStatus = async (j: JadwalTemu, next: StatusJadwal) => {
    try {
      setBusyId(j.id);
      await jadwalTemuApi.setStatus(j.id, next);
      setNotice({
        type: "success",
        text: `Jadwal temu ${j.namaPasien ?? ""} ${
          next === "selesai" ? "ditandai selesai" : "dibatalkan"
        }.`,
      });
      await fetchItems();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status",
      });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await jadwalTemuApi.remove(toDelete.id);
      setNotice({ type: "success", text: "Jadwal temu berhasil dihapus." });
      setToDelete(null);
      await fetchItems();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // Unduh data jadwal (sesuai pencarian & filter yang sedang aktif) sebagai CSV
  const handleDownload = () => {
    downloadCsv(
      `jadwal-temu-${hariIniISO()}.csv`,
      [
        "Kode Rekam Medis", "Tanggal", "Waktu", "Dokter", "Ruangan",
        "Pasien", "Kode Pasien", "Keluhan", "Status",
      ],
      filtered.map((j) => [
        j.kodeRekamMedis, formatTanggal(j.tanggalTemu), asText(j.jamTemu),
        j.namaDokter, j.namaRuangan, j.namaPasien, j.kodePasien,
        j.keluhan, labelStatusJadwal(j.status),
      ]),
    );
  };

  const goAdd = () => navigate("/jadwal-temu/tambah");

  // ---------- Halaman daftar ----------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
        <h2 className="text-2xl font-medium text-gray-900">Jadwal Temu</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Menampilkan seluruh daftar jadwal temu dokter dan pasien
        </p>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  filterOpen || activeFilterCount > 0
                    ? "border-pink-300 text-pink-600 bg-pink-50/40"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Filter
                {activeFilterCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                ) : (
                  <Filter size={14} />
                )}
              </button>

              {filterOpen && (
                <div className="absolute z-20 left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as StatusFilter);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500"
                    >
                      <option value="semua">Semua Status</option>
                      <option value="menunggu">Menunggu</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Ruangan</label>
                    <select
                      value={ruanganFilter}
                      onChange={(e) => {
                        setRuanganFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500"
                    >
                      <option value="semua">Semua Ruangan</option>
                      {ruanganOptions.map(([id, nama]) => (
                        <option key={id} value={id}>
                          {nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={activeFilterCount === 0}
                    onClick={() => {
                      setStatusFilter("semua");
                      setRuanganFilter("semua");
                      setPage(1);
                    }}
                    className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search..."
                className="pl-9 pr-4 py-2.5 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Download size={15} />
              Download Data
            </button>
            <button
              type="button"
              onClick={goAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <PlusCircle size={16} />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data jadwal temu...</div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-sm text-rose-500 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchItems();
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
              <PackageOpen size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Jadwal Temu</h3>
            <p className="text-sm text-gray-400 mb-6">Saat ini data jadwal temu masih kosong</p>
            <button
              type="button"
              onClick={goAdd}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              Tambah Jadwal
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Tidak ada jadwal temu yang cocok dengan pencarian atau filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-medium text-gray-800">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Dokter</th>
                    <th className="py-3 px-4">Keluhan</th>
                    <th className="py-3 px-4">Pasien</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {pageItems.map((j) => {
                    const style = STATUS_STYLE[j.status];
                    const menunggu = j.status === "menunggu";
                    return (
                      <tr
                        key={j.id}
                        onClick={() => navigate(`/jadwal-temu/${j.id}`)}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                          {tanggalSingkat(j.tanggalTemu)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-2 text-gray-700">
                            <IdCard size={16} className="text-blue-500" />
                            {j.namaDokter ?? "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">{j.keluhan}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[11px]">
                              {getInisial(j.namaPasien ?? "?")}
                            </div>
                            <span className="text-gray-800">{j.namaPasien ?? "-"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs ${style.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {labelStatusJadwal(j.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div
                            className="flex items-center justify-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => navigate(`/jadwal-temu/${j.id}/edit`)}
                              className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            {menunggu ? (
                              <>
                                <button
                                  type="button"
                                  title="Batalkan"
                                  disabled={busyId === j.id}
                                  onClick={() => changeStatus(j, "batal")}
                                  className="p-2 text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-40"
                                >
                                  <Ban size={14} />
                                </button>
                                <button
                                  type="button"
                                  title="Tandai selesai"
                                  disabled={busyId === j.id}
                                  onClick={() => changeStatus(j, "selesai")}
                                  className="p-2 text-emerald-500 hover:text-emerald-700 transition-colors disabled:opacity-40"
                                >
                                  <Check size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                title="Hapus"
                                onClick={() => {
                                  setDeleteError(null);
                                  setToDelete(j);
                                }}
                                className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filtered.length}
              unfilteredTotal={items.length}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {toDelete && (
        <ConfirmDeleteModal
          title="Hapus Jadwal Temu?"
          description={
            <>
              Jadwal temu{" "}
              <span className="font-semibold text-gray-800">
                {toDelete.namaPasien ?? "-"}
              </span>{" "}
              pada {tanggalSingkat(toDelete.tanggalTemu)} akan dihapus permanen
              dan tidak dapat dikembalikan.
            </>
          }
          deleting={deleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
