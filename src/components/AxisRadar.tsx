type AxisPoint = { label: string; value: number };

export function AxisRadar({
  axes,
  size = 200,
  color = "#4ade80",
}: {
  axes: AxisPoint[];
  size?: number;
  color?: string;
}) {
  const center = size / 2;
  const radius = size / 2 - 36;
  const angleStep = (2 * Math.PI) / axes.length;

  function pointFor(value: number, index: number): [number, number] {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (value / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  const valuePolygon = axes.map((a, i) => pointFor(a.value, i).join(",")).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={axes.map((_, i) => pointFor(level * 100, i).join(",")).join(" ")}
          fill="none"
          stroke="#4ade8033"
          strokeWidth={1}
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pointFor(100, i);
        return <line key={a.label} x1={center} y1={center} x2={x} y2={y} stroke="#4ade8033" strokeWidth={1} />;
      })}
      <polygon points={valuePolygon} fill={`${color}33`} stroke={color} strokeWidth={2} />
      {axes.map((a, i) => {
        const [x, y] = pointFor(122, i);
        return (
          <text
            key={a.label}
            x={x}
            y={y}
            fontSize={11}
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {a.label} {a.value}
          </text>
        );
      })}
    </svg>
  );
}
