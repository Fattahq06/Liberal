import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import CopyButton from "./CopyButton";
import { usePatient } from "../hooks/usePatient";
import {
  formatTanggal,
  formatTanggalRegistrasi,
  getInisial,
  hitungUmur,
} from "../utils/patientFormat";

interface DetailPatientContainerProps {
  patientId: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

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
      <h3 className="text-sm font-medium text-pink-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {children}
      </div>
    </section>
  );
}

export default function DetailPatientContainer({
  patientId,
  onBack,
  onEdit,
  onDelete,
}: DetailPatientContainerProps) {
  const { patient, loading, error } = usePatient(patientId);

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

      {loading || error || !patient ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
          {loading ? "Memuat detail pasien..." : error ?? "Data pasien tidak ditemukan"}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
          {/* Kepala kartu: avatar, kode, nama, aksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 shrink-0 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center text-lg font-medium">
                {getInisial(patient.nama)}
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  Kode:{" "}
                  <span className="font-medium text-gray-900">
                    {patient.kodePasien}
                  </span>
                  <CopyButton text={patient.kodePasien} />
                </p>
                <h2 className="text-lg font-medium text-gray-900 mt-1">
                  Pasien - {patient.nama}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={15} />
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={15} />
                Hapus
              </button>
            </div>
          </div>

          <Section title="Informasi Pribadi">
            <Info label="Nama">{patient.nama}</Info>
            <Info label="Jenis Kelamin">{patient.jenisKelamin}</Info>
            <Info label="Tempat, Tanggal Lahir">
              {patient.tempatLahir}, {formatTanggal(patient.tanggalLahir)}
            </Info>
            <Info label="Umur">{hitungUmur(patient.tanggalLahir)}</Info>
            <Info label="No Handphone">{patient.nomorHandphone}</Info>
            <Info label="Email">{patient.email}</Info>
            <Info label="Alamat" className="md:col-span-2">
              {patient.alamat}
            </Info>
          </Section>

          <Section title="Informasi Pasien">
            <Info label="Kode Pasien">
              <span className="inline-flex items-center gap-2">
                {patient.kodePasien}
                <CopyButton text={patient.kodePasien} />
              </span>
            </Info>
            <Info label="Jenis Pasien">Pasien {patient.jenisPasien}</Info>
            {patient.jenisPasien === "BPJS" && (
              <Info label="Faskes" className="md:col-span-2">
                {patient.faskes || "-"}
              </Info>
            )}
          </Section>

          <Section title="Informasi Administrasi">
            <Info label="NIK">{patient.nikPasien}</Info>
            <Info label="Tanggal Registrasi">
              {formatTanggalRegistrasi(patient.createdAt)}
            </Info>
          </Section>
        </div>
      )}
    </div>
  );
}
