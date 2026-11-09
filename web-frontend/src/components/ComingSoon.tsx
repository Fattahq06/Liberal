import { useEffect } from "react";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  breadcrumb: string;
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

// Halaman sementara untuk menu yang belum dikerjakan
export default function ComingSoon({
  title,
  breadcrumb,
  onHeaderChange,
}: ComingSoonProps) {
  useEffect(() => {
    onHeaderChange?.(title, breadcrumb);
  }, [title, breadcrumb, onHeaderChange]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm py-24 flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-6 flex items-center justify-center bg-pink-50/50 rounded-full text-pink-500">
          <Construction size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-400">
          Halaman ini belum tersedia, segera hadir.
        </p>
      </div>
    </div>
  );
}
