/** Convert an array of objects to CSV and trigger a browser download. */
export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns?: { key: string; label: string }[],
) {
  if (!rows || rows.length === 0) return;

  const cols =
    columns ??
    Object.keys(rows[0]).map((k) => ({ key: k, label: k }));

  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = typeof val === "object" ? JSON.stringify(val) : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const header = cols.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => cols.map((c) => escape(getValue(row, c.key))).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getValue(obj: Record<string, any>, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
