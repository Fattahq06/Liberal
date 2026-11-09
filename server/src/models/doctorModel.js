const db = require("../config/database");

// ---------- Pembungkus sqlite3 supaya bisa dipakai dengan async/await ----------
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// Data dokter selalu diambil bersama nama & status jenis dokternya (relasi)
const BASE_SELECT = `
  SELECT
    d.*,
    j.jenisDokter AS namaJenisDokter,
    j.status AS statusJenisDokter
  FROM doctors d
  LEFT JOIN jenisDokter j ON d.jenisDokterId = j.id
`;

// Ambil semua data dokter (urut dari kode terlama ke terbaru)
const getAllDoctors = () => all(`${BASE_SELECT} ORDER BY d.id ASC`);

// Ambil satu data dokter berdasarkan ID
const getDoctorById = (id) => get(`${BASE_SELECT} WHERE d.id = ?`, [id]);

// Kode dokter berikutnya (DR-0001, DR-0002, ...) dari nomor kode terbesar yang ada,
// jadi tidak bentrok walau ada data yang dihapus.
const getNextCode = async () => {
  const row = await get(
    `SELECT COALESCE(MAX(CAST(SUBSTR(kodeDokter, 4) AS INTEGER)), 0) AS maxNo FROM doctors`,
  );
  return `DR-${String((row ? row.maxNo : 0) + 1).padStart(4, "0")}`;
};

/**
 * Insert data dokter baru
 * @param {Object} data data dokter yang sudah divalidasi
 * @returns {Promise<Object>} data dokter yang baru dibuat
 */
const createDoctor = async (data) => {
  const kodeDokter = await getNextCode();

  const { lastID } = await run(
    `INSERT INTO doctors (
      nama, jenisKelamin, tempatLahir, tanggalLahir, nomorHandphone, email, alamat,
      kodeDokter, jenisDokterId, spesialisasi, subspesialisasi,
      specialClinicalInterest, specializedServiceLine, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')`,
    [
      data.nama,
      data.jenisKelamin,
      data.tempatLahir,
      data.tanggalLahir,
      data.nomorHandphone,
      data.email,
      data.alamat,
      kodeDokter,
      data.jenisDokterId,
      data.spesialisasi,
      data.subspesialisasi,
      data.specialClinicalInterest,
      data.specializedServiceLine,
    ],
  );

  return getDoctorById(lastID);
};

// Edit / Update data dokter (kode dokter tidak bisa diubah). null bila ID tidak ada.
const updateDoctor = async (id, data) => {
  const { changes } = await run(
    `UPDATE doctors SET
      nama = ?, jenisKelamin = ?, tempatLahir = ?, tanggalLahir = ?,
      nomorHandphone = ?, email = ?, alamat = ?, jenisDokterId = ?,
      spesialisasi = ?, subspesialisasi = ?,
      specialClinicalInterest = ?, specializedServiceLine = ?
    WHERE id = ?`,
    [
      data.nama,
      data.jenisKelamin,
      data.tempatLahir,
      data.tanggalLahir,
      data.nomorHandphone,
      data.email,
      data.alamat,
      data.jenisDokterId,
      data.spesialisasi,
      data.subspesialisasi,
      data.specialClinicalInterest,
      data.specializedServiceLine,
      id,
    ],
  );
  if (changes === 0) return null;
  return getDoctorById(id);
};

// Ubah status dokter (aktif / non aktif). null bila ID tidak ada.
const updateStatus = async (id, status) => {
  const { changes } = await run(`UPDATE doctors SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
  if (changes === 0) return null;
  return getDoctorById(id);
};

// Hapus data dokter beserta jadwal temunya (sesuai ON DELETE CASCADE di skema).
// true = terhapus, false = ID tidak ada
const deleteDoctor = async (id) => {
  await run(`DELETE FROM jadwalTemu WHERE doctorId = ?`, [id]);
  const { changes } = await run(`DELETE FROM doctors WHERE id = ?`, [id]);
  return changes > 0;
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getNextCode,
  createDoctor,
  updateDoctor,
  updateStatus,
  deleteDoctor,
};
