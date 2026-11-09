import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Ban,
  Check,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PackageOpen,
} from "lucide-react";
import AddRuanganContainer from "./AddRuanganContainer";
import EditRuanganContainer from "./EditRuanganContainer";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import NoticeBanner, { type Notice } from "./NoticeBanner";
import { labelStatusRuangan, type Ruangan } from "../types/ruangan";
import { ruanganApi } from "../services/ruanganApi";

type View = { name: "list" } | { name: "add" } | { name: "edit"; id: number };
type StatusFilter = "semua" | "aktif" | "non aktif";

interface RuanganContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

const HEADERS = {
  list: { title: "Ruangan", breadcrumb: "Master Data > Ruangan" },
  add: {
    title: "Tambah Ruangan",
    breadcrumb: "Master Data > Ruangan > Tambah",
  },
  edit: {
    title: "Edit Ruangan",
    breadcrumb: "Master Data > Ruangan > Edit",
  },
} as const;

const PAGE_SIZES = [10, 20, 50];

export default function RuanganContainer({
  onHeaderChange,
}: RuanganContainerProps) {
  const [items, setItems] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<View>({ name: "list" });
  const [notice, setNotice] = useState<Notice | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState<Ruangan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setItems(await ruanganApi.getAll());
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

  // ---------- Pencarian, filter & pagination ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (it) =>
        (statusFilter === "semua" || it.status === statusFilter) &&
        (!q || it.namaRuangan.toLowerCase().includes(q)),
    );
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // ---------- Aksi ----------
  const toggleStatus = async (item: Ruangan) => {
    const next = item.status === "aktif" ? "non aktif" : "aktif";
    try {
      setTogglingId(item.id);
      await ruanganApi.update(item.id, {
        namaRuangan: item.namaRuangan,
        status: next,
      });
      setNotice({
        type: "success",
        text: `${item.namaRuangan} berhasil ${next === "aktif" ? "diaktifkan" : "dinonaktifkan"}.`,
      });
      await fetchItems();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const askDelete = (it: Ruangan) => {
    setDeleteError(null);
    setToDelete(it);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await ruanganApi.remove(toDelete.id);
      setNotice({
        type: "success",
        text: `Ruangan ${toDelete.namaRuangan} berhasil dihapus.`,
      });
      setToDelete(null);
      await fetchItems();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Halaman lain ----------
  if (view.name === "add") {
    return (
      <AddRuanganContainer
        onBack={() => setView({ name: "list" })}
        onSuccess={() => {
          setView({ name: "list" });
          setSearch("");
          setStatusFilter("semua");
          setPage(1);
          setNotice({ type: "success", text: "Ruangan berhasil ditambahkan." });
          fetchItems();
        }}
      />
    );
  }

  if (view.name === "edit") {
    const item = items.find((i) => i.id === view.id);
    if (!item) {
      // Data sudah tidak ada (mis. terhapus) -> kembali ke daftar
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
            Data ruangan tidak ditemukan.{" "}
            <button
              type="button"
              onClick={() => setView({ name: "list" })}
              className="text-pink-600 font-medium hover:underline"
            >
              Kembali ke daftar
            </button>
          </div>
        </div>
      );
    }
    return (
      <EditRuanganContainer
        item={item}
        onBack={() => setView({ name: "list" })}
        onSuccess={() => {
          setView({ name: "list" });
          setNotice({ type: "success", text: "Ruangan berhasil diperbarui." });
          fetchItems();
        }}
      />
    );
  }

  // ---------- Halaman daftar ----------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ruangan</h2>
            <p className="text-sm text-gray-400 mt-1">
              Master data ruangan yang tersedia
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="non aktif">Non Aktif</option>
            </select>

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
                placeholder="Cari ruangan..."
                className="pl-9 pr-4 py-2.5 w-60 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              Tambah Ruangan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            Memuat data ruangan...
          </div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-sm text-rose-500 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchItems();
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
              <PackageOpen size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Ruangan
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Saat ini data ruangan masih kosong
            </p>
            <button
              type="button"
              onClick={() => setView({ name: "add" })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all"
            >
              <Plus size={16} />
              Tambah Ruangan
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Tidak ada ruangan yang cocok dengan pencarian atau filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Ruangan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {pageItems.map((item) => {
                    const aktif = item.status === "aktif";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 shrink-0 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                              <DoorOpen size={16} />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {item.namaRuangan}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              aktif
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                aktif ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            ></span>
                            {labelStatusRuangan(item.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                setView({ name: "edit", id: item.id })
                              }
                              className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              title={aktif ? "Nonaktifkan" : "Aktifkan"}
                              disabled={togglingId === item.id}
                              onClick={() => toggleStatus(item)}
                              className={`p-2 transition-colors disabled:opacity-40 ${
                                aktif
                                  ? "text-gray-400 hover:text-rose-500"
                                  : "text-gray-400 hover:text-emerald-500"
                              }`}
                            >
                              {aktif ? <Ban size={16} /> : <Check size={16} />}
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
                    );
                  })}
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
                  {filtered.length !== items.length &&
                    ` (total ${items.length})`}
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

      {toDelete && (
        <ConfirmDeleteModal
          title="Hapus Ruangan?"
          description={
            <>
              Ruangan{" "}
              <span className="font-semibold text-gray-800">
                {toDelete.namaRuangan}
              </span>{" "}
              akan dihapus permanen dan tidak dapat dikembalikan.
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
