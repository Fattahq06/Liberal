import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type {
  PatientFormErrors,
  PatientFormValues,
} from "../types/patient";
import { ApiError } from "../services/patientApi";
import { hariIniISO } from "../utils/patientFormat";

interface PatientFormProps {
  title: string;
  submitLabel: string;
  initialValues: PatientFormValues;
  onBack: () => void;
  onSubmit: (values: PatientFormValues) => Promise<void>;
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${
    hasError
      ? "border-rose-400 focus:border-rose-500"
      : "border-gray-200 focus:border-pink-500"
  }`;

const labelClass =
  "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
}

// Validasi di sisi client (server tetap memvalidasi ulang)
function validate(v: PatientFormValues): PatientFormErrors {
  const e: PatientFormErrors = {};
  if (!v.nama.trim()) e.nama = "Nama wajib diisi";
  if (!v.tempatLahir.trim()) e.tempatLahir = "Tempat lahir wajib diisi";
  if (!v.tanggalLahir) e.tanggalLahir = "Tanggal lahir wajib diisi";
  else if (v.tanggalLahir > hariIniISO())
    e.tanggalLahir = "Tanggal lahir tidak boleh di masa depan";
  if (!/^\+?\d{8,15}$/.test(v.nomorHandphone.replace(/[\s-]/g, "")))
    e.nomorHandphone = "Nomor handphone harus 8-15 digit angka";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Format email tidak valid";
  if (!v.alamat.trim()) e.alamat = "Alamat wajib diisi";
  if (!/^\d{16}$/.test(v.nikPasien)) e.nikPasien = "NIK harus 16 digit angka";
  return e;
}

export default function PatientForm({
  title,
  submitLabel,
  initialValues,
  onBack,
  onSubmit,
}: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(initialValues);
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof PatientFormValues>(
    name: K,
    value: PatientFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error field ini begitu user mengetik ulang
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setField(name as keyof PatientFormValues, value as never);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError("Periksa kembali isian yang masih salah.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
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

          {/* Informasi Pribadi */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-pink-600 mb-4">
              Informasi Pribadi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Field label="Nama" required error={errors.nama}>
                <input
                  type="text"
                  name="nama"
                  value={values.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama pasien.."
                  className={inputClass(!!errors.nama)}
                />
              </Field>

              <Field label="Jenis Kelamin" required>
                <div className="flex items-center gap-6 h-[46px]">
                  {(["Pria", "Wanita"] as const).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="jenisKelamin"
                        value={opt}
                        checked={values.jenisKelamin === opt}
                        onChange={handleChange}
                        className="accent-pink-500 w-4 h-4"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Field label="Tempat Lahir" required error={errors.tempatLahir}>
                <input
                  type="text"
                  name="tempatLahir"
                  value={values.tempatLahir}
                  onChange={handleChange}
                  placeholder="Kota kelahiran.."
                  className={inputClass(!!errors.tempatLahir)}
                />
              </Field>

              <Field label="Tanggal Lahir" required error={errors.tanggalLahir}>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={values.tanggalLahir}
                  max={hariIniISO()}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.tanggalLahir)} text-gray-700`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Field label="Nomor Handphone" required error={errors.nomorHandphone}>
                <input
                  type="tel"
                  inputMode="tel"
                  name="nomorHandphone"
                  value={values.nomorHandphone}
                  onChange={handleChange}
                  placeholder="Masukkan no telepon.."
                  className={inputClass(!!errors.nomorHandphone)}
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Masukkan email.."
                  className={inputClass(!!errors.email)}
                />
              </Field>
            </div>

            <Field label="Alamat" required error={errors.alamat}>
              <textarea
                name="alamat"
                rows={3}
                value={values.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat.."
                className={`${inputClass(!!errors.alamat)} resize-none`}
              />
            </Field>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Informasi Pasien */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-pink-600 mb-4">
              Informasi Pasien
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Field label="Jenis Pasien" error={errors.jenisPasien}>
                <select
                  name="jenisPasien"
                  value={values.jenisPasien}
                  onChange={handleChange}
                  className={inputClass(!!errors.jenisPasien)}
                >
                  <option value="Umum">Umum</option>
                  <option value="BPJS">BPJS</option>
                </select>
              </Field>

              <Field label="NIK Pasien" required error={errors.nikPasien}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="nikPasien"
                  maxLength={16}
                  value={values.nikPasien}
                  onChange={(e) =>
                    setField("nikPasien", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="16 digit NIK pasien.."
                  className={inputClass(!!errors.nikPasien)}
                />
              </Field>
            </div>

            {values.jenisPasien === "BPJS" && (
              <Field label="Faskes" error={errors.faskes}>
                <input
                  type="text"
                  name="faskes"
                  value={values.faskes}
                  onChange={handleChange}
                  placeholder="Contoh: Faskes Tingkat I - Puskesmas Dasusalam"
                  className={inputClass(!!errors.faskes)}
                />
              </Field>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Kode pasien dibuat otomatis oleh sistem.
            </p>
          </div>

          {/* Tombol aksi */}
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
