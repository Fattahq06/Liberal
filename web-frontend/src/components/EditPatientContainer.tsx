import PatientForm from "./PatientForm";
import { ArrowLeft } from "lucide-react";
import { patientToFormValues } from "../types/patient";
import { patientApi } from "../services/patientApi";
import { usePatient } from "../hooks/usePatient";

interface EditPatientContainerProps {
  patientId: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function EditPatientContainer({
  patientId,
  onBack,
  onSuccess,
}: EditPatientContainerProps) {
  const { patient, loading, error } = usePatient(patientId);

  if (loading || error || !patient) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
          {loading ? "Memuat data pasien..." : error ?? "Data pasien tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <PatientForm
      title={`Edit Data Pasien - ${patient.kodePasien}`}
      submitLabel="Simpan Perubahan"
      initialValues={patientToFormValues(patient)}
      onBack={onBack}
      onSubmit={async (values) => {
        await patientApi.update(patient.id, values);
        onSuccess();
      }}
    />
  );
}
