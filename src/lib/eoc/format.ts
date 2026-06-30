export function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

/** Compact Indian denomination (k / L / Cr). */
function compactINR(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

export function formatCurrency(n: number, compact = false): string {
  if (compact) return `₹${compactINR(n)}`;
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

const CURRENCY_UNITS = new Set(["$", "₹", "INR", "inr"]);

export function formatValue(value: number, unit?: string): string {
  if (unit && CURRENCY_UNITS.has(unit)) return formatCurrency(value, Math.abs(value) >= 100_000);
  const v =
    Number.isInteger(value) || Math.abs(value) >= 100
      ? formatNumber(value)
      : value.toString();
  if (!unit) return v;
  if (unit.startsWith("/")) return `${v}${unit}`;
  return `${v}${unit === "%" ? "%" : ` ${unit}`}`;
}
