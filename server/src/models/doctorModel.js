const db = require("../config/database");

/**
 * Insert data dokter baru
 * @param {Object} body data dokter
 * @returns {Promise<Object>} data dokter yang baru dibuat
 */
const createDoctor = (body) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO doctors (
          nama,
          jenisKelamin,
          tempatLahir,
          tanggalLahir,
          nomorHandphone,
          email,
          alamat,
          kodeDokter,
          jenisDokterId,
          spesialisasi,
          subspesialisasi,
          specialClinicalInterest,
          specializedServiceLine
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        body.nama,
        body.jenisKelamin,
        body.tempatLahir,
        body.tanggalLahir,
        body.nomorHandphone,
        body.email,
        body.alamat,
        body.kodeDokter,
        body.jenisDokterId, // Diubah dari jenisDokter ke jenisDokterId
        body.spesialisasi || null,
        body.subspesialisasi || null,
        body.specialClinicalInterest || null,
        body.specializedServiceLine || null,
      ];

      db.run(query, values, function (err) {
        if (err) {
          console.error("Something's not right!", err);
          return reject(err);
        }

        // Ambil data yang baru di-insert beserta join jenis dokternya agar konsisten
        db.get(
          `
          SELECT 
            doctors.*, 
            jenisDokter.jenisDokter AS namaJenisDokter,
            jenisDokter.status AS statusJenisDokter
          FROM doctors
          JOIN jenisDokter ON doctors.jenisDokterId = jenisDokter.id
          WHERE doctors.id = ?
        `,
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

// Ambil semua data dokter (Menggunakan JOIN agar data jenis dokter ikut tampil)
const viewAllDoctors = () => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          doctors.*, 
          jenisDokter.jenisDokter AS namaJenisDokter,
          jenisDokter.status AS statusJenisDokter
        FROM doctors
        JOIN jenisDokter ON doctors.jenisDokterId = jenisDokter.id
      `;

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

// Ambil satu data dokter berdasarkan ID (Menggunakan JOIN)
const viewSingleDoctor = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          doctors.*, 
          jenisDokter.jenisDokter AS namaJenisDokter,
          jenisDokter.status AS statusJenisDokter
        FROM doctors
        JOIN jenisDokter ON doctors.jenisDokterId = jenisDokter.id
        WHERE doctors.id = ?
      `;

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

// Edit / Update data dokter
const editDoctor = (id, body) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE doctors
      SET nama = ?,
          jenisKelamin = ?,
          tempatLahir = ?,
          tanggalLahir = ?,
          nomorHandphone = ?,
          email = ?,
          alamat = ?,
          kodeDokter = ?,
          jenisDokterId = ?,
          spesialisasi = ?,
          subspesialisasi = ?,
          specialClinicalInterest = ?,
          specializedServiceLine = ?
      WHERE id = ?
    `;

    const values = [
      body.nama,
      body.jenisKelamin,
      body.tempatLahir,
      body.tanggalLahir,
      body.nomorHandphone,
      body.email,
      body.alamat,
      body.kodeDokter,
      body.jenisDokterId, // Diubah dari jenisDokter ke jenisDokterId
      body.spesialisasi || null,
      body.subspesialisasi || null,
      body.specialClinicalInterest || null,
      body.specializedServiceLine || null,
      id,
    ];

    db.run(query, values, function (err) {
      if (err) {
        console.error("Something's not right!", err);
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(null);
      }

      // Ambil data dokter yang sudah di-update beserta JOIN jenis dokternya
      db.get(
        `
        SELECT 
          doctors.*, 
          jenisDokter.jenisDokter AS namaJenisDokter,
          jenisDokter.status AS statusJenisDokter
        FROM doctors
        JOIN jenisDokter ON doctors.jenisDokterId = jenisDokter.id
        WHERE doctors.id = ?
      `,
        [id],
        (err, row) => {
          if (err) {
            return reject(err);
          }

          resolve(row);
        },
      );
    });
  });
};

// Hapus data dokter
const deleteDoctor = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM doctors WHERE id = ?`;

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
  createDoctor,
  viewAllDoctors,
  viewSingleDoctor,
  editDoctor,
  deleteDoctor,
};
