import { ArrowLeft } from "lucide-react";
import DoctorForm from "./DoctorForm";
import { doctorToFormValues } from "../types/doctor";
import { doctorApi } from "../services/doctorApi";
import { useDoctor } from "../hooks/useDoctor";
import { useJenisDokterList } from "../hooks/useJenisDokterList";

interface EditDoctorContainerProps {
  doctorId: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function EditDoctorContainer({
  doctorId,
  onBack,
  onSuccess,
}: EditDoctorContainerProps) {
  const { doctor, loading, error } = useDoctor(doctorId);
  const jenis = useJenisDokterList();

  const failure = error ?? jenis.error;

  if (loading || jenis.loading || failure || !doctor) {
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
        <div
          className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm p-16 text-center text-sm ${
            failure ? "text-rose-500" : "text-gray-400"
          }`}
        >
          {failure ?? (loading || jenis.loading ? "Memuat data dokter..." : "Data dokter tidak ditemukan")}
        </div>
      </div>
    );
  }

  return (
    <DoctorForm
      title="Edit Data Dokter"
      submitLabel="Simpan Perubahan"
      initialValues={doctorToFormValues(doctor)}
      kodeDokter={doctor.kodeDokter}
      jenisDokterList={jenis.list}
      onBack={onBack}
      onSubmit={async (values) => {
        await doctorApi.update(doctor.id, values);
        onSuccess();
      }}
    />
  );
}
