const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** "2006-01-16" -> "16 Januari 2006" */
export function formatTanggal(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "-";
  return `${pad(d)} ${BULAN[m - 1]} ${y}`;
}

/** createdAt dari SQLite (UTC, "YYYY-MM-DD HH:MM:SS") -> tanggal lokal */
export function formatTanggalRegistrasi(createdAt: string | null | undefined): string {
  if (!createdAt) return "-";
  const date = new Date(createdAt.replace(" ", "T") + "Z");
  if (isNaN(date.getTime())) return formatTanggal(createdAt);
  return `${pad(date.getDate())} ${BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

/** Hitung umur dari tanggal lahir -> "19 Tahun" (atau "5 Bulan" untuk bayi) */
export function hitungUmur(tanggalLahir: string | null | undefined): string {
  if (!tanggalLahir) return "-";
  const [y, m, d] = tanggalLahir.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "-";

  const now = new Date();
  let tahun = now.getFullYear() - y;
  let bulan = now.getMonth() + 1 - m;
  if (now.getDate() < d) bulan -= 1;
  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }
  if (tahun < 0) return "-";
  if (tahun === 0) return `${bulan} Bulan`;
  return `${tahun} Tahun`;
}

export function getInisial(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Tanggal hari ini (lokal) dalam format YYYY-MM-DD, untuk atribut max input date */
export function hariIniISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}
