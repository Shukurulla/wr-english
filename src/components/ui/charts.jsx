"use client";

const LINE = "#EAEAE4";
const FAINT = "#A1A1AA";
const MIST = "#F4F4F0";

/**
 * Donut chart with colored segments.
 * @param {{ size?: number, thickness?: number, segments: { value: number, color: string }[], center?: React.ReactNode }} props
 */
export function DonutChart({ size = 140, thickness = 18, segments, center }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let accumulated = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={MIST}
          strokeWidth={thickness}
        />
        {/* Segments */}
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLength = pct * circumference;
          const dashGap = circumference - dashLength;
          const offset = -accumulated * circumference + circumference * 0.25;
          accumulated += pct;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dashLength} ${dashGap}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease" }}
            />
          );
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex items-center justify-center">
          {center}
        </div>
      )}
    </div>
  );
}

/**
 * Line chart with optional fill, dots, and gridlines.
 * @param {{ data: number[], width?: number, height?: number, color?: string, fill?: boolean, showDots?: boolean, yMax?: number, yMin?: number, xLabels?: string[] }} props
 */
export function LineChart({
  data,
  width = 400,
  height = 140,
  color = "#047857",
  fill = true,
  showDots = true,
  yMax,
  yMin = 0,
  xLabels,
}) {
  if (!data || data.length === 0) return null;

  const padX = 32;
  const padTop = 8;
  const padBottom = xLabels ? 24 : 8;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = yMax ?? Math.max(...data);
  const min = yMin;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padX + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
    const y = padTop + chartH - ((v - min) / range) * chartH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillPath = `${linePath} L${points[points.length - 1].x},${padTop + chartH} L${points[0].x},${padTop + chartH} Z`;

  const gridLines = 4;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padTop + (i / gridLines) * chartH;
        const val = Math.round(max - (i / gridLines) * range);
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={LINE} strokeWidth={1} />
            <text x={padX - 6} y={y + 3} textAnchor="end" fontSize={10} fill={FAINT}>
              {val}
            </text>
          </g>
        );
      })}
      {/* Fill area */}
      {fill && (
        <path d={fillPath} fill={color} opacity={0.1} />
      )}
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2} />
        ))}
      {/* X labels */}
      {xLabels &&
        xLabels.map((label, i) => {
          const x = padX + (xLabels.length > 1 ? (i / (xLabels.length - 1)) * chartW : chartW / 2);
          return (
            <text key={i} x={x} y={height - 4} textAnchor="middle" fontSize={10} fill={FAINT}>
              {label}
            </text>
          );
        })}
    </svg>
  );
}

/**
 * Bar chart with gridlines and x-labels.
 * @param {{ data: number[], width?: number, height?: number, color?: string, xLabels?: string[], yMax?: number }} props
 */
export function BarChart({
  data,
  width = 400,
  height = 140,
  color = "#0A0A0B",
  xLabels,
  yMax,
}) {
  if (!data || data.length === 0) return null;

  const padX = 32;
  const padTop = 8;
  const padBottom = xLabels ? 24 : 8;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = yMax ?? Math.max(...data);
  const range = max || 1;

  const barGap = 4;
  const barWidth = Math.max(4, (chartW - barGap * (data.length - 1)) / data.length);

  const gridLines = 4;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padTop + (i / gridLines) * chartH;
        const val = Math.round(max - (i / gridLines) * range);
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={LINE} strokeWidth={1} />
            <text x={padX - 6} y={y + 3} textAnchor="end" fontSize={10} fill={FAINT}>
              {val}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((v, i) => {
        const barH = (v / range) * chartH;
        const x = padX + i * (barWidth + barGap);
        const y = padTop + chartH - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={Math.min(barWidth / 2, 4)}
            fill={color}
            style={{ transition: "height 0.3s ease, y 0.3s ease" }}
          />
        );
      })}
      {/* X labels */}
      {xLabels &&
        xLabels.map((label, i) => {
          const x = padX + i * (barWidth + barGap) + barWidth / 2;
          return (
            <text key={i} x={x} y={height - 4} textAnchor="middle" fontSize={10} fill={FAINT}>
              {label}
            </text>
          );
        })}
    </svg>
  );
}

/**
 * Sparkline (mini inline chart).
 * @param {{ data: number[], width?: number, height?: number, color?: string }} props
 */
export function Sparkline({ data, width = 80, height = 24, color = "#047857" }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (height - pad * 2) - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block align-middle">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Horizontal progress bar.
 * @param {{ value: number, max?: number, color?: string, height?: number }} props
 */
export function HBar({ value, max = 100, color = "#047857", height = 6 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: MIST }}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
