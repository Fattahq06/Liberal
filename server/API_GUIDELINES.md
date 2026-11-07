# Panduan Penulisan Route & API - Proyek Servis HP

## 1. Aturan Penulisan URL (Endpoint)

- Gunakan huruf kecil semua (lowercase).
- Gunakan format _plural_ (jamak) untuk sumber data, contoh: `/api/services`.
- Untuk aksi spesifik, gunakan format RESTful standar:
  - `GET /api/services` -> Ambil semua data
  - `GET /api/services/:id` -> Ambil satu data berdasarkan ID
  - `POST /api/services` -> Tambah data baru
  - `PUT /api/services/:id` -> Edit data berdasarkan ID
  - `DELETE /api/services/:id` -> Hapus data berdasarkan ID

## 2. Format Request Body (POST / PUT)

Pastikan mengirim data JSON dengan field berikut:

```json
{
  "namaCustomer": "String",
  "seriHandphone": "String",
  "kerusakan": "String",
  "biaya": "Number"
}
```
