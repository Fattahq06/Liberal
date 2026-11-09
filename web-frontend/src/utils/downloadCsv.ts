// Unduh data sebagai file CSV (bisa dibuka di Excel / Google Sheets)

type Cell = string | number | null | undefined;

const escapeCell = (v: Cell) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Bungkus teks angka (mis. no HP) supaya Excel tidak menghapus angka 0 di depan */
export const asText = (v: string) => (v ? `="${v.replace(/"/g, '""')}"` : "");

export function downloadCsv(filename: string, header: string[], rows: Cell[][]) {
  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          // sel berformat ="..." sudah berbentuk rumus teks, jangan di-escape lagi
          typeof cell === "string" && cell.startsWith('="') ? cell : escapeCell(cell),
        )
        .join(","),
    )
    .join("\r\n");

  // BOM (\uFEFF) supaya Excel membaca UTF-8 dengan benar
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
