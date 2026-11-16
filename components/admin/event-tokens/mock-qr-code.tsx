import type { ReactNode } from "react";

export default function MockQrCode() {
  const size = 29;
  const modules: ReactNode[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const finder = [
        { row: 0, column: 0 },
        { row: 0, column: size - 7 },
        { row: size - 7, column: 0 },
      ].find((position) =>
        row >= position.row && row < position.row + 7 &&
        column >= position.column && column < position.column + 7
      );

      let dark: boolean;
      if (finder) {
        const localRow = row - finder.row;
        const localColumn = column - finder.column;
        dark = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6 ||
          (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4);
      } else {
        dark = ((row * 13 + column * 7 + row * column) % 11) < 5;
      }

      if (dark) modules.push(<rect key={`${row}-${column}`} x={column} y={row} width="1" height="1" />);
    }
  }

  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="h-[min(34vh,220px)] w-auto max-w-full rounded bg-white p-2" role="img" aria-label="ภาพตัวอย่าง QR Code">
      <g fill="#05070a">{modules}</g>
      <path d="M4 10V4h6 M19 4h6v6 M25 19v6h-6 M10 25H4v-6" fill="none" stroke="#49a5fb" strokeWidth="0.8" />
    </svg>
  );
}
