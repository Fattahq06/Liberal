const db = require("../config/database");

/**
 * Insert data jenis dokter baru
 * @param {Object} body data jenis dokter
 * @returns {Promise<Object>} data jenis dokter yang baru dibuat
 */
const createJenisDokter = (body) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO jenisDokter (
          jenisDokter,
          status
        )
        VALUES (?, ?)
      `;

      const values = [body.jenisDokter, body.status || "aktif"];

      db.run(query, values, function (err) {
        if (err) {
          console.error("Something's not right!", err);
          return reject(err);
        }

        db.get(
          `SELECT * FROM jenisDokter WHERE id = ?`,
          [this.lastID],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          },
        );
      });
    } catch (error) {
      console.error("Something's not right!", error);
      reject(error);
    }
  });
};

// Ambil semua data jenis dokter
const getAllJenisDokter = () => {
  return new Promise((resolve, reject) => {
    try {
      const query = `SELECT * FROM jenisDokter`;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Something's not right!", err);
          return reject(err);
        }

        resolve(rows);
      });
    } catch (error) {
      console.error("Something's not right!", error);
      reject(error);
    }
  });
};

// Ambil satu data jenis dokter berdasarkan ID
const getJenisDokterById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `SELECT * FROM jenisDokter WHERE id = ?`;

      db.get(query, [id], (err, row) => {
        if (err) {
          console.error("Something's not right!", err);
          return reject(err);
        }

        resolve(row);
      });
    } catch (error) {
      console.error("Something's not right!", error);
      reject(error);
    }
  });
};

// Edit / Update data jenis dokter
const updateJenisDokter = (id, body) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE jenisDokter
      SET jenisDokter = ?,
          status = ?
      WHERE id = ?
    `;

    const values = [body.jenisDokter, body.status || "aktif", id];

    db.run(query, values, function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(null);
      }

      db.get(`SELECT * FROM jenisDokter WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return reject(err);
        }

        resolve(row);
      });
    });
  });
};

// Hapus data jenis dokter
const deleteJenisDokter = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM jenisDokter WHERE id = ?`;

    db.run(query, [id], function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(false);
      }

      resolve(true);
    });
  });
};

module.exports = {
  createJenisDokter,
  getAllJenisDokter,
  getJenisDokterById,
  updateJenisDokter,
  deleteJenisDokter,
};
