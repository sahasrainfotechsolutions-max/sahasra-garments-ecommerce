import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = 'No records found',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-neutral-400">Loading data...</div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-400 bg-white rounded-xl border border-neutral-100">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((item, rowIndex) => (
            <tr
              key={item.id ? String(item.id) : rowIndex}
              className="hover:bg-neutral-50/60 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-4 py-3.5 text-neutral-700 ${col.className || ''}`}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
