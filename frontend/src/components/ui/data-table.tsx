import { cn } from "@/utils/cn";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Hiển thị dạng bảng trên desktop, tự chuyển sang danh sách card trên mobile
 * để tránh ép co nhỏ nội dung bảng.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  getRowHref,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowHref?: (row: T) => string;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-bg-subtle text-caption uppercase tracking-wide text-text-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-fast hover:bg-bg-subtle/60">
                {columns.map((col) => (
                  <td key={col.header} className={cn("px-4 py-3.5 align-middle text-text", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-surface p-4 shadow-soft-sm">
            <dl className="flex flex-col gap-2">
              {columns.map((col) => (
                <div key={col.header} className="flex items-center justify-between gap-3 text-body-sm">
                  <dt className="text-caption uppercase tracking-wide text-text-muted">{col.header}</dt>
                  <dd className="text-right text-text">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {getRowHref ? (
              <a href={getRowHref(row)} className="mt-3 block text-body-sm font-medium text-primary">
                Xem chi tiết
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
