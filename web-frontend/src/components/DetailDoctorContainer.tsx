import { useState } from "react";
import { ArrowLeft, Ban, Check, Pencil, PlusSquare } from "lucide-react";
import CopyButton from "./CopyButton";
import NoticeBanner, { type Notice } from "./NoticeBanner";
import { useDoctor } from "../hooks/useDoctor";
import { doctorApi } from "../services/doctorApi";
import { labelStatusDokter } from "../types/doctor";
import { formatTanggal, getInisial, hitungUmur } from "../utils/patientFormat";

interface DetailDoctorContainerProps {
  doctorId: number;
  onBack: () => void;
  onEdit: () => void;
  /** Dipanggil setelah data berubah (mis. status) supaya daftar ikut diperbarui */
  onChanged: () => void;
}

const KOSONG = "Informasi Belum tersedia";

function Info({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-[15px] font-medium text-gray-900 break-words">
        {children}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h3 className="text-sm text-pink-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {children}
      </div>
    </section>
  );
}

const iconBtn =
  "w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40";

export default function DetailDoctorContainer({
  doctorId,
  onBack,
  onEdit,
  onChanged,
}: DetailDoctorContainerProps) {
  const { doctor, loading, error, reload } = useDoctor(doctorId);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [toggling, setToggling] = useState(false);

  const toggleStatus = async () => {
    if (!doctor) return;
    const next = doctor.status === "aktif" ? "non aktif" : "aktif";
    try {
      setToggling(true);
      await doctorApi.setStatus(doctor.id, next);
      setNotice({
        type: "success",
        text: `Dokter ${doctor.nama} berhasil ${next === "aktif" ? "diaktifkan" : "dinonaktifkan"}.`,
      });
      reload();
      onChanged();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status",
      });
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      {loading || (error && !doctor) || !doctor ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
          {loading ? "Memuat detail dokter..." : error ?? "Data dokter tidak ditemukan"}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
          {/* Kepala kartu: avatar, kode, nama, aksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 shrink-0 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center text-lg">
                {getInisial(doctor.nama)}
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  Kode:{" "}
                  <span className="font-medium text-gray-900">
                    {doctor.kodeDokter}
                  </span>
                  <CopyButton text={doctor.kodeDokter} />
                </p>
                <h2 className="text-base font-medium text-gray-900 mt-1 flex items-center gap-3">
                  Dokter - {doctor.nama}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doctor.status === "aktif"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        doctor.status === "aktif" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></span>
                    {labelStatusDokter(doctor.status)}
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Edit"
                onClick={onEdit}
                className={`${iconBtn} text-orange-500`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                title={doctor.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                disabled={toggling}
                onClick={toggleStatus}
                className={`${iconBtn} ${
                  doctor.status === "aktif" ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {doctor.status === "aktif" ? <Ban size={15} /> : <Check size={15} />}
              </button>
              <button
                type="button"
                disabled
                title="Segera hadir (menunggu fitur Jadwal Temu)"
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-pink-500 text-white text-xs font-medium opacity-50 cursor-not-allowed"
              >
                <PlusSquare size={14} />
                Lakukan Pengobatan
              </button>
            </div>
          </div>

          <Section title="Informasi Pribadi">
            <Info label="Nama">{doctor.nama}</Info>
            <Info label="Jenis Kelamin">{doctor.jenisKelamin}</Info>
            <Info label="Tempat, Tanggal Lahir">
              {doctor.tempatLahir}, {formatTanggal(doctor.tanggalLahir)}
            </Info>
            <Info label="Umur">{hitungUmur(doctor.tanggalLahir)}</Info>
            <Info label="No Handphone">{doctor.nomorHandphone}</Info>
            <Info label="Email">{doctor.email}</Info>
            <Info label="Alamat" className="md:col-span-2">
              {doctor.alamat}
            </Info>
          </Section>

          <Section title="Informasi Dokter">
            <Info label="Kode Dokter">
              <span className="inline-flex items-center gap-2">
                {doctor.kodeDokter}
                <CopyButton text={doctor.kodeDokter} />
              </span>
            </Info>
            <Info label="Jenis Dokter">{doctor.namaJenisDokter || "-"}</Info>
            <Info label="Spesialisasi">{doctor.spesialisasi || KOSONG}</Info>
            <Info label="Subspesialisasi">{doctor.subspesialisasi || KOSONG}</Info>
            <Info label="Special Clinical Interest">
              {doctor.specialClinicalInterest || KOSONG}
            </Info>
            <Info label="Specialized Service Line">
              {doctor.specializedServiceLine || KOSONG}
            </Info>
          </Section>
        </div>
      )}
    </div>
  );
}
