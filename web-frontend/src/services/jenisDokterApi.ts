import type {
  JenisDokter,
  JenisDokterFormErrors,
  JenisDokterFormValues,
} from "../types/jenisDokter";

const BASE_URL: string =
  import.meta.env.VITE_API_JENIS_DOKTER_URL ??
  "http://localhost:3000/api/jenis-dokter";

export class JenisDokterApiError extends Error {
  fieldErrors: JenisDokterFormErrors;

  constructor(message: string, fieldErrors: JenisDokterFormErrors = {}) {
    super(message);
    this.name = "JenisDokterApiError";
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
    throw new JenisDokterApiError(
      "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
    );
  }

  let body: {
    message?: string;
    serverMessage?: string;
    errors?: JenisDokterFormErrors;
    data?: T;
  } = {};
  try {
    body = await response.json();
  } catch {
    // body bukan JSON, abaikan
  }

  if (!response.ok) {
    throw new JenisDokterApiError(
      body.serverMessage ??
        body.message ??
        `Terjadi kesalahan (kode ${response.status})`,
      body.errors ?? {},
    );
  }
  return body as T;
}

export const jenisDokterApi = {
  async getAll(): Promise<JenisDokter[]> {
    const res = await request<{ data: JenisDokter[] }>("/all");
    return Array.isArray(res.data) ? res.data : [];
  },

  async create(values: JenisDokterFormValues): Promise<void> {
    await request("", { method: "POST", body: JSON.stringify(values) });
  },

  async update(id: number, values: JenisDokterFormValues): Promise<void> {
    await request(`/edit/${id}`, { method: "PUT", body: JSON.stringify(values) });
  },

  async remove(id: number): Promise<void> {
    await request(`/delete/${id}`, { method: "DELETE" });
  },
};
