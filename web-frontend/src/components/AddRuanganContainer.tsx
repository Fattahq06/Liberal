import RuanganForm from "./RuanganForm";
import { emptyRuanganForm } from "../types/ruangan";
import { ruanganApi } from "../services/ruanganApi";

interface AddRuanganContainerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddRuanganContainer({
  onBack,
  onSuccess,
}: AddRuanganContainerProps) {
  return (
    <RuanganForm
      title="Tambah Ruangan"
      submitLabel="Simpan Ruangan"
      initialValues={emptyRuanganForm}
      onBack={onBack}
      onSubmit={async (values) => {
        await ruanganApi.create(values);
        onSuccess();
      }}
    />
  );
}
