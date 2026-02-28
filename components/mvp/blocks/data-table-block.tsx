'use client'

import { MvpBlock, DataTableBlockContent } from '@/types/mvp'

interface DataTableBlockProps {
  block: MvpBlock
}

export function DataTableBlock({ block }: DataTableBlockProps) {
  const content = block.content as DataTableBlockContent

  return (
    <div className="h-full flex flex-col p-6 bg-white overflow-auto">
      <h2 className="text-xl font-bold mb-4">{content.title || 'Data Table'}</h2>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              {(content.columns || []).map((column) => (
                <th
                  key={column.id}
                  className="text-left px-4 py-2 font-semibold text-slate-700"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(content.rows || []).slice(0, 5).map((row, ridx) => (
              <tr key={ridx} className="border-b hover:bg-slate-50">
                {(content.columns || []).map((column) => (
                  <td
                    key={`${ridx}-${column.id}`}
                    className="px-4 py-2 text-slate-700"
                  >
                    {String(row[column.id] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(content.rows || []).length > 5 && (
        <p className="text-xs text-slate-500 mt-2">
          Showing 5 of {content.rows!.length} rows
        </p>
      )}
    </div>
  )
}
