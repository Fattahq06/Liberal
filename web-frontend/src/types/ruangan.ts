export type StatusRuangan = "aktif" | "non aktif";

// Bentuk data ruangan yang dikirim oleh server
export interface Ruangan {
  id: number;
  namaRuangan: string;
  status: StatusRuangan;
}

export interface RuanganFormValues {
  namaRuangan: string;
  status: StatusRuangan;
}

export type RuanganFormErrors = Partial<Record<keyof RuanganFormValues, string>>;

export const emptyRuanganForm: RuanganFormValues = {
  namaRuangan: "",
  status: "aktif",
};

export const labelStatusRuangan = (s: StatusRuangan) =>
  s === "aktif" ? "Aktif" : "Non Aktif";
