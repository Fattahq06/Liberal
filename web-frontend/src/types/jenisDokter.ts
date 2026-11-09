export type StatusJenisDokter = "aktif" | "non aktif";

// Bentuk data jenis dokter yang dikirim oleh server
export interface JenisDokter {
  id: number;
  jenisDokter: string;
  status: StatusJenisDokter;
}

export interface JenisDokterFormValues {
  jenisDokter: string;
  status: StatusJenisDokter;
}

export type JenisDokterFormErrors = Partial<
  Record<keyof JenisDokterFormValues, string>
>;

export const emptyJenisDokterForm: JenisDokterFormValues = {
  jenisDokter: "",
  status: "aktif",
};

export const labelStatus = (s: StatusJenisDokter) =>
  s === "aktif" ? "Aktif" : "Non Aktif";
