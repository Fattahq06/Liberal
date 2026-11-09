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

// Ambil semua ruangan (urut abjad)
const getAllRuangan = () =>
  all(`SELECT * FROM ruangan ORDER BY namaRuangan COLLATE NOCASE ASC`);

const getRuanganById = (id) => get(`SELECT * FROM ruangan WHERE id = ?`, [id]);

// Cari ruangan dengan nama sama (excludeId dipakai saat edit)
const findByName = (nama, excludeId = 0) =>
  get(
    `SELECT * FROM ruangan WHERE LOWER(namaRuangan) = LOWER(?) AND id != ?`,
    [nama, excludeId],
  );

// Hitung jadwal temu yang memakai ruangan ini
const countJadwalUsing = async (id) => {
  const row = await get(
    `SELECT COUNT(*) AS total FROM jadwalTemu WHERE ruanganId = ?`,
    [id],
  );
  return row ? row.total : 0;
};

const createRuangan = async (body) => {
  const { lastID } = await run(
    `INSERT INTO ruangan (namaRuangan, status) VALUES (?, ?)`,
    [body.namaRuangan, body.status || "aktif"],
  );
  return getRuanganById(lastID);
};

const updateRuangan = async (id, body) => {
  const { changes } = await run(
    `UPDATE ruangan SET namaRuangan = ?, status = ? WHERE id = ?`,
    [body.namaRuangan, body.status || "aktif", id],
  );
  if (changes === 0) return null;
  return getRuanganById(id);
};

const deleteRuangan = async (id) => {
  const { changes } = await run(`DELETE FROM ruangan WHERE id = ?`, [id]);
  return changes > 0;
};

module.exports = {
  getAllRuangan,
  getRuanganById,
  findByName,
  countJadwalUsing,
  createRuangan,
  updateRuangan,
  deleteRuangan,
};
