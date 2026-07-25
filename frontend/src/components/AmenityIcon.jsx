const PATHS = {
  wifi: (
    <>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.5a6 6 0 0 1 6 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </>
  ),
  power: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
  breakfast: (
    <>
      <path d="M3 10h14v3a7 7 0 0 1-14 0v-3z" />
      <path d="M17 10h2a3 3 0 0 1 0 6h-2" />
      <path d="M6 2c0 1.5-1.5 1.5-1.5 3S6 6.5 6 8" />
      <path d="M10 2c0 1.5-1.5 1.5-1.5 3S10 6.5 10 8" />
    </>
  ),
  pool: (
    <>
      <path d="M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
      <path d="M7 13V6a3 3 0 0 1 6 0" />
      <path d="M17 13v-3" />
    </>
  ),
  gym: (
    <>
      <path d="M4 12h16" />
      <path d="M4 8v8M20 8v8M8 10v4M16 10v4" />
    </>
  ),
  shuttle: (
    <>
      <rect x="2" y="7" width="16" height="9" rx="1.5" />
      <path d="M18 10h3l1 3v3h-4" />
      <circle cx="6.5" cy="18" r="1.5" />
      <circle cx="16.5" cy="18" r="1.5" />
    </>
  )
};

export default function AmenityIcon({ name }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {path}
    </svg>
  );
}
