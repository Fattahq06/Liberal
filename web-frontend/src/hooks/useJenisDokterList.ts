import { useEffect, useState } from "react";
import type { JenisDokter } from "../types/jenisDokter";
import { jenisDokterApi } from "../services/jenisDokterApi";

/** Ambil semua jenis dokter (dipakai untuk pilihan di form dokter) */
export function useJenisDokterList() {
  const [list, setList] = useState<JenisDokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    jenisDokterApi
      .getAll()
      .then((data) => {
        if (!cancelled) setList(data);
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
  }, []);

  return { list, loading, error };
}
