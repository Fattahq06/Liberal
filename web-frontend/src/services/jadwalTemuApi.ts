import type {
  JadwalTemu,
  JadwalTemuFormErrors,
  JadwalTemuFormValues,
  StatusJadwal,
} from "../types/jadwalTemu";

const BASE_URL: string =
  import.meta.env.VITE_API_JADWAL_TEMU_URL ??
  "http://localhost:3000/api/jadwal-temu";

export class JadwalTemuApiError extends Error {
  fieldErrors: JadwalTemuFormErrors;

  constructor(message: string, fieldErrors: JadwalTemuFormErrors = {}) {
    super(message);
    this.name = "JadwalTemuApiError";
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new JadwalTemuApiError(
      "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
    );
  }

  let body: {
    message?: string;
    serverMessage?: string;
    errors?: JadwalTemuFormErrors;
    data?: T;
  } = {};
  try {
    body = await response.json();
  } catch {
    // body bukan JSON, abaikan
  }

  if (!response.ok) {
    throw new JadwalTemuApiError(
      body.serverMessage ??
        body.message ??
        `Terjadi kesalahan (kode ${response.status})`,
      body.errors ?? {},
    );
  }
  return body as T;
}

// Form menyimpan id sebagai string, server butuh angka
const toPayload = (v: JadwalTemuFormValues) =>
  JSON.stringify({
    ...v,
    patientId: Number(v.patientId),
    doctorId: Number(v.doctorId),
    ruanganId: Number(v.ruanganId),
  });

export const jadwalTemuApi = {
  /** patientId opsional: hanya jadwal milik satu pasien */
  async getAll(patientId?: number): Promise<JadwalTemu[]> {
    const res = await request<{ data: JadwalTemu[] }>(
      patientId ? `/all?patientId=${patientId}` : "/all",
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: number): Promise<JadwalTemu> {
    const res = await request<{ data: JadwalTemu }>(`/single/${id}`);
    return res.data;
  },

  async create(values: JadwalTemuFormValues): Promise<void> {
    await request("", { method: "POST", body: toPayload(values) });
  },

  async update(id: number, values: JadwalTemuFormValues): Promise<void> {
    await request(`/edit/${id}`, { method: "PUT", body: toPayload(values) });
  },

  async setStatus(id: number, status: StatusJadwal): Promise<void> {
    await request(`/status/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async remove(id: number): Promise<void> {
    await request(`/delete/${id}`, { method: "DELETE" });
  },
};
