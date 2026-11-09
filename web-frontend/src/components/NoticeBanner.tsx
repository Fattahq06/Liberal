import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface Notice {
  type: "success" | "error";
  text: string;
}

export default function NoticeBanner({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  const ok = notice.type === "success";
  return (
    <div
      className={`mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${
        ok
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-rose-50 border-rose-100 text-rose-600"
      }`}
    >
      <span className="flex items-center gap-2">
        {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        {notice.text}
      </span>
      <button
        type="button"
        onClick={onClose}
        className={ok ? "text-emerald-500 hover:text-emerald-700" : "text-rose-400 hover:text-rose-600"}
      >
        <X size={16} />
      </button>
    </div>
  );
}
