import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DoctorForm from "./DoctorForm";
import { emptyDoctorForm } from "../types/doctor";
import { doctorApi } from "../services/doctorApi";
import { useJenisDokterList } from "../hooks/useJenisDokterList";

interface AddDoctorContainerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddDoctorContainer({
  onBack,
  onSuccess,
}: AddDoctorContainerProps) {
  const jenis = useJenisDokterList();
  const [kode, setKode] = useState<string | null>(null);
  const [kodeError, setKodeError] = useState<string | null>(null);

  // Kode dokter berikutnya (mis. DR-0004) diminta dari server
  useEffect(() => {
    let cancelled = false;
    doctorApi
      .getNextCode()
      .then((k) => {
        if (!cancelled) setKode(k);
      })
      .catch((err: Error) => {
        if (!cancelled) setKodeError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const error = jenis.error ?? kodeError;

  if (error || jenis.loading || kode === null) {
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
            error ? "text-rose-500" : "text-gray-400"
          }`}
        >
          {error ?? "Menyiapkan form..."}
        </div>
      </div>
    );
  }

  return (
    <DoctorForm
      title="Tambah Data Dokter"
      submitLabel="Simpan Data Dokter"
      initialValues={emptyDoctorForm}
      kodeDokter={kode}
      jenisDokterList={jenis.list}
      onBack={onBack}
      onSubmit={async (values) => {
        await doctorApi.create(values);
        onSuccess();
      }}
    />
  );
}
