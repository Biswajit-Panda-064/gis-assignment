
const DataTable = ({ data = [], columns = [] }) => {
  if (!data || data.length === 0) {
    return <h4 className="text-center py-2">No data available</h4>;
  }

  return (
    <div className="max-h-[300px] overflow-y-auto border rounded-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-gray-100 font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="px-4 py-2">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-2">
                  {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
