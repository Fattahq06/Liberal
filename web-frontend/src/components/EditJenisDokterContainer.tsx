import JenisDokterForm from "./JenisDokterForm";
import type { JenisDokter } from "../types/jenisDokter";
import { jenisDokterApi } from "../services/jenisDokterApi";

interface EditJenisDokterContainerProps {
  item: JenisDokter;
  onBack: () => void;
  onSuccess: () => void;
}

export default function EditJenisDokterContainer({
  item,
  onBack,
  onSuccess,
}: EditJenisDokterContainerProps) {
  return (
    <JenisDokterForm
      title="Edit Jenis Dokter"
      submitLabel="Simpan Perubahan"
      initialValues={{ jenisDokter: item.jenisDokter, status: item.status }}
      onBack={onBack}
      onSubmit={async (values) => {
        await jenisDokterApi.update(item.id, values);
        onSuccess();
      }}
    />
  );
}
