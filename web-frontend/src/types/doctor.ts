import type { JenisKelamin } from "./patient";
import type { StatusJenisDokter } from "./jenisDokter";

export type StatusDokter = "aktif" | "non aktif";

// Bentuk data dokter yang dikirim oleh server (sudah digabung dengan jenis dokternya)
export interface Doctor {
  id: number;
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  nomorHandphone: string;
  email: string;
  alamat: string;
  kodeDokter: string;
  jenisDokterId: number;
  spesialisasi: string | null;
  subspesialisasi: string | null;
  specialClinicalInterest: string | null;
  specializedServiceLine: string | null;
  status: StatusDokter;
  createdAt: string;
  namaJenisDokter: string | null;
  statusJenisDokter: StatusJenisDokter | null;
}

// Nilai di dalam form (semua berupa string supaya mudah di-bind ke input)
export interface DoctorFormValues {
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  nomorHandphone: string;
  email: string;
  alamat: string;
  jenisDokterId: string; // "" = belum dipilih
  spesialisasi: string;
  subspesialisasi: string;
  specialClinicalInterest: string;
  specializedServiceLine: string;
}

export type DoctorFormErrors = Partial<Record<keyof DoctorFormValues, string>>;

export const emptyDoctorForm: DoctorFormValues = {
  nama: "",
  jenisKelamin: "Pria",
  tempatLahir: "",
  tanggalLahir: "",
  nomorHandphone: "",
  email: "",
  alamat: "",
  jenisDokterId: "",
  spesialisasi: "",
  subspesialisasi: "",
  specialClinicalInterest: "",
  specializedServiceLine: "",
};

export function doctorToFormValues(d: Doctor): DoctorFormValues {
  return {
    nama: d.nama,
    jenisKelamin: d.jenisKelamin,
    tempatLahir: d.tempatLahir,
    tanggalLahir: d.tanggalLahir,
    nomorHandphone: d.nomorHandphone,
    email: d.email,
    alamat: d.alamat,
    jenisDokterId: String(d.jenisDokterId),
    spesialisasi: d.spesialisasi ?? "",
    subspesialisasi: d.subspesialisasi ?? "",
    specialClinicalInterest: d.specialClinicalInterest ?? "",
    specializedServiceLine: d.specializedServiceLine ?? "",
  };
}

// Sesuai desain: "Aktif" dan "Nonaktif"
export const labelStatusDokter = (s: StatusDokter) =>
  s === "aktif" ? "Aktif" : "Nonaktif";
