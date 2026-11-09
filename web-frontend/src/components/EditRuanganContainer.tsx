import RuanganForm from "./RuanganForm";
import type { Ruangan } from "../types/ruangan";
import { ruanganApi } from "../services/ruanganApi";

interface EditRuanganContainerProps {
  item: Ruangan;
  onBack: () => void;
  onSuccess: () => void;
}

export default function EditRuanganContainer({
  item,
  onBack,
  onSuccess,
}: EditRuanganContainerProps) {
  return (
    <RuanganForm
      title="Edit Ruangan"
      submitLabel="Simpan Perubahan"
      initialValues={{ namaRuangan: item.namaRuangan, status: item.status }}
      onBack={onBack}
      onSubmit={async (values) => {
        await ruanganApi.update(item.id, values);
        onSuccess();
      }}
    />
  );
}
