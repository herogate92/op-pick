// Identical on the server and in every browser: Intl's Korean output differs between ICU builds
// ("PM 4:16" vs "오후 4:16"), which breaks hydration when a client component formats a date.
export function formatKst(iso: string) {
  const kst = new Date(Date.parse(iso) + 9 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${kst.getUTCFullYear()}. ${kst.getUTCMonth() + 1}. ${kst.getUTCDate()}. ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())} KST`;
}
