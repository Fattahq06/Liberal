import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

interface AddPatientContainerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddPatientContainer({
  onBack,
  onSuccess,
}: AddPatientContainerProps) {
  // State form tanpa kodePasien (karena digenerate otomatis oleh backend)
  const [formData, setFormData] = useState({
    nama: "",
    jenisKelamin: "Pria",
    tempatLahir: "",
    tanggalLahir: "",
    nomorHandphone: "",
    email: "",
    alamat: "",
    jenisPasien: "Umum",
    nikPasien: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Data pasien berhasil disimpan!");
        onSuccess();
      } else {
        alert("Gagal menyimpan data pasien.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Tambah Data Pasien
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informasi Pribadi */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-pink-600 mb-4">
              Informasi Pribadi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama pasien.."
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-6 h-[46px]">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Pria"
                      checked={formData.jenisKelamin === "Pria"}
                      onChange={handleChange}
                      className="accent-pink-500 w-4 h-4"
                    />
                    Pria
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Wanita"
                      checked={formData.jenisKelamin === "Wanita"}
                      onChange={handleChange}
                      className="accent-pink-500 w-4 h-4"
                    />
                    Wanita
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  placeholder="Kota kelahiran.."
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Nomor Handphone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomorHandphone"
                  value={formData.nomorHandphone}
                  onChange={handleChange}
                  placeholder="Masukkan no telepon.."
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email.."
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Alamat <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="alamat"
                rows={3}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Masukkan Alamat.."
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Informasi Pasien (Tanpa input Kode Pasien karena otomatis) */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-pink-600 mb-4">
              Informasi Pasien
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jenis Pasien */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Jenis Pasien
                </label>
                <select
                  name="jenisPasien"
                  value={formData.jenisPasien}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                >
                  <option value="Umum">Umum</option>
                  <option value="BPJS">BPJS</option>
                  <option value="Asuransi">Asuransi</option>
                </select>
              </div>

              {/* NIK Pasien */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  NIK Pasien
                </label>
                <input
                  type="text"
                  name="nikPasien"
                  value={formData.nikPasien}
                  onChange={handleChange}
                  placeholder="Masukkan NIK Pasien.."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {loading ? "Menyimpan..." : "Simpan Data Pasien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
