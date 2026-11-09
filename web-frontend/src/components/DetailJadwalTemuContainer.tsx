import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Check, Pencil, PlusSquare } from "lucide-react";
import CopyButton from "./CopyButton";
import EmptyBalloon from "./EmptyBalloon";
import NoticeBanner, { type Notice } from "./NoticeBanner";
import {
  labelStatusJadwal,
  type JadwalTemu,
  type StatusJadwal,
} from "../types/jadwalTemu";
import { jadwalTemuApi } from "../services/jadwalTemuApi";
import { formatTanggal, getInisial } from "../utils/patientFormat";

interface DetailJadwalTemuContainerProps {
  /** Dipakai App untuk mengganti judul & breadcrumb di Header */
  onHeaderChange?: (title: string, breadcrumb: string) => void;
}

type Tab = "informasi" | "penanganan" | "obat";

const TABS: { key: Tab; label: string }[] = [
  { key: "informasi", label: "Informasi" },
  { key: "penanganan", label: "Penanganan" },
  { key: "obat", label: "Obat" },
];

// Tab yang belum dikerjakan: hanya menampilkan keterangan data belum tersedia
const TAB_KOSONG: Record<Exclude<Tab, "informasi">, string> = {
  penanganan: "Data ini hanya tersedia untuk Dokter & Pasien",
  obat: "Data ini hanya tersedia untuk Dokter, Pasien, & Apoteker",
};

const STATUS_BADGE: Record<StatusJadwal, string> = {
  selesai: "bg-emerald-50 text-emerald-800",
  menunggu: "bg-amber-50 text-amber-700",
  batal: "bg-rose-50 text-rose-600",
};

function Info({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-[15px] font-medium text-gray-900 break-words">
        {children}
      </div>
    </div>
  );
}

function Section({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "" : "mt-9"}>
      <h3 className="text-sm text-pink-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {children}
      </div>
    </section>
  );
}

const iconBtn =
  "w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40";

export default function DetailJadwalTemuContainer({
  onHeaderChange,
}: DetailJadwalTemuContainerProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [jadwal, setJadwal] = useState<JadwalTemu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("informasi");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onHeaderChange?.("Detail Pasien", "Pengobatan > Jadwal Temu > Detail");
  }, [onHeaderChange]);

  const load = useCallback(async () => {
    try {
      setJadwal(await jadwalTemuApi.getById(Number(id)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Notifikasi hilang sendiri setelah beberapa detik
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const changeStatus = async (next: StatusJadwal) => {
    if (!jadwal) return;
    try {
      setBusy(true);
      await jadwalTemuApi.setStatus(jadwal.id, next);
      setNotice({
        type: "success",
        text: next === "batal" ? "Jadwal temu dibatalkan." : "Jadwal temu diaktifkan kembali.",
      });
      await load();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status",
      });
    } finally {
      setBusy(false);
    }
  };

  const back = () => navigate("/jadwal-temu");
  const namaPasien = jadwal?.namaPasien ?? "-";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        type="button"
        onClick={back}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      {loading || error || !jadwal ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-16 text-center text-sm text-gray-400">
          {loading ? "Memuat detail jadwal temu..." : error ?? "Data jadwal temu tidak ditemukan"}
        </div>
      ) : (
        <>
          {/* Kartu kepala: avatar, kode, nama, aksi, dan tab */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm px-8 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center text-lg">
                  {getInisial(namaPasien)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    Kode:{" "}
                    <span className="font-medium text-gray-900">
                      {jadwal.kodePasien ?? "-"}
                    </span>
                    {jadwal.kodePasien && <CopyButton text={jadwal.kodePasien} />}
                  </p>
                  <h2 className="text-base font-medium text-gray-900 mt-1 flex items-center gap-3">
                    Pasien - {namaPasien}
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-normal ${STATUS_BADGE[jadwal.status]}`}
                    >
                      {labelStatusJadwal(jadwal.status)}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Edit"
                  onClick={() => navigate(`/jadwal-temu/${jadwal.id}/edit`)}
                  className={`${iconBtn} text-orange-500`}
                >
                  <Pencil size={15} />
                </button>
                {jadwal.status === "menunggu" && (
                  <button
                    type="button"
                    title="Batalkan"
                    disabled={busy}
                    onClick={() => changeStatus("batal")}
                    className={`${iconBtn} text-rose-500`}
                  >
                    <Ban size={15} />
                  </button>
                )}
                {jadwal.status === "batal" && (
                  <button
                    type="button"
                    title="Aktifkan kembali"
                    disabled={busy}
                    onClick={() => changeStatus("menunggu")}
                    className={`${iconBtn} text-emerald-500`}
                  >
                    <Check size={15} />
                  </button>
                )}
                <button
                  type="button"
                  disabled
                  title="Segera hadir"
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-pink-500 text-white text-xs font-medium opacity-50 cursor-not-allowed"
                >
                  <PlusSquare size={14} />
                  Lakukan Pengobatan
                </button>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-6" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-3 text-sm border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-pink-500 text-pink-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Isi tab */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 mt-6">
            {tab === "informasi" ? (
              <>
                <Section title="Jadwal Temu" first>
                  <Info label="Kode Rekam Medis">
                    {jadwal.kodeRekamMedis ? (
                      <span className="inline-flex items-center gap-2">
                        {jadwal.kodeRekamMedis}
                        <CopyButton text={jadwal.kodeRekamMedis} />
                      </span>
                    ) : (
                      "-"
                    )}
                  </Info>
                  <Info label="Ruangan">{jadwal.namaRuangan || "-"}</Info>
                  <Info label="Tanggal">{formatTanggal(jadwal.tanggalTemu)}</Info>
                  <Info label="Waktu">{jadwal.jamTemu} WIB</Info>
                  <Info label="Keluhan" className="md:col-span-2">
                    {jadwal.keluhan}
                  </Info>
                </Section>

                <Section title="Informasi Dokter">
                  <Info label="Kode Dokter">
                    {jadwal.kodeDokter ? (
                      <span className="inline-flex items-center gap-2">
                        {jadwal.kodeDokter}
                        <CopyButton text={jadwal.kodeDokter} />
                      </span>
                    ) : (
                      "-"
                    )}
                  </Info>
                  <Info label="Jenis Dokter">{jadwal.namaJenisDokter || "-"}</Info>
                  <Info label="Nama">{jadwal.namaDokter || "-"}</Info>
                </Section>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <h3 className="text-2xl font-medium text-gray-900 mb-1">
                  Data Tidak Tersedia
                </h3>
                <p className="text-xs text-gray-400 mb-6">{TAB_KOSONG[tab]}</p>
                <EmptyBalloon />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
