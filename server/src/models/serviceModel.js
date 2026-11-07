const db = require("../config/database");

/**
 * Insert transaksi service baru
 * @param {Object} body { namaCustomer, seriHandphone, kerusakan, biaya }
 * @returns {Promise<Object>} data yang baru dibuat
 */
const createNewService = (body) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO services (namaCustomer, seriHandphone, kerusakan, status, biaya, tanggal)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const statusDefault = "Masuk";
      const tanggalHariIni = new Date().toISOString().split("T")[0];

      const values = [
        body.namaCustomer,
        body.seriHandphone,
        body.kerusakan,
        statusDefault,
        Number(body.biaya),
        tanggalHariIni,
      ];

      db.run(query, values, function (err) {
        if (err) {
          console.error("Something's not right!", err);
          return reject(err);
        }

        // [isan] this.lastID = id auto-increment yang baru dibuat
        resolve({
          // sebutkan aja satu persatu sesuai dengan data yang di database
          id: this.lastID,
          namaCustomer: body.namaCustomer,
          seriHandphone: body.seriHandphone,
          kerusakan: body.kerusakan,
          status: statusDefault,
          biaya: Number(body.biaya),
          tanggal: tanggalHariIni,
        });
      });
    } catch (error) {
      console.error("Something's not right!", error);
      reject(error);
    }
  });
};

const viewAllServices = () => {
  return new Promise((resolve, reject) => {
    try {
      const query = `SELECT * FROM services`;

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

const viewSingleService = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `SELECT * FROM services WHERE id = ?`;

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

const editService = (id, body) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE services
      SET namaCustomer = ?,
          seriHandphone = ?,
          kerusakan = ?,
          status = ?,
          biaya = ?
      WHERE id = ?
    `;

    const values = [
      body.namaCustomer,
      body.seriHandphone,
      body.kerusakan,
      body.status,
      Number(body.biaya),
      id,
    ];

    db.run(query, values, function (err) {
      if (err) {
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(null);
      }

      // Ambil data service yang sudah di-update
      db.get(`SELECT * FROM services WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  });
};

const deleteService = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM services WHERE id = ?`;

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
  createNewService,
  viewAllServices,
  viewSingleService,
  editService,
  deleteService,
};
