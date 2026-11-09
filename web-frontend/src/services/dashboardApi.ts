export interface DashboardSummary {
  pasien: number;
  dokterAktif: number;
  jadwalTemu: number;
}

const BASE_URL: string =
  import.meta.env.VITE_API_DASHBOARD_URL ?? "http://localhost:3000/api/dashboard";

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    let response: Response;
    try {
      response = await fetch(BASE_URL);
    } catch {
      throw new Error(
        "Tidak dapat terhubung ke server. Pastikan server sudah dijalankan.",
      );
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        body.serverMessage ?? body.message ?? `Terjadi kesalahan (kode ${response.status})`,
      );
    }
    return body.data as DashboardSummary;
  },
};
