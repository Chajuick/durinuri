// 두리누리 마스코트 — 눈·분홍 볼 픽셀 슬라임 (로그인·빈 화면·아이콘 공용)

const BODY = [
  ".....#####.....",
  "...#########...",
  "..###########..",
  ".#############.",
  ".#############.",
  "###############",
  "###############",
  "###############",
  "###############",
  "###############",
  ".#############.",
  "..###########..",
];
const EYES = [
  [4, 5],
  [5, 5],
  [4, 6],
  [5, 6],
  [9, 5],
  [10, 5],
  [9, 6],
  [10, 6],
];
const SHINE = [
  [4, 5],
  [9, 5],
];
const CHEEKS = [
  [2, 7],
  [3, 7],
  [11, 7],
  [12, 7],
];
const HILITE = [
  [3, 2],
  [4, 2],
  [5, 2],
  [2, 3],
];

export const SLIME_SKINS = {
  coral: { body: "#f0806a", shade: "#d3694f", hi: "#f8a892" },
  sky: { body: "#6bb8f2", shade: "#4b97d4", hi: "#a6d6f8" },
} as const;

export function PixelSlime({
  variant,
  bounceLate,
  width,
}: {
  variant: keyof typeof SLIME_SKINS;
  bounceLate?: boolean;
  width?: number;
}) {
  const { body, shade, hi } = SLIME_SKINS[variant];
  const px = new Map<string, string>();
  BODY.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === "#") px.set(`${x},${y}`, y >= 10 ? shade : body);
    }),
  );
  HILITE.forEach(([x, y]) => px.set(`${x},${y}`, hi));
  CHEEKS.forEach(([x, y]) => px.set(`${x},${y}`, "#ff7d9a"));
  EYES.forEach(([x, y]) => px.set(`${x},${y}`, "#3a2b29"));
  SHINE.forEach(([x, y]) => px.set(`${x},${y}`, "#ffffff"));

  return (
    <div className={`pxSlime${bounceLate ? " b" : ""}`}>
      <svg
        viewBox="0 0 15 12"
        className="pxImg"
        style={width ? { width } : undefined}
        shapeRendering="crispEdges"
      >
        {[...px].map(([k, c]) => {
          const [x, y] = k.split(",").map(Number);
          return <rect key={k} x={x} y={y} width="1" height="1" fill={c} />;
        })}
      </svg>
    </div>
  );
}

/** 코랄+하늘 슬라임 둘이 번갈아 통통 튐 */
export function SlimePair({ width }: { width?: number }) {
  return (
    <div className="pxStage">
      <PixelSlime variant="coral" width={width} />
      <PixelSlime variant="sky" bounceLate width={width} />
    </div>
  );
}
