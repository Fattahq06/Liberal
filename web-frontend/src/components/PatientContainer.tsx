import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PackageOpen,
  CheckCircle2,
  X,
} from "lucide-react";
import AddPatientContainer from "./AddPatientContainer";
import EditPatientContainer from "./EditPatientContainer";
import DetailPatientContainer from "./DetailPatientContainer";
import DeletePatientModal from "./DeletePatientModal";
import CopyButton from "./CopyButton";
import type { Patient } from "../types/patient";
import { patientApi } from "../services/patientApi";
import { getInisial } from "../utils/patientFormat";

type View =
  | { name: "list" }
  | { name: "add" }
  | { name: "detail"; id: number }
  | { name: "edit"; id: number; from: "list" | "detail" };

interface PatientContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

const HEADERS = {
  list: { title: "Pasien", breadcrumb: "Pengobatan > Pasien" },
  add: { title: "Tambah Pasien", breadcrumb: "Pengobatan > Pasien > Tambah" },
  detail: { title: "Detail Pasien", breadcrumb: "Pengobatan > Pasien > Detail" },
  edit: { title: "Edit Pasien", breadcrumb: "Pengobatan > Pasien > Edit" },
} as const;

const PAGE_SIZES = [10, 20, 50];

export default function PatientContainer({
  onHeaderChange,
}: PatientContainerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<View>({ name: "list" });
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setPatients(await patientApi.getAll());
      setLoadError(null);
    } catch (err) {
      setPatients([]);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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

  // ---------- Pencarian & pagination ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.kodePasien.toLowerCase().includes(q) ||
        p.nikPasien.includes(q),
    );
  }, [patients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  // Nomor halaman yang ditampilkan (maksimal 5, bergeser mengikuti halaman aktif)
  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // ---------- Hapus ----------
  const askDelete = (p: Patient) => {
    setDeleteError(null);
    setToDelete(p);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await patientApi.remove(toDelete.id);
      const nama = toDelete.nama;
      setToDelete(null);
      setView({ name: "list" });
      setNotice(`Data pasien ${nama} berhasil dihapus.`);
      await fetchPatients();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  const deleteModal = toDelete && (
    <DeletePatientModal
      patient={toDelete}
      deleting={deleting}
      error={deleteError}
      onCancel={() => setToDelete(null)}
      onConfirm={confirmDelete}
    />
  );

  // ---------- Halaman lain ----------
  if (view.name === "add") {
    return (
      <AddPatientContainer
        onBack={() => setView({ name: "list" })}
        onSuccess={() => {
          setView({ name: "list" });
          setSearch("");
          setPage(1);
          setNotice("Data pasien berhasil ditambahkan.");
          fetchPatients();
        }}
      />
    );
  }

  if (view.name === "edit") {
    const back: View =
      view.from === "detail"
        ? { name: "detail", id: view.id }
        : { name: "list" };
    return (
      <EditPatientContainer
        patientId={view.id}
        onBack={() => setView(back)}
        onSuccess={() => {
          setView(back);
          setNotice("Data pasien berhasil diperbarui.");
          fetchPatients();
        }}
      />
    );
  }

  if (view.name === "detail") {
    const current = patients.find((p) => p.id === view.id);
    return (
      <>
        <DetailPatientContainer
          patientId={view.id}
          onBack={() => setView({ name: "list" })}
          onEdit={() => setView({ name: "edit", id: view.id, from: "detail" })}
          onDelete={() => current && askDelete(current)}
        />
        {deleteModal}
      </>
    );
  }

  // ---------- Halaman daftar ----------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pasien</h2>
            <p className="text-sm text-gray-400 mt-1">
              Menampilkan seluruh daftar pasien yang terdaftar
            </p>
          </div>

          <div className="flex items-center gap-3">
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
                placeholder="Cari nama, kode, atau NIK..."
                className="pl-9 pr-4 py-2.5 w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              Tambah Pasien
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            Memuat data pasien...
          </div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-sm text-rose-500 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchPatients();
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
              <PackageOpen size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Data Pasien
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Saat ini data pasien masih kosong
            </p>
            <button
              type="button"
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all"
            >
              <Plus size={16} />
              Tambah Pasien
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Tidak ada pasien yang cocok dengan “{search}”.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Jenis Pasien</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {pageItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setView({ name: "detail", id: item.id })}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                            {getInisial(item.nama)}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          Kode:{" "}
                          <span className="font-medium text-gray-800">
                            {item.kodePasien}
                          </span>
                          <CopyButton text={item.kodePasien} />
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            item.jenisPasien === "BPJS"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.jenisPasien}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            title="Lihat detail"
                            onClick={() =>
                              setView({ name: "detail", id: item.id })
                            }
                            className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              setView({
                                name: "edit",
                                id: item.id,
                                from: "list",
                              })
                            }
                            className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            title="Hapus"
                            onClick={() => askDelete(item)}
                            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>Menampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-500"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>
                  dari {filtered.length} data
                  {filtered.length !== patients.length &&
                    ` (total ${patients.length})`}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      n === currentPage
                        ? "bg-pink-500 text-white font-semibold"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {deleteModal}
    </div>
  );
}
