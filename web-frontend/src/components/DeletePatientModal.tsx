import { Trash2 } from "lucide-react";
import type { Patient } from "../types/patient";

interface DeletePatientModalProps {
  patient: Patient;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeletePatientModal({
  patient,
  deleting,
  error,
  onCancel,
  onConfirm,
}: DeletePatientModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
      onClick={deleting ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
          <Trash2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pasien?</h3>
        <p className="text-sm text-gray-500">
          Data pasien{" "}
          <span className="font-semibold text-gray-800">{patient.nama}</span> (
          {patient.kodePasien}) beserta jadwal temunya akan dihapus permanen dan
          tidak dapat dikembalikan.
        </p>

        {error && (
          <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
