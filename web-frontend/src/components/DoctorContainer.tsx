import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import AddDoctorContainer from "./AddDoctorContainer";
import EditDoctorContainer from "./EditDoctorContainer";
import DetailDoctorContainer from "./DetailDoctorContainer";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import NoticeBanner, { type Notice } from "./NoticeBanner";
import CopyButton from "./CopyButton";
import Pagination from "./Pagination";
import { labelStatusDokter, type Doctor, type StatusDokter } from "../types/doctor";
import { doctorApi } from "../services/doctorApi";
import { asText, downloadCsv } from "../utils/downloadCsv";
import { formatTanggal, getInisial, hariIniISO } from "../utils/patientFormat";

type View =
  | { name: "list" }
  | { name: "add" }
  | { name: "detail"; id: number }
  | { name: "edit"; id: number; from: "list" | "detail" };

type StatusFilter = "semua" | StatusDokter;

interface DoctorContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

const HEADERS = {
  list: { title: "Dokter", breadcrumb: "Insight > Dokter" },
  add: { title: "Tambah Data Dokter", breadcrumb: "Insight > Dokter > Tambah" },
  detail: { title: "Detail Dokter", breadcrumb: "Insight > Dokter > Detail" },
  edit: { title: "Edit Data Dokter", breadcrumb: "Insight > Dokter > Edit" },
} as const;

