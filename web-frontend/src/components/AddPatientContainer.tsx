import PatientForm from "./PatientForm";
import { emptyPatientForm } from "../types/patient";
import { patientApi } from "../services/patientApi";

interface AddPatientContainerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddPatientContainer({
  onBack,
  onSuccess,
}: AddPatientContainerProps) {
  return (
    <PatientForm
      title="Tambah Data Pasien"
      submitLabel="Simpan Data Pasien"
      initialValues={emptyPatientForm}
      onBack={onBack}
      onSubmit={async (values) => {
        await patientApi.create(values);
        onSuccess();
      }}
    />
  );
}
