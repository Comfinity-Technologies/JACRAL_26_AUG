import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, keyExtractor, emptyMessage = "No data available" }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5DCDB] bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E5DCDB] bg-[#FAF6EE] text-xs font-bold uppercase tracking-wider text-[#685B55]">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3.5">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5DCDB] text-sm font-medium text-[#2C221E]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-[#685B55] italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-[#FAF6EE]/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-4">
                    {typeof col.accessor === "function" ? col.accessor(row) : (row[col.accessor] as any)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
