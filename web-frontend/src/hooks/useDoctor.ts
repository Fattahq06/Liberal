import { useCallback, useEffect, useState } from "react";
import type { Doctor } from "../types/doctor";
import { doctorApi } from "../services/doctorApi";

/** Ambil satu dokter berdasarkan ID dari server. reload() memuat ulang tanpa berkedip. */
export function useDoctor(id: number) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // State awal sudah loading=true; komponen dibuat ulang tiap ganti halaman.
    let cancelled = false;

    doctorApi
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          setDoctor(data);
          setError(null);
        }
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
  }, [id, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { doctor, loading, error, reload };
}
