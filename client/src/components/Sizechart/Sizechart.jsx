export default function SizeChart() {
  const rows = [
    ["XS", '44"', '26.5"', '9.5"', '21.5"'],
    ["S", '46"', '27"', '10"', '22"'],
    ["M", '48"', '27.5"', '10.5"', '22.5"'],
    ["L", '50"', '28"', '11"', '23"'],
    ["XL", '52"', '28.5"', '11.5"', '23.5"'],
    ["XXL", '54"', '29"', '12"', '24"'],
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 sm:p-5 w-[92vw] max-w-[520px]">
      <h3 className="text-white text-base sm:text-lg font-semibold mb-4">
        Size Chart
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="p-2 text-[11px] sm:text-sm text-gray-300">Size</th>
              <th className="p-2 text-[11px] sm:text-sm text-gray-300">Chest</th>
              <th className="p-2 text-[11px] sm:text-sm text-gray-300">Length</th>
              <th className="p-2 text-[11px] sm:text-sm text-gray-300">Sleeves</th>
              <th className="p-2 text-[11px] sm:text-sm text-gray-300">Shoulder</th>
            </tr>
          </thead>

          <tbody className="text-[11px] sm:text-sm text-gray-200">
            {rows.map((row) => (
              <tr
                key={row[0]}
                className="border-b border-neutral-800 hover:bg-neutral-800/50"
              >
                {row.map((cell, index) => (
                  <td
                    key={index}
                    className={`p-2 ${index === 0 ? "font-semibold text-red-500" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] sm:text-xs text-gray-400">
        All measurements are in inches.
      </p>
    </div>
  );
}