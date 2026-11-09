import type {
  Doctor,
  DoctorFormErrors,
  DoctorFormValues,
  StatusDokter,
} from "../types/doctor";

const BASE_URL: string =
  import.meta.env.VITE_API_DOKTER_URL ?? "http://localhost:3000/api/doctors";

export class DoctorApiError extends Error {
  fieldErrors: DoctorFormErrors;

  constructor(message: string, fieldErrors: DoctorFormErrors = {}) {
    super(message);
    this.name = "DoctorApiError";
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
    throw new DoctorApiError(
      "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
    );
  }

  let body: {
    message?: string;
    serverMessage?: string;
    errors?: DoctorFormErrors;
    data?: T;
  } = {};
  try {
    body = await response.json();
  } catch {
    // body bukan JSON, abaikan
  }

  if (!response.ok) {
    throw new DoctorApiError(
      body.serverMessage ??
        body.message ??
        `Terjadi kesalahan (kode ${response.status})`,
      body.errors ?? {},
    );
  }
  return body as T;
}

// Form menyimpan jenisDokterId sebagai string, server butuh angka
const toPayload = (v: DoctorFormValues) =>
  JSON.stringify({ ...v, jenisDokterId: Number(v.jenisDokterId) });

export const doctorApi = {
  async getAll(): Promise<Doctor[]> {
    const res = await request<{ data: Doctor[] }>("/all");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: number): Promise<Doctor> {
    const res = await request<{ data: Doctor }>(`/single/${id}`);
    return res.data;
  },

  async getNextCode(): Promise<string> {
    const res = await request<{ data: { kodeDokter: string } }>("/next-code");
    return res.data.kodeDokter;
  },

  async create(values: DoctorFormValues): Promise<void> {
    await request("", { method: "POST", body: toPayload(values) });
  },

  async update(id: number, values: DoctorFormValues): Promise<void> {
    await request(`/edit/${id}`, { method: "PUT", body: toPayload(values) });
  },

  async setStatus(id: number, status: StatusDokter): Promise<void> {
    await request(`/status/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async remove(id: number): Promise<void> {
    await request(`/delete/${id}`, { method: "DELETE" });
  },
};
