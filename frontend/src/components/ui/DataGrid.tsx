export function DataGrid({ data, columns }: { data: any[], columns: any[] }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left">
        <thead className="bg-surface-container text-on-surface border-b border-outline-variant">
          <tr>
            {columns.map((col, i) => <th key={i} className="p-3 font-medium text-sm">{col.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-surface-container-highest/20 transition-colors">
              {columns.map((col, j) => <td key={j} className="p-3 text-sm text-on-surface-variant">{row[col.accessorKey]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
