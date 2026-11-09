import type { Patient, PatientFormErrors, PatientFormValues } from "../types/patient";

const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/patients";

export class ApiError extends Error {
  fieldErrors: PatientFormErrors;

  constructor(message: string, fieldErrors: PatientFormErrors = {}) {
    super(message);
    this.name = "ApiError";
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
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
    );
  }

  let body: { message?: string; errors?: PatientFormErrors; data?: T } = {};
  try {
    body = await response.json();
  } catch {
    // body bukan JSON, abaikan
  }

  if (!response.ok) {
    throw new ApiError(
      body.message ?? `Terjadi kesalahan (kode ${response.status})`,
      body.errors ?? {},
    );
  }
  return body as T;
}

export const patientApi = {
  async getAll(): Promise<Patient[]> {
    const res = await request<{ data: Patient[] }>("/all");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: number): Promise<Patient> {
    const res = await request<{ data: Patient }>(`/single/${id}`);
    return res.data;
  },

  async create(values: PatientFormValues): Promise<void> {
    await request("", { method: "POST", body: JSON.stringify(values) });
  },

  async update(id: number, values: PatientFormValues): Promise<void> {
    await request(`/edit/${id}`, { method: "PUT", body: JSON.stringify(values) });
  },

  async remove(id: number): Promise<void> {
    await request(`/delete/${id}`, { method: "DELETE" });
  },
};
