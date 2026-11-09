const db = require("../config/database");

/**
 * Insert data jenis dokter baru
 * @param {Object} body data jenis dokter
 * @returns {Promise<Object>} data jenis dokter yang baru dibuat
 */
const createJenisDokter = (body) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO jenisDokter (jenisDokter, status) VALUES (?, ?)`;
    const values = [body.jenisDokter, body.status || "aktif"];

    db.run(query, values, function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }

      db.get(
        `SELECT * FROM jenisDokter WHERE id = ?`,
        [this.lastID],
        (getErr, row) => {
          if (getErr) return reject(getErr);
          resolve(row);
        },
      );
    });
  });
};

// Ambil semua data jenis dokter (urut abjad)
const getAllJenisDokter = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM jenisDokter ORDER BY jenisDokter COLLATE NOCASE ASC`;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};

// Ambil satu data jenis dokter berdasarkan ID
const getJenisDokterById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM jenisDokter WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }
      resolve(row);
    });
  });
};

// Cari jenis dokter dengan nama sama (tanpa peduli huruf besar/kecil).
// excludeId dipakai saat edit supaya data itu sendiri tidak dihitung bentrok.
const findByName = (nama, excludeId = 0) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM jenisDokter WHERE LOWER(jenisDokter) = LOWER(?) AND id != ?`,
      [nama, excludeId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
};

// Hitung berapa dokter yang memakai jenis dokter ini
const countDoctorsUsing = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) AS total FROM doctors WHERE jenisDokterId = ?`,
      [id],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.total : 0);
      },
    );
  });
};

// Edit / Update data jenis dokter. Mengembalikan baris terbaru, atau null bila ID tidak ada.
const updateJenisDokter = (id, body) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE jenisDokter SET jenisDokter = ?, status = ? WHERE id = ?`;
    const values = [body.jenisDokter, body.status || "aktif", id];

    db.run(query, values, function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }

      if (this.changes === 0) return resolve(null);

      db.get(`SELECT * FROM jenisDokter WHERE id = ?`, [id], (getErr, row) => {
        if (getErr) return reject(getErr);
        resolve(row);
      });
    });
  });
};

// Hapus data jenis dokter. true = terhapus, false = ID tidak ada
const deleteJenisDokter = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM jenisDokter WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }
      resolve(this.changes > 0);
    });
  });
};

module.exports = {
  createJenisDokter,
  getAllJenisDokter,
  getJenisDokterById,
  findByName,
  countDoctorsUsing,
  updateJenisDokter,
  deleteJenisDokter,
};
