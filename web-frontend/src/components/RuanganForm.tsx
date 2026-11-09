import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type {
  RuanganFormErrors,
  RuanganFormValues,
} from "../types/ruangan";
import { RuanganApiError } from "../services/ruanganApi";

interface RuanganFormProps {
  title: string;
  submitLabel: string;
  initialValues: RuanganFormValues;
  onBack: () => void;
  onSubmit: (values: RuanganFormValues) => Promise<void>;
}

export default function RuanganForm({
  title,
  submitLabel,
  initialValues,
  onBack,
  onSubmit,
}: RuanganFormProps) {
  const [values, setValues] = useState<RuanganFormValues>(initialValues);
  const [errors, setErrors] = useState<RuanganFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nama = values.namaRuangan.trim();
    if (!nama || nama.length > 100) {
      setErrors({
        namaRuangan: !nama
          ? "Nama ruangan wajib diisi"
          : "Nama ruangan maksimal 100 karakter",
      });
      setFormError("Periksa kembali isian yang masih salah.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ ...values, namaRuangan: nama });
    } catch (err) {
      if (err instanceof RuanganApiError) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        setFormError(err.message);
      } else {
        setFormError("Terjadi kesalahan tak terduga.");
      }
      setSaving(false);
    }
    // Jika sukses, parent berpindah halaman sehingga form ini hilang.
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600">
              {formError}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-pink-600 mb-4">
              Informasi Ruangan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Nama Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={values.namaRuangan}
                  maxLength={100}
                  onChange={(e) => {
                    setValues((p) => ({ ...p, namaRuangan: e.target.value }));
                    setErrors((p) => ({ ...p, namaRuangan: undefined }));
                  }}
                  placeholder="Contoh: Poli Umum"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${
                    errors.namaRuangan
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-gray-200 focus:border-pink-500"
                  }`}
                />
                {errors.namaRuangan && (
                  <p className="text-xs text-rose-500 mt-1.5">
                    {errors.namaRuangan}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Status <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-6 h-[46px]">
                  {(
                    [
                      ["aktif", "Aktif"],
                      ["non aktif", "Non Aktif"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={val}
                        checked={values.status === val}
                        onChange={() =>
                          setValues((p) => ({ ...p, status: val }))
                        }
                        className="accent-pink-500 w-4 h-4"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? "Menyimpan..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
