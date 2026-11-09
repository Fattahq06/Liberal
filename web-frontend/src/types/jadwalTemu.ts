export type StatusJadwal = "menunggu" | "selesai" | "batal";

// Bentuk data jadwal temu yang dikirim oleh server (sudah digabung dengan dokter, pasien & ruangan)
export interface JadwalTemu {
  id: number;
  doctorId: number;
  patientId: number;
  ruanganId: number | null;
  kodeRekamMedis: string | null;
  tanggalTemu: string; // YYYY-MM-DD
  jamTemu: string; // HH:MM
  keluhan: string;
  status: StatusJadwal;
  createdAt: string;
  namaDokter: string | null;
  kodeDokter: string | null;
  namaJenisDokter: string | null;
  namaPasien: string | null;
  kodePasien: string | null;
  namaRuangan: string | null;
}

// Nilai di dalam form (semua berupa string supaya mudah di-bind ke input)
export interface JadwalTemuFormValues {
  patientId: string; // "" = belum dipilih
  doctorId: string;
  ruanganId: string;
  tanggalTemu: string;
  jamTemu: string;
  keluhan: string;
}

export type JadwalTemuFormErrors = Partial<Record<keyof JadwalTemuFormValues, string>>;

export const emptyJadwalTemuForm: JadwalTemuFormValues = {
  patientId: "",
  doctorId: "",
  ruanganId: "",
  tanggalTemu: "",
  jamTemu: "",
  keluhan: "",
};

export function jadwalToFormValues(j: JadwalTemu): JadwalTemuFormValues {
  return {
    patientId: String(j.patientId),
    doctorId: String(j.doctorId),
    ruanganId: j.ruanganId ? String(j.ruanganId) : "",
    tanggalTemu: j.tanggalTemu,
    jamTemu: j.jamTemu,
    keluhan: j.keluhan,
  };
}

export const labelStatusJadwal = (s: StatusJadwal) =>
  s === "selesai" ? "Selesai" : s === "batal" ? "Batal" : "Menunggu";
