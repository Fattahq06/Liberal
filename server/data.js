const db = require("./src/db");
 
const args = process.argv.slice(2);
const reset = args.includes("--reset");
const numArg = args.find((a) => /^[0-9]+$/.test(a));
const JUMLAH_PASIEN = Math.min(Math.max(parseInt(numArg, 10) || 100, 1), 2000);
 
// Pengacak yang hasilnya selalu sama (supaya data contoh konsisten)
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261108);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const between = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const pad = (n, len) => String(n).padStart(len, "0");
const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2);
 
const NAMA_PRIA = ["Andika", "Budi", "Ihsan", "Dick", "Shane", "Rizky", "Fajar", "Dimas", "Bagas", "Hendra", "Agus", "Joko", "Reza", "Farhan", "Yoga", "Kevin", "Michael", "Daniel", "Eko", "Taufik"];
const NAMA_WANITA = ["Dilan", "Rachel", "Siti", "Rina", "Dewi", "Putri", "Maya", "Intan", "Nadia", "Sari", "Wulan", "Citra", "Ayu", "Lina", "Melati", "Tania", "Vivi", "Clara", "Fitri", "Rani"];
const NAMA_BELAKANG = ["Monica", "Darmawan", "Amanda", "Luk", "Pratama", "Nasution", "Siregar", "Lubis", "Hutapea", "Tanjung", "Sihombing", "Harahap", "Wijaya", "Santoso", "Saputra", "Liau", "Ginting", "Sitorus", "Purba", "Halim"];
const KOTA = ["Medan", "Binjai", "Pematangsiantar", "Tebing Tinggi", "Kisaran", "Lubuk Pakam", "Padang", "Pekanbaru"];
const JALAN = ["Jl. Karya Bakti", "Jl. Gatot Subroto", "Jl. Sisingamangaraja", "Jl. Setia Budi", "Jl. Iskandar Muda", "Jl. Ringroad", "Jl. Gajah Mada", "Jl. Diponegoro"];
const FASKES = ["Puskesmas Medan Baru", "Puskesmas Helvetia", "Klinik Pratama Sehat", "Puskesmas Medan Johor", null, null];
const KELUHAN = ["Sakit Gigi", "Demam", "Batuk dan Pilek", "Sakit Kepala", "Nyeri Punggung", "Kontrol Rutin", "Gatal pada Kulit", "Sakit Perut", "Pemeriksaan Gigi", "Konsultasi Umum"];
 
const DOKTER = [
  ["dr. Hendra Wijaya", "Pria", "Dokter Umum", "Umum", null],
  ["dr. Maya Sari", "Wanita", "Dokter Umum", "Umum", null],
  ["drg. Rina Lubis", "Wanita", "Dokter Umum", "Gigi", "Konservasi Gigi"],
  ["dr. Agus Santoso", "Pria", "Dokter Umum", "Penyakit Dalam", "Gastroenterologi"],
  ["dr. Putri Nasution", "Wanita", "Dokter Umum", "Anak", null],
  ["dr. Fajar Siregar", "Pria", "Dokter Umum", "Kulit dan Kelamin", null],
  ["dr. Intan Harahap", "Wanita", "Dokter Umum", "Saraf", "Neurologi Klinis"],
  ["Ns. Dewi Tanjung", "Wanita", "Tenaga Medis", null, null],
  ["Ns. Yoga Pratama", "Pria", "Tenaga Medis", null, null],
  ["dr. Reza Saputra", "Pria", "Dokter Umum", "Umum", null],
];
 
function jenisId(nama) {
  const row = db.prepare("SELECT id FROM jenis_dokter WHERE nama_jenis = ?").get(nama);
  if (row) return row.id;
  return Number(db.prepare("INSERT INTO jenis_dokter (nama_jenis) VALUES (?)").run(nama).lastInsertRowid);
}
 