export default function DoctorContainer({ onHeaderChange }: DoctorContainerProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<View>({ name: "list" });
  const [notice, setNotice] = useState<Notice | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [jenisFilter, setJenisFilter] = useState("semua"); // "semua" atau id jenis dokter
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setDoctors(await doctorApi.getAll());
      setLoadError(null);
    } catch (err) {
      setDoctors([]);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Ganti judul header sesuai halaman yang aktif
  useEffect(() => {
    const h = HEADERS[view.name];
    onHeaderChange?.(h.title, h.breadcrumb);
  }, [view.name, onHeaderChange]);

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

  // Pilihan filter jenis dokter diambil dari data dokter yang ada
  const jenisOptions = useMemo(() => {
    const map = new Map<number, string>();
    doctors.forEach((d) => map.set(d.jenisDokterId, d.namaJenisDokter ?? "-"));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [doctors]);

  // ---------- Pencarian, filter & pagination ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter(
      (d) =>
        (statusFilter === "semua" || d.status === statusFilter) &&
        (jenisFilter === "semua" || String(d.jenisDokterId) === jenisFilter) &&
        (!q ||
          d.nama.toLowerCase().includes(q) ||
          d.kodeDokter.toLowerCase().includes(q) ||
          (d.namaJenisDokter ?? "").toLowerCase().includes(q)),
    );
  }, [doctors, search, statusFilter, jenisFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  const activeFilterCount =
    (statusFilter !== "semua" ? 1 : 0) + (jenisFilter !== "semua" ? 1 : 0);

  // ---------- Aksi ----------
  const toggleStatus = async (d: Doctor) => {
    const next: StatusDokter = d.status === "aktif" ? "non aktif" : "aktif";
    try {
      setTogglingId(d.id);
      await doctorApi.setStatus(d.id, next);
      setNotice({
        type: "success",
        text: `Dokter ${d.nama} berhasil ${next === "aktif" ? "diaktifkan" : "dinonaktifkan"}.`,
      });
      await fetchDoctors();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const askDelete = (d: Doctor) => {
    setDeleteError(null);
    setToDelete(d);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await doctorApi.remove(toDelete.id);
      setNotice({
        type: "success",
        text: `Data dokter ${toDelete.nama} berhasil dihapus.`,
      });
      setToDelete(null);
      await fetchDoctors();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // Unduh data dokter (sesuai pencarian & filter yang sedang aktif) sebagai CSV
  const handleDownload = () => {
    downloadCsv(
      `data-dokter-${hariIniISO()}.csv`,
      [
        "Kode Dokter", "Nama", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir",
        "Nomor Handphone", "Email", "Alamat", "Jenis Dokter", "Spesialisasi",
        "Subspesialisasi", "Special Clinical Interest", "Specialized Service Line", "Status",
      ],
      filtered.map((d) => [
        d.kodeDokter, d.nama, d.jenisKelamin, d.tempatLahir, formatTanggal(d.tanggalLahir),
        asText(d.nomorHandphone), d.email, d.alamat, d.namaJenisDokter, d.spesialisasi,
        d.subspesialisasi, d.specialClinicalInterest, d.specializedServiceLine,
        labelStatusDokter(d.status),
      ]),
    );
  };

  // ---------- Halaman lain ----------
  if (view.name === "add") {
    return (
      <AddDoctorContainer
        onBack={() => setView({ name: "list" })}
        onSuccess={() => {
          setView({ name: "list" });
          setSearch("");
          setStatusFilter("semua");
          setJenisFilter("semua");
          // Daftar urut dari kode terlama, jadi lompat ke halaman terakhir
          // (otomatis dibatasi ke halaman terakhir yang ada) agar dokter baru langsung terlihat.
          setPage(Number.MAX_SAFE_INTEGER);
          setNotice({ type: "success", text: "Data dokter berhasil ditambahkan." });
          fetchDoctors();
        }}
      />
    );
  }

  if (view.name === "edit") {
    const back: View =
      view.from === "detail" ? { name: "detail", id: view.id } : { name: "list" };
    return (
      <EditDoctorContainer
        doctorId={view.id}
        onBack={() => setView(back)}
        onSuccess={() => {
          setView(back);
          setNotice({ type: "success", text: "Data dokter berhasil diperbarui." });
          fetchDoctors();
        }}
      />
    );
  }

  if (view.name === "detail") {
    return (
      <DetailDoctorContainer
        doctorId={view.id}
        onBack={() => setView({ name: "list" })}
        onEdit={() => setView({ name: "edit", id: view.id, from: "detail" })}
        onChanged={fetchDoctors}
      />
    );
  }

  // ---------- Halaman daftar ----------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
        <h2 className="text-2xl font-medium text-gray-900">Daftar Dokter</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Menampilkan seluruh daftar dokter
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
                      <option value="aktif">Aktif</option>
                      <option value="non aktif">Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Jenis Dokter
                    </label>
                    <select
                      value={jenisFilter}
                      onChange={(e) => {
                        setJenisFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500"
                    >
                      <option value="semua">Semua Jenis Dokter</option>
                      {jenisOptions.map(([id, nama]) => (
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
                      setJenisFilter("semua");
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
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <PlusCircle size={16} />
              Tambah Dokter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data dokter...</div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-sm text-rose-500 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchDoctors();
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
              <PackageOpen size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Data Dokter</h3>
            <p className="text-sm text-gray-400 mb-6">Saat ini data dokter masih kosong</p>
            <button
              type="button"
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              Tambah Dokter
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Tidak ada dokter yang cocok dengan pencarian atau filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-medium text-gray-800">
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Jenis Dokter</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {pageItems.map((d) => {
                    const aktif = d.status === "aktif";
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setView({ name: "detail", id: d.id })}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[11px]">
                              {getInisial(d.nama)}
                            </div>
                            <span className="text-gray-800">{d.nama}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            Kode:{" "}
                            <span className="font-medium text-gray-800">{d.kodeDokter}</span>
                            <CopyButton text={d.kodeDokter} />
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-2 text-gray-700">
                            <IdCard size={16} className="text-blue-500" />
                            {d.namaJenisDokter ?? "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs ${
                              aktif
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                aktif ? "bg-emerald-600" : "bg-rose-500"
                              }`}
                            ></span>
                            {labelStatusDokter(d.status)}
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
                              onClick={() =>
                                setView({ name: "edit", id: d.id, from: "list" })
                              }
                              className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title={aktif ? "Nonaktifkan" : "Aktifkan"}
                              disabled={togglingId === d.id}
                              onClick={() => toggleStatus(d)}
                              className={`p-2 transition-colors disabled:opacity-40 ${
                                aktif
                                  ? "text-rose-500 hover:text-rose-700"
                                  : "text-emerald-500 hover:text-emerald-700"
                              }`}
                            >
                              {aktif ? <Ban size={14} /> : <Check size={14} />}
                            </button>
                            <button
                              type="button"
                              title="Hapus"
                              onClick={() => askDelete(d)}
                              className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
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
              unfilteredTotal={doctors.length}
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
          title="Hapus Dokter?"
          description={
            <>
              Data dokter{" "}
              <span className="font-semibold text-gray-800">{toDelete.nama}</span> (
              {toDelete.kodeDokter}) beserta jadwal temunya akan dihapus permanen
              dan tidak dapat dikembalikan. Jika hanya tidak ingin dipakai lagi,
              nonaktifkan saja.
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
