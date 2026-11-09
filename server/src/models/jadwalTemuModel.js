const db = require("../config/database");

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
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

// Jadwal temu selalu diambil bersama data dokter, pasien & ruangannya.
// Status lama 'pending' dianggap 'menunggu'.
const BASE_SELECT = `
  SELECT
    j.id, j.doctorId, j.patientId, j.ruanganId, j.kodeRekamMedis,
    j.tanggalTemu, j.jamTemu, j.keluhan, j.catatanDokter, j.createdAt,
    CASE WHEN j.status IS NULL OR j.status = 'pending' THEN 'menunggu' ELSE j.status END AS status,
    d.nama AS namaDokter, d.kodeDokter, jd.jenisDokter AS namaJenisDokter,
    p.nama AS namaPasien, p.kodePasien,
    r.namaRuangan
  FROM jadwalTemu j
  LEFT JOIN doctors d ON j.doctorId = d.id
  LEFT JOIN jenisDokter jd ON d.jenisDokterId = jd.id
  LEFT JOIN patients p ON j.patientId = p.id
  LEFT JOIN ruangan r ON j.ruanganId = r.id
`;

// Terbaru di atas. patientId opsional untuk memfilter jadwal milik satu pasien.
const getAllJadwal = (patientId) =>
  patientId
    ? all(
        `${BASE_SELECT} WHERE j.patientId = ? ORDER BY j.tanggalTemu DESC, j.jamTemu DESC, j.id DESC`,
        [patientId],
      )
    : all(`${BASE_SELECT} ORDER BY j.tanggalTemu DESC, j.jamTemu DESC, j.id DESC`);

const getJadwalById = (id) => get(`${BASE_SELECT} WHERE j.id = ?`, [id]);

// Kode rekam medis berikutnya: RM-00000000001, RM-00000000002, ...
const getNextRekamMedis = async () => {
  const row = await get(
    `SELECT COALESCE(MAX(CAST(SUBSTR(kodeRekamMedis, 4) AS INTEGER)), 0) AS maxNo FROM jadwalTemu`,
  );
  return `RM-${String((row ? row.maxNo : 0) + 1).padStart(11, "0")}`;
};

const createJadwal = async (data) => {
  const kode = await getNextRekamMedis();
  const { lastID } = await run(
    `INSERT INTO jadwalTemu
      (doctorId, patientId, ruanganId, kodeRekamMedis, tanggalTemu, jamTemu, keluhan, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'menunggu')`,
    [
      data.doctorId,
      data.patientId,
      data.ruanganId,
      kode,
      data.tanggalTemu,
      data.jamTemu,
      data.keluhan,
    ],
  );
  return getJadwalById(lastID);
};

const updateJadwal = async (id, data) => {
  const { changes } = await run(
    `UPDATE jadwalTemu SET
       doctorId = ?, patientId = ?, ruanganId = ?,
       tanggalTemu = ?, jamTemu = ?, keluhan = ?
     WHERE id = ?`,
    [
      data.doctorId,
      data.patientId,
      data.ruanganId,
      data.tanggalTemu,
      data.jamTemu,
      data.keluhan,
      id,
    ],
  );
  if (changes === 0) return null;
  return getJadwalById(id);
};

const updateStatus = async (id, status) => {
  const { changes } = await run(`UPDATE jadwalTemu SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
  if (changes === 0) return null;
  return getJadwalById(id);
};

const deleteJadwal = async (id) => {
  const { changes } = await run(`DELETE FROM jadwalTemu WHERE id = ?`, [id]);
  return changes > 0;
};

// Pengecekan relasi untuk validasi
const getDoctor = (id) => get(`SELECT id, status FROM doctors WHERE id = ?`, [id]);
const getPatient = (id) => get(`SELECT id FROM patients WHERE id = ?`, [id]);
const getRuangan = (id) => get(`SELECT id, status FROM ruangan WHERE id = ?`, [id]);

module.exports = {
  getAllJadwal,
  getJadwalById,
  getNextRekamMedis,
  createJadwal,
  updateJadwal,
  updateStatus,
  deleteJadwal,
  getDoctor,
  getPatient,
  getRuangan,
};
