/**
 * Data export utilities — CSV download and print-friendly PDF views.
 */

/* ── CSV Export ── */
export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const cols =
    columns ??
    (Object.keys(data[0]) as (keyof T)[]).map((k) => ({
      key: k,
      label: String(k),
    }));

  const header = cols.map((c) => `"${String(c.label)}"`).join(',');
  const rows = data.map((row) =>
    cols
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/* ── PDF Export (print-based) ── */
export function exportToPdf(title: string) {
  const style = document.createElement('style');
  style.id = 'print-style';
  style.textContent = `
    @media print {
      body * { visibility: hidden; }
      #print-area, #print-area * { visibility: visible; }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      @page { margin: 1cm; }
    }
  `;

  // Set the document title for the PDF filename
  const originalTitle = document.title;
  document.title = title;
  document.head.appendChild(style);

  window.print();

  // Cleanup after print dialog
  setTimeout(() => {
    document.getElementById('print-style')?.remove();
    document.title = originalTitle;
  }, 500);
}

/* ── Helpers ── */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
