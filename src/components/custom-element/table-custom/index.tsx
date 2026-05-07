export interface Column {
  field: string;
  label: string | React.ReactNode | any;
  width: string;
  render?: any;
  headerVertical?: boolean;
  bodyAlign?: "left" | "center" | "right";
}

interface TableCustomProps {
  rows?: any;
  columns: Column[];
  onClickRow?: any;
  border?: boolean;
  px?: boolean;
}

const TableCustom = ({
  rows,
  columns,
  onClickRow,
  border = false,
  px = true,
}: TableCustomProps) => {
  return (
    <div className={`w-full overflow-x-auto ${px ? "px-6 py-6" : ""}`}>
      <div className="min-w-[1000px] bg-white rounded-t-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F2F5] text-[#7A7A7A] text-[14px] leading-normal font-semibold">
              {columns.map((col, index) => (
                <th
                  key={"header-" + index}
                  style={{
                    width: col.width,
                    minWidth: col.width.includes("%") ? "120px" : col.width,
                    ...(col?.headerVertical && {
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      textAlign: "center",
                    }),
                  }}
                  className={`py-5 px-6 font-semibold text-center`}
                >
                  {typeof col.label === "string"
                    ? col.label
                    : typeof col.label === "function"
                      ? col.label()
                      : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows?.map((row: any, rowIndex: any) => (
              <tr
                key={"row-" + rowIndex}
                onClick={() => onClickRow?.(row)}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {columns.map((col: any, colIndex: number) => (
                  <td
                    key={"cell-" + colIndex}
                    style={{
                      width: col.width,
                    }}
                    className={`py-5 px-6 text-[14px] text-gray-800 ${
                      col?.bodyAlign === "center"
                        ? "text-center"
                        : col?.bodyAlign === "right"
                          ? "text-right"
                          : "text-left"
                    } ${border ? "border-x  border-gray-200" : ""}`}
                  >
                    {col?.render ? col.render(row, rowIndex) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCustom;
