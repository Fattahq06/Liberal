// Ilustrasi balon udara untuk tab yang datanya belum tersedia
export default function EmptyBalloon() {
  return (
    <svg
      viewBox="0 0 220 190"
      className="w-56 h-48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M40 120C28 80 60 28 112 30c46 2 76 40 66 84-8 36-46 54-84 50-30-3-46-18-54-44z"
        fill="#E955C4"
      />
      <path
        d="M24 66c-8-2-10-14 2-16 2-8 14-8 18-2 8-2 14 6 8 12z"
        stroke="#111"
        strokeWidth="1.5"
      />
      <path
        d="M166 62c-6-2-6-12 4-12 3-6 12-5 14 1 8 0 10 9 4 11z"
        stroke="#111"
        strokeWidth="1.5"
      />
      <path
        d="M70 80c0-28 18-48 40-48s40 20 40 48c0 8-20 16-40 16S70 88 70 80z"
        fill="#fff"
        stroke="#111"
        strokeWidth="1.8"
      />
      <path
        d="M76 84c10 6 26 6 34 0 8 6 24 6 34 0"
        stroke="#E955C4"
        strokeWidth="2"
      />
      <path d="M84 94l14 36M136 94l-14 36M110 96v34" stroke="#111" strokeWidth="1.5" />
      <rect x="94" y="130" width="32" height="26" fill="#fff" stroke="#111" strokeWidth="1.8" />
      <path d="M94 143h32M102 130v26M110 130v26M118 130v26" stroke="#111" strokeWidth="1.2" />
      <path
        d="M20 168c40-4 90-4 180 0M60 168l-4-8M70 168l2-10M150 168l-3-9M160 168l4-8"
        stroke="#111"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
