import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type {
  JadwalTemuFormErrors,
  JadwalTemuFormValues,
} from "../types/jadwalTemu";
import type { Patient } from "../types/patient";
import type { Doctor } from "../types/doctor";
import type { Ruangan } from "../types/ruangan";
import { JadwalTemuApiError } from "../services/jadwalTemuApi";
import { patientApi } from "../services/patientApi";
import { doctorApi } from "../services/doctorApi";
import { ruanganApi } from "../services/ruanganApi";

interface JadwalTemuFormProps {
  title: string;
  submitLabel: string;
  initialValues: JadwalTemuFormValues;
  onBack: () => void;
  onSubmit: (values: JadwalTemuFormValues) => Promise<void>;
}

const labelCls =
  "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";
const inputCls = (hasError?: string) =>
  `w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${
    hasError
      ? "border-rose-400 focus:border-rose-500"
      : "border-gray-200 focus:border-pink-500"
  }`;

export default function JadwalTemuForm({
  title,
  submitLabel,
  initialValues,
  onBack,
  onSubmit,
}: JadwalTemuFormProps) {
  const [values, setValues] = useState<JadwalTemuFormValues>(initialValues);
  const [errors, setErrors] = useState<JadwalTemuFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Pilihan pasien, dokter & ruangan diambil dari server
  useEffect(() => {
    let cancelled = false;
    Promise.all([patientApi.getAll(), doctorApi.getAll(), ruanganApi.getAll()])
      .then(([p, d, r]) => {
        if (cancelled) return;
        setPatients(p);
        setDoctors(d);
        setRuangan(r);
      })
      .catch((err: Error) => {
        if (!cancelled) setOptionsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hanya yang aktif yang bisa dipilih (kecuali yang sudah terpilih saat edit)
  const doctorOptions = doctors.filter(
    (d) => d.status === "aktif" || String(d.id) === initialValues.doctorId,
  );
  const ruanganOptions = ruangan.filter(
    (r) => r.status === "aktif" || String(r.id) === initialValues.ruanganId,
  );

  const setField =
    (field: keyof JadwalTemuFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((p) => ({ ...p, [field]: e.target.value }));
      setErrors((p) => ({ ...p, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const next: JadwalTemuFormErrors = {};
    if (!values.patientId) next.patientId = "Pasien wajib dipilih";
    if (!values.doctorId) next.doctorId = "Dokter wajib dipilih";
    if (!values.ruanganId) next.ruanganId = "Ruangan wajib dipilih";
    if (!values.tanggalTemu) next.tanggalTemu = "Tanggal wajib diisi";
    if (!values.jamTemu) next.jamTemu = "Waktu wajib diisi";
    if (!values.keluhan.trim()) next.keluhan = "Keluhan wajib diisi";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setFormError("Periksa kembali isian yang masih salah.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ ...values, keluhan: values.keluhan.trim() });
    } catch (err) {
      if (err instanceof JadwalTemuApiError) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        setFormError(err.message);
      } else {
        setFormError("Terjadi kesalahan tak terduga.");
      }
      setSaving(false);
    }
    // Jika sukses, parent berpindah halaman sehingga form ini hilang.
  };

  const fieldError = (name: keyof JadwalTemuFormValues) =>
    errors[name] ? (
      <p className="text-xs text-rose-500 mt-1.5">{errors[name]}</p>
    ) : null;

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

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {(formError || optionsError) && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600">
              {formError ?? optionsError}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm text-pink-700 mb-4">Informasi Jadwal Temu</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>
                  Pasien <span className="text-rose-500">*</span>
                </label>
                <select
                  value={values.patientId}
                  onChange={setField("patientId")}
                  disabled={loadingOptions}
                  className={inputCls(errors.patientId)}
                >
                  <option value="">
                    {loadingOptions ? "Memuat pasien..." : "Pilih pasien"}
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kodePasien} - {p.nama}
                    </option>
                  ))}
                </select>
                {fieldError("patientId")}
              </div>

              <div>
                <label className={labelCls}>
                  Dokter <span className="text-rose-500">*</span>
                </label>
                <select
                  value={values.doctorId}
                  onChange={setField("doctorId")}
                  disabled={loadingOptions}
                  className={inputCls(errors.doctorId)}
                >
                  <option value="">
                    {loadingOptions ? "Memuat dokter..." : "Pilih dokter"}
                  </option>
                  {doctorOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama}
                      {d.namaJenisDokter ? ` (${d.namaJenisDokter})` : ""}
                    </option>
                  ))}
                </select>
                {fieldError("doctorId")}
              </div>

              <div>
                <label className={labelCls}>
                  Ruangan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={values.ruanganId}
                  onChange={setField("ruanganId")}
                  disabled={loadingOptions}
                  className={inputCls(errors.ruanganId)}
                >
                  <option value="">
                    {loadingOptions ? "Memuat ruangan..." : "Pilih ruangan"}
                  </option>
                  {ruanganOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.namaRuangan}
                    </option>
                  ))}
                </select>
                {fieldError("ruanganId")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={values.tanggalTemu}
                    onChange={setField("tanggalTemu")}
                    className={inputCls(errors.tanggalTemu)}
                  />
                  {fieldError("tanggalTemu")}
                </div>
                <div>
                  <label className={labelCls}>
                    Waktu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={values.jamTemu}
                    onChange={setField("jamTemu")}
                    className={inputCls(errors.jamTemu)}
                  />
                  {fieldError("jamTemu")}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>
                  Keluhan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={values.keluhan}
                  maxLength={255}
                  rows={3}
                  onChange={setField("keluhan")}
                  placeholder="Contoh: Sakit gigi sejak dua hari lalu"
                  className={`${inputCls(errors.keluhan)} resize-none`}
                />
                {fieldError("keluhan")}
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
              disabled={saving || loadingOptions}
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