function main() {
  const existing = db.prepare("SELECT COUNT(*) AS c FROM pasien").get().c;
  if (existing > 0 && !reset) {
    console.log("Database sudah berisi " + existing + " pasien. Tidak ada data yang diubah.");
    console.log("Gunakan: node data.js --reset  untuk mengisi ulang dari awal.");
    return;
  }
 
  const run = db.transaction(() => {
    if (reset) {
      db.prepare("DELETE FROM jadwal_temu").run();
      db.prepare("DELETE FROM pasien").run();
      db.prepare("DELETE FROM dokter").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('jadwal_temu','pasien','dokter')").run();
    }
 
    // Dokter
    const insDokter = db.prepare(
      "INSERT INTO dokter (kode_dokter, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, no_hp, email, alamat, jenis_dokter_id, spesialisasi, subspesialisasi, special_clinical_interest, specialized_service_line, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    const setKodeDokter = db.prepare("UPDATE dokter SET kode_dokter = ? WHERE id = ?");
    DOKTER.forEach((d, i) => {
      const tgl = fmt(new Date(between(1965, 1992), between(0, 11), between(1, 28)));
      const aktif = i === DOKTER.length - 1 ? 0 : 1; // dokter terakhir sengaja nonaktif
      const info = insDokter.run(
        "TMP-D" + i, d[0], d[1], pick(KOTA), tgl, "0812" + pad(20000000 + i * 1357, 8),
        "dokter" + (i + 1) + "@wiraplan.test", pick(JALAN) + " No. " + between(1, 99),
        jenisId(d[2]), d[3], d[4], null, null, aktif
      );
      const id = Number(info.lastInsertRowid);
      setKodeDokter.run("DR-" + pad(id, 3), id);
    });
 
    // Pasien
    const insPasien = db.prepare(
      "INSERT INTO pasien (kode_pasien, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, no_hp, email, alamat, jenis_pasien, faskes, nik, tanggal_registrasi, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    const setKodePasien = db.prepare("UPDATE pasien SET kode_pasien = ? WHERE id = ?");
    const hariIni = new Date();
    for (let i = 1; i <= JUMLAH_PASIEN; i++) {
      const pria = rnd() < 0.5;
      const nama = pick(pria ? NAMA_PRIA : NAMA_WANITA) + " " + pick(NAMA_BELAKANG);
      const tgl = fmt(new Date(between(1955, 2018), between(0, 11), between(1, 28)));
      const reg = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() - between(0, 400));
      const bpjs = rnd() < 0.45;
      const aktif = rnd() < 0.9 ? 1 : 0;
      const info = insPasien.run(
        "TMP-P" + i, nama, pria ? "Pria" : "Wanita", pick(KOTA), tgl,
        "0813" + pad(10000000 + i * 7919 % 89999999, 8),
        nama.toLowerCase().replace(/[^a-z]+/g, ".") + "." + i + "@example.com",
        pick(JALAN) + " No. " + between(1, 150),
        bpjs ? "BPJS" : "Umum", bpjs ? pick(FASKES) : null,
        "1207" + pad(i, 12), fmt(reg), aktif
      );
      const id = Number(info.lastInsertRowid);
      setKodePasien.run("PT-" + pad(id, 4), id);
    }
 
    // Jadwal temu (hanya memakai pasien dan dokter yang aktif)
    const dokterAktif = db.prepare("SELECT id FROM dokter WHERE is_active = 1").all().map((r) => r.id);
    const pasienAktif = db.prepare("SELECT id FROM pasien WHERE is_active = 1").all().map((r) => r.id);
    const insJadwal = db.prepare("INSERT INTO jadwal_temu (tanggal, dokter_id, pasien_id, keluhan, status) VALUES (?,?,?,?,?)");
    const jumlahJadwal = Math.min(40, pasienAktif.length);
    for (let i = 0; i < jumlahJadwal; i++) {
      const offset = between(-14, 7);
      const tgl = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() + offset);
      let status = "menunggu";
      if (offset < 0) status = rnd() < 0.85 ? "selesai" : "dibatalkan";
      insJadwal.run(fmt(tgl), pick(dokterAktif), pasienAktif[i], pick(KELUHAN), status);
    }
  });
 
  run();
 
  const c = (sql) => db.prepare(sql).get().c;
  console.log("Data contoh berhasil diisi:");
  console.log("  jenis dokter :", c("SELECT COUNT(*) AS c FROM jenis_dokter"));
  console.log("  dokter       :", c("SELECT COUNT(*) AS c FROM dokter"));
  console.log("  pasien       :", c("SELECT COUNT(*) AS c FROM pasien"));
  console.log("  jadwal temu  :", c("SELECT COUNT(*) AS c FROM jadwal_temu"));
}
 
try {
  main();
} catch (err) {
  console.error("Gagal mengisi data contoh:", err.message);
  process.exitCode = 1;
}
if (typeof db.close === "function") db.close();
