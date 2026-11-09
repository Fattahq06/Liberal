export type JenisKelamin = "Pria" | "Wanita";
export type JenisPasien = "Umum" | "BPJS";

// Bentuk data pasien yang dikirim oleh server
export interface Patient {
  id: number;
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  nomorHandphone: string;
  email: string;
  alamat: string;
  kodePasien: string;
  jenisPasien: JenisPasien;
  nikPasien: string;
  faskes: string | null;
  createdAt: string; // YYYY-MM-DD HH:MM:SS (UTC)
}

// Nilai di dalam form (semua berupa string supaya mudah di-bind ke input)
export interface PatientFormValues {
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  nomorHandphone: string;
  email: string;
  alamat: string;
  jenisPasien: JenisPasien;
  nikPasien: string;
  faskes: string;
}

export type PatientFormErrors = Partial<Record<keyof PatientFormValues, string>>;

export const emptyPatientForm: PatientFormValues = {
  nama: "",
  jenisKelamin: "Pria",
  tempatLahir: "",
  tanggalLahir: "",
  nomorHandphone: "",
  email: "",
  alamat: "",
  jenisPasien: "Umum",
  nikPasien: "",
  faskes: "",
};

export function patientToFormValues(p: Patient): PatientFormValues {
  return {
    nama: p.nama,
    jenisKelamin: p.jenisKelamin,
    tempatLahir: p.tempatLahir,
    tanggalLahir: p.tanggalLahir,
    nomorHandphone: p.nomorHandphone,
    email: p.email,
    alamat: p.alamat,
    jenisPasien: p.jenisPasien,
    nikPasien: p.nikPasien,
    faskes: p.faskes ?? "",
  };
}
