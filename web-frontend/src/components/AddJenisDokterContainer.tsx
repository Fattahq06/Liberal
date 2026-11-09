import JenisDokterForm from "./JenisDokterForm";
import { emptyJenisDokterForm } from "../types/jenisDokter";
import { jenisDokterApi } from "../services/jenisDokterApi";

interface AddJenisDokterContainerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddJenisDokterContainer({
  onBack,
  onSuccess,
}: AddJenisDokterContainerProps) {
  return (
    <JenisDokterForm
      title="Tambah Jenis Dokter"
      submitLabel="Simpan Jenis Dokter"
      initialValues={emptyJenisDokterForm}
      onBack={onBack}
      onSubmit={async (values) => {
        await jenisDokterApi.create(values);
        onSuccess();
      }}
    />
  );
}
