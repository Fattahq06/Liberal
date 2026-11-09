import { useEffect, useState } from "react";
import type { Patient } from "../types/patient";
import { patientApi } from "../services/patientApi";

/** Ambil satu pasien berdasarkan ID dari server */
export function usePatient(id: number) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // State awal sudah loading=true; komponen dibuat ulang tiap ganti halaman.
    let cancelled = false;

    patientApi
      .getById(id)
      .then((data) => {
        if (!cancelled) setPatient(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { patient, loading, error };
}
