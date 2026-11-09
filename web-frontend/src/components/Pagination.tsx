import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  /** Total semua data sebelum difilter (opsional, untuk keterangan "total N") */
  unfilteredTotal?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  unfilteredTotal,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);

  // Nomor halaman yang ditampilkan (maksimal 3, bergeser mengikuti halaman aktif)
  const numbers = useMemo(() => {
    const max = 3;
    let start = Math.max(1, current - 1);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [current, totalPages]);

  const navBtn =
    "w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span>Menampilkan</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pink-500"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>
          dari {totalItems} data
          {unfilteredTotal !== undefined &&
            unfilteredTotal !== totalItems &&
            ` (total ${unfilteredTotal})`}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Halaman pertama"
          disabled={current === 1}
          onClick={() => onPageChange(1)}
          className={navBtn}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className={navBtn}
        >
          <ChevronLeft size={16} />
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
              n === current
                ? "border border-gray-300 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={current === totalPages}
          onClick={() => onPageChange(current + 1)}
          className={navBtn}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          aria-label="Halaman terakhir"
          disabled={current === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={navBtn}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
