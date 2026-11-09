import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCheck, Mail } from "lucide-react";
import type { DoctorFormErrors, DoctorFormValues } from "../types/doctor";
import type { JenisDokter } from "../types/jenisDokter";
import { DoctorApiError } from "../services/doctorApi";
import { hariIniISO } from "../utils/patientFormat";

interface DoctorFormProps {
  title: string;
  submitLabel: string;
  initialValues: DoctorFormValues;
  /** Kode dokter (DR-0004). Dibuat otomatis oleh server, hanya ditampilkan. */
  kodeDokter: string;
  /** Semua jenis dokter; form hanya menawarkan yang aktif */
  jenisDokterList: JenisDokter[];
  onBack: () => void;
  onSubmit: (values: DoctorFormValues) => Promise<void>;
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder:text-gray-300 focus:outline-none transition-colors ${
    hasError
      ? "border-rose-400 focus:border-rose-500"
      : "border-gray-200 focus:border-pink-500"
  }`;

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm text-gray-700 mb-2">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
}

// Validasi di sisi client (server tetap memvalidasi ulang)
function validate(v: DoctorFormValues): DoctorFormErrors {
  const e: DoctorFormErrors = {};
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
  if (!v.jenisDokterId) e.jenisDokterId = "Jenis dokter wajib dipilih";
  for (const key of [
    "spesialisasi",
    "subspesialisasi",
    "specialClinicalInterest",
    "specializedServiceLine",
  ] as const) {
    if (v[key].length > 200) e[key] = "Maksimal 200 karakter";
  }
  return e;
}

export default function DoctorForm({
  title,
  submitLabel,
  initialValues,
  kodeDokter,
  jenisDokterList,
  onBack,
  onSubmit,
}: DoctorFormProps) {
  const [values, setValues] = useState<DoctorFormValues>(initialValues);
  const [errors, setErrors] = useState<DoctorFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Hanya jenis dokter AKTIF yang boleh dipilih. Saat edit, jenis dokter lama
  // dokter ini tetap ditampilkan walau sudah nonaktif supaya data tidak hilang.
  const options = jenisDokterList.filter(
    (j) => j.status === "aktif" || String(j.id) === initialValues.jenisDokterId,
  );
  const noActiveJenis = !jenisDokterList.some((j) => j.status === "aktif");

  const [kodePrefix, ...kodeRest] = kodeDokter.split("-");
  const kodeNumber = kodeRest.join("-");

  const setField = <K extends keyof DoctorFormValues>(
    name: K,
    value: DoctorFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setField(name as keyof DoctorFormValues, value as never);
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
      if (err instanceof DoctorApiError) {
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
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
        <h2 className="text-xl font-medium text-gray-900 mb-8">{title}</h2>

        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600">
              {formError}
            </div>
          )}

          {/* Informasi Pribadi */}
          <h3 className="text-sm text-pink-600 mb-4">Informasi Pribadi</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mb-5">
            <Field label="Nama" required error={errors.nama} className="md:col-span-3">
              <input
                type="text"
                name="nama"
                value={values.nama}
                onChange={handleChange}
                placeholder="Masukkan nama dokter.."
                className={inputClass(!!errors.nama)}
              />
            </Field>

            <Field label="Jenis Kelamin" required error={errors.jenisKelamin}>
              <div className="flex items-center gap-5 h-[46px]">
                {(["Pria", "Wanita"] as const).map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"
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

            <Field
              label="Tempat Lahir"
              required
              error={errors.tempatLahir}
              className="md:col-span-3"
            >
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
                className={`${inputClass(!!errors.tanggalLahir)} text-gray-600`}
              />
            </Field>

            <Field
              label="Nomor Handphone"
              required
              error={errors.nomorHandphone}
              className="md:col-span-2"
            >
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

            <Field label="Email" required error={errors.email} className="md:col-span-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Masukkan email.."
                  className={`${inputClass(!!errors.email)} pl-11`}
                />
              </div>
            </Field>

            <Field label="Alamat" required error={errors.alamat} className="md:col-span-4">
              <textarea
                name="alamat"
                rows={4}
                value={values.alamat}
                onChange={handleChange}
                placeholder="Masukkan Alamat.."
                className={`${inputClass(!!errors.alamat)} resize-y`}
              />
            </Field>
          </div>

          {/* Informasi Dokter */}
          <h3 className="text-sm text-pink-600 mt-8 mb-4">Informasi Dokter</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5">
            <Field label="Kode Dokter">
              <div className="flex">
                <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">
                  {kodePrefix}
                </span>
                <input
                  type="text"
                  value={kodeNumber}
                  readOnly
                  tabIndex={-1}
                  title="Kode dibuat otomatis oleh sistem"
                  className="w-full min-w-0 px-3 py-3 bg-gray-50 border border-gray-200 rounded-r-lg text-sm text-gray-600 focus:outline-none cursor-not-allowed"
                />
              </div>
            </Field>

            <Field
              label="Jenis Dokter"
              required
              error={errors.jenisDokterId}
              className="md:col-span-3"
            >
              <select
                name="jenisDokterId"
                value={values.jenisDokterId}
                onChange={handleChange}
                className={`${inputClass(!!errors.jenisDokterId)} ${
                  values.jenisDokterId ? "text-gray-800" : "text-gray-500"
                }`}
              >
                <option value="">Pilih Jenis Dokter</option>
                {options.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jenisDokter}
                    {j.status !== "aktif" ? " (Nonaktif)" : ""}
                  </option>
                ))}
              </select>
              {noActiveJenis && (
                <p className="text-xs text-amber-600 mt-1.5">
                  Belum ada jenis dokter yang aktif. Tambahkan atau aktifkan dulu
                  di menu{" "}
                  <Link to="/jenis-dokter" className="font-medium underline">
                    Jenis Dokter
                  </Link>
                  .
                </p>
              )}
            </Field>

            <Field label="Spesialisasi" error={errors.spesialisasi} className="md:col-span-2">
              <input
                type="text"
                name="spesialisasi"
                value={values.spesialisasi}
                onChange={handleChange}
                placeholder="Masukkan Spesialisasi"
                className={inputClass(!!errors.spesialisasi)}
              />
            </Field>

            <Field
              label="Subspesialisasi"
              error={errors.subspesialisasi}
              className="md:col-span-2"
            >
              <input
                type="text"
                name="subspesialisasi"
                value={values.subspesialisasi}
                onChange={handleChange}
                placeholder="Masukkan Subspesialisasi"
                className={inputClass(!!errors.subspesialisasi)}
              />
            </Field>

            <Field
              label="Special Clinical Interest"
              error={errors.specialClinicalInterest}
              className="md:col-span-2"
            >
              <input
                type="text"
                name="specialClinicalInterest"
                value={values.specialClinicalInterest}
                onChange={handleChange}
                placeholder="Masukkan Fokus atau Minat Khusus..."
                className={inputClass(!!errors.specialClinicalInterest)}
              />
            </Field>

            <Field
              label="Specialized Service Line"
              error={errors.specializedServiceLine}
              className="md:col-span-2"
            >
              <input
                type="text"
                name="specializedServiceLine"
                value={values.specializedServiceLine}
                onChange={handleChange}
                placeholder="Masukkan Lini Pelayanan Khusus..."
                className={inputClass(!!errors.specializedServiceLine)}
              />
            </Field>
          </div>

          {/* Tombol aksi */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="px-6 py-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || noActiveJenis}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} />
              {saving ? "Menyimpan..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
