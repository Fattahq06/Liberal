import type {
  Ruangan,
  RuanganFormErrors,
  RuanganFormValues,
} from "../types/ruangan";

const BASE_URL: string =
  import.meta.env.VITE_API_RUANGAN_URL ?? "http://localhost:3000/api/ruangan";

export class RuanganApiError extends Error {
  fieldErrors: RuanganFormErrors;

  constructor(message: string, fieldErrors: RuanganFormErrors = {}) {
    super(message);
    this.name = "RuanganApiError";
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
    throw new RuanganApiError(
      "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
    );
  }

  let body: {
    message?: string;
    serverMessage?: string;
    errors?: RuanganFormErrors;
    data?: T;
  } = {};
  try {
    body = await response.json();
  } catch {
    // body bukan JSON, abaikan
  }

  if (!response.ok) {
    throw new RuanganApiError(
      body.serverMessage ??
        body.message ??
        `Terjadi kesalahan (kode ${response.status})`,
      body.errors ?? {},
    );
  }
  return body as T;
}

export const ruanganApi = {
  async getAll(): Promise<Ruangan[]> {
    const res = await request<{ data: Ruangan[] }>("/all");
    return Array.isArray(res.data) ? res.data : [];
  },

  async create(values: RuanganFormValues): Promise<void> {
    await request("", { method: "POST", body: JSON.stringify(values) });
  },

  async update(id: number, values: RuanganFormValues): Promise<void> {
    await request(`/edit/${id}`, { method: "PUT", body: JSON.stringify(values) });
  },

  async remove(id: number): Promise<void> {
    await request(`/delete/${id}`, { method: "DELETE" });
  },
};
